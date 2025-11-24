
"use client";

import { GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut, sendPasswordResetEmail, User, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification, getAdditionalUserInfo, updateProfile, setPersistence, browserSessionPersistence, Auth, linkWithCredential, EmailAuthProvider, signInAnonymously } from "firebase/auth";
import { FirebaseApp } from "firebase/app";
import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { createUserData, updateUserData, UserData } from "./follow-data";
import { getStorage, ref, uploadString, getDownloadURL, deleteObject } from "firebase/storage";
import { getFunctions, httpsCallable } from "firebase/functions";
import { getFirestoreDb } from "./firebase-db";

async function triggerUpdateLastLogin(auth: Auth) {
    if (!auth.currentUser) return;

    try {
        const functions = getFunctions(auth.app);
        const updateLastLogin = httpsCallable(functions, 'updateLastLogin');
        await updateLastLogin();
    } catch (error) {
        console.error("Could not update last login time via function:", error);
    }
}

export function getAuthActions(
    auth: Auth, 
    firebaseApp: FirebaseApp,
    router: AppRouterInstance,
    toast: (options: { title: string, description?: string, variant?: 'default' | 'destructive' }) => void
) {
    const signOut = async (isSeller = false) => {
        try {
            await firebaseSignOut(auth);
            
            if (isSeller) {
                sessionStorage.setItem('sellerSignedOut', 'true');
            }

            window.location.href = '/';

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
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            
            const additionalUserInfo = getAdditionalUserInfo(result);
            if (additionalUserInfo?.isNewUser) {
                await createUserData(user, 'customer');
            }
            await triggerUpdateLastLogin(auth);
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

    const handleEmailSignIn = async (values: any): Promise<boolean> => {
        try {
            await setPersistence(auth, browserSessionPersistence);
            await signInWithEmailAndPassword(auth, values.email, values.password);
            await triggerUpdateLastLogin(auth);
             toast({
                title: "Logged In!",
                description: "Welcome back!",
            });
            return true;
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
            return false;
        }
    };

    const handleCustomerSignUp = async (values: any) => {
        try {
            const emailRes = await fetch('/api/check-email', { method: 'POST', body: JSON.stringify({ email: values.email }) });
            if (!emailRes.ok) throw new Error('Email check failed');
            const emailData = await emailRes.json();
            if (emailData.exists) {
                toast({ title: "Sign Up Failed", description: "This email is already registered.", variant: "destructive" });
                return;
            }

            const phoneRes = await fetch('/api/check-phone', { method: 'POST', body: JSON.stringify({ phone: values.phone }) });
            if (!phoneRes.ok) throw new Error('Phone check failed');
            const phoneData = await phoneRes.json();
            if (phoneData.exists) {
                toast({ title: "Sign Up Failed", description: "This phone number is already registered.", variant: "destructive" });
                return;
            }
            
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
        const functions = getFunctions(auth.app);
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
        const currentUser = auth.currentUser;
        if (!currentUser || !currentUser.isAnonymous) {
            toast({ variant: 'destructive', title: "Authentication Error", description: "No valid anonymous session found. Please refresh." });
            throw new Error("User is not anonymous or not logged in.");
        }

        try {
            const credential = EmailAuthProvider.credential(values.email, values.password);
            const userCredential = await linkWithCredential(currentUser, credential);
            const user = userCredential.user;
            
            const displayName = values.displayName;
            await updateProfile(user, { displayName: displayName });
            
            const sellerData: Partial<UserData> = {
                ...values,
                role: 'seller',
                email: user.email, // Ensure email is updated from the new credential
            };
        
            delete (sellerData as any).password;
            delete (sellerData as any).confirmPassword;
            
            // This will now update the existing anonymous user's document with the full data
            await updateUserData(user.uid, sellerData as UserData);
            
            await sendEmailVerification(user);
            
            toast({
                title: "Registration Complete!",
                description: "Your seller account has been created. A verification email has been sent.",
            });

        } catch (error: any) {
            let errorMessage = "An unknown error occurred.";
             if (error.code === 'auth/email-already-in-use') {
                 errorMessage = "This email address is already registered. Please login as a customer and upgrade to a seller account, or use a different email.";
            } else if (error.code === 'auth/credential-already-in-use') {
                 errorMessage = "This credential is already associated with another account.";
            } else {
                 errorMessage = error.message || "Failed to create account. Please try again.";
            }
            toast({
                title: "Sign Up Failed",
                description: errorMessage,
                variant: "destructive",
            });
            throw error;
        }
    };
    
    const initiateAnonymousSignIn = async () => {
        try {
            await signInAnonymously(auth);
        } catch (error) {
            console.error("Anonymous sign-in failed:", error);
            toast({
                title: "Session Error",
                description: "Could not start a temporary session. Please refresh the page.",
                variant: "destructive",
            });
        }
    };

    const updateUserProfile = async (user: User, data: Partial<UserData>) => {
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

    return { 
        signOut, 
        sendPasswordResetLink, 
        handleGoogleSignIn, 
        handleEmailSignIn, 
        handleCustomerSignUp, 
        handleAdminSignUp, 
        handleSellerSignUp, 
        initiateAnonymousSignIn,
        updateUserProfile 
    };
}

    