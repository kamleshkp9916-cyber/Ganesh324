
import { getFirebaseAdminApp } from './firebase-server';
import { cookies } from 'next/headers';
import { UserData } from './follow-data';

export async function checkAdminRole() {
    const app = getFirebaseAdminApp();
    const sessionCookie = cookies().get('__session')?.value || '';

    if (!sessionCookie) {
        return { isAdmin: false, user: null };
    }

    try {
        const decodedClaims = await app.auth().verifySessionCookie(sessionCookie, true);
        return { 
            isAdmin: decodedClaims.role === 'admin',
            user: decodedClaims,
        };
    } catch (error) {
        return { isAdmin: false, user: null };
    }
}
