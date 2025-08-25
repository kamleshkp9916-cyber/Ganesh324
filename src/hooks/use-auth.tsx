
"use client";

import { useEffect, useState, createContext, useContext } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { usePathname, useRouter } from 'next/navigation';

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

function AuthProviderInternal({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  
  const enableMockUser = false; // Disabled mock user flow

  useEffect(() => {
    const updateUserState = (firebaseUser: User | null) => {
      if (enableMockUser && sessionStorage.getItem('mockUserSessionActive') === 'true') {
        const isSellerLogin = sessionStorage.getItem('isSellerLogin') === 'true';
        const sellerDetailsRaw = localStorage.getItem('sellerDetails');

        if (isSellerLogin && sellerDetailsRaw) {
             const sellerDetails = JSON.parse(sellerDetailsRaw);
             setUser({
                ...mockUser,
                displayName: sellerDetails.name,
                email: sellerDetails.email,
             });
        } else {
             // Default to admin/customer mock user
             setUser(mockUser);
        }
      } else {
        setUser(firebaseUser);
      }
      setLoading(false);
    };

    const unsubscribe = onAuthStateChanged(auth, updateUserState);
    updateUserState(auth.currentUser);

    const handleStorageChange = (event: StorageEvent) => {
       if (event.key === 'mockUserSessionActive' || event.key === 'sellerDetails' || event.key === 'isSellerLogin' || event.key === null) {
          updateUserState(auth.currentUser); 
       }
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      unsubscribe();
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}


export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
      <AuthProviderInternal>
        {children}
      </AuthProviderInternal>
  );
}


export const useAuth = () => {
  return useContext(AuthContext);
};
