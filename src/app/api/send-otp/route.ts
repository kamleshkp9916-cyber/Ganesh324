import { NextResponse } from 'next/server';
import { MailerSend, EmailParams, Recipient } from 'mailersend';
import crypto from 'crypto';
import { getFirebaseAdminApp } from '@/lib/firebase-server';
import { getFirestore } from 'firebase-admin/firestore';

const OTP_TTL = 300; // 5 minutes

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000)); // 6-digit OTP
}

function hashOtp(otp: string, salt: string) {
  return crypto.createHmac("sha256", salt).update(otp).digest("hex");
}

export async function POST(request: Request) {
  try {
    const { email, phone } = await request.json();
    const target = email || phone;
    const type = email ? 'email' : 'phone';

    if (!target) {
      return NextResponse.json({ error: "Email or phone is required" }, { status: 400 });
    }

    const otp = generateOtp();
    const salt = crypto.randomBytes(16).toString("hex");
    const otpHash = hashOtp(otp, salt);
    const expiresAt = new Date(Date.now() + OTP_TTL * 1000);

    // Save the hashed OTP to Firestore instead of an in-memory map
    const db = getFirestore(getFirebaseAdminApp());
    await db.collection('otp_requests').doc(target).set({
      type,
      otpHash,
      salt,
      expiresAt,
      attempts: 0,
    });

    if (email) {
      const mailer = new MailerSend({
        apiKey: process.env.MAILERSEND_API_KEY || "",
      });

      const params = new EmailParams()
        .setFrom({ email: 'no-reply@nipher.in', name: 'Nipher OTP' })
        .setRecipients([new Recipient(email)])
        .setSubject("Your Nipher Verification Code")
        .setHtml(`<p>Your OTP is <strong>${otp}</strong>. It expires in 5 minutes.</p>`)
        .setText(`Your OTP is ${otp}. It expires in 5 minutes.`);

      await mailer.email.send(params);
      return NextResponse.json({ success: true, message: "OTP sent to email." });

    } else if (phone) {
      // SMS sending logic would go here using a service like Twilio
      console.log(`Simulating sending OTP ${otp} to phone: ${phone}`);
      return NextResponse.json({ success: true, message: "OTP sent to phone (simulation)." });
    }

  } catch (err: any) {
    console.error("send-otp error:", err);
    return NextResponse.json({ error: "Failed to send OTP", details: err.message }, { status: 500 });
  }

  return NextResponse.json({ error: "Invalid request type" }, { status: 400 });
}
