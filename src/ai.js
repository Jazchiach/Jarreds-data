const MODEL = 'claude-sonnet-4-20250514';

export async function generateDailyBrief(apiKey, { readiness, headacheRisk, today, avgHrv }) {
  const stravaInfo = today.stravaId
    ? `Strava activity: ${today.activityName || 'workout'}, ${today.durationMins} mins, suffer score ${today.sufferScore || 'n/a'}.`
    : '';
  const appleInfo = today.appleHealthSynced
    ? `Apple Health: deep sleep ${today.deepSleepMins || '?'}min, REM ${today.remSleepMins || '?'}min, respiratory rate ${today.respiratoryRate || '?'} breaths/min, steps yesterday ${today.steps || '?'}.`
    : '';

  const prompt = `You are a sports science and nutrition AI for Jarred, a 40-year-old elite endurance athlete based in Sydney. He trains every morning at 6:30am (Zwift cycling + running), focused on optimising performance, recovery, and reducing afternoon headaches (MRI clear, likely exercise/lifestyle-related). He wants to reduce sugar and poor calorie intake.

Today's data:
- Training readiness: ${readiness}/100
- HRV: ${today.hrv}ms (30-day avg: ${avgHrv}ms, delta: ${today.hrv - avgHrv > 0 ? '+' : ''}${today.hrv - avgHrv}ms)
- Resting HR: ${today.restingHr}bpm
- Sleep: ${today.sleepHrs}h (quality: ${today.sleepQuality})
- Session today: ${today.workoutLoad}
- SpO2: ${today.spo2}%
- Electrolytes post-workout: ${today.electrolytes || 'not logged'}
- Headache risk today: ${headacheRisk.level} (score ${headacheRisk.score}/100)
${stravaInfo}
${appleInfo}

Generate exactly 4 highly personalised, evidence-based health insights for today. Each must reference his actual data numbers -- no generic advice. Cover: (1) post-workout protein/nutrition timing, (2) hydration and electrolyte strategy specific to today's load, (3) sugar and refined carb guidance, (4) recovery or sleep optimisation.

Respond ONLY as a JSON array, no preamble, no markdown fences:
[{"title":"short title","body":"2-3 sentences referencing his actual data","icon":"nutrition|hydration|recovery|sleep|sugar"}]`;

  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: MODEL, max_tokens: 1000, messages: [{ role: 'user', content: prompt }] }),
    });
    const data = await r.json();
    const text = data.content?.map(b => b.text || '').join('');
    return JSON.parse(text.replace(/```json|```/g, '').trim());
  } catch (e) {
    return fallbackBrief(today, headacheRisk);
  }
}

export async function generateHeadacheAnalysis(apiKey, correlations, history) {
  const total = history.filter(d => d.hadHeadache).length;
  const top = correlations.slice(0, 3).map(c => `${c.label} (${c.pct}% of events)`).join(', ');
  const hasStrava = history.some(d => d.stravaId);
  const hasApple = history.some(d => d.appleHealthSynced);

  const prompt = `Sports medicine AI. Patient: Jarred, 40yo male endurance athlete, Sydney. Very fit, trains 6 mornings/week (Zwift cycling + running), clear MRI, afternoon headaches believed lifestyle-related. ${hasStrava ? 'Strava data integrated.' : ''} ${hasApple ? 'Apple Health data integrated (HRV, sleep stages).' : ''}

${total} headache events logged. Top correlating factors: ${top}.

Provide: (1) a 3-4 sentence physiological interpretation of the most likely mechanism(s) -- consider exercise-associated hyponatremia, post-exertional cerebral vasodilation, dehydration, tension/cervicogenic factors from cycling posture. (2) 3 specific, evidence-based interventions ranked by likelihood of impact.

Respond ONLY as JSON, no preamble: {"interpretation":"...","recommendations":["...","...","..."]}`;

  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: MODEL, max_tokens: 700, messages: [{ role: 'user', content: prompt }] }),
    });
    const data = await r.json();
    const text = data.content?.map(b => b.text || '').join('');
    return JSON.parse(text.replace(/```json|```/g, '').trim());
  } catch (e) {
    return { interpretation: 'Check your API key in Settings.', recommendations: [] };
  }
}

function fallbackBrief(today, headacheRisk) {
  return [
    { icon: 'nutrition', title: 'Post-workout protein window', body: `After a ${today.workoutLoad} session, target 30-40g protein within 45 minutes. Greek yoghurt, eggs, or whey without added sugar. This supports muscle repair and blunts the cortisol spike from training.` },
    { icon: 'hydration', title: 'Electrolyte strategy today', body: `${today.electrolytes === 'none' ? 'No electrolytes logged -- high risk.' : today.electrolytes === 'partial' ? 'Partial electrolytes logged.' : 'Good electrolyte intake.'} Target 500ml with sodium within 30 mins of finishing. Plain water alone can dilute remaining sodium and trigger afternoon headaches.` },
    { icon: 'sugar', title: 'Refined carb watch', body: `${today.workoutLoad === 'hard' ? 'Hard sessions increase sugar cravings.' : 'Stay consistent with nutrition quality today.'} Stick to whole-food carbs -- sweet potato, oats, fruit. Avoid processed snacks which cause blood sugar swings compounding afternoon fatigue.` },
    { icon: 'recovery', title: 'Recovery note', body: `HRV of ${today.hrv}ms is ${today.hrv < 55 ? 'below' : 'near'} your baseline. Prioritise sleep before midnight tonight. Alcohol suppresses deep sleep and blunts HRV recovery -- even one drink shifts your baseline.` },
  ];
}
