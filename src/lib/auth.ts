
"use client";

import { GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut, sendPasswordResetEmail, User, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification, getAdditionalUserInfo, updateProfile } from "firebase/auth";
import { getFirebaseAuth, getFirebaseStorage } from "./firebase";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { createUserData, updateUserData, UserData, getUserData } from "./follow-data";
import { ref, uploadString, getDownloadURL, deleteObject } from "firebase/storage";

export function useAuthActions() {
    const router = useRouter();
    const { toast } = useToast();
    
    const signOut = async (isSeller = false) => {
        const auth = getFirebaseAuth();
        try {
            await firebaseSignOut(auth);
            
            if (isSeller) {
                // Set a flag to indicate a seller has just signed out.
                // This can be used by the login page to adjust its UI.
                sessionStorage.setItem('sellerSignedOut', 'true');
            }

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
        const auth = getFirebaseAuth();
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
         const auth = getFirebaseAuth();
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
            throw error;
        }
    };
    
    const handleSellerSignUp = async (values: any) => {
        const auth = getFirebaseAuth();
        let user: User | null = auth.currentUser;
        
        try {
            // Check if a user is already logged in (customer upgrading)
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
                verificationStatus: 'pending',
                displayName: displayName,
                followers: 0,
                following: 0,
            };
        
            delete (sellerData as any).password;
            delete (sellerData as any).confirmPassword;
            delete (sellerData as any).aadharOtp;
            
            const storage = getFirebaseStorage();

            if (values.passportPhoto) {
                 const photoRef = ref(storage, `seller-documents/${user.uid}/passport-photo`);
                 const photoUrl = await uploadString(photoRef, values.passportPhoto.preview, 'data_url').then(snap => getDownloadURL(snap.ref));
                 (sellerData as any).passportPhoto = photoUrl;
            }

            if (values.signature) {
                 const signatureRef = ref(storage, `seller-documents/${user.uid}/signature`);
                 const signatureUrl = await uploadString(signatureRef, values.signature, 'data_url').then(snap => getDownloadURL(snap.ref));
                 (sellerData as any).signature = signatureUrl;
            }

            await updateUserData(user.uid, sellerData);
            
            toast({
                title: "Application Submitted!",
                description: "Your seller application is under review. We will notify you upon completion.",
            });
            
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
        const { displayName } = data;
        let { photoURL } = data;
        
        const { id, dismiss, update } = toast({
            title: "Updating Profile...",
            description: "Please wait while we update your details.",
        });

        try {
            const storage = getFirebaseStorage();
            const oldUserData = await getUserData(user.uid);
            const oldPhotoURL = oldUserData?.photoURL;

            // Check if there's an old photo to delete and it's not a default placeholder
            if (oldPhotoURL && oldPhotoURL.includes('firebasestorage.googleapis.com') && oldPhotoURL !== photoURL) {
                try {
                    const oldStorageRef = ref(storage, oldPhotoURL);
                    await deleteObject(oldStorageRef);
                } catch (error: any) {
                    // It's okay if deletion fails (e.g., file not found), just log it
                    console.warn("Could not delete old profile picture:", error.message);
                }
            }
            
            // Check if photoURL is a new base64 upload
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

            // Update Firestore with all data, including the new URL
            const firestoreUpdates = { ...data };
            if(photoURL !== undefined) {
                firestoreUpdates.photoURL = photoURL;
            }
            await updateUserData(user.uid, firestoreUpdates);
            
            // Force a refresh of the user's token to get the latest profile data
            // This makes the useAuth hook update with the new info.
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
            throw error; // re-throw to be caught by the form handler
        } finally {
             // Dismiss the toast after a delay
             setTimeout(() => dismiss(), 3000);
        }
    };

    return { signOut, sendPasswordResetLink, handleGoogleSignIn, handleEmailSignIn, handleCustomerSignUp, handleSellerSignUp, updateUserProfile };
}
