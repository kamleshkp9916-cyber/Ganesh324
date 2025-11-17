
"use client";

import { useEffect, useState, createContext, useContext, useMemo } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { initializeFirebase } from '@/firebase'; // Changed import
import { createUserData, getUserData, UserData } from "@/lib/follow-data";
import { doc, onSnapshot } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  authReady: boolean; // New state to indicate when auth and user data are fully resolved
}

const AuthContext = createContext<AuthContextType>({ user: null, userData: null, loading: true, authReady: false });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [authReady, setAuthReady] = useState(false); // Track if both auth and firestore data are ready

  useEffect(() => {
    const { auth, firestore: db } = initializeFirebase(); // Changed to get instances from the central source
    
    // This is the primary listener for Firebase Auth state changes.
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      // Whenever auth state might change, we are no longer "ready" and are "loading".
      setAuthReady(false);
      setLoading(true);
      setUser(firebaseUser); // Set user immediately, can be null

      if (firebaseUser) {
        // If a user is logged in, listen for changes to their user document in Firestore.
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const unsubscribeFirestore = onSnapshot(userDocRef, async (doc) => {
            if (doc.exists()) {
                // User document exists, set the data.
                setUserData(doc.data() as UserData);
            } else {
                // User document does not exist, so we need to create it.
                // This can happen on first sign-up.
                let data = await getUserData(firebaseUser.uid);
                if (!data) {
                    await createUserData(firebaseUser, 'customer');
                    // After creation, fetch it again to be sure.
                    data = await getUserData(firebaseUser.uid);
                }
                setUserData(data);
            }
            // Once user data is fetched/set, we are done loading for this user.
            setLoading(false);
            setAuthReady(true);
        }, (error) => {
            console.error("Error listening to user data:", error);
            setUserData(null);
            setLoading(false);
            setAuthReady(true);
        });

        // This function will be called when the onAuthStateChanged listener is cleaned up.
        // It's crucial for unsubscribing from the Firestore listener to prevent memory leaks.
        return () => unsubscribeFirestore();

      } else {
        // No user is logged in.
        setUser(null);
        setUserData(null);
        setLoading(false);
        setAuthReady(true); // We are "ready" because we know for sure there is no user.
      }
    });

    // Cleanup the main auth listener on component unmount.
    return () => unsubscribeAuth();
  }, []);

  const value = useMemo(() => ({ user, userData, loading, authReady }), [user, userData, loading, authReady]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}


export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
