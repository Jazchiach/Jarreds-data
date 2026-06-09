// Apple Health data is sent by an iPhone Shortcut each morning
// The Shortcut runs automatically, reads Health app data, and calls our Firebase endpoint
// This file handles parsing and validating that incoming data

/**
 * Expected payload from iPhone Shortcut:
 * {
 *   date: "2026-06-05",
 *   hrv: 58,                    // ms, overnight average
 *   restingHr: 49,              // bpm
 *   sleepHrs: 7.3,              // total sleep hours
 *   sleepQuality: "good",       // derived from duration
 *   deepSleepMins: 94,          // minutes of deep sleep
 *   remSleepMins: 112,          // minutes of REM sleep
 *   spo2: 97,                   // %
 *   respiratoryRate: 14.2,      // breaths/min
 *   steps: 8420,                // steps previous day
 *   activeEnergy: 680,          // kcal
 * }
 */

export function parseAppleHealthPayload(raw) {
  const d = typeof raw === 'string' ? JSON.parse(raw) : raw;
  const sleepHrs = parseFloat(d.sleepHrs) || 0;
  const sleepQuality = sleepHrs >= 8 ? 'great'
    : sleepHrs >= 7.5 ? 'good'
    : sleepHrs >= 7 ? 'good'
    : sleepHrs >= 6.5 ? 'ok'
    : 'poor';

  return {
    date: d.date,
    hrv: Math.round(parseFloat(d.hrv) || 0),
    restingHr: Math.round(parseFloat(d.restingHr) || 0),
    sleepHrs: Math.round(sleepHrs * 10) / 10,
    sleepQuality,
    deepSleepMins: Math.round(parseFloat(d.deepSleepMins) || 0),
    remSleepMins: Math.round(parseFloat(d.remSleepMins) || 0),
    spo2: Math.round(parseFloat(d.spo2) || 0),
    respiratoryRate: Math.round(parseFloat(d.respiratoryRate) * 10) / 10,
    steps: Math.round(parseFloat(d.steps) || 0),
    activeEnergy: Math.round(parseFloat(d.activeEnergy) || 0),
    appleHealthSynced: true,
    appleHealthSyncedAt: new Date().toISOString(),
  };
}

// Generate the Apple Shortcut URL scheme for the setup guide
// This tells the user exactly what URL their shortcut should POST to
export function getShortcutWebhookUrl(projectId) {
  if (!projectId || projectId === 'PASTE_YOUR_PROJECT_ID_HERE') return null;
  // Firebase callable function URL -- set up in step-by-step guide
  return `https://${projectId}.web.app/api/apple-health`;
}

// Derive sleep quality label from hours
export function sleepLabel(hrs) {
  if (hrs >= 8) return 'great';
  if (hrs >= 7.5) return 'good';
  if (hrs >= 7) return 'good';
  if (hrs >= 6.5) return 'ok';
  return 'poor';
}

// The iPhone Shortcut script (shown to user in Settings > Apple Health setup)
export const SHORTCUT_INSTRUCTIONS = `
WHAT THE SHORTCUT DOES:
Every morning at 6:00am, your iPhone automatically reads last night's data
from the Apple Health app and sends it to your Health OS database.
Data collected: HRV, resting heart rate, sleep hours, deep sleep,
REM sleep, SpO2, respiratory rate, steps, active energy.

HOW TO SET IT UP:
1. Open the Shortcuts app on your iPhone
2. Tap the + button to create a new shortcut
3. Follow the step-by-step guide in Settings > Apple Health in the app
`;
