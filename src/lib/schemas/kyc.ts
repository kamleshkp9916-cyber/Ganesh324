
import { z } from 'zod';

export const KycInputSchema = z.object({
  userId: z.string(),
  aadhar: z.string().regex(/^\d{12}$/, "Aadhar must be 12 digits."),
  pan: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Invalid PAN card format."),
});

export type KycInput = z.infer<typeof KycInputSchema>;
