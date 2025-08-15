
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
            // In a real app, you would let Firebase handle the popup and result.
            // await signInWithPopup(auth, provider);
            
            // For mock flow, we simulate success immediately.
            console.log("Simulating Google Sign-In...");
            await new Promise(resolve => setTimeout(resolve, 500));
            
            toast({
                title: "Signed In!",
                description: `Welcome back!`,
            });
            // This is key for the mock user flow
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
            // In a real app, you would use this. For now, we simulate.
            // const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            // const user = userCredential.user;
            // await updateProfile(user, {
            //     displayName: `${profileData.firstName} ${profileData.lastName}`,
            // });
            console.log("Simulating account creation for:", email);
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // This is key for the mock user flow
            sessionStorage.setItem('mockUserSessionActive', 'true');
            
            // We still return a mock userCredential-like object if needed elsewhere
            // return { user: { email, displayName: `${profileData.firstName} ${profileData.lastName}` } };
        } catch (error: any) {
            console.error("Error signing up: ", error);
            let errorMessage = "An unknown error occurred.";
            // This error handling is kept for when you switch to real auth
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
            // In a real app, you would sign out from Firebase
            // await firebaseSignOut(auth);
            
            // This is key for the mock user flow
            sessionStorage.removeItem('mockUserSessionActive');
            
            toast({
                title: "Signed Out",
                description: "You have been successfully signed out.",
            });
            // Force a redirect to the login page to ensure a clean state.
            router.push('/');
            // A hard reload can also help ensure all state is cleared.
            router.refresh(); 

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
