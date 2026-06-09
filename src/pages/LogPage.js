import React, { useState } from 'react';
import { todayStr } from '../utils';

const MORNING = [
  { key: 'sleepQuality', label: 'Sleep quality last night', opts: [['poor','Poor'],['ok','OK'],['good','Good'],['great','Great']] },
  { key: 'sleepHrs', label: 'Hours slept', opts: [[5.5,'<6h'],[6.25,'6-6.5h'],[7,'7h'],[7.5,'7.5h'],[8.5,'8h+']] },
  { key: 'workoutLoad', label: 'Session intensity (if no Strava)', opts: [['rest','Rest'],['easy','Easy'],['moderate','Moderate'],['hard','Hard']] },
  { key: 'electrolytes', label: 'Electrolytes post-workout', opts: [['none','None'],['partial','Partial'],['full','Full']] },
];

const EVENING = [
  { key: 'screenTime', label: 'Afternoon screen time', opts: [[1.5,'<2h'],[3,'2-4h'],[5,'4-6h'],[7,'>6h']] },
  { key: 'nutritionQuality', label: 'Nutrition quality today', opts: [['poor','Poor'],['ok','OK'],['good','Good'],['very_good','Very good']] },
  { key: 'energyLevel', label: 'Energy levels today', opts: [['low','Low'],['ok','OK'],['good','Good'],['high','High']] },
  { key: 'hadHeadache', label: 'Headache today?', opts: [[false,'No'],['mild','Mild'],['moderate','Moderate'],['severe','Severe']] },
];

export default function LogPage({ today, onLogSave, stravaConnected, appleConnected }) {
  const [v, setV] = useState({
    sleepQuality: today.sleepQuality || 'good',
    sleepHrs: today.sleepHrs || 7,
    workoutLoad: today.workoutLoad || 'moderate',
    electrolytes: today.electrolytes || '',
    screenTime: today.screenTime || 3,
    nutritionQuality: today.nutritionQuality || 'good',
    energyLevel: today.energyLevel || 'good',
    hadHeadache: today.hadHeadache !== undefined ? today.hadHeadache : false,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const set = (k, val) => setV(p => ({ ...p, [k]: val }));

  async function handleSave() {
    setSaving(true);
    await onLogSave({ ...v, date: todayStr() });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const Section = ({ title, rows, note }) => (
    <div>
      <div className="sl" style={{ marginTop: 20 }}>{title}</div>
      <div className="card">
        {rows.map(row => (
          <div className="lr" key={row.key}>
            <span className="ll">{row.label}</span>
            <div className="lo">
              {row.opts.map(([val, lbl]) => (
                <button key={lbl} className={`lb ${v[row.key] === val ? 'sel' : ''}`} onClick={() => set(row.key, val)}>{lbl}</button>
              ))}
            </div>
          </div>
        ))}
      </div>
      {note && <div style={{ margin: '-8px 0 16px', padding: '12px 16px', background: 'var(--bg3)', borderRadius: 'var(--r)', border: '0.5px solid var(--border)', fontSize: 12, color: 'var(--text3)', lineHeight: 1.6 }}>{note}</div>}
    </div>
  );

  return (
    <div>
      <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 16, lineHeight: 1.6 }}>
        Takes 2-3 minutes. The electrolyte and headache fields are the most important -- they can't come from Strava or Apple Health.
      </div>

      {/* Integration status */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', marginBottom: 12 }}>What's auto-filled today</div>
        <div className="rfr">
          <span className="rfl">Sleep, HRV, resting HR, SpO2</span>
          <span className={appleConnected ? 'rok' : 'rmo'}>{appleConnected ? '✓ Apple Health' : '→ Log manually above'}</span>
        </div>
        <div className="rfr">
          <span className="rfl">Workout load and activity data</span>
          <span className={stravaConnected ? 'rok' : 'rmo'}>{stravaConnected ? '✓ Strava / Zwift' : '→ Log manually above'}</span>
        </div>
        <div className="rfr">
          <span className="rfl">Electrolytes, screen time, headache</span>
          <span style={{ fontSize: 12, color: 'var(--amber)' }}>→ Always manual (log below)</span>
        </div>
      </div>

      <Section
        title="Morning check-in"
        rows={MORNING}
        note={<><strong style={{ color: 'var(--text2)' }}>Why electrolytes matter:</strong> After intense sessions, sodium loss can trigger afternoon headaches if you rehydrate with plain water only -- exercise-associated hyponatremia. This is the highest-signal input in the headache engine.</>}
      />
      <Section title="Evening check-in" rows={EVENING} />

      <button className="btn-p" onClick={handleSave} disabled={saving}>
        {saving ? 'Saving...' : saved ? 'Saved ✓' : 'Save today\'s log →'}
      </button>
    </div>
  );
}
