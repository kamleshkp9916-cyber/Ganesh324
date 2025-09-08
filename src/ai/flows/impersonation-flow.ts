
'use server';
/**
 * @fileOverview A flow for creating a user impersonation token.
 */

import { ai } from '@/ai/genkit';
import { getFirebaseAdminApp } from '@/lib/firebase-server';
import { z } from 'zod';
import * as admin from 'firebase-admin';

const ImpersonationInputSchema = z.string().describe('The UID of the user to impersonate.');
const ImpersonationOutputSchema = z.object({
  token: z.string(),
});

const createImpersonationTokenFlow = ai.defineFlow(
  {
    name: 'createImpersonationTokenFlow',
    inputSchema: ImpersonationInputSchema,
    outputSchema: ImpersonationOutputSchema,
  },
  async (uid) => {
    getFirebaseAdminApp();
    const auth = admin.auth();

    try {
      const customToken = await auth.createCustomToken(uid);
      return { token: customToken };
    } catch (error: any) {
      console.error('Error creating custom token:', error);
      throw new Error(`Failed to create token for UID ${uid}: ${error.message}`);
    }
  }
);

export async function createImpersonationToken(uid: string): Promise<z.infer<typeof ImpersonationOutputSchema>> {
  return createImpersonationTokenFlow(uid);
}
