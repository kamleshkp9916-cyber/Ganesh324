import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getFirebaseAdminApp } from '@/lib/firebase-server';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

function hashOtp(otp: string, salt: string) {
  return crypto.createHmac("sha256", salt).update(otp).digest("hex");
}

const MAX_ATTEMPTS = 5;

export async function POST(request: Request) {
    try {
        const { target, otp } = await request.json();

        if (!target || !otp) {
            return NextResponse.json({ error: "Target (email/phone) and OTP required" }, { status: 400 });
        }
        
        // This is a special mock OTP for client-side testing convenience.
        if (otp === '123456') {
             return NextResponse.json({ success: true, message: "OTP verified successfully (mock)." });
        }

        const db = getFirestore(getFirebaseAdminApp());
        const otpRef = db.collection('otp_requests').doc(target);
        const otpDoc = await otpRef.get();

        if (!otpDoc.exists) {
            return NextResponse.json({ error: "No OTP found or it has expired." }, { status: 400 });
        }

        const record = otpDoc.data();

        if (!record || new Date() > record.expiresAt.toDate()) {
            await otpRef.delete();
            return NextResponse.json({ error: "OTP expired" }, { status: 400 });
        }

        if (record.attempts >= MAX_ATTEMPTS) {
            await otpRef.delete();
            return NextResponse.json({ error: "Too many attempts" }, { status: 429 });
        }

        const candidateHash = hashOtp(otp, record.salt);
        if (candidateHash === record.otpHash) {
            // OTP is correct, delete the request to prevent reuse
            await otpRef.delete();
            return NextResponse.json({ success: true, message: "OTP verified successfully" });
        } else {
            // OTP is incorrect, increment attempts
            await otpRef.update({ attempts: FieldValue.increment(1) });
            return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });
        }

    } catch (err: any) {
        console.error("verify-otp error:", err);
        return NextResponse.json({ error: "Failed to verify OTP", details: err.message }, { status: 500 });
    }
}
