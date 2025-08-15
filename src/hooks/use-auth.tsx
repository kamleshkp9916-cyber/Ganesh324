
"use client";

import { useEffect, useState, createContext, useContext } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter, usePathname } from 'next/navigation';

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
  const router = useRouter();
  const pathname = usePathname();
  
  // To use real Firebase authentication, set enableMockUser to false
  const enableMockUser = true;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (authUser) => {
      if (authUser) {
        setUser(authUser);
      } else {
        if (enableMockUser && (pathname === '/' || pathname === '/signup' || pathname.startsWith('/otp'))) {
            // Don't set mock user on auth pages to allow login/signup flow
            setUser(null);
        } else if (enableMockUser) {
            // Set mock user if not logged in and not on auth pages
            // Check a session storage flag to see if we should show the mock user
            const mockUserSessionActive = sessionStorage.getItem('mockUserSessionActive');
            if (mockUserSessionActive === 'true') {
                 setUser(mockUser);
            } else {
                setUser(null);
            }
        } else {
             setUser(null);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [pathname, enableMockUser]);

  // This effect simulates a login for the mock user
   useEffect(() => {
    if (enableMockUser && (pathname.startsWith('/otp') || pathname === '/live-selling')) {
        const hasBeenRedirected = sessionStorage.getItem('mockUserSessionActive');
        if (!hasBeenRedirected) {
             // This logic runs after a "login" or "signup" to show the mock user
            sessionStorage.setItem('mockUserSessionActive', 'true');
            if (!auth.currentUser) {
                setUser(mockUser);
            }
        }
    }
  },[pathname, enableMockUser]);


  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  return useContext(AuthContext);
};
