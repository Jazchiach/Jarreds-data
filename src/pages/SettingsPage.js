import React, { useState } from 'react';
import { stravaAuthUrl, stravaConfigured } from '../strava';

export default function SettingsPage({ apiKey, onApiKeySave, stravaConnected, appleConnected, onStravaConnect, projectId }) {
  const [key, setKey] = useState(apiKey || '');
  const [saved, setSaved] = useState(false);

  function saveKey() {
    onApiKeySave(key.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const webhookUrl = projectId && projectId !== 'PASTE_YOUR_PROJECT_ID_HERE'
    ? `https://${projectId}.web.app/api/apple-health`
    : null;

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

      {/* APPLE HEALTH */}
      <div className="sl">Apple Health (iPhone Shortcut)</div>
      <div className="setup-card">
        <h3>Set up Apple Health sync</h3>
        <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 16, lineHeight: 1.6 }}>
          Apple Health doesn't have a web API, so we use an iPhone Shortcut that runs automatically each morning at 6:00am, reads your overnight data, and sends it to your app. Takes about 5 minutes to set up.
        </div>
        <div style={{ marginBottom: 16 }}>
          {[
            'On your iPhone, open the Shortcuts app (built into iOS -- search for it if you can\'t find it)',
            'Tap the + button at the top right to create a new shortcut',
            'Tap "Add Action", search for "Health", select "Find Health Samples"',
            'Set Type to "Heart Rate Variability (SDNN)", Limit to 1, Sort by Date -- Newest first',
            'Add another "Find Health Samples" action for each metric: Resting Heart Rate, Sleep Analysis, Blood Oxygen, Respiratory Rate',
            'Add a "Get Contents of URL" action. Set the URL to your webhook URL below. Set Method to POST. Add each health value as a JSON body field.',
            'Add an Automation: open Shortcuts > Automation tab > + > Time of Day > 6:00am > Daily > run this shortcut',
          ].map((step, i) => (
            <div className="setup-step" key={i}>
              <div className="step-num">{i + 1}</div>
              <div>{step}</div>
            </div>
          ))}
        </div>

        {webhookUrl
          ? <div>
            <div className="sl">Your webhook URL</div>
            <div style={{ background: 'var(--bg2)', border: '0.5px solid var(--border2)', borderRadius: 'var(--r)', padding: '10px 14px', fontSize: 12, color: 'var(--green)', fontFamily: 'monospace', wordBreak: 'break-all', marginBottom: 8 }}>{webhookUrl}</div>
            <div style={{ fontSize: 11, color: 'var(--text3)' }}>Copy this URL into the "Get Contents of URL" action in your Shortcut.</div>
          </div>
          : <div style={{ fontSize: 12, color: 'var(--amber)', lineHeight: 1.6 }}>
            Your webhook URL will appear here once Firebase is configured. Complete the Firebase setup in Step A of the deployment guide first.
          </div>
        }

        {appleConnected && (
          <div className="connected-badge" style={{ marginTop: 12 }}>✓ Apple Health data is flowing in</div>
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
          Get your key: go to <strong style={{ color: 'var(--green)' }}>console.anthropic.com</strong> on your personal Gmail account → API Keys → Create Key.
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
        <div className="rfr"><span className="rfl">Apple Health (sleep, HRV, SpO2)</span><span className={appleConnected ? 'rok' : 'rmo'}>{appleConnected ? '✓ Receiving data' : '→ Shortcut not set up'}</span></div>
        <div className="rfr"><span className="rfl">AI brief and analysis</span><span className={apiKey ? 'rok' : 'rmo'}>{apiKey ? '✓ Active' : '→ Add API key above'}</span></div>
        <div className="rfr"><span className="rfl">Daily log (electrolytes, headache)</span><span className="rok">✓ Always available</span></div>
      </div>

    </div>
  );
}
