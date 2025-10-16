
'use server';
/**
 * @fileOverview Creates a custom Firebase token for user impersonation.
 */

import { getFirebaseAdminApp } from '@/lib/firebase-server';
import { getAuth } from 'firebase-admin/auth';
import { ai } from '@/ai/genkit';
import { z } from 'zod';

export const createImpersonationToken = ai.defineFlow(
  {
    name: 'createImpersonationToken',
    inputSchema: z.string(),
    outputSchema: z.object({ token: z.string() }),
  },
  async (uid) => {
    const adminApp = getFirebaseAdminApp();
    const auth = getAuth(adminApp);
    const token = await auth.createCustomToken(uid);
    return { token };
  }
);
