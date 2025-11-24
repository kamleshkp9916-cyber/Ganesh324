
import { NextResponse } from 'next/server';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { getFirebaseApp } from '@/firebase/config';

export async function POST(request: Request) {
  try {
    const { field, value } = await request.json();

    if (!field || !value) {
      return NextResponse.json({ error: 'Field and value are required' }, { status: 400 });
    }

    const functions = getFunctions(getFirebaseApp());
    const checkUserExists = httpsCallable(functions, 'checkUserExists');
    
    const result: any = await checkUserExists({ field, value });

    return NextResponse.json({ exists: result.data.exists });
  } catch (error: any) {
    console.error('Error in /api/check-user:', error);
    // The error from an onCall function might be nested
    const errorMessage = error.details?.message || error.message || 'Internal Server Error';
    const errorStatus = error.code === 'functions/internal' ? 500 : 400;
    return NextResponse.json({ error: errorMessage }, { status: errorStatus });
  }
}
