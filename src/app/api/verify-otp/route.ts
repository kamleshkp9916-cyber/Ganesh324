
import {NextResponse} from 'next/server';
import crypto from 'crypto';

// This would be a shared store (e.g., Redis, Firestore) in a real app
const otpStore = new Map();

function hashOtp(otp: string, salt: string) {
  return crypto.createHmac("sha256", salt).update(otp).digest("hex");
}

export async function POST(request: Request) {
  const {email, otp} = await request.json();
  if (!email || !otp) {
    return NextResponse.json(
      {error: 'Email and OTP required'},
      {status: 400}
    );
  }

  const record = otpStore.get(email);
  if (!record) {
    return NextResponse.json({error: 'No OTP found'}, {status: 400});
  }

  if (Date.now() > record.expiresAt) {
    otpStore.delete(email);
    return NextResponse.json({error: 'OTP expired'}, {status: 400});
  }

  record.attempts++;
  if (record.attempts > 5) {
    otpStore.delete(email);
    return NextResponse.json({error: 'Too many attempts'}, {status: 429});
  }

  const candidate = hashOtp(otp, record.salt);
  if (candidate === record.otpHash) {
    otpStore.delete(email);
    return NextResponse.json({ok: true, message: 'OTP verified successfully'});
  }

  return NextResponse.json({error: 'Invalid OTP'}, {status: 400});
}
