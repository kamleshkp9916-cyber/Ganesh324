
"use client";

import { useEffect, useState, createContext, useContext, useMemo } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { getFirebaseAuth } from '@/lib/firebase';
import { createUserData, getUserData, UserData, updateUserData } from '@/lib/follow-data';

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, userData: null, loading: true });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getFirebaseAuth();
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        let data = await getUserData(firebaseUser.uid);
        
        // --- TEMPORARY ADMIN PROMOTION LOGIC ---
        // This will ensure the specific user is promoted to admin upon login.
        if (firebaseUser.email === 'kamleshkp9916@gmail.com' && data?.role !== 'admin') {
            console.log("Attempting to promote kamleshkp9916@gmail.com to admin...");
            await updateUserData(firebaseUser.uid, { role: 'admin' });
            // Re-fetch data after update to ensure it's fresh
            data = await getUserData(firebaseUser.uid);
            console.log("Re-fetched user data, new role:", data?.role);
        }
        // --- END TEMPORARY LOGIC ---

        // If no user document exists, it's a brand new user (e.g., first Google sign-in).
        // Create a default customer profile for them.
        if (!data) {
          await createUserData(firebaseUser, 'customer');
          data = await getUserData(firebaseUser.uid); // Re-fetch the newly created data
        }
        setUser(firebaseUser);
        setUserData(data);
      } else {
        setUser(null);
        setUserData(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const value = useMemo(() => ({ user, userData, loading }), [user, userData, loading]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}


export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
