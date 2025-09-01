
import * as admin from 'firebase-admin';

// This function is for the Genkit flows (server-side)
export function getFirebaseAdminApp() {
  if (admin.apps.length > 0 && admin.apps[0]) {
    return admin.apps[0];
  }

  try {
    const credential =
      process.env.GCLOUD_PROJECT && process.env.GOOGLE_APPLICATION_CREDENTIALS
        ? admin.credential.applicationDefault()
        : admin.credential.cert({
            projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
          });

    return admin.initializeApp({
      credential,
    });
  } catch (error) {
    console.error("Firebase admin initialization error:", error);
    throw new Error("Could not initialize Firebase Admin SDK. Please check your credentials.");
  }
}
