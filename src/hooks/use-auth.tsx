
"use client";

import { useEffect, useState, createContext, useContext, useMemo } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { FirebaseContext } from '@/firebase/provider';
import { createUserData, getUserData, UserData } from "@/lib/follow-data";
import { getAuthActions } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Auth } from 'firebase/auth';
import { FirebaseApp } from 'firebase/app';

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  authReady: boolean; // Indicates if the initial auth check is done
  actions: ReturnType<typeof getAuthActions>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const firebaseContext = useContext(FirebaseContext);
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [authReady, setAuthReady] = useState(false);
  
  const router = useRouter();
  const { toast } = useToast();

  const actions = useMemo(() => {
    if (firebaseContext?.auth && firebaseContext?.firebaseApp && router && toast) {
      return getAuthActions(firebaseContext.auth, firebaseContext.firebaseApp, router, toast);
    }
    // Return a dummy object if context is not ready, to prevent errors on initial render
    return getAuthActions({} as Auth, {} as FirebaseApp, {} as typeof router, () => {});
  }, [firebaseContext, router, toast]);

  useEffect(() => {
    if (!firebaseContext || !firebaseContext.auth || !firebaseContext.firestore) {
      // Still waiting for Firebase services from the parent provider.
      // We set authReady to false because we can't check auth state yet.
      setAuthReady(false);
      setLoading(true);
      return;
    }
    
    const { auth, firestore } = firebaseContext;

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      
      if (firebaseUser) {
        setUser(firebaseUser);
        const userDocRef = doc(firestore, 'users', firebaseUser.uid);
        const unsubscribeFirestore = onSnapshot(userDocRef, (doc) => {
          if (doc.exists()) {
            setUserData(doc.data() as UserData);
          } else {
            setUserData(null);
          }
          setLoading(false);
          setAuthReady(true);
        }, (error) => {
          console.error("Error listening to user data:", error);
          setUserData(null);
          setLoading(false);
          setAuthReady(true);
        });
        
        return () => unsubscribeFirestore();
      } else {
        setUser(null);
        setUserData(null);
        setLoading(false);
        setAuthReady(true);
      }
    });

    return () => unsubscribeAuth();
  }, [firebaseContext]);

  const value = useMemo(() => ({ user, userData, loading, authReady, actions }), [user, userData, loading, authReady, actions]);

  if (!firebaseContext) {
      return <div>Loading Firebase...</div>;
  }

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

export const useAuthActions = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuthActions must be used within an AuthProvider');
    }
    return context.actions;
}
