
"use client";

import { useEffect, useState, createContext, useContext, useCallback } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { getFirebaseAuth } from '@/lib/firebase';

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
    
    // The onAuthStateChanged listener will handle Firebase user state
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        // Check for a mock admin user in sessionStorage
        const mockAdminUserRaw = sessionStorage.getItem('mockAdminUser');
        if (mockAdminUserRaw) {
            try {
                const mockAdminUser = JSON.parse(mockAdminUserRaw);
                setUser(mockAdminUser); // Prioritize admin session
            } catch (e) {
                 console.error("Failed to parse mock admin user from sessionStorage", e);
                 setUser(firebaseUser); // Fallback to firebase user
            }
        } else {
            setUser(firebaseUser); // No admin session, use firebase state
        }
        setLoading(false);
    });

    return () => unsubscribe();
  }, []); // This effect runs only once on mount

  return (
    <AuthContext.Provider value={{ user, loading, setUser: handleSetUser }}>
      {children}
    </AuthContext.Provider>
  );
}


export const useAuth = () => {
  return useContext(AuthContext);
};
