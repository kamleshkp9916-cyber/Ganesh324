
"use client";

import { GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut, onAuthStateChanged, User } from "firebase/auth";
import { auth } from "./firebase";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";

export function useAuthActions() {
    const router = useRouter();
    const { toast } = useToast();

    const signInWithGoogle = async () => {
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
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

    const signOut = async () => {
        try {
            await firebaseSignOut(auth);
            router.push("/");
        } catch (error) {
            console.error("Error signing out: ", error);
            toast({
                title: "Error",
                description: "Failed to sign out. Please try again.",
                variant: "destructive",
            });
        }
    };

    return { signInWithGoogle, signOut };
}

export { auth };
