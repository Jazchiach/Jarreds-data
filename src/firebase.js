import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, getDoc, getDocs, query, orderBy, limit } from 'firebase/firestore';

// STEP: Replace these placeholders with your Firebase project config
// Get these from: console.firebase.google.com -> Your project -> Project settings -> Your apps
const firebaseConfig = {
  apiKey: "PASTE_YOUR_API_KEY_HERE",
  authDomain: "PASTE_YOUR_AUTH_DOMAIN_HERE",
  projectId: "PASTE_YOUR_PROJECT_ID_HERE",
  storageBucket: "PASTE_YOUR_STORAGE_BUCKET_HERE",
  messagingSenderId: "PASTE_YOUR_SENDER_ID_HERE",
  appId: "PASTE_YOUR_APP_ID_HERE"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Save a daily log entry
export async function saveLog(dateStr, data) {
  try {
    await setDoc(doc(db, 'logs', dateStr), { ...data, updatedAt: new Date().toISOString() }, { merge: true });
    return true;
  } catch (e) {
    console.error('Save failed:', e);
    return false;
  }
}

// Load all logs from Firestore
export async function loadLogs(days = 90) {
  try {
    const q = query(collection(db, 'logs'), orderBy('date', 'desc'), limit(days));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ ...d.data(), date: d.id }));
  } catch (e) {
    console.error('Load failed:', e);
    return [];
  }
}

// Save Strava tokens
export async function saveStravaTokens(tokens) {
  await setDoc(doc(db, 'config', 'strava'), tokens, { merge: true });
}

// Load Strava tokens
export async function loadStravaTokens() {
  const snap = await getDoc(doc(db, 'config', 'strava'));
  return snap.exists() ? snap.data() : null;
}

// Save Apple Health data for a date
export async function saveAppleHealthData(dateStr, healthData) {
  await setDoc(doc(db, 'logs', dateStr), { ...healthData, updatedAt: new Date().toISOString() }, { merge: true });
}
