import { NextResponse } from 'next/server';
import { MailerSend, EmailParams, Recipient } from 'mailersend';
import crypto from 'crypto';

const OTP_TTL = 300; // 5 minutes
// In a real app, this should be a persistent store like Redis or Firestore
const otpStore = new Map();

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000)); // 6-digit OTP
}

function hashOtp(otp: string, salt: string) {
  return crypto.createHmac("sha256", salt).update(otp).digest("hex");
}

export async function POST(request: Request) {
  try {
    const { email, phone } = await request.json();

    if (!email && !phone) {
      return NextResponse.json({ error: "Email or phone is required" }, { status: 400 });
    }

    if (email) {
      const mailer = new MailerSend({
        apiKey: process.env.MAILERSEND_KEY || "",
      });

      const otp = generateOtp();
      const salt = crypto.randomBytes(16).toString("hex");
      const otpHash = hashOtp(otp, salt);
      const expiresAt = Date.now() + OTP_TTL * 1000;

      otpStore.set(email, { otpHash, salt, expiresAt, attempts: 0 });

      const params = new EmailParams()
        .setFrom({ email: 'no-reply@nipher.in', name: 'Nipher OTP' })
        .setRecipients([new Recipient(email)])
        .setSubject("Your Nipher Verification Code")
        .setHtml(`<p>Your OTP is <strong>${otp}</strong>. It expires in 5 minutes.</p>`)
        .setText(`Your OTP is ${otp}. It expires in 5 minutes.`);

      await mailer.email.send(params);
      return NextResponse.json({ success: true, message: "OTP sent to email." });

    } else if (phone) {
      // SMS sending logic would go here
      // For now, we just simulate success
      console.log(`Simulating sending OTP to phone: ${phone}`);
      const otp = '123456'; // Use fixed OTP for phone for now
      const salt = crypto.randomBytes(16).toString("hex");
      const otpHash = hashOtp(otp, salt);
      const expiresAt = Date.now() + OTP_TTL * 1000;
      otpStore.set(phone, { otpHash, salt, expiresAt, attempts: 0 });

      return NextResponse.json({ success: true, message: "OTP sent to phone (simulation)." });
    }

  } catch (err: any) {
    console.error("send-otp error:", err);
    return NextResponse.json({ error: "Failed to send OTP", details: err.message }, { status: 500 });
  }

  return NextResponse.json({ error: "Invalid request type" }, { status: 400 });
}
