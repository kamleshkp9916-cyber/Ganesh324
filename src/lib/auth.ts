
"use client";

import { GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut, createUserWithEmailAndPassword, updateProfile, signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { getFirebaseAuth } from "./firebase";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

export function useAuthActions() {
    const router = useRouter();
    const { toast } = useToast();

    const signInWithGoogle = async () => {
        const auth = getFirebaseAuth();
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
            toast({
                title: "Signed In!",
                description: `Welcome back!`,
            });
            window.location.href = "/live-selling";
        } catch (error) {
            console.error("Error signing in with Google: ", error);
            toast({
                title: "Error",
                description: "Failed to sign in with Google. Please try again.",
                variant: "destructive",
            });
        }
    };
    
    const signUpWithEmail = async (email: string, password: string, profileData: { firstName: string; lastName: string; }) => {
        const auth = getFirebaseAuth();
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            await updateProfile(user, {
                displayName: `${profileData.firstName} ${profileData.lastName}`,
            });
             toast({
                title: "Account Created!",
                description: "You have been successfully signed up.",
            });
            router.push('/live-selling');
        } catch (error: any) {
            console.error("Error signing up: ", error);
            let errorMessage = "An unknown error occurred.";
            switch (error.code) {
                case 'auth/email-already-in-use':
                    errorMessage = "This email address is already in use by another account.";
                    break;
                case 'auth/invalid-email':
                    errorMessage = "The email address is not valid.";
                    break;
                case 'auth/operation-not-allowed':
                    errorMessage = "Email/password accounts are not enabled.";
                    break;
                case 'auth/weak-password':
                    errorMessage = "The password is too weak.";
                    break;
                default:
                    errorMessage = error.message;
            }
            throw new Error(errorMessage);
        }
    };
    
    const signInWithEmail = async (email: string, password: string) => {
        const auth = getFirebaseAuth();
        try {
            await signInWithEmailAndPassword(auth, email, password);
            toast({
                title: "Logged In!",
                description: "Welcome back!",
            });

            if (email === "samael.prajapati@example.com") {
                router.push('/admin/dashboard');
                return;
            }

            const sellerDetailsRaw = localStorage.getItem('sellerDetails');
            if (sellerDetailsRaw) {
                const sellerDetails = JSON.parse(sellerDetailsRaw);
                if (sellerDetails.email === email) {
                    router.push('/seller/dashboard');
                    return;
                }
            }
            
            router.push('/live-selling');
        } catch (error: any) {
            console.error("Error signing in: ", error);
             let errorMessage = "An unknown error occurred.";
            switch (error.code) {
                case 'auth/user-not-found':
                case 'auth/wrong-password':
                case 'auth/invalid-credential':
                    errorMessage = "Invalid email or password. Please try again.";
                    break;
                case 'auth/invalid-email':
                    errorMessage = "Please enter a valid email address.";
                    break;
                case 'auth/user-disabled':
                    errorMessage = "This account has been disabled.";
                    break;
                default:
                    errorMessage = "Failed to sign in. Please try again later.";
            }
            throw new Error(errorMessage);
        }
    };

    const signOut = async () => {
        const auth = getFirebaseAuth();
        try {
            await firebaseSignOut(auth);
            
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
                title: 'Password Reset Email Sent',
                description: `If an account exists for ${email}, you will receive a password reset link. Please check your inbox.`,
            });
            router.push('/');
        } catch (error: any) {
             console.error("Error sending password reset email: ", error);
             toast({
                title: 'Error',
                description: "Failed to send password reset email. Please try again.",
                variant: "destructive",
            });
        }
    }

    return { signInWithGoogle, signOut, signUpWithEmail, signInWithEmail, sendPasswordResetLink };
}

export { useAuth } from '@/hooks/use-auth.tsx';
export { getFirebaseAuth as getAuth };
