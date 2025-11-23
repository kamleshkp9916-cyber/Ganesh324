
'use server';

import * as admin from 'firebase-admin';

// This function is for the Genkit flows (server-side)
export function getFirebaseAdminApp() {
  if (admin.apps.length > 0 && admin.apps[0]) {
    return admin.apps[0];
  }

  // In a deployed Firebase environment (like Cloud Functions or App Hosting),
  // initializeApp() without arguments automatically picks up the service account credentials.
  try {
    return admin.initializeApp();
  } catch (error) {
    console.error("Firebase admin initialization error:", error);
    // This will now throw a more informative error if credentials are not found.
    throw new Error("Could not initialize Firebase Admin SDK. Ensure the function is running in a configured Firebase environment.");
  }
}
