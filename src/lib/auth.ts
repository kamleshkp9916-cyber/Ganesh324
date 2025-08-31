
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
            // The AuthProvider's onAuthStateChanged will now handle user creation
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
                // AuthRedirector will handle the navigation
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

          await createUserData(user, 'customer', {
            displayName: displayName,
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
            throw error; // Re-throw the error so the form can handle its loading state
        }
    };
    
    const handleSellerSignUp = async (values: any) => {
        const auth = getFirebaseAuth();
        const displayName = `${values.firstName} ${values.lastName}`;
        // If user is already logged in, we update their role. Otherwise, we create a new user.
        if (auth.currentUser) {
            await updateUserData(auth.currentUser.uid, {
                role: 'seller',
                verificationStatus: 'pending',
                ...values,
                displayName: displayName
            });
            toast({
                title: "Registration Submitted!",
                description: "Your seller application is now under review.",
            });
            router.push('/seller/verification');

        } else {
             try {
                const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
                const user = userCredential.user;
                 await updateProfile(user, { displayName: displayName });
                
                await createUserData(user, 'seller', {
                    ...values,
                    displayName: displayName,
                    verificationStatus: 'pending',
                });
                
                await sendEmailVerification(user);
                
                toast({
                    title: "Account Created!",
                    description: "Your seller application is submitted. Please verify your email.",
                });
                
                router.push('/seller/verification');

             } catch (error: any) {
                 let errorMessage = "An unknown error occurred.";
                switch (error.code) {
                    case 'auth/email-already-in-use':
                        errorMessage = "This email address is already in use by another account. Please log in first.";
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
        }
    };
    
    const updateUserProfile = async (user: User, data: Partial<UserData>) => {
        const { displayName } = data;
        let { photoURL } = data;
        
        const { id, dismiss, update } = toast({
            title: "Updating Profile...",
            description: "Please wait.",
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
