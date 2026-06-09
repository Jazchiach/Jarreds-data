import { format, subDays } from 'date-fns';

export function fmtDate(d) {
  return format(d, 'yyyy-MM-dd');
}

export function todayStr() {
  return fmtDate(new Date());
}

// Generate placeholder history for days with no real data
export function generatePlaceholderDay(date) {
  const seed = date.getTime();
  const rng = (min, max) => {
    const x = Math.sin(seed + min) * 10000;
    return min + ((x - Math.floor(x)) * (max - min));
  };
  const sleepHrs = Math.round((6.5 + rng(0, 2)) * 10) / 10;
  const workoutLoad = ['rest', 'easy', 'moderate', 'hard'][Math.floor(rng(0, 4))];
  const hrv = Math.round(50 + rng(0, 28));
  const electrolytes = ['none', 'partial', 'full'][Math.floor(rng(0, 3))];
  const screenTime = Math.round(2 + rng(0, 5));
  const headacheRisk =
    (workoutLoad === 'hard' ? 0.4 : 0) +
    (sleepHrs < 7 ? 0.3 : 0) +
    (electrolytes === 'none' ? 0.25 : electrolytes === 'partial' ? 0.1 : 0) +
    (screenTime > 4 ? 0.15 : 0);
  const hadHeadache = rng(0, 1) < headacheRisk * 0.5;

  return {
    date: fmtDate(date),
    dateObj: date,
    sleepHrs,
    sleepQuality: sleepHrs >= 7.5 ? 'great' : sleepHrs >= 7 ? 'good' : sleepHrs >= 6.5 ? 'ok' : 'poor',
    workoutLoad,
    hrv,
    restingHr: Math.round(46 + rng(0, 12)),
    spo2: Math.round(95 + rng(0, 4)),
    electrolytes,
    screenTime,
    nutritionQuality: ['poor', 'ok', 'good', 'very_good'][Math.floor(rng(0, 4))],
    energyLevel: ['low', 'ok', 'good', 'high'][Math.floor(rng(0, 4))],
    hadHeadache,
    headacheSeverity: hadHeadache ? ['mild', 'moderate', 'severe'][Math.floor(rng(0, 3))] : null,
    isPlaceholder: true,
  };
}

// Build a 90-day history merging real Firebase data with placeholders
export function buildHistory(firebaseLogs, days = 90) {
  const logMap = {};
  firebaseLogs.forEach(l => { logMap[l.date] = l; });

  const history = [];
  for (let i = days; i >= 0; i--) {
    const date = subDays(new Date(), i);
    const dateStr = fmtDate(date);
    if (logMap[dateStr]) {
      history.push({ ...logMap[dateStr], dateObj: date, isPlaceholder: false });
    } else {
      history.push(generatePlaceholderDay(date));
    }
  }
  return history;
}

// Compute training readiness 0-100
export function computeReadiness(today, avgHrv) {
  let score = 60;
  const { sleepHrs, hrv, workoutLoad } = today;

  if (sleepHrs >= 8) score += 20;
  else if (sleepHrs >= 7.5) score += 15;
  else if (sleepHrs >= 7) score += 10;
  else if (sleepHrs >= 6.5) score += 5;
  else score -= 5;

  const d = hrv - avgHrv;
  if (d >= 5) score += 15;
  else if (d >= 0) score += 10;
  else if (d >= -5) score += 5;
  else score -= 5;

  if (workoutLoad === 'hard') score -= 15;
  else if (workoutLoad === 'moderate') score -= 5;
  else if (workoutLoad === 'easy') score += 5;
  else score += 10;

  return Math.min(100, Math.max(0, score));
}

export function readinessLabel(score) {
  if (score >= 80) return { label: 'Go hard today', badge: 'bg', sub: 'Full intensity -- your body is ready' };
  if (score >= 65) return { label: 'Go moderate today', badge: 'ba', sub: 'Aerobic base or tempo work' };
  if (score >= 45) return { label: 'Go easy today', badge: 'ba', sub: 'Zone 2 or recovery ride' };
  return { label: 'Rest or very easy', badge: 'br', sub: 'Active recovery only' };
}

// Compute afternoon headache risk
export function computeRisk(today) {
  let risk = 0;
  const factors = [];

  if (today.sleepHrs < 7) {
    risk += 30;
    factors.push({ label: 'Under 7h sleep', level: 'high' });
  } else {
    factors.push({ label: `Sleep ${today.sleepHrs}h`, level: 'ok' });
  }

  if (today.workoutLoad === 'hard') {
    risk += 35;
    factors.push({ label: 'High workout load', level: 'high' });
  } else if (today.workoutLoad === 'moderate') {
    risk += 10;
    factors.push({ label: 'Moderate workout load', level: 'moderate' });
  } else {
    factors.push({ label: 'Workout load manageable', level: 'ok' });
  }

  if (today.electrolytes === 'none') {
    risk += 25;
    factors.push({ label: 'No electrolytes post-workout', level: 'high' });
  } else if (today.electrolytes === 'partial') {
    risk += 10;
    factors.push({ label: 'Partial electrolyte intake', level: 'moderate' });
  } else if (today.electrolytes === 'full') {
    factors.push({ label: 'Electrolytes taken', level: 'ok' });
  } else {
    factors.push({ label: 'Electrolytes: not logged', level: 'moderate' });
    risk += 10;
  }

  if ((today.screenTime || 0) > 4) {
    risk += 15;
    factors.push({ label: `Screen time ${today.screenTime}h`, level: 'moderate' });
  } else if (today.screenTime) {
    factors.push({ label: 'Screen time normal', level: 'ok' });
  }

  const level = risk >= 60 ? 'high' : risk >= 30 ? 'moderate' : 'low';
  return { score: Math.min(100, risk), level, factors };
}

// Headache correlation analysis
export function analyseCorrelations(history) {
  const hd = history.filter(d => d.hadHeadache);
  const total = hd.length;
  if (!total) return [];

  return [
    { label: 'High workout load', count: hd.filter(d => d.workoutLoad === 'hard').length },
    { label: 'Under 7h sleep', count: hd.filter(d => d.sleepHrs < 7).length },
    { label: 'No or partial electrolytes', count: hd.filter(d => d.electrolytes !== 'full').length },
    { label: 'Screen time over 4h', count: hd.filter(d => (d.screenTime || 0) > 4).length },
  ]
    .map(c => ({ ...c, total, pct: Math.round((c.count / total) * 100) }))
    .sort((a, b) => b.pct - a.pct);
}

export function avg(arr) {
  return arr.length ? Math.round(arr.reduce((s, v) => s + v, 0) / arr.length) : 0;
}
