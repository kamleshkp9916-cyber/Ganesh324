
"use client";

import { useEffect, useState, createContext, useContext, useCallback } from 'react';
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

  useEffect(() => {
    // --- Mock user for development ---
    // To use real Firebase authentication, set enableMockUser to false
    const enableMockUser = true;

    const handleAuthChange = (authUser: User | null) => {
        if (enableMockUser && authUser) {
            // If mock user is enabled and we get a real auth user,
            // we can use a mock user instead or merge details.
            // For now, let's just use the mock user.
            setUser(mockUser);
        } else {
            setUser(authUser);
        }
        setLoading(false);

        // Redirect if a user is logged in and on the login/signup page
        if (authUser && (pathname === '/' || pathname === '/signup')) {
            router.replace('/live-selling');
        }
    };
    
    const unsubscribe = onAuthStateChanged(auth, handleAuthChange);

    // If mock user is enabled and there's no real user initially, set the mock user.
    // This handles the initial load when not logged into Firebase.
    if (enableMockUser && !auth.currentUser) {
       // A small delay to simulate loading
       setTimeout(() => {
            setUser(mockUser);
            setLoading(false);
       }, 500)
    }


    return () => unsubscribe();
    
  }, [pathname, router]);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  return useContext(AuthContext);
};
