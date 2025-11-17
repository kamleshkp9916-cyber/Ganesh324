
import { initializeFirebase } from "@/firebase";

export const getFirestoreDb = () => {
    const { firestore } = initializeFirebase();
    return firestore;
}
