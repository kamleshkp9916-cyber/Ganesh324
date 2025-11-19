import { NextResponse } from 'next/server';
import crypto from 'crypto';

// In a real app, this should be a persistent store like Redis or Firestore
const otpStore = new Map();

function hashOtp(otp: string, salt: string) {
  return crypto.createHmac("sha256", salt).update(otp).digest("hex");
}

export async function POST(request: Request) {
    try {
        const { target, otp } = await request.json(); // target can be email or phone

        if (!target || !otp) {
            return NextResponse.json({ error: "Target (email/phone) and OTP required" }, { status: 400 });
        }

        // For this demo, we'll just check a static OTP for simplicity
        if (otp === '123456') {
            return NextResponse.json({ success: true, message: "OTP verified successfully." });
        }

        // The logic below would be for a real implementation with the in-memory store
        const record = otpStore.get(target);
        if (!record) {
            return NextResponse.json({ error: "No OTP found or it has expired." }, { status: 400 });
        }

        if (Date.now() > record.expiresAt) {
            otpStore.delete(target);
            return NextResponse.json({ error: "OTP expired" }, { status: 400 });
        }

        record.attempts++;
        if (record.attempts > 5) {
            otpStore.delete(target);
            return NextResponse.json({ error: "Too many attempts" }, { status: 429 });
        }

        const candidate = hashOtp(otp, record.salt);
        if (candidate === record.otpHash) {
            otpStore.delete(target);
            return NextResponse.json({ success: true, message: "OTP verified successfully" });
        }

        return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });

    } catch (err: any) {
        console.error("verify-otp error:", err);
        return NextResponse.json({ error: "Failed to verify OTP", details: err.message }, { status: 500 });
    }
}
