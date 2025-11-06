
'use server';
/**
 * @fileOverview Creates a custom Firebase token for user impersonation.
 */

import { getFirebaseAdminApp } from '@/lib/firebase-server';
import { getAuth } from 'firebase-admin/auth';
import { genkit } from 'genkit';
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
  async (uid) => {
    const adminApp = getFirebaseAdminApp();
    const auth = getAuth(adminApp);
    const token = await auth.createCustomToken(uid);
    return { token };
  }
);

