
import { NextResponse } from 'next/server';
import { getFirebaseAdminApp } from '@/lib/firebase-server-utils';
import { getFirestore as getAdminFirestore } from 'firebase-admin/firestore';

export async function POST(request: Request) {
  try {
    const { field, value } = await request.json();

    if (!field || !value || (field !== 'email' && field !== 'phone')) {
      return NextResponse.json({ error: 'Invalid field or value provided.' }, { status: 400 });
    }

    getFirebaseAdminApp(); // Initialize Firebase Admin
    const db = getAdminFirestore();

    const usersRef = db.collection('users');
    const querySnapshot = await usersRef.where(field, '==', value).limit(1).get();

    return NextResponse.json({ exists: !querySnapshot.empty });
  } catch (error: any) {
    console.error("API Error in check-user-exists:", error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}

    