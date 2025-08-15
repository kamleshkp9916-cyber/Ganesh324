
"use client";

import { useEffect, useState, createContext, useContext, useCallback } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';

const mockUser: User = {
  uid: 'mock-user-id-123',
  email: 'samael.prajapati@example.com',
  displayName: 'Samael Prajapati',
  photoURL: 'https://placehold.co/40x40.png',
  emailVerified: true,
  isAnonymous: false,
  metadata: {},
  providerData: [],
  providerId: 'password',
  tenantId: null,
  delete: async () => {},
  getIdToken: async () => 'mock-token',
  getIdTokenResult: async () => ({
    token: 'mock-token',
    expirationTime: '',
    authTime: '',
    issuedAtTime: '',
    signInProvider: null,
    signInSecondFactor: null,
    claims: {},
  }),
  reload: async () => {},
  toJSON: () => ({}),
};

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  // To use real Firebase authentication, set enableMockUser to false
  const enableMockUser = true;

  const checkAuth = useCallback(() => {
    setLoading(true);
    // Prioritize mock user if the session flag is set
    if (enableMockUser && sessionStorage.getItem('mockUserSessionActive') === 'true') {
      setUser(mockUser);
      setLoading(false);
      return;
    }

    // Fallback to Firebase auth
    const unsubscribe = onAuthStateChanged(auth, (authUser) => {
      if (authUser) {
        setUser(authUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [enableMockUser]);


  useEffect(() => {
    const unsubscribe = checkAuth();
    
    // Add a listener for storage changes, which helps in multi-tab scenarios
    // but also for our session-based mock.
    const handleStorageChange = () => {
      checkAuth();
    };

    window.addEventListener('storage', handleStorageChange);
    // Also re-check auth when the window gets focus
    window.addEventListener('focus', checkAuth);


    // Cleanup subscription on unmount
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', checkAuth);
    };
  }, [checkAuth]);


  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  return useContext(AuthContext);
};
