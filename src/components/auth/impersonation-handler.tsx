
"use client";

import { useEffect, useState } from 'react';
import { getFirebaseAuth } from '@/lib/firebase';
import { signInWithCustomToken, signOut as firebaseSignOut } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '../ui/button';
import { LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

export function ImpersonationHandler() {
  const { toast } = useToast();
  const [isImpersonating, setIsImpersonating] = useState(false);
  const { user } = useAuth(); // Use auth state to know when to show banner

  useEffect(() => {
    const handleImpersonation = async () => {
      const token = localStorage.getItem('impersonationToken');
      if (token) {
        localStorage.removeItem('impersonationToken'); // Use the token only once
        const auth = getFirebaseAuth();
        try {
          // Sign out any existing user in this tab
          if (auth.currentUser) {
            await firebaseSignOut(auth);
          }
          await signInWithCustomToken(auth, token);
          // The useAuth hook will handle the user state update
        } catch (error) {
          console.error("Custom token sign-in error:", error);
          toast({ variant: 'destructive', title: "Impersonation Failed", description: "The login link has expired or is invalid." });
        }
      }
    };

    handleImpersonation();
  }, [toast]);
  
  useEffect(() => {
      // Check if we are in an impersonation session by looking for the admin token
      const adminToken = localStorage.getItem('adminToken');
      setIsImpersonating(!!adminToken);
  }, [user]);

  const handleEndImpersonation = async () => {
    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) return;

    localStorage.removeItem('adminToken');
    const auth = getFirebaseAuth();

    try {
        await firebaseSignOut(auth);
        toast({ title: "Session Ended", description: "You are no longer impersonating the user. You can close this tab."});
        window.close();
    } catch (error) {
        console.error("Sign out error:", error);
        toast({ variant: 'destructive', title: "Error", description: "Could not end the session."});
    }
  };

  if (!isImpersonating) {
    return null;
  }

  return (
    <div className="bg-yellow-400 text-yellow-900 p-2 text-center text-sm font-semibold flex items-center justify-center gap-4 fixed top-0 w-full z-[100]">
      <p>You are viewing this page as another user.</p>
      <Button variant="ghost" size="sm" className="h-auto p-1 hover:bg-yellow-500/50" onClick={handleEndImpersonation}>
        <LogOut className="mr-2 h-4 w-4" />
        End Session
      </Button>
    </div>
  );
}
