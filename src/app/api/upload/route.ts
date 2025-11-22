
import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseAdminApp } from '@/lib/firebase-server';
import { getStorage } from 'firebase-admin/storage';
import { getAuth } from 'firebase-admin/auth';

export async function POST(request: NextRequest) {
  try {
    const adminApp = getFirebaseAdminApp();
    const bucket = getStorage(adminApp).bucket();

    // Verify user authentication via Authorization header
    const authorization = request.headers.get("Authorization");
    if (!authorization?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const idToken = authorization.split("Bearer ")[1];
    const decodedToken = await getAuth(adminApp).verifyIdToken(idToken);
    const userId = decodedToken.uid;

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const filePath = formData.get('filePath') as string | null;

    if (!file || !filePath) {
      return NextResponse.json({ error: 'File or filePath is missing' }, { status: 400 });
    }
    
    if (!filePath.startsWith(`products/${userId}/`)) {
        return NextResponse.json({ error: 'Invalid file path' }, { status: 403 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const storageFile = bucket.file(filePath);

    await storageFile.save(buffer, {
      metadata: {
        contentType: file.type,
      },
    });

    const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(filePath)}?alt=media`;

    return NextResponse.json({ url: publicUrl });

  } catch (error: any) {
    console.error('Upload Error:', error);
     if (error.code === 'auth/id-token-expired') {
        return NextResponse.json({ error: 'Authentication token expired. Please log in again.' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
