import React, { useState, useEffect } from 'react';
import { readinessLabel } from '../utils';
import { generateDailyBrief } from '../ai';

const ICON = { nutrition: '🥩', hydration: '💧', recovery: '⚡', sleep: '🌙', sugar: '🍬' };

function ScoreRing({ score }) {
  const r = 36, circ = 2 * Math.PI * r, filled = (score / 100) * circ;
  const color = score >= 70 ? '#4ade80' : score >= 45 ? '#fbbf24' : '#f87171';
  return (
    <svg width="88" height="88" viewBox="0 0 88 88">
      <circle cx="44" cy="44" r={r} fill="none" stroke="rgba(74,222,128,0.08)" strokeWidth="5" />
      <circle cx="44" cy="44" r={r} fill="none" stroke={color} strokeWidth="5"
        strokeDasharray={`${filled} ${circ - filled}`} strokeLinecap="round"
        transform="rotate(-90 44 44)" style={{ transition: 'stroke-dasharray 1s ease' }} />
      <text x="44" y="40" textAnchor="middle" fill={color} fontSize="20" fontFamily="DM Serif Display,serif">{score}</text>
      <text x="44" y="54" textAnchor="middle" fill="rgba(154,181,154,0.6)" fontSize="10" fontFamily="DM Sans,sans-serif">/100</text>
    </svg>
  );
}

export default function TodayPage({ today, readiness, headacheRisk, avgHrv, apiKey, stravaConnected, appleConnected }) {
  const [brief, setBrief] = useState(null);
  const [briefLoading, setBriefLoading] = useState(false);
  const [briefGenerated, setBriefGenerated] = useState(false);
  const rec = readinessLabel(readiness);
  const d = today.hrv - avgHrv;
  const rlb = headacheRisk.level === 'high' ? 'br' : headacheRisk.level === 'moderate' ? 'ba' : 'bg';
  const rlt = headacheRisk.level === 'high' ? 'High risk -- take action' : headacheRisk.level === 'moderate' ? 'Moderate -- watch it' : 'Low risk today';

  async function loadBrief() {
    setBriefLoading(true);
    const b = await generateDailyBrief(apiKey, { readiness, headacheRisk, today, avgHrv });
    setBrief(b);
    setBriefLoading(false);
    setBriefGenerated(true);
  }

  // Auto-load fallback brief (no API key needed)
  useEffect(() => {
    if (!briefGenerated) {
      generateDailyBrief('', { readiness, headacheRisk, today, avgHrv }).then(b => {
        setBrief(b);
        setBriefGenerated(true);
      });
    }
  }, [today.date]);

  return (
    <div>
      {/* Data source pills */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {today.stravaId && <span className="badge bb">⚡ {today.activityName || 'Strava activity'} · {today.durationMins}min</span>}
        {today.appleHealthSynced && <span className="badge bp">🍎 Apple Health synced</span>}
        {today.isPlaceholder && <span className="badge" style={{ background: 'var(--bg3)', color: 'var(--text3)', border: '0.5px solid var(--border)' }}>Demo data -- start logging to see your real numbers</span>}
      </div>

      <div className="sl">Training readiness</div>
      <div className="rc">
        <ScoreRing score={readiness} />
        <div>
          <div className="rt">{rec.label}</div>
          <div className="rd">
            {today.sleepHrs >= 7 ? `Sleep solid at ${today.sleepHrs}h. ` : `Sleep short at ${today.sleepHrs}h -- recovery compromised. `}
            {d >= 0 ? `HRV ${d}ms above your baseline -- good sign. ` : `HRV ${Math.abs(d)}ms below 30-day baseline. `}
            {today.workoutLoad === 'hard' ? 'High load session logged -- accumulated fatigue is a factor.' : today.workoutLoad === 'rest' ? 'Rest day -- legs should be fresh.' : "Yesterday's load was manageable."}
          </div>
          <span className={`badge ${rec.badge}`}>{rec.sub}</span>
          <span className="badge bb">HRV {today.hrv}ms</span>
          <span className={`badge ${today.sleepHrs >= 7 ? 'bg' : 'ba'}`}>Sleep {today.sleepHrs}h</span>
          {today.sufferScore > 0 && <span className="badge ba">Suffer score {today.sufferScore}</span>}
        </div>
      </div>

      {/* Metrics row */}
      <div className="mg4">
        <div className="mc">
          <div className="ml">Resting HR</div>
          <div className="mv">{today.restingHr}</div>
          <div className="ms">bpm {today.appleHealthSynced ? '· Apple' : ''}</div>
        </div>
        <div className="mc">
          <div className="ml">HRV</div>
          <div className="mv">{today.hrv}</div>
          <div className="ms">ms &nbsp;<span className={d >= 0 ? 'mdu' : 'mdd'}>{d >= 0 ? '+' : ''}{d} vs avg</span></div>
        </div>
        <div className="mc">
          <div className="ml">Sleep</div>
          <div className="mv">{today.sleepHrs}</div>
          <div className="ms">
            hours
            {today.deepSleepMins > 0 && <span> · {today.deepSleepMins}min deep</span>}
          </div>
        </div>
        <div className="mc">
          <div className="ml">SpO2</div>
          <div className="mv">{today.spo2}%</div>
          <div className="ms">{today.spo2 >= 96 ? 'normal' : 'slightly low'}</div>
        </div>
      </div>

      {/* Extra Apple Health metrics if available */}
      {today.appleHealthSynced && (
        <div className="mg3" style={{ marginBottom: 16 }}>
          <div className="mc">
            <div className="ml">Deep sleep</div>
            <div className="mv">{today.deepSleepMins || '--'}</div>
            <div className="ms">minutes</div>
          </div>
          <div className="mc">
            <div className="ml">REM sleep</div>
            <div className="mv">{today.remSleepMins || '--'}</div>
            <div className="ms">minutes</div>
          </div>
          <div className="mc">
            <div className="ml">Resp. rate</div>
            <div className="mv">{today.respiratoryRate || '--'}</div>
            <div className="ms">breaths/min</div>
          </div>
        </div>
      )}

      {/* Strava activity detail */}
      {today.stravaId && (
        <>
          <div className="sl">Today's Strava activity</div>
          <div className="card" style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--text)' }}>{today.activityName}</div>
              <a href={today.stravaUrl} target="_blank" rel="noreferrer" style={{ fontSize: 11, color: 'var(--blue)', textDecoration: 'none' }}>View on Strava →</a>
            </div>
            <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--text2)' }}>
              <span>{today.durationMins} min</span>
              {today.distanceKm > 0 && <span>{today.distanceKm} km</span>}
              {today.avgHrActivity && <span>Avg HR {today.avgHrActivity}bpm</span>}
              {today.sufferScore > 0 && <span>Suffer {today.sufferScore}</span>}
              {today.elevationGain > 0 && <span>{today.elevationGain}m elevation</span>}
            </div>
          </div>
        </>
      )}

      <div className="sl">Afternoon headache risk</div>
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <span style={{ fontSize: 15, fontWeight: 500, color: 'var(--text)' }}>Today's assessment</span>
          <span className={`badge ${rlb}`}>{rlt}</span>
        </div>
        {headacheRisk.factors.map((f, i) => (
          <div className="rfr" key={i}>
            <span className="rfl">{f.label}</span>
            <span className={f.level === 'ok' ? 'rok' : f.level === 'moderate' ? 'rmo' : 'rhi'}>
              {f.level === 'ok' ? '✓ No concern' : f.level === 'moderate' ? '→ Watch it' : '↑ Risk factor'}
            </span>
          </div>
        ))}
        {headacheRisk.level !== 'low' && (
          <div className="ib">
            {headacheRisk.level === 'high'
              ? 'High risk day. Drink 500ml with electrolytes within 30 mins of finishing your session. Take a 10-min screen break around 1:30-2pm. Your data shows most headaches cluster on hard session days with short sleep or no electrolytes.'
              : 'Moderate risk. Stay on top of hydration post-workout. If neck tension builds around midday, step away from the screen and stretch for 5 minutes -- catching it early prevents escalation.'}
          </div>
        )}
      </div>

      <div className="sl">
        AI health brief
        {!apiKey && <span style={{ color: 'var(--text3)', fontSize: 10, marginLeft: 6, textTransform: 'none', letterSpacing: 0 }}>-- add API key in Settings for live AI</span>}
      </div>
      <div className="card">
        {briefLoading && <div style={{ textAlign: 'center', padding: 24, color: 'var(--text3)', fontSize: 13 }}>Generating your brief...</div>}
        {!briefLoading && brief?.map((item, i) => (
          <div className="bi" key={i}>
            <div className="bic">{ICON[item.icon] || '💡'}</div>
            <div>
              <div className="btl">{item.title}</div>
              <div className="bbd">{item.body}</div>
            </div>
          </div>
        ))}
        {!briefLoading && apiKey && (
          <button className="btn-p" style={{ marginTop: 12 }} onClick={loadBrief}>
            Regenerate with live AI →
          </button>
        )}
      </div>
    </div>
  );
}
