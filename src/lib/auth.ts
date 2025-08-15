
"use client";

import { GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "./firebase";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

export function useAuthActions() {
    const router = useRouter();
    const { toast } = useToast();

    const signInWithGoogle = async () => {
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            toast({
                title: "Signed In!",
                description: `Welcome back, ${result.user.displayName}!`,
            });
            sessionStorage.setItem('mockUserSessionActive', 'true');
            router.push("/live-selling");
        } catch (error) {
            console.error("Error signing in with Google: ", error);
            toast({
                title: "Error",
                description: "Failed to sign in with Google. Please try again.",
                variant: "destructive",
            });
        }
    };
    
    const signUpWithEmailAndPassword = async (email: string, password: string, profileData: { firstName: string; lastName: string; }) => {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            await updateProfile(user, {
                displayName: `${profileData.firstName} ${profileData.lastName}`,
            });
            toast({
                title: "Account Created!",
                description: "You have successfully created an account and logged in.",
            });
            sessionStorage.setItem('mockUserSessionActive', 'true');
            router.push(`/live-selling`);
            return userCredential;
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

    const signOut = async () => {
        try {
            await firebaseSignOut(auth);
            // This is key for the mock user flow
            sessionStorage.removeItem('mockUserSessionActive');
            toast({
                title: "Signed Out",
                description: "You have been successfully signed out.",
            });
            // The onAuthStateChanged listener in useAuth will handle the state update
            // and the UI will rerender accordingly without a forced navigation.
        } catch (error) {
            console.error("Error signing out: ", error);
            toast({
                title: "Error",
                description: "Failed to sign out. Please try again.",
                variant: "destructive",
            });
        }
    };

    return { signInWithGoogle, signOut, signUpWithEmailAndPassword };
}

export { useAuth } from '@/hooks/use-auth.tsx';
export { auth };
