import React, { useState, useEffect, useMemo } from 'react';
import { saveLog, loadLogs, saveStravaTokens, loadStravaTokens } from './firebase';
import { exchangeStravaCode, fetchStravaActivities, refreshStravaToken } from './strava';
import { buildHistory, computeReadiness, computeRisk, analyseCorrelations, todayStr } from './utils';
import TodayPage from './pages/TodayPage';
import LogPage from './pages/LogPage';
import TrendsPage from './pages/TrendsPage';
import HeadachePage from './pages/HeadachePage';
import SettingsPage from './pages/SettingsPage';
import './App.css';

const NAV = [
  { id: 'today', label: 'Today' },
  { id: 'log', label: 'Daily log' },
  { id: 'trends', label: 'Trends' },
  { id: 'headache', label: 'Headache tracker' },
  { id: 'settings', label: 'Settings' },
];

// Extract project ID from firebase config for webhook URL display
function getProjectId() {
  try {
    const { db } = require('./firebase');
    return db?.app?.options?.projectId || null;
  } catch { return null; }
}

export default function App() {
  const [tab, setTab] = useState('today');
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stravaTokens, setStravaTokens] = useState(null);
  const [stravaActivities, setStravaActivities] = useState([]);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('hos_api_key') || '');

  // Handle Strava OAuth callback
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    if (code && window.location.pathname.includes('strava-callback')) {
      exchangeStravaCode(code).then(async tokens => {
        await saveStravaTokens(tokens);
        setStravaTokens(tokens);
        window.history.replaceState({}, '', '/');
      });
    }
  }, []);

  // Load data on mount
  useEffect(() => {
    async function init() {
      setLoading(true);
      try {
        // Load Firebase logs
        const logs = await loadLogs(90);

        // Load Strava tokens and activities
        const tokens = await loadStravaTokens();
        if (tokens) {
          let accessToken = tokens.access_token;
          // Refresh if expired
          if (tokens.expires_at && Date.now() / 1000 > tokens.expires_at - 300) {
            const refreshed = await refreshStravaToken(tokens.refresh_token);
            accessToken = refreshed.access_token;
            await saveStravaTokens(refreshed);
            setStravaTokens(refreshed);
          } else {
            setStravaTokens(tokens);
          }
          const activities = await fetchStravaActivities(accessToken, 30);
          setStravaActivities(activities);
          // Merge Strava data into logs
          const stravaByDate = {};
          activities.forEach(a => { stravaByDate[a.date] = a; });
          // Save Strava activities to Firestore
          await Promise.all(
            activities.slice(0, 10).map(a => saveLog(a.date, a))
          );
        }

        // Build full history
        const allLogs = await loadLogs(90);
        const h = buildHistory(allLogs, 90);
        setHistory(h);
      } catch (e) {
        console.error('Init error:', e);
        // Fall back to placeholder data if Firebase not configured
        const { buildHistory: bh } = await import('./utils');
        setHistory(bh([], 90));
      }
      setLoading(false);
    }
    init();
  }, []);

  const today = useMemo(() => history[history.length - 1] || null, [history]);

  const avgHrv = useMemo(() => {
    if (!history.length) return 63;
    const vals = history.map(d => d.hrv).filter(Boolean);
    return Math.round(vals.reduce((s, v) => s + v, 0) / vals.length);
  }, [history]);

  const readiness = useMemo(() => today ? computeReadiness(today, avgHrv) : 70, [today, avgHrv]);
  const headacheRisk = useMemo(() => today ? computeRisk(today) : { score: 20, level: 'low', factors: [] }, [today]);
  const correlations = useMemo(() => analyseCorrelations(history), [history]);

  const stravaConnected = !!stravaTokens;
  const appleConnected = history.some(d => d.appleHealthSynced);

  async function handleLogSave(updates) {
    const merged = { ...today, ...updates };
    await saveLog(todayStr(), updates);
    setHistory(prev => {
      const next = [...prev];
      next[next.length - 1] = { ...merged, dateObj: today.dateObj };
      return next;
    });
    setTab('today');
  }

  function handleApiKeySave(k) {
    setApiKey(k);
    localStorage.setItem('hos_api_key', k);
  }

  const stravaStatus = stravaConnected ? 'Connected' : 'Not connected';
  const appleStatus = appleConnected ? 'Synced' : 'Not set up';

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: 'var(--text3)', fontSize: 14, fontFamily: 'var(--fb)' }}>
        Loading Jarred's Data...
      </div>
    );
  }

  const pages = {
    today: <TodayPage today={today} readiness={readiness} headacheRisk={headacheRisk} avgHrv={avgHrv} apiKey={apiKey} stravaConnected={stravaConnected} appleConnected={appleConnected} />,
    log: <LogPage today={today} onLogSave={handleLogSave} stravaConnected={stravaConnected} appleConnected={appleConnected} />,
    trends: <TrendsPage history={history} />,
    headache: <HeadachePage history={history} correlations={correlations} apiKey={apiKey} />,
    settings: <SettingsPage apiKey={apiKey} onApiKeySave={handleApiKeySave} stravaConnected={stravaConnected} appleConnected={appleConnected} projectId={getProjectId()} />,
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-inner">
          <div className="logo">
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
              <path d="M10 2L12.5 7.5H18L13.5 11L15.5 17L10 13.5L4.5 17L6.5 11L2 7.5H7.5L10 2Z" fill="#4ade80" opacity="0.9" />
            </svg>
            Jarred's Data
          </div>
          <div className="header-pills">
            <span className="pill"><span className={`pill-dot ${stravaConnected ? 'dot-green' : 'dot-gray'}`} />Strava {stravaStatus}</span>
            <span className="pill"><span className={`pill-dot ${appleConnected ? 'dot-green' : 'dot-gray'}`} />Apple {appleStatus}</span>
            <span className="date-label">{new Date().toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
          </div>
        </div>
      </header>

      <nav className="app-nav">
        <div className="nav-inner">
          {NAV.map(n => (
            <button key={n.id} className={`nav-tab ${tab === n.id ? 'active' : ''}`} onClick={() => setTab(n.id)}>
              {n.label}
            </button>
          ))}
        </div>
      </nav>

      <main className="app-main">
        {today ? pages[tab] : <div style={{ color: 'var(--text3)', textAlign: 'center', padding: 40 }}>No data loaded.</div>}
      </main>
    </div>
  );
}
