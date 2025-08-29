
"use client";

import { GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut, createUserWithEmailAndPassword, updateProfile, signInWithEmailAndPassword, sendEmailVerification, sendPasswordResetEmail, User } from "firebase/auth";
import { getFirebaseAuth } from "./firebase";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { getUserData, updateUserData } from "./follow-data";
import { useAuth } from "@/hooks/use-auth.tsx";

const ADMIN_EMAIL = "samael.prajapati@example.com";

const findSellerByPhone = (phone: string) => {
    if (typeof window === 'undefined') return null;
    const allUsers = JSON.parse(localStorage.getItem('globalUserData') || '{}');
    return Object.values(allUsers).find((user: any) => user.role === 'seller' && user.phone === phone);
}

export function useAuthActions() {
    const router = useRouter();
    const { toast } = useToast();
    const { setUser } = useAuth();
    
    // Helper function to handle redirection after login
    const handleLoginSuccess = (user: User) => {
        // Special case for admin user
        if (user.email === ADMIN_EMAIL) {
             sessionStorage.setItem('mockAdminUser', JSON.stringify(user));
             setUser(user);
             toast({ title: "Logged In!", description: "Welcome, Admin!" });
             router.replace('/admin/dashboard');
             return;
        }
        
        const userData = getUserData(user.uid);
        const actualRole = userData.role;
        // @ts-ignore
        const verificationStatus = userData.verificationStatus;
        
        toast({
            title: "Logged In!",
            description: "Welcome back!",
        });

        // Redirect based on role and status
        if (actualRole === 'seller') {
            if (verificationStatus === 'verified') {
                 router.replace('/seller/dashboard');
            } else {
                 router.replace('/seller/verification');
            }
        } else {
            router.replace('/live-selling');
        }
    };


    const signInWithGoogle = async (role: 'customer' | 'seller' = 'customer') => {
        const auth = getFirebaseAuth();
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            // Create or update user data with the specified role
            // Only set the role if it's a new user, otherwise respect the existing role
            const existingData = getUserData(user.uid);
            updateUserData(user.uid, {
                uid: user.uid,
                displayName: user.displayName || 'Google User',
                email: user.email || '',
                photoURL: user.photoURL || '',
                role: existingData.role || role
            });
            
            handleLoginSuccess(user);

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
            handleLoginSuccess(mockAdminUser);
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
            
            handleLoginSuccess(user);

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
    
    const validateSellerPassword = async (phone: string, password: string): Promise<boolean> => {
        const auth = getFirebaseAuth();
        const seller: any = findSellerByPhone(phone);
        if (!seller) {
            throw new Error("No seller account found with this phone number.");
        }
        try {
            // We use signInWithEmailAndPassword to validate the password, but we don't complete the login here.
            await signInWithEmailAndPassword(auth, seller.email, password);
            // If the above doesn't throw, password is correct. Sign out immediately.
            await firebaseSignOut(auth);
            return true;
        } catch(error: any) {
            if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
                throw new Error("Invalid password. Please try again.");
            }
            // Re-throw other errors
            throw error;
        }
    }

    const signInWithOtp = async (phone: string) => {
        const auth = getFirebaseAuth();
        const seller: any = findSellerByPhone(phone);
        if (!seller) {
            throw new Error("No seller account found with this phone number.");
        }

        // In a real app, you would sign in the user via a custom token
        // received after successful OTP verification on your backend.
        // For this demo, we'll find the user and log them in directly
        // since we can't do a full custom auth flow.
        
        // This is a MOCK sign-in. We're finding the user and manually setting them as logged in.
         const mockUser: User = {
                uid: seller.uid,
                email: seller.email,
                displayName: seller.displayName,
                photoURL: seller.photoURL,
                emailVerified: true, // We assume verified for this flow
                isAnonymous: false,
                metadata: {},
                providerData: [],
                providerId: 'phone',
                tenantId: null,
                delete: async () => {},
                getIdToken: async () => 'mock-seller-token',
                getIdTokenResult: async () => ({
                    token: 'mock-seller-token',
                    authTime: new Date().toISOString(),
                    issuedAtTime: new Date().toISOString(),
                    signInProvider: 'phone',
                    signInSecondFactor: null,
                    expirationTime: new Date(Date.now() + 3600 * 1000).toISOString(),
                    claims: {},
                }),
                reload: async () => {},
                toJSON: () => ({}),
            };
        
        // This will update the auth state and trigger redirection.
        setUser(mockUser);
        handleLoginSuccess(mockUser);
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

    return { signInWithGoogle, signOut, signUpWithEmail, signInWithEmail, sendPasswordResetLink, signInWithOtp, validateSellerPassword };
}

export { useAuth } from '@/hooks/use-auth.tsx';
export { getFirebaseAuth as getAuth };
