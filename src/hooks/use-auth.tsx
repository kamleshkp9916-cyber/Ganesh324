
"use client";

import { useEffect, useState, createContext, useContext, useMemo } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { getFirebaseAuth } from '@/lib/firebase';
import { createUserData, getUserData, UserData } from '@/lib/follow-data';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

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
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        let data = await getUserData(firebaseUser.uid);
        if (!data) {
          // This is a new user, create their document with default role 'customer'
          await createUserData(firebaseUser, 'customer');
          data = await getUserData(firebaseUser.uid); // Re-fetch the newly created data
        }
        setUser(firebaseUser);
        setUserData(data);
      } else {
        setUser(null);
        setUserData(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
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
