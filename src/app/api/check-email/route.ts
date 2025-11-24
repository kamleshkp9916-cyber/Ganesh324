
import { NextResponse } from 'next/server';
import { getFirebaseAdminApp } from '@/lib/firebase-server-utils';
import { getFirestore as getAdminFirestore } from 'firebase-admin/firestore';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    getFirebaseAdminApp();
    const db = getAdminFirestore();
    const usersRef = db.collection('users');
    const querySnapshot = await usersRef.where('email', '==', email).limit(1).get();

    return NextResponse.json({ exists: !querySnapshot.empty });
  } catch (error: any) {
    console.error('Error checking email existence:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

    