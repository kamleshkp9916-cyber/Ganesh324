
"use client";

import { useEffect, useState, createContext, useContext } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { getFirebaseAuth } from '@/lib/firebase';

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
    // Attempt to load mock admin user from sessionStorage on initial load
    try {
        const mockAdminUser = sessionStorage.getItem('mockAdminUser');
        if (mockAdminUser) {
            setUser(JSON.parse(mockAdminUser));
        }
    } catch (e) {
        console.error("Failed to parse mock admin user from sessionStorage", e);
    }


    const auth = getFirebaseAuth();
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        const mockAdminUserRaw = sessionStorage.getItem('mockAdminUser');

        if (mockAdminUserRaw) {
            // If the admin user is in session storage, prioritize it.
             if (!user) {
                setUser(JSON.parse(mockAdminUserRaw));
            }
        } else {
             // If not an admin, proceed with normal firebase auth state.
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
