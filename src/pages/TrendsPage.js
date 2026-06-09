import React, { useMemo } from 'react';
import { format } from 'date-fns';
import { avg } from '../utils';

function MiniChart({ data, maxV, color, hlFn }) {
  const max = maxV || Math.max(...data.map(d => d.val), 1);
  return (
    <div className="tmb">
      {data.map((d, i) => {
        const h = Math.round((d.val / max) * 52);
        const hl = hlFn ? hlFn(d, i) : false;
        return (
          <div key={i} className="tbar" style={{
            height: Math.max(h, 2),
            background: hl ? '#f87171' : color,
            opacity: d.isPlaceholder ? 0.3 : 0.45 + (i / data.length) * 0.55,
          }} title={`${d.label || ''}: ${d.val}`} />
        );
      })}
    </div>
  );
}

function TrendCard({ title, data, maxV, color, avgLabel, hlFn, source }) {
  const first = data.find(d => d.dateObj);
  const last = data[data.length - 1];
  return (
    <div className="card" style={{ marginBottom: 0 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{title}</div>
        {source && <span style={{ fontSize: 10, color: 'var(--text3)' }}>{source}</span>}
      </div>
      <MiniChart data={data} maxV={maxV} color={color} hlFn={hlFn} />
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text3)', marginTop: 6 }}>
        <span>{first?.dateObj ? format(first.dateObj, 'dd MMM') : ''}</span>
        <span>{avgLabel}</span>
        <span>Today</span>
      </div>
    </div>
  );
}

export default function TrendsPage({ history }) {
  const last30 = history.slice(-30);
  const loadMap = { rest: 1, easy: 2, moderate: 3, hard: 4 };

  const stats = useMemo(() => ({
    avgHrv: avg(last30.map(d => d.hrv).filter(Boolean)),
    avgSleep: Math.round(last30.reduce((s, d) => s + (d.sleepHrs || 0), 0) / last30.length * 10) / 10,
    haCount: last30.filter(d => d.hadHeadache).length,
    hardDays: last30.filter(d => d.workoutLoad === 'hard').length,
    hardHA: last30.filter(d => d.workoutLoad === 'hard' && d.hadHeadache).length,
    shortSleep: last30.filter(d => d.sleepHrs < 7).length,
    shortHA: last30.filter(d => d.sleepHrs < 7 && d.hadHeadache).length,
    noElecHA: last30.filter(d => d.hadHeadache && d.electrolytes !== 'full').length,
    noElec: last30.filter(d => d.electrolytes !== 'full').length,
    realDays: last30.filter(d => !d.isPlaceholder).length,
  }), [last30]);

  const appleConnected = last30.some(d => d.appleHealthSynced);
  const stravaConnected = last30.some(d => d.stravaId);

  return (
    <div>
      {stats.realDays < 7 && (
        <div className="ib" style={{ marginBottom: 16 }}>
          {stats.realDays === 0
            ? 'No real data yet -- charts show demo data. Start logging daily and connect your integrations to see your actual trends.'
            : `${stats.realDays} real days logged so far. Keep going -- patterns become meaningful after 30+ days.`}
        </div>
      )}

      <div className="mg4" style={{ marginBottom: 16 }}>
        <div className="mc"><div className="ml">Avg HRV</div><div className="mv">{stats.avgHrv}</div><div className="ms">ms · 30 days</div></div>
        <div className="mc"><div className="ml">Avg sleep</div><div className="mv">{stats.avgSleep}</div><div className="ms">hours · 30 days</div></div>
        <div className="mc"><div className="ml">Headache days</div><div className="mv" style={{ color: stats.haCount > 5 ? 'var(--red)' : 'var(--text)' }}>{stats.haCount}</div><div className="ms">of last 30</div></div>
        <div className="mc"><div className="ml">Hard sessions</div><div className="mv">{stats.hardDays}</div><div className="ms">of last 30</div></div>
      </div>

      <div className="sl">30-day charts</div>
      <div className="two-col">
        <TrendCard
          title="HRV (ms)"
          data={last30.map(d => ({ val: d.hrv || 0, dateObj: d.dateObj, isPlaceholder: d.isPlaceholder }))}
          maxV={100} color="#4ade80"
          avgLabel={`Avg ${stats.avgHrv}ms`}
          source={appleConnected ? 'Apple Health' : 'logged'}
        />
        <TrendCard
          title="Sleep (hrs)"
          data={last30.map(d => ({ val: (d.sleepHrs || 0) * 10, dateObj: d.dateObj, isPlaceholder: d.isPlaceholder }))}
          maxV={90} color="#60a5fa"
          avgLabel={`Avg ${stats.avgSleep}h`}
          source={appleConnected ? 'Apple Health' : 'logged'}
        />
      </div>
      <div className="two-col">
        <TrendCard
          title="Workout load"
          data={last30.map(d => ({ val: loadMap[d.workoutLoad] || 0, dateObj: d.dateObj, isPlaceholder: d.isPlaceholder, load: d.workoutLoad }))}
          maxV={4} color="#fbbf24"
          avgLabel={stravaConnected ? 'Strava / Zwift' : 'logged'}
          hlFn={d => d.load === 'hard'}
          source={stravaConnected ? 'Strava' : 'logged'}
        />
        <TrendCard
          title="Headache events"
          data={last30.map(d => ({ val: d.hadHeadache ? 1 : 0.08, dateObj: d.dateObj, isPlaceholder: d.isPlaceholder, ha: d.hadHeadache }))}
          maxV={1} color="#f87171"
          avgLabel={`${stats.haCount} events`}
          hlFn={d => d.ha}
        />
      </div>

      {appleConnected && (
        <>
          <div className="sl">Sleep quality (Apple Health)</div>
          <div className="two-col">
            <TrendCard
              title="Deep sleep (mins)"
              data={last30.map(d => ({ val: d.deepSleepMins || 0, dateObj: d.dateObj, isPlaceholder: !d.appleHealthSynced }))}
              maxV={180} color="#a78bfa"
              avgLabel={`Avg ${avg(last30.filter(d => d.appleHealthSynced).map(d => d.deepSleepMins || 0))}min`}
              source="Apple Health"
            />
            <TrendCard
              title="REM sleep (mins)"
              data={last30.map(d => ({ val: d.remSleepMins || 0, dateObj: d.dateObj, isPlaceholder: !d.appleHealthSynced }))}
              maxV={180} color="#60a5fa"
              avgLabel={`Avg ${avg(last30.filter(d => d.appleHealthSynced).map(d => d.remSleepMins || 0))}min`}
              source="Apple Health"
            />
          </div>
        </>
      )}

      <div className="sl">Pattern insights</div>
      <div className="card">
        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', marginBottom: 12 }}>Headache correlations (30 days)</div>

        {[
          { label: 'Headaches after hard sessions', val: Math.round(stats.hardHA / Math.max(stats.hardDays, 1) * 100), color: '#fbbf24' },
          { label: 'Headaches on under-7h sleep days', val: Math.round(stats.shortHA / Math.max(stats.shortSleep, 1) * 100), color: '#60a5fa' },
          { label: 'Headaches with no/partial electrolytes', val: Math.round(stats.noElecHA / Math.max(stats.noElec, 1) * 100), color: '#f87171' },
        ].map((row, i) => (
          <div key={i} style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text2)', marginBottom: 4 }}>
              <span>{row.label}</span>
              <span style={{ fontWeight: 500, color: 'var(--text)' }}>{row.val}%</span>
            </div>
            <div className="bt"><div className="bf" style={{ width: `${row.val}%`, background: row.color }} /></div>
          </div>
        ))}

        <div className="ib">
          {stats.haCount >= 5
            ? `${stats.haCount} headache events across 30 days gives meaningful signal. Check the Headache tracker tab for the AI analysis of your specific pattern.`
            : `${stats.haCount} event(s) logged. The engine needs around 8-10 events to surface reliable correlations. Keep logging daily.`}
        </div>
      </div>
    </div>
  );
}
