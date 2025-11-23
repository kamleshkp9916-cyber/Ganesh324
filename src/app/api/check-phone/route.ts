
import { NextResponse } from 'next/server';
import { getFirebaseAdminApp } from '@/lib/firebase-server-utils';
import { getFirestore } from 'firebase-admin/firestore';

export async function POST(request: Request) {
  try {
    const { phone } = await request.json();
    if (!phone) {
      return NextResponse.json({ error: 'Phone number is required.' }, { status: 400 });
    }

    const adminApp = getFirebaseAdminApp();
    const db = getFirestore(adminApp);

    const usersRef = db.collection('users');
    const querySnapshot = await usersRef.where('phone', '==', phone).limit(1).get();

    return NextResponse.json({ exists: !querySnapshot.empty });
  } catch (error) {
    console.error("Error in checkPhoneExists API route:", error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
