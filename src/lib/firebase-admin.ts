import { App, cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

function getPrivateKey(): string | undefined {
  const key = process.env.FIREBASE_PRIVATE_KEY;
  if (!key) return undefined;
  return key.replace(/\\n/g, "\n");
}

let app: App | undefined;

if (!getApps().length) {
  const svcJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  let projectId: string | undefined;
  let clientEmail: string | undefined;
  let privateKey: string | undefined;

  if (svcJson) {
    try {
      const parsed = JSON.parse(svcJson) as {
        project_id?: string;
        client_email?: string;
        private_key?: string;
      };
      projectId = parsed.project_id;
      clientEmail = parsed.client_email;
      privateKey = (parsed.private_key || '').replace(/\\n/g, "\n");
    } catch (e) {
      throw new Error('Invalid FIREBASE_SERVICE_ACCOUNT_KEY JSON');
    }
  } else {
    projectId = process.env.FIREBASE_PROJECT_ID;
    clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    privateKey = getPrivateKey();
  }

  if (projectId && clientEmail && privateKey) {
    app = initializeApp({
      credential: cert({ projectId, clientEmail, privateKey }),
    });
  } else {
    throw new Error(
      'Missing Firebase Admin credentials. Provide FIREBASE_SERVICE_ACCOUNT_KEY (preferred) or FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY.'
    );
  }
}

export const adminAuth = getAuth();
export const adminDb = getFirestore();
export default app!;
