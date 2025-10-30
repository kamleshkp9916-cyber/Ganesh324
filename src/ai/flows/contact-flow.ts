
'use server';
/**
 * @fileOverview Manages customer inquiries from contact forms.
 */

import { z } from 'zod';
import { getFirebaseAdminApp } from '@/lib/firebase-server';
import { getFirestore, collection, addDoc, serverTimestamp, query, getDocs, orderBy, doc, updateDoc } from 'firebase-admin/firestore';

const InquirySchema = z.object({
  name: z.string(),
  email: z.string().email(),
  subject: z.string(),
  message: z.string(),
  createdAt: z.string().optional(), // Will be replaced by server timestamp
  isRead: z.boolean().optional(),   // Will be set to false by default
});

export type Inquiry = z.infer<typeof InquirySchema>;

export async function submitInquiry(inquiryData: Omit<Inquiry, 'createdAt'>): Promise<{ id: string }> {
  const db = getFirestore(getFirebaseAdminApp());
  const validatedData = InquirySchema.omit({ createdAt: true }).parse(inquiryData);

  const docRef = await addDoc(collection(db, 'inquiries'), {
    ...validatedData,
    createdAt: serverTimestamp(),
    isRead: false,
  });

  return { id: docRef.id };
}

export async function getInquiries(): Promise<(Inquiry & { id: string })[]> {
  const db = getFirestore(getFirebaseAdminApp());
  const inquiriesRef = collection(db, 'inquiries');
  const q = query(inquiriesRef, orderBy('createdAt', 'desc'));
  
  const snapshot = await getDocs(q);
  if (snapshot.empty) {
    return [];
  }
  
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt.toDate().toISOString(),
    } as Inquiry & { id: string };
  });
}

export async function markInquiryRead(inquiryId: string): Promise<void> {
    const db = getFirestore(getFirebaseAdminApp());
    const inquiryRef = doc(db, 'inquiries', inquiryId);
    await updateDoc(inquiryRef, { isRead: true });
}
