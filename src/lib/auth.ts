
"use client";

import { GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut, sendPasswordResetEmail, User, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { getFirebaseAuth } from "./firebase";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { createUserData } from "./follow-data";

export function useAuthActions() {
    const router = useRouter();
    const { toast } = useToast();
    
    const signOut = async () => {
        const auth = getFirebaseAuth();
        try {
            await firebaseSignOut(auth);
            
            router.push('/');
            toast({
                title: "Signed Out",
                description: "You have been successfully signed out.",
            });

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

    const handleGoogleSignIn = async () => {
        const auth = getFirebaseAuth();
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
             toast({
                title: "Signed In!",
                description: "Welcome back!",
            });
        } catch (error: any) {
            console.error("Error signing in with Google: ", error);
            toast({
                title: "Error",
                description: "Failed to sign in with Google. Please try again.",
                variant: "destructive",
            });
        }
    };

    const handleEmailSignIn = async (values: any) => {
        const auth = getFirebaseAuth();
        try {
            const userCredential = await signInWithEmailAndPassword(auth, values.email, values.password);
             if (!userCredential.user.emailVerified) {
                await sendEmailVerification(userCredential.user);
                toast({
                    title: "Email Not Verified",
                    description: "Please verify your email address. A new verification link has been sent.",
                    variant: "destructive"
                });
                router.push('/verify-email');
            } else {
                 toast({
                    title: "Logged In!",
                    description: "Welcome back!",
                });
            }
        } catch (error: any) {
             let errorMessage = "An unknown error occurred.";
            switch (error.code) {
                case 'auth/user-not-found':
                case 'auth/wrong-password':
                case 'auth/invalid-credential':
                    errorMessage = "Invalid credentials. Please try again.";
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
            toast({
                title: "Login Failed",
                description: errorMessage,
                variant: "destructive"
            });
        }
    };

    const handleEmailSignUp = async (values: any) => {
         const auth = getFirebaseAuth();
        try {
          const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
          const user = userCredential.user;
          
          await createUserData(user, 'customer', {
            displayName: `${values.firstName} ${values.lastName}`,
            phone: values.phone,
          });
          
          await sendEmailVerification(user);
          
          toast({
            title: "Account Created!",
            description: "A verification email has been sent. Please check your inbox.",
          });
          
          router.push('/verify-email');

        } catch (error: any) {
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
            toast({
                title: "Sign Up Failed",
                description: errorMessage,
                variant: "destructive",
            });
        }
    };

    return { signOut, sendPasswordResetLink, handleGoogleSignIn, handleEmailSignIn, handleEmailSignUp };
}

export { getFirebaseAuth as getAuth };
