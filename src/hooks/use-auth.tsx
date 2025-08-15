
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
    if (enableMockUser && sessionStorage.getItem('mockUserSessionActive') === 'true') {
      setUser(mockUser);
      setLoading(false);
      // We don't need to check Firebase if the mock session is active.
      // We return an empty function to match the signature of onAuthStateChanged.
      return () => {};
    }

    // Fallback to Firebase auth if mock session isn't active
    const unsubscribe = onAuthStateChanged(auth, (authUser) => {
      // Re-check for mock session in case it was set during a multi-step auth flow.
      if (enableMockUser && sessionStorage.getItem('mockUserSessionActive') === 'true') {
        setUser(mockUser);
      } else {
        setUser(authUser);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [enableMockUser]);


  useEffect(() => {
    const unsubscribe = checkAuth();
    
    const handleStorageChange = () => {
      checkAuth();
    };

    window.addEventListener('storage', handleStorageChange);
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
