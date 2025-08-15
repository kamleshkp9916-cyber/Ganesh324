
"use client";

import { useEffect, useState, createContext, useContext } from 'react';
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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (authUser) => {
        // If we have a real Firebase user, we can use it.
        // For this project, we prioritize the mock user if the session flag is set.
        if (enableMockUser && sessionStorage.getItem('mockUserSessionActive') === 'true') {
          setUser(mockUser);
        } else if (authUser) {
          setUser(authUser);
        } else {
          setUser(null);
        }
        setLoading(false);
    });

    // Also check session storage on initial load, in case auth state is already set
    if (enableMockUser && sessionStorage.getItem('mockUserSessionActive') === 'true') {
      setUser(mockUser);
    }
    setLoading(false);


    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [enableMockUser]);


  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  return useContext(AuthContext);
};
