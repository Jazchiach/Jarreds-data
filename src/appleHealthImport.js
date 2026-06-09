// Parses Apple Health export XML and extracts key metrics
// Apple Health exports a zip containing export.xml with all health data

// Record types we care about
const RECORD_TYPES = {
  HRV: 'HKQuantityTypeIdentifierHeartRateVariabilitySDNN',
  RESTING_HR: 'HKQuantityTypeIdentifierRestingHeartRate',
  SPO2: 'HKQuantityTypeIdentifierOxygenSaturation',
  RESPIRATORY: 'HKQuantityTypeIdentifierRespiratoryRate',
  STEPS: 'HKQuantityTypeIdentifierStepCount',
  ACTIVE_ENERGY: 'HKQuantityTypeIdentifierActiveEnergyBurned',
};

const SLEEP_TYPE = 'HKCategoryTypeIdentifierSleepAnalysis';

// Main entry point -- call with the File object from an <input type="file">
export async function parseAppleHealthExport(file) {
  try {
    // Apple Health exports a zip file -- we need to read export.xml inside it
    // Use JSZip loaded from CDN in index.html
    if (file.name.endsWith('.zip')) {
      return await parseZip(file);
    }
    // If user somehow got the XML directly
    if (file.name.endsWith('.xml')) {
      const text = await file.text();
      return parseXML(text);
    }
    throw new Error('Please select the export.zip file from Apple Health');
  } catch (e) {
    throw new Error('Could not read file: ' + e.message);
  }
}

async function parseZip(file) {
  // Dynamically load JSZip
  if (!window.JSZip) {
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js');
  }
  const zip = await window.JSZip.loadAsync(file);

  // Find export.xml inside the zip
  let xmlFile = zip.file('apple_health_export/export.xml') || zip.file('export.xml');
  if (!xmlFile) {
    // Search for it
    const files = Object.keys(zip.files);
    const xmlPath = files.find(f => f.endsWith('export.xml'));
    if (!xmlPath) throw new Error('Could not find export.xml inside the zip file');
    xmlFile = zip.file(xmlPath);
  }

  const text = await xmlFile.async('string');
  return parseXML(text);
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = src;
    s.onload = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

function parseXML(xmlText) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlText, 'text/xml');

  const records = Array.from(doc.querySelectorAll('Record'));
  const sleepRecords = Array.from(doc.querySelectorAll('CategorySamples, Record[type="' + SLEEP_TYPE + '"]'));

  // Group records by date
  const byDate = {};

  function ensureDate(d) {
    if (!byDate[d]) byDate[d] = { date: d, hrvReadings: [], restingHrReadings: [], spo2Readings: [], respiratoryReadings: [], steps: 0, activeEnergy: 0, sleepMins: 0, deepSleepMins: 0, remSleepMins: 0 };
    return byDate[d];
  }

  records.forEach(r => {
    const type = r.getAttribute('type');
    const value = parseFloat(r.getAttribute('value') || 0);
    const startDate = r.getAttribute('startDate') || '';
    const date = startDate.split(' ')[0]; // YYYY-MM-DD
    if (!date || !value) return;

    const day = ensureDate(date);

    switch (type) {
      case RECORD_TYPES.HRV:
        day.hrvReadings.push(value);
        break;
      case RECORD_TYPES.RESTING_HR:
        day.restingHrReadings.push(value);
        break;
      case RECORD_TYPES.SPO2:
        // Apple stores SpO2 as 0-1, convert to percentage
        day.spo2Readings.push(value <= 1 ? value * 100 : value);
        break;
      case RECORD_TYPES.RESPIRATORY:
        day.respiratoryReadings.push(value);
        break;
      case RECORD_TYPES.STEPS:
        day.steps += value;
        break;
      case RECORD_TYPES.ACTIVE_ENERGY:
        day.activeEnergy += value;
        break;
    }

    // Sleep analysis
    if (type === SLEEP_TYPE) {
      const endDate = r.getAttribute('endDate') || '';
      const start = new Date(startDate);
      const end = new Date(endDate);
      const mins = (end - start) / 60000;
      const val = r.getAttribute('value') || '';

      if (val.includes('AsleepDeep') || val.includes('Deep')) {
        day.deepSleepMins += mins;
      } else if (val.includes('AsleepREM') || val.includes('REM')) {
        day.remSleepMins += mins;
      } else if (val.includes('Asleep') || val.includes('InBed')) {
        day.sleepMins += mins;
      }
    }
  });

  // Convert raw readings to daily summaries
  const results = [];
  Object.entries(byDate).forEach(([date, day]) => {
    const hrv = day.hrvReadings.length
      ? Math.round(day.hrvReadings.reduce((s, v) => s + v, 0) / day.hrvReadings.length)
      : null;
    const restingHr = day.restingHrReadings.length
      ? Math.round(day.restingHrReadings.reduce((s, v) => s + v, 0) / day.restingHrReadings.length)
      : null;
    const spo2 = day.spo2Readings.length
      ? Math.round(day.spo2Readings.reduce((s, v) => s + v, 0) / day.spo2Readings.length)
      : null;
    const respiratoryRate = day.respiratoryReadings.length
      ? Math.round((day.respiratoryReadings.reduce((s, v) => s + v, 0) / day.respiratoryReadings.length) * 10) / 10
      : null;

    const totalSleepMins = day.sleepMins + day.deepSleepMins + day.remSleepMins;
    const sleepHrs = totalSleepMins > 0
      ? Math.round((totalSleepMins / 60) * 10) / 10
      : null;
    const sleepQuality = !sleepHrs ? null
      : sleepHrs >= 8 ? 'great'
      : sleepHrs >= 7 ? 'good'
      : sleepHrs >= 6.5 ? 'ok'
      : 'poor';

    // Only include days that have at least some data
    if (!hrv && !restingHr && !sleepHrs && !spo2) return;

    const entry = {
      date,
      appleHealthSynced: true,
      appleHealthSyncedAt: new Date().toISOString(),
    };

    if (hrv) entry.hrv = hrv;
    if (restingHr) entry.restingHr = restingHr;
    if (sleepHrs) { entry.sleepHrs = sleepHrs; entry.sleepQuality = sleepQuality; }
    if (day.deepSleepMins > 0) entry.deepSleepMins = Math.round(day.deepSleepMins);
    if (day.remSleepMins > 0) entry.remSleepMins = Math.round(day.remSleepMins);
    if (spo2) entry.spo2 = spo2;
    if (respiratoryRate) entry.respiratoryRate = respiratoryRate;
    if (day.steps > 0) entry.steps = Math.round(day.steps);
    if (day.activeEnergy > 0) entry.activeEnergy = Math.round(day.activeEnergy);

    results.push(entry);
  });

  return results.sort((a, b) => a.date.localeCompare(b.date));
}
