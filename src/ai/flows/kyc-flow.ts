
'use server';
/**
 * @fileOverview A flow for handling seller KYC verification.
 * This is a MOCK flow and does not connect to a real KYC provider.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { updateUserDataOnServer } from '@/lib/firebase-server-utils';
import { KycInputSchema, KycInput } from '@/lib/schemas/kyc';

const KycOutputSchema = z.object({
  status: z.enum(["verified", "pending", "rejected"]),
  message: z.string(),
});

/**
 * Masks an Aadhaar number, showing only the last 4 digits.
 */
function maskAadhaar(aadhar: string): string {
    return 'XXXX-XXXX-' + aadhar.slice(-4);
}

/**
 * Masks a PAN number, showing only the first and last two characters.
 */
function maskPan(pan: string): string {
    return pan.substring(0, 2) + '******' + pan.slice(-2);
}


const verifyKycFlow = ai.defineFlow(
  {
    name: 'verifyKycFlow',
    inputSchema: KycInputSchema,
    outputSchema: KycOutputSchema,
  },
  async ({ userId, aadhar, pan }) => {
    // In a real application, you would call a third-party KYC API here
    // with the raw aadhaar and pan numbers.
    // For this demo, we will simulate a successful verification.

    console.log(`Simulating KYC verification for user: ${userId}`);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    const kycData = {
        role: 'seller',
        kycStatus: 'verified',
        kycType: 'Aadhaar + PAN',
        verifiedAt: new Date().toISOString(),
        maskedData: {
            aadhaar: maskAadhaar(aadhar),
            pan: maskPan(pan),
        },
        // Also update other seller-specific fields that are now implicitly confirmed
        verificationStatus: 'verified',
        businessName: "Verified Business", // Placeholder
    };
    
    // Update the user's document in Firestore with the verified (and masked) data
    await updateUserDataOnServer(userId, kycData as any);
    
    console.log(`KYC for user ${userId} verified and stored securely.`);
    
    return { 
        status: "verified",
        message: "KYC verification successful. The user is now a verified seller."
    };
  }
);

export async function verifyKyc(input: KycInput): Promise<z.infer<typeof KycOutputSchema>> {
  return await verifyKycFlow(input);
}
