
"use client";

import { useEffect, useState, createContext, useContext, useCallback } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { getFirebaseAuth } from '@/lib/firebase';
import { getUserData, UserData } from '@/lib/follow-data';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType>({ user: null, userData: null, loading: true, setUser: () => {} });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleSetUser = useCallback((newUser: User | null) => {
    setUser(newUser);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    const auth = getFirebaseAuth();
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      if (!firebaseUser) {
        setUserData(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [isMounted]);

  useEffect(() => {
      if (user) {
        // Delay fetching user data slightly to allow Firestore to connect
        setTimeout(() => {
            getUserData(user.uid, user).then(data => {
                setUserData(data);
                setLoading(false);
            }).catch(error => {
                console.error("Failed to fetch user data:", error);
                setLoading(false);
            });
        }, 100);
      }
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, userData, loading, setUser: handleSetUser }}>
      {!isMounted || loading ? <div className="w-full h-screen flex items-center justify-center"><LoadingSpinner /></div> : children}
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
