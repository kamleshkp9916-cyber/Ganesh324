
'use server';

import * as admin from 'firebase-admin';

// This function is for the Genkit flows (server-side)
export async function getFirebaseAdminApp() {
  if (admin.apps.length > 0 && admin.apps[0]) {
    return admin.apps[0];
  }

  // Explicitly check for environment variables to provide a clearer error message.
  if (!process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY) {
      throw new Error("Firebase Admin credentials (FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY) are not set in the environment. Please check your .env file.");
  }

  try {
    const credential = admin.credential.cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      // Replace escaped newlines from the .env file with actual newlines
      privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
    });

    return admin.initializeApp({
      credential,
    });
  } catch (error) {
    console.error("Firebase admin initialization error:", error);
    throw new Error("Could not initialize Firebase Admin SDK. Please check your credentials.");
  }
}
