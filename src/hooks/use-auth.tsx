
"use client";

import { useEffect, useState, createContext, useContext, useMemo } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { getFirebaseAuth, getFirestoreDb } from '@/lib/firebase';
import { createUserData, getUserData, UserData, updateUserData } from '@/lib/follow-data';
import { doc, onSnapshot } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, userData: null, loading: true });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getFirebaseAuth();
    const db = getFirestoreDb();
    
    // This is the listener for authentication state changes (login/logout)
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // User is logged in. Set the user object and start listening to their data document.
        setUser(firebaseUser);
        
        // Set up a real-time listener for the user's data in Firestore
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const unsubscribeFirestore = onSnapshot(userDocRef, async (doc) => {
            if (doc.exists()) {
                setUserData(doc.data() as UserData);
            } else {
                // This case handles a new user who has just signed up but their doc hasn't been created yet.
                // We create it here as a fallback.
                let data = await getUserData(firebaseUser.uid);
                if (!data) {
                    await createUserData(firebaseUser, 'customer');
                    data = await getUserData(firebaseUser.uid);
                }
                setUserData(data);
            }
            setLoading(false);
        }, (error) => {
            console.error("Error listening to user data:", error);
            setLoading(false);
        });

        // Return the cleanup function for the Firestore listener
        return () => unsubscribeFirestore();

      } else {
        // User is logged out
        setUser(null);
        setUserData(null);
        setLoading(false);
      }
    });

    // Return the cleanup function for the auth state listener
    return () => unsubscribeAuth();
  }, []);

  const value = useMemo(() => ({ user, userData, loading }), [user, userData, loading]);

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
