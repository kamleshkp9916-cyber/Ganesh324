
"use client";

import { useEffect, useState, createContext, useContext, useCallback } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { getFirebaseAuth } from '@/lib/firebase';
import { getUserData } from '@/lib/follow-data';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true, setUser: () => {} });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
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

    const mockAdminUserRaw = sessionStorage.getItem('mockAdminUser');
    if (mockAdminUserRaw) {
        try {
            const adminUser = JSON.parse(mockAdminUserRaw);
            setUser(adminUser);
            setLoading(false);
            return; 
        } catch (e) {
            console.error("Failed to parse mock admin user from sessionStorage", e);
            sessionStorage.removeItem('mockAdminUser');
        }
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        if (firebaseUser) {
            const userData = getUserData(firebaseUser.uid, {
                displayName: firebaseUser.displayName || 'New User',
                email: firebaseUser.email || '',
                photoURL: firebaseUser.photoURL || '',
            });
            
            const augmentedUser = { ...firebaseUser, ...userData };
            setUser(augmentedUser as User);
        } else {
             setUser(null);
             sessionStorage.removeItem('mockAdminUser');
        }
        setLoading(false);
    });

    return () => unsubscribe();
  }, [isMounted]);

  return (
    <AuthContext.Provider value={{ user, loading, setUser: handleSetUser }}>
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
