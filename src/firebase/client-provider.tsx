"use client";

import { useMemo } from 'react';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFirebaseApp } from '@/firebase/config';
import { FirebaseProvider } from '@/firebase/provider';

/**
 * This provider is responsible for initializing Firebase on the client-side.
 * It ensures that Firebase services are ready before rendering the rest of the app.
 * It should be used as a wrapper in your main layout file.
 */
export function FirebaseClientProvider({ children }: { children: React.ReactNode }) {
  // Memoize the Firebase instances to prevent re-initialization on re-renders.
  const { app, auth, firestore } = useMemo(() => {
    const app = getFirebaseApp();
    const auth = getAuth(app);
    const firestore = getFirestore(app);
    return { app, auth, firestore };
  }, []);

  return (
    <FirebaseProvider firebaseApp={app} auth={auth} firestore={firestore}>
      {children}
    </FirebaseProvider>
  );
}
