import React, { useState } from 'react';
import { format } from 'date-fns';
import { generateHeadacheAnalysis } from '../ai';

const LOAD = { rest: 'Rest day', easy: 'Easy session', moderate: 'Moderate session', hard: 'Hard session' };
const ELEC = { none: 'No electrolytes', partial: 'Partial', full: 'Full electrolytes' };
const BAR_COLORS = ['#fbbf24', '#60a5fa', '#4ade80', '#f87171'];

export default function HeadachePage({ history, correlations, apiKey }) {
  const [insight, setInsight] = useState(null);
  const [loading, setLoading] = useState(false);

  const haDays = history.filter(d => d.hadHeadache).sort((a, b) => b.dateObj - a.dateObj).slice(0, 10);
  const total = history.filter(d => d.hadHeadache).length;
  const realTotal = history.filter(d => d.hadHeadache && !d.isPlaceholder).length;

  function flags(day) {
    const f = [];
    if (day.workoutLoad === 'hard') f.push('Hard session');
    if (day.sleepHrs < 7) f.push('Short sleep');
    if (day.electrolytes && day.electrolytes !== 'full') f.push('Low electrolytes');
    if ((day.screenTime || 0) > 4) f.push('High screen time');
    return f;
  }

  async function analyse() {
    setLoading(true);
    const r = await generateHeadacheAnalysis(apiKey || '', correlations, history);
    setInsight(r);
    setLoading(false);
  }

  return (
    <div>
      <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 16, lineHeight: 1.6 }}>
        {realTotal > 0
          ? `${realTotal} real headache events logged. The engine is correlating against sleep, workout load, electrolytes, and screen time.`
          : `No real headache events logged yet. Each evening, mark whether you had a headache in the Daily log. The engine builds its model from your actual events.`}
        {total > realTotal && total > 0 && ` (${total - realTotal} shown are demo data.)`}
      </div>

      {correlations.length > 0 && (
        <>
          <div className="sl">Top correlating factors</div>
          <div className="card" style={{ marginBottom: 16 }}>
            {correlations.map((c, i) => (
              <div key={i} style={{ marginBottom: i < correlations.length - 1 ? 14 : 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text2)', marginBottom: 5 }}>
                  <span>{c.label}</span>
                  <span style={{ fontWeight: 500, color: 'var(--text)' }}>{c.pct}% of {total} events</span>
                </div>
                <div className="bt"><div className="bf" style={{ width: `${c.pct}%`, background: BAR_COLORS[i] || '#4ade80' }} /></div>
              </div>
            ))}
            <div className="ib">
              {correlations[0]?.pct >= 65
                ? `Strong signal: "${correlations[0]?.label}" appears in ${correlations[0]?.pct}% of your headache days. Run a focused 2-week experiment -- on hard session days, ensure full electrolyte intake immediately post-workout and track whether headache rate drops.`
                : `No single dominant factor yet. Continue logging. The electrolyte hypothesis is the highest-plausibility intervention -- prioritise consistent use after hard sessions while the data builds.`}
            </div>
          </div>
        </>
      )}

      {total >= 4 && (
        <>
          <div className="sl">
            AI pattern analysis
            {!apiKey && <span style={{ color: 'var(--amber)', fontSize: 10, marginLeft: 6, textTransform: 'none', letterSpacing: 0 }}>-- add API key in Settings to unlock</span>}
          </div>
          <div className="card" style={{ marginBottom: 16 }}>
            {!insight && !loading && (
              <>
                <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 12, lineHeight: 1.6 }}>
                  The AI analyses your headache pattern against sports medicine research -- covering exercise-associated hyponatremia, post-exertional vasodilation, cycling posture tension, and dehydration mechanisms.
                </div>
                <button className="btn-p" onClick={analyse}>Analyse my headache pattern →</button>
              </>
            )}
            {loading && <div style={{ textAlign: 'center', padding: 24, color: 'var(--text3)', fontSize: 13 }}>Analysing your pattern...</div>}
            {insight && (
              <>
                <div style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.7, marginBottom: 16 }}>{insight.interpretation}</div>
                {insight.recommendations?.length > 0 && (
                  <>
                    <div className="sl" style={{ marginBottom: 10 }}>Evidence-based recommendations</div>
                    {insight.recommendations.map((r, i) => (
                      <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 10, alignItems: 'flex-start' }}>
                        <span style={{ color: 'var(--green)', fontSize: 13, marginTop: 1 }}>→</span>
                        <span style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6 }}>{r}</span>
                      </div>
                    ))}
                  </>
                )}
                <button className="btn-p" style={{ marginTop: 8 }} onClick={() => { setInsight(null); analyse(); }}>Refresh analysis →</button>
              </>
            )}
          </div>
        </>
      )}

      <div className="sl">Event log</div>
      {haDays.length === 0
        ? <div className="card" style={{ textAlign: 'center', color: 'var(--text3)', fontSize: 13 }}>No headache events logged. Mark headache days in the evening check-in to build the dataset.</div>
        : haDays.map((day, i) => {
          const f = flags(day);
          return (
            <div className="hae" key={i}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: day.isPlaceholder ? 'var(--text3)' : 'var(--text)', marginBottom: 4 }}>
                    {format(day.dateObj, 'EEE d MMM')}
                    {day.isPlaceholder && <span style={{ fontSize: 10, color: 'var(--text3)', marginLeft: 6 }}>demo</span>}
                    {day.headacheSeverity && (
                      <span className={`badge ${day.headacheSeverity === 'severe' ? 'br' : 'ba'}`} style={{ marginLeft: 8 }}>{day.headacheSeverity}</span>
                    )}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text3)' }}>
                    {LOAD[day.workoutLoad] || day.workoutLoad} · Sleep {day.sleepHrs}h
                    {day.electrolytes ? ` · ${ELEC[day.electrolytes]}` : ''}
                    {day.screenTime ? ` · Screen ${day.screenTime}h` : ''}
                    {day.stravaId && ` · Strava: ${day.activityName || 'activity'}`}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'flex-end', maxWidth: 180 }}>
                  {f.map((fl, fi) => <span key={fi} className="badge ba" style={{ fontSize: 10 }}>{fl}</span>)}
                </div>
              </div>
            </div>
          );
        })
      }
    </div>
  );
}
