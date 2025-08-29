
"use client";

import { GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut, sendPasswordResetEmail, User } from "firebase/auth";
import { getFirebaseAuth } from "./firebase";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth.tsx";

export function useAuthActions() {
    const router = useRouter();
    const { toast } = useToast();
    const { setUser } = useAuth();
    
    const signOut = async () => {
        const auth = getFirebaseAuth();
        try {
            await firebaseSignOut(auth);
            
            if (typeof window !== 'undefined') {
                sessionStorage.removeItem('mockAdminUser');
            }
            setUser(null);

            toast({
                title: "Signed Out",
                description: "You have been successfully signed out.",
            });
            
            router.push('/');

        } catch (error) {
            console.error("Error signing out: ", error);
            toast({
                title: "Error",
                description: "Failed to sign out. Please try again.",
                variant: "destructive",
            });
        }
    };
    
    const sendPasswordResetLink = async (email: string) => {
        const auth = getFirebaseAuth();
        try {
            await sendPasswordResetEmail(auth, email);
            toast({
                title: "Password Reset Email Sent",
                description: "If an account exists for this email, a reset link has been sent.",
            });
             router.push('/');
        } catch (error: any) {
             console.error("Error sending password reset email: ", error);
             toast({
                title: "Error",
                description: "Failed to send password reset email. Please try again later.",
                variant: "destructive",
            });
        }
    };

    return { signOut, sendPasswordResetLink };
}

export { useAuth } from '@/hooks/use-auth.tsx';
export { getFirebaseAuth as getAuth };
