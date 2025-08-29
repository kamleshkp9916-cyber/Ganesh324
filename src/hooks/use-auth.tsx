
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

  const handleSetUser = useCallback((newUser: User | null) => {
    setUser(newUser);
  }, []);

  useEffect(() => {
    const auth = getFirebaseAuth();

    // First, check for a mock admin user in sessionStorage.
    const mockAdminUserRaw = sessionStorage.getItem('mockAdminUser');
    if (mockAdminUserRaw) {
        try {
            const adminUser = JSON.parse(mockAdminUserRaw);
            setUser(adminUser);
            setLoading(false);
            // Don't set up the onAuthStateChanged listener if we're using the mock admin.
            // This prevents the real auth state (null) from overwriting our mock session.
            return; 
        } catch (e) {
            console.error("Failed to parse mock admin user from sessionStorage", e);
        }
    }

    // If no mock admin, proceed with real Firebase auth.
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
        }
        setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, setUser: handleSetUser }}>
      {children}
    </AuthContext.Provider>
  );
}


export const useAuth = () => {
  return useContext(AuthContext);
};
