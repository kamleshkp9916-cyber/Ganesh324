
"use client";

import { useEffect, useState, createContext, useContext } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { getFirebaseAuth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

function AuthProviderInternal({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getFirebaseAuth();
    
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        setUser(firebaseUser);
        setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
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
