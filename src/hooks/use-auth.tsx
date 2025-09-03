
"use client";

import { useEffect, useState, createContext, useContext, useMemo } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { getFirebaseAuth, getFirestoreDb } from '@/lib/firebase';
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
    const auth = getFirebaseAuth();
    const db = getFirestoreDb();
    
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true); // Start loading whenever auth state changes
      setAuthReady(false);

      if (firebaseUser) {
        setUser(firebaseUser);
        
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const unsubscribeFirestore = onSnapshot(userDocRef, async (doc) => {
            if (doc.exists()) {
                setUserData(doc.data() as UserData);
            } else {
                let data = await getUserData(firebaseUser.uid);
                if (!data) {
                    await createUserData(firebaseUser, 'customer');
                    data = await getUserData(firebaseUser.uid);
                }
                setUserData(data);
            }
            setLoading(false);
            setAuthReady(true); // User and their data are loaded
        }, (error) => {
            console.error("Error listening to user data:", error);
            setLoading(false);
            setAuthReady(true); // Still ready, even with an error
        });

        return () => unsubscribeFirestore();

      } else {
        setUser(null);
        setUserData(null);
        setLoading(false);
        setAuthReady(true); // Ready, because we know there's no user
      }
    });

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
