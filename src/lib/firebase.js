const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};
const appCheckSiteKey = String(import.meta.env.VITE_FIREBASE_APPCHECK_SITE_KEY ?? "").trim();

const hasRequiredConfig = Object.values(firebaseConfig).every(
  (value) => typeof value === "string" && value.trim().length > 0
);
const appCheckConfigured = appCheckSiteKey.length > 0;

const firebaseGlobal = typeof window !== "undefined" ? window.firebase : null;

let app = null;
let auth = null;
let db = null;
let googleProvider = null;
let appCheck = null;
let firebaseLoadError = "";
let appCheckLoadError = "";

if (hasRequiredConfig) {
  if (!firebaseGlobal || typeof firebaseGlobal.initializeApp !== "function") {
    firebaseLoadError = "Firebase SDK 스크립트가 로드되지 않았습니다.";
  } else {
    if (!firebaseGlobal.apps.length) {
      firebaseGlobal.initializeApp(firebaseConfig);
    }
    app = firebaseGlobal.app();
    auth = app.auth();
    db = app.firestore();
    googleProvider = new firebaseGlobal.auth.GoogleAuthProvider();
    if (appCheckConfigured) {
      if (typeof firebaseGlobal.appCheck !== "function") {
        appCheckLoadError = "Firebase App Check SDK 스크립트가 로드되지 않았습니다.";
      } else {
        try {
          appCheck = firebaseGlobal.appCheck(app);
          appCheck.activate(appCheckSiteKey, true);
        } catch (error) {
          appCheckLoadError = "Firebase App Check 초기화에 실패했습니다.";
        }
      }
    }
  }
}

export function serverTimestamp() {
  if (!firebaseGlobal || !firebaseGlobal.firestore) {
    return new Date().toISOString();
  }
  return firebaseGlobal.firestore.FieldValue.serverTimestamp();
}

export const firebaseEnabled = hasRequiredConfig && Boolean(auth) && Boolean(db);
export const appCheckEnabled = Boolean(appCheck);
export { app, auth, db, googleProvider, appCheck, firebaseLoadError, appCheckConfigured, appCheckLoadError };
