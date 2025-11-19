
import {NextResponse} from 'next/server';
import {MailerSend, EmailParams, Sender, Recipient} from 'mailersend';
import crypto from 'crypto';

const OTP_TTL = 300; // 5 minutes
// This would be a shared store (e.g., Redis, Firestore) in a real app
const otpStore = new Map();

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function hashOtp(otp: string, salt: string) {
  return crypto.createHmac("sha256", salt).update(otp).digest("hex");
}

export async function POST(request: Request) {
  try {
    const {email} = await request.json();
    if (!email) {
      return NextResponse.json({error: 'Email required'}, {status: 400});
    }

    const mailerSend = new MailerSend({
      apiKey: process.env.MAILERSEND_KEY || '',
    });

    const otp = generateOtp();
    const salt = crypto.randomBytes(16).toString('hex');
    const otpHash = hashOtp(otp, salt);
    const expiresAt = Date.now() + OTP_TTL * 1000;

    otpStore.set(email, {otpHash, salt, expiresAt, attempts: 0});

    const sentFrom = new Sender(
      process.env.SENDER_EMAIL || 'you@yourverifieddomain.com',
      'Nipher OTP'
    );
    const recipients = [new Recipient(email, 'Nipher User')];

    const emailParams = new EmailParams()
      .setFrom(sentFrom)
      .setTo(recipients)
      .setSubject('Your Nipher Verification Code')
      .setHtml(
        `<p>Your OTP is <strong>${otp}</strong>. It expires in 5 minutes.</p>`
      )
      .setText(`Your OTP is ${otp}. It expires in 5 minutes.`);

    await mailerSend.email.send(emailParams);

    return NextResponse.json({ok: true, message: 'OTP sent'});
  } catch (error: any) {
    console.error('MailerSend Error:', error?.response?.body || error.message);
    return NextResponse.json(
      {error: 'Failed to send OTP'},
      {status: 500}
    );
  }
}
