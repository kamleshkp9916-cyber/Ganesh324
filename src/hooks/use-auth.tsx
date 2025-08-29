

"use client";

import { useEffect, useState, createContext, useContext, useCallback } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { getFirebaseAuth } from '@/lib/firebase';
import { createUserData, getUserData, UserData } from '@/lib/follow-data';
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

  const handleSetUser = useCallback((newUser: User | null) => {
    setUser(newUser);
  }, []);

  useEffect(() => {
    const auth = getFirebaseAuth();
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        setUser(firebaseUser);
        let data = await getUserData(firebaseUser.uid);
        if (!data) {
          // This is a new user, create their document
          await createUserData(firebaseUser, 'customer');
          data = await getUserData(firebaseUser.uid); // Re-fetch the newly created data
        }
        setUserData(data);
      } else {
        setUser(null);
        setUserData(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);


  return (
    <AuthContext.Provider value={{ user, userData, loading, setUser: handleSetUser }}>
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
