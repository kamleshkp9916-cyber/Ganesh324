
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
    
    const mockAdminUserRaw = sessionStorage.getItem('mockAdminUser');
    if (mockAdminUserRaw) {
        try {
            const adminUser = JSON.parse(mockAdminUserRaw);
            setUser(adminUser);
            setLoading(false);
            // We still want the real auth listener to run in case the real session changes
        } catch (e) {
            console.error("Failed to parse mock admin user from sessionStorage", e);
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
            
            const currentMockAdminRaw = sessionStorage.getItem('mockAdminUser');
            // If there's a real user but also a mock admin, the real user takes precedence.
            if(currentMockAdminRaw) {
                sessionStorage.removeItem('mockAdminUser');
            }

            setUser(augmentedUser as User);
        } else {
             // This is the crucial part: if Firebase says no user, we ensure our state is null.
             // This also handles signing out the mock admin user.
             if (sessionStorage.getItem('mockAdminUser')) {
                 sessionStorage.removeItem('mockAdminUser');
             }
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
