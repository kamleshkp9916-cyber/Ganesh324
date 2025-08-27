
"use client";

import { useEffect, useState, createContext, useContext } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { getFirebaseAuth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true, setUser: () => {} });

function AuthProviderInternal({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getFirebaseAuth();
    
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        // Special handling for mocked admin user
        if (user?.email === 'samael.prajapati@example.com' && !firebaseUser) {
          // Don't clear the mocked admin user
        } else {
          setUser(firebaseUser);
        }
        setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, loading, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}


export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
      <AuthProviderInternal>
        {children}
      </AuthProviderInternal>
  );
}


export const useAuth = () => {
  return useContext(AuthContext);
};

    