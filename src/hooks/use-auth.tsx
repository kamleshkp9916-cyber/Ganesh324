
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
    const updateUserState = (firebaseUser: User | null) => {
      if (enableMockUser && sessionStorage.getItem('mockUserSessionActive') === 'true') {
        setUser(mockUser);
      } else {
        setUser(firebaseUser);
      }
      setLoading(false);
    };

    // Firebase auth listener
    const unsubscribe = onAuthStateChanged(auth, updateUserState);

    // Initial check in case the component mounts after the initial auth state change
    updateUserState(auth.currentUser);

    // Listener for session storage changes (e.g., logout from another tab)
    // This helps sync state across tabs.
    const handleStorageChange = (event: StorageEvent) => {
       if (event.key === 'mockUserSessionActive' || event.key === null) {
          updateUserState(auth.currentUser); 
       }
    };

    window.addEventListener('storage', handleStorageChange);

    // Cleanup subscription on unmount
    return () => {
      unsubscribe();
      window.removeEventListener('storage', handleStorageChange);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  return useContext(AuthContext);
};
