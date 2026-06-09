// STEP: Replace with your Strava API credentials
// Get these from: strava.com/settings/api -> Create App
const STRAVA_CLIENT_ID = '256601';
const STRAVA_CLIENT_SECRET = '4a847695a8c3e14ec07775993bce84b9f8611f05';
const REDIRECT_URI = window.location.origin + '/strava-callback';

// Strava OAuth scopes we need
const SCOPE = 'read,activity:read_all';

// Step 1: Send user to Strava login
export function stravaAuthUrl() {
  const params = new URLSearchParams({
    client_id: STRAVA_CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: 'code',
    scope: SCOPE,
  });
  return `https://www.strava.com/oauth/authorize?${params}`;
}

// Step 2: Exchange code for tokens (called after redirect back)
export async function exchangeStravaCode(code) {
  const resp = await fetch('https://www.strava.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: STRAVA_CLIENT_ID,
      client_secret: STRAVA_CLIENT_SECRET,
      code,
      grant_type: 'authorization_code',
    }),
  });
  return resp.json();
}

// Step 3: Refresh access token when expired
export async function refreshStravaToken(refreshToken) {
  const resp = await fetch('https://www.strava.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: STRAVA_CLIENT_ID,
      client_secret: STRAVA_CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });
  return resp.json();
}

// Step 4: Fetch recent activities from Strava
export async function fetchStravaActivities(accessToken, days = 14) {
  const after = Math.floor(Date.now() / 1000) - days * 86400;
  const resp = await fetch(
    `https://www.strava.com/api/v3/athlete/activities?after=${after}&per_page=50`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  const activities = await resp.json();
  if (!Array.isArray(activities)) return [];

  // Map each activity to our format
  return activities.map(a => {
    const date = a.start_date_local?.split('T')[0];
    const durationMins = Math.round(a.moving_time / 60);
    const sufferScore = a.suffer_score || 0;
    const load = sufferScore >= 100 ? 'hard'
      : sufferScore >= 50 ? 'moderate'
      : durationMins >= 45 ? 'easy'
      : 'rest';
    return {
      date,
      stravaId: a.id,
      activityType: a.type,
      activityName: a.name,
      durationMins,
      distanceKm: Math.round((a.distance || 0) / 100) / 10,
      sufferScore,
      avgHrActivity: a.average_heartrate || null,
      maxHr: a.max_heartrate || null,
      elevationGain: a.total_elevation_gain || 0,
      workoutLoad: load,
      stravaUrl: `https://www.strava.com/activities/${a.id}`,
    };
  });
}

// Map suffer score to load label
export function sufferToLoad(score) {
  if (!score) return 'unknown';
  if (score >= 150) return 'hard';
  if (score >= 75) return 'moderate';
  if (score >= 25) return 'easy';
  return 'rest';
}

// Validate that Strava is configured (not placeholder)
export function stravaConfigured() {
  return STRAVA_CLIENT_ID !== 'PASTE_YOUR_STRAVA_CLIENT_ID_HERE';
}
