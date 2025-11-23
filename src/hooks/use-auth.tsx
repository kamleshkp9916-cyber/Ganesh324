
"use client";

import { useEffect, useState, createContext, useContext, useMemo } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { useFirebase } from '@/firebase'; // Import the main hook
import { createUserData, getUserData, UserData } from "@/lib/follow-data";

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  authReady: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, userData: null, loading: true, authReady: false });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { auth, firestore } = useFirebase(); // Get instances from the provider
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    if (!auth || !firestore) {
      // Firebase services are not available yet.
      return;
    }

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      setAuthReady(false);
      setUser(firebaseUser);

      if (firebaseUser) {
        const userDocRef = doc(firestore, 'users', firebaseUser.uid);
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
          setAuthReady(true);
        }, (error) => {
          console.error("Error listening to user data:", error);
          setUserData(null);
          setLoading(false);
          setAuthReady(true);
        });
        
        // Return the firestore listener unsubscribe function
        return () => unsubscribeFirestore();
      } else {
        setUser(null);
        setUserData(null);
        setLoading(false);
        setAuthReady(true);
      }
    });

    return () => unsubscribeAuth();
  }, [auth, firestore]);

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
