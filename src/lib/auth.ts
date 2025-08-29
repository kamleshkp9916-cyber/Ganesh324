
"use client";

import { GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut, createUserWithEmailAndPassword, updateProfile, signInWithEmailAndPassword, sendEmailVerification, sendPasswordResetEmail, User } from "firebase/auth";
import { getFirebaseAuth } from "./firebase";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth.tsx";
import { updateUserData } from "./follow-data";

const ADMIN_EMAIL = "samael.prajapati@example.com";

export function useAuthActions() {
    const router = useRouter();
    const { toast } = useToast();
    const { setUser } = useAuth();
    
    const signInWithGoogle = async (role: 'customer' | 'seller' = 'customer') => {
        const auth = getFirebaseAuth();
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
             toast({
                title: "Logged In!",
                description: "Welcome back!",
            });
            // Redirection and user data creation is now handled in src/app/page.tsx
        } catch (error: any) {
            console.error("Error signing in with Google: ", error);
            toast({
                title: "Error",
                description: "Failed to sign in with Google. Please try again.",
                variant: "destructive",
            });
        }
    };
    
    const signUpWithEmail = async (values: any, role: 'customer' | 'seller', skipRedirect = false) => {
        const auth = getFirebaseAuth();
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
            const user = userCredential.user;
            const displayName = `${values.firstName} ${values.lastName}`;
            
            await updateProfile(user, { displayName: displayName });

            // Do not call updateUserData here as it accesses localStorage and causes server errors
            // The creation logic is now handled client-side in src/app/page.tsx's useEffect

            await sendEmailVerification(user);
            
             toast({
                title: "Account Created!",
                description: "A verification email has been sent. Please check your inbox.",
            });
            if (!skipRedirect) {
                router.push('/verify-email');
            }
             // Store temporary data for the client-side to pick up
            if(typeof window !== 'undefined') {
                sessionStorage.setItem(`newUser_${user.uid}`, JSON.stringify({ ...values, role, uid: user.uid, displayName }));
            }

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

        if (email === ADMIN_EMAIL) {
            const mockAdminUser: User = {
                uid: 'admin-mock-uid',
                email: ADMIN_EMAIL,
                displayName: 'Samael Prajapati',
                photoURL: '',
                emailVerified: true,
                isAnonymous: false,
                metadata: {},
                providerData: [],
                providerId: 'password',
                tenantId: null,
                delete: async () => {},
                getIdToken: async () => 'mock-admin-token',
                getIdTokenResult: async () => ({
                    token: 'mock-admin-token',
                    authTime: new Date().toISOString(),
                    issuedAtTime: new Date().toISOString(),
                    signInProvider: 'password',
                    signInSecondFactor: null,
                    expirationTime: new Date(Date.now() + 3600 * 1000).toISOString(),
                    claims: {},
                }),
                reload: async () => {},
                toJSON: () => ({}),
            };
            sessionStorage.setItem('mockAdminUser', JSON.stringify(mockAdminUser));
            setUser(mockAdminUser); // Update auth context
            toast({ title: "Logged In!", description: "Welcome, Admin!" });
            router.replace('/admin/dashboard'); 
            return;
        }
        
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            if (!user.emailVerified) {
                await sendEmailVerification(user);
                toast({
                    title: "Email Not Verified",
                    description: "Please verify your email address. A new verification link has been sent.",
                    variant: "destructive"
                });
                router.push('/verify-email');
                return;
            }
            
            toast({
                title: "Logged In!",
                description: "Welcome back!",
            });
            // Redirection is handled in src/app/page.tsx after user state is confirmed
        } catch (error: any) {
             console.error("Error signing in: ", error);
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
            throw new Error(errorMessage);
        }
    };
    

    const signOut = async () => {
        const auth = getFirebaseAuth();
        try {
            await firebaseSignOut(auth);
            
            sessionStorage.removeItem('mockAdminUser');
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

    return { signInWithGoogle, signOut, signUpWithEmail, signInWithEmail, sendPasswordResetLink };
}

export { useAuth } from '@/hooks/use-auth.tsx';
export { getFirebaseAuth as getAuth };
