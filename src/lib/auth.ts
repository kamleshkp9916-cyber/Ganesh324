
"use client";

import { GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut, createUserWithEmailAndPassword, updateProfile, signInWithEmailAndPassword, sendEmailVerification, sendPasswordResetEmail, User } from "firebase/auth";
import { getFirebaseAuth } from "./firebase";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { getUserData, updateUserData } from "./follow-data";

const ADMIN_EMAIL = "samael.prajapati@example.com";

export function useAuthActions() {
    const router = useRouter();
    const { toast } = useToast();
    
    // Helper function to handle redirection after login
    const handleLoginSuccess = (user: User) => {
        // Fetch user data which includes the role
        const userData = getUserData(user.uid);
        
        toast({
            title: "Logged In!",
            description: "Welcome back!",
        });

        // Redirect based on role
        if (userData.role === 'admin') {
            router.push('/admin/dashboard');
        } else if (userData.role === 'seller') {
            router.push('/seller/dashboard');
        } else {
            router.push('/live-selling');
        }
    };


    const signInWithGoogle = async (role: 'customer' | 'seller' = 'customer') => {
        const auth = getFirebaseAuth();
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            // Create or update user data with the specified role
            updateUserData(user.uid, {
                uid: user.uid,
                displayName: user.displayName || 'Google User',
                email: user.email || '',
                photoURL: user.photoURL || '',
                role: role
            });
            
            handleLoginSuccess(user);

        } catch (error) {
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

            // Create user record in our mock DB with the correct role
            updateUserData(user.uid, {
                ...values,
                uid: user.uid,
                displayName: displayName,
                role: role,
                photoURL: ''
            });

            await sendEmailVerification(user);
            
             toast({
                title: "Account Created!",
                description: "A verification email has been sent. Please check your inbox.",
            });
            if (!skipRedirect) {
                router.push('/verify-email');
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

        // Special case for admin login
        if (email === ADMIN_EMAIL) {
            // This is a mock user object. In a real app, you'd get the actual user object.
            const mockAdminUser: User = {
                uid: 'admin_uid_placeholder', // A consistent placeholder UID
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
                getIdToken: async () => 'mock-token',
                getIdTokenResult: async () => ({
                    token: 'mock-token',
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
            handleLoginSuccess(mockAdminUser);
            return; // IMPORTANT: This stops the function from proceeding to the real auth call.
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
            
            handleLoginSuccess(user);

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
