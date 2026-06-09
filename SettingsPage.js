import React, { useState, useRef } from 'react';
import { stravaAuthUrl, stravaConfigured } from '../strava';
import { parseAppleHealthExport } from '../appleHealthImport';
import { saveLog } from '../firebase';

export default function SettingsPage({ apiKey, onApiKeySave, stravaConnected, appleConnected, onAppleImport, projectId }) {
  const [key, setKey] = useState(apiKey || '');
  const [saved, setSaved] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [importError, setImportError] = useState(null);
  const fileRef = useRef();

  function saveKey() {
    onApiKeySave(key.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setImporting(true);
    setImportResult(null);
    setImportError(null);
    try {
      const days = await parseAppleHealthExport(file);
      // Save all days to Firebase
      let saved = 0;
      for (const day of days) {
        const ok = await saveLog(day.date, day);
        if (ok) saved++;
      }
      setImportResult({ total: days.length, saved });
      if (onAppleImport) onAppleImport(days);
    } catch (err) {
      setImportError(err.message);
    }
    setImporting(false);
    // Reset file input
    e.target.value = '';
  }

  return (
    <div>

      {/* STRAVA */}
      <div className="sl">Strava + Zwift</div>
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)', marginBottom: 3 }}>Connect Strava</div>
            <div style={{ fontSize: 12, color: 'var(--text2)' }}>Auto-fills workout load, duration, suffer score. Since Zwift syncs to Strava, both are covered.</div>
          </div>
          {stravaConnected
            ? <div className="connected-badge">✓ Connected</div>
            : <button className="btn-sm" onClick={() => window.location.href = stravaAuthUrl()}>Connect →</button>
          }
        </div>
        {!stravaConnected && (
          <div style={{ fontSize: 12, color: 'var(--text3)', lineHeight: 1.6, borderTop: '0.5px solid var(--border)', paddingTop: 10 }}>
            Clicking Connect will take you to Strava to log in and authorise. You'll be redirected back automatically.
            {!stravaConfigured() && <span style={{ color: 'var(--amber)', display: 'block', marginTop: 4 }}>⚠ Add your Strava Client ID and Secret to src/strava.js first.</span>}
          </div>
        )}
      </div>

      {/* APPLE HEALTH IMPORT */}
      <div className="sl">Apple Health</div>
      <div className="setup-card">
        <h3>Import Apple Health data</h3>
        <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 16, lineHeight: 1.6 }}>
          Export your data from the Health app on your iPhone and import it here. This pulls in your HRV, sleep, resting heart rate, SpO2, and more. Do this weekly to keep your data fresh.
        </div>

        <div style={{ marginBottom: 16 }}>
          {[
            'On your iPhone, open the Health app',
            'Tap your profile photo (top right corner)',
            'Scroll down and tap Export All Health Data',
            'Tap Export -- it takes 30-60 seconds to prepare',
            'When ready, tap Save to Files and save it to iCloud Drive',
            'On your computer, go to icloud.com, sign in, open Files, and download the export.zip',
            'Come back here and click Import below -- select that export.zip file',
          ].map((step, i) => (
            <div className="setup-step" key={i}>
              <div className="step-num">{i + 1}</div>
              <div>{step}</div>
            </div>
          ))}
        </div>

        <input
          ref={fileRef}
          type="file"
          accept=".zip,.xml"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />

        {importing ? (
          <div style={{ textAlign: 'center', padding: '16px 0', color: 'var(--text2)', fontSize: 13 }}>
            Reading your Apple Health data -- this can take up to a minute for large exports...
          </div>
        ) : (
          <button className="btn-p" style={{ marginTop: 0 }} onClick={() => fileRef.current.click()}>
            Import export.zip →
          </button>
        )}

        {importResult && (
          <div className="connected-badge" style={{ marginTop: 12 }}>
            ✓ Imported {importResult.saved} days of Apple Health data
          </div>
        )}

        {importError && (
          <div style={{ marginTop: 12, padding: '10px 14px', background: 'var(--red-bg)', border: '0.5px solid var(--red-border)', borderRadius: 'var(--r)', fontSize: 12, color: 'var(--red)' }}>
            {importError}
          </div>
        )}

        {appleConnected && !importResult && (
          <div className="connected-badge" style={{ marginTop: 12 }}>✓ Apple Health data already in your app</div>
        )}
      </div>

      {/* ANTHROPIC API KEY */}
      <div className="sl">AI features (Anthropic API key)</div>
      <div className="setup-card">
        <h3>Add your API key</h3>
        <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 12, lineHeight: 1.6 }}>
          Powers the AI daily brief and headache pattern analysis. Cost: roughly $1-2 USD per month at your usage level. New accounts get free credits.
        </div>
        <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 12, lineHeight: 1.6 }}>
          Get your key at <strong style={{ color: 'var(--green)' }}>console.anthropic.com</strong> → API Keys → Create Key.
        </div>
        <input
          className="api-input"
          type="password"
          placeholder="sk-ant-..."
          value={key}
          onChange={e => setKey(e.target.value)}
        />
        <button className="btn-p" style={{ marginTop: 4 }} onClick={saveKey}>
          {saved ? 'Saved ✓' : 'Save API key →'}
        </button>
        {apiKey && <div className="connected-badge" style={{ marginTop: 12 }}>✓ API key saved</div>}
      </div>

      {/* DATA STATUS */}
      <div className="sl">Data sources</div>
      <div className="card">
        <div className="rfr"><span className="rfl">Strava / Zwift activities</span><span className={stravaConnected ? 'rok' : 'rmo'}>{stravaConnected ? '✓ Connected' : '→ Not connected'}</span></div>
        <div className="rfr"><span className="rfl">Apple Health (sleep, HRV, SpO2)</span><span className={appleConnected ? 'rok' : 'rmo'}>{appleConnected ? '✓ Data imported' : '→ Import above'}</span></div>
        <div className="rfr"><span className="rfl">AI brief and analysis</span><span className={apiKey ? 'rok' : 'rmo'}>{apiKey ? '✓ Active' : '→ Add API key above'}</span></div>
        <div className="rfr"><span className="rfl">Daily log (electrolytes, headache)</span><span className="rok">✓ Always available</span></div>
      </div>

    </div>
  );
}
