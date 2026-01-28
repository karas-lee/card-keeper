const FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID;
const FIREBASE_CLIENT_EMAIL = process.env.FIREBASE_CLIENT_EMAIL;
const FIREBASE_PRIVATE_KEY = process.env.FIREBASE_PRIVATE_KEY?.replace(
  /\\n/g,
  "\n"
);

// Opaque module path to prevent Turbopack/webpack static analysis warnings
// when firebase-admin is not installed (optional dependency)
const FIREBASE_PKG = "firebase-admin";

let firebaseApp: any = null;

async function getFirebaseApp(): Promise<any> {
  if (firebaseApp) return firebaseApp;
  if (!FIREBASE_PROJECT_ID || !FIREBASE_CLIENT_EMAIL || !FIREBASE_PRIVATE_KEY) {
    return null;
  }

  try {
    const { initializeApp, cert, getApps } = await import(
      /* webpackIgnore: true */ `${FIREBASE_PKG}/app`
    );
    const apps = getApps();
    if (apps.length > 0) {
      firebaseApp = apps[0]!;
    } else {
      firebaseApp = initializeApp({
        credential: cert({
          projectId: FIREBASE_PROJECT_ID,
          clientEmail: FIREBASE_CLIENT_EMAIL,
          privateKey: FIREBASE_PRIVATE_KEY,
        }),
      });
    }
    return firebaseApp;
  } catch {
    return null;
  }
}

export function isFirebaseConfigured(): boolean {
  return !!(
    FIREBASE_PROJECT_ID &&
    FIREBASE_CLIENT_EMAIL &&
    FIREBASE_PRIVATE_KEY
  );
}

export async function verifyFirebaseToken(
  idToken: string
): Promise<{ uid: string; email: string; name: string | null } | null> {
  const app = await getFirebaseApp();
  if (!app) {
    return null;
  }

  try {
    const { getAuth } = await import(
      /* webpackIgnore: true */ `${FIREBASE_PKG}/auth`
    );
    const decoded = await getAuth(app).verifyIdToken(idToken);
    return {
      uid: decoded.uid,
      email: decoded.email ?? "",
      name: decoded.name ?? null,
    };
  } catch {
    return null;
  }
}
