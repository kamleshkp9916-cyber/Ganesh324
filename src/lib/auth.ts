
"use client";

import { GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut, sendPasswordResetEmail, User, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification, getAdditionalUserInfo, updateProfile, setPersistence, browserSessionPersistence } from "firebase/auth";
import { initializeFirebase } from "@/firebase";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { createUserData, updateUserData, UserData, getUserData } from "./follow-data";
import { getStorage, ref, uploadString, getDownloadURL, deleteObject } from "firebase/storage";
import { getFunctions, httpsCallable } from "firebase/functions";

export function useAuthActions() {
    const router = useRouter();
    const { toast } = useToast();
    
    const signOut = async (isSeller = false) => {
        const { auth } = initializeFirebase();
        try {
            await firebaseSignOut(auth);
            
            if (isSeller) {
                sessionStorage.setItem('sellerSignedOut', 'true');
            }

            // Force a full page reload to the login page
            window.location.href = '/';

            // Toast will likely not be seen, but it's good practice to leave it.
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
        const { auth } = initializeFirebase();
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
        const { auth } = initializeFirebase();
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            
            const additionalUserInfo = getAdditionalUserInfo(result);
            if (additionalUserInfo?.isNewUser) {
                await createUserData(user, 'customer');
            }
            
            toast({
                title: "Signed In!",
                description: "Welcome!",
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
        const { auth } = initializeFirebase();
        try {
            await signInWithEmailAndPassword(auth, values.email, values.password);
             toast({
                title: "Logged In!",
                description: "Welcome back!",
            });
            // AuthRedirector will handle the navigation
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
                variant: "destructive",
            });
        }
    };

    const handleCustomerSignUp = async (values: any) => {
        const { auth } = initializeFirebase();
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
            const user = userCredential.user;
            const displayName = `${values.firstName} ${values.lastName}`;
            
            await updateProfile(user, { displayName: displayName });
            
            await createUserData(user, 'customer', { userId: values.userId, phone: values.phone });
            
            await sendEmailVerification(user);
            
            toast({
                title: "Account Created!",
                description: "A verification email has been sent. Please check your inbox.",
            });
        } catch (error: any) {
             let errorMessage = "An unknown error occurred.";
            switch (error.code) {
                case 'auth/email-already-in-use':
                    errorMessage = "This email address is already in use by another account.";
                    break;
                default:
                    errorMessage = "Failed to create account. Please try again.";
            }
            toast({
                title: "Sign Up Failed",
                description: errorMessage,
                variant: "destructive",
            });
            throw error;
        }
    };
    
    const handleAdminSignUp = async (values: any) => {
        const functions = getFunctions();
        const createAdmin = httpsCallable(functions, 'createAdminUser');
        try {
            await createAdmin(values);
            toast({
                title: "Admin Account Created!",
                description: `${values.email} has been granted admin privileges.`,
            });
        } catch (error: any) {
            console.error("Admin creation failed:", error);
            toast({
                title: "Admin Creation Failed",
                description: error.message || "An unexpected error occurred.",
                variant: "destructive",
            });
            throw error;
        }
    };
    
    const handleSellerSignUp = async (values: any) => {
        const { auth } = initializeFirebase();
        let user: User | null = auth.currentUser;
        
        try {
            if (!user) {
                const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
                user = userCredential.user;
                await sendEmailVerification(user);
            }

            if (!user) throw new Error("User authentication failed.");
            
            const displayName = `${values.firstName} ${values.lastName}`;
            await updateProfile(user, { displayName: displayName });

            const sellerData: Partial<UserData> = {
                ...values,
                role: 'seller',
                verificationStatus: 'verified', // Auto-verify
                displayName: displayName,
                followers: 0,
                following: 0,
            };
        
            delete (sellerData as any).password;
            delete (sellerData as any).confirmPassword;
            
            await createUserData(user, 'seller', sellerData);
            
            toast({
                title: "Registration Complete!",
                description: "Welcome! You can now access your seller dashboard.",
            });

            router.push('/seller/dashboard');

        } catch (error: any) {
            let errorMessage = "An unknown error occurred.";
             if (error.code === 'auth/email-already-in-use') {
                 errorMessage = "This email address is already registered. Please login as a customer and upgrade to a seller account, or use a different email.";
            } else {
                 errorMessage = "Failed to create account. Please try again.";
            }
            toast({
                title: "Sign Up Failed",
                description: errorMessage,
                variant: "destructive",
            });
            throw error;
        }
    };
    
    const updateUserProfile = async (user: User, data: Partial<UserData>) => {
        const { firebaseApp } = initializeFirebase();
        const storage = getStorage(firebaseApp);
        const { displayName } = data;
        let { photoURL } = data;
        
        const { id, dismiss, update } = toast({
            title: 'Updating Profile...',
            description: 'Please wait while we update your details.',
        });

        try {
            const oldUserData = await getUserData(user.uid);
            const oldPhotoURL = oldUserData?.photoURL;

            if (oldPhotoURL && oldPhotoURL.includes('firebasestorage.googleapis.com') && oldPhotoURL !== photoURL) {
                try {
                    const oldStorageRef = ref(storage, oldPhotoURL);
                    await deleteObject(oldStorageRef);
                } catch (error: any) {
                    console.warn("Could not delete old profile picture:", error.message);
                }
            }
            
            if (photoURL && photoURL.startsWith('data:image')) {
                update({ description: "Uploading image... Please wait." });
                const storageRef = ref(storage, `profile-pictures/${user.uid}`);
                const uploadResult = await uploadString(storageRef, photoURL, 'data_url');
                photoURL = await getDownloadURL(uploadResult.ref);
            }

            const authUpdates: {displayName?: string, photoURL?: string | null} = {};
            if(displayName) authUpdates.displayName = displayName;
            if(photoURL !== undefined) authUpdates.photoURL = photoURL;

            if (Object.keys(authUpdates).length > 0) {
                await updateProfile(user, authUpdates as any);
            }

            const firestoreUpdates = { ...data };
            if(photoURL !== undefined) {
                firestoreUpdates.photoURL = photoURL;
            }
            await updateUserData(user.uid, firestoreUpdates);
            
            await user.getIdToken(true);

            update({
                id,
                title: "Profile Updated!",
                description: "Your profile information has been saved.",
            });

        } catch (error) {
             console.error("Error updating profile: ", error);
            update({
                id,
                title: "Update Failed",
                description: "Could not update your profile. Please try again.",
                variant: "destructive",
            });
            throw error;
        } finally {
             setTimeout(() => dismiss(), 3000);
        }
    };

    return { signOut, sendPasswordResetLink, handleGoogleSignIn, handleEmailSignIn, handleCustomerSignUp, handleAdminSignUp, handleSellerSignUp, updateUserProfile };
}
