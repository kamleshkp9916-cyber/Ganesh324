
import { NextResponse } from 'next/server';
import { getFirebaseAdminApp } from '@/lib/firebase-server';
import { getFirestore } from 'firebase-admin/firestore';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    if (!email) {
      return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
    }

    const adminApp = getFirebaseAdminApp();
    const db = getFirestore(adminApp);
    
    const usersRef = db.collection('users');
    const querySnapshot = await usersRef.where('email', '==', email).limit(1).get();

    return NextResponse.json({ exists: !querySnapshot.empty });
  } catch (error) {
    console.error("Error in checkEmailExists API route:", error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
