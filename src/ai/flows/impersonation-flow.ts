
'use server';
/**
 * @fileOverview Creates a custom Firebase token for user impersonation.
 */

import { getFirebaseAdminApp } from '@/lib/firebase-server';
import { getAuth } from 'firebase-admin/auth';
import { genkit, AuthError } from 'genkit';
import { z } from 'zod';
import { googleAI } from '@genkit-ai/google-genai';

const ai = genkit({
    plugins: [googleAI()],
    logLevel: 'debug',
    enableTracing: true,
});


export const createImpersonationToken = ai.defineFlow(
  {
    name: 'createImpersonationToken',
    inputSchema: z.string(),
    outputSchema: z.object({ token: z.string() }),
  },
  async (uid, streamingCallback, auth) => {
    // SECURITY CHECK: Ensure the user calling this flow is an admin.
    if (auth?.claims?.role !== 'admin') {
      throw new AuthError('You must be an admin to perform this action.');
    }
    
    const adminApp = getFirebaseAdminApp();
    const adminAuth = getAuth(adminApp);
    const token = await adminAuth.createCustomToken(uid);
    return { token };
  }
);
