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
    const { type, target } = await request.json();
    if (!target || !type) {
      return NextResponse.json({error: 'Target and type required'}, {status: 400});
    }

    const otp = generateOtp();
    const salt = crypto.randomBytes(16).toString('hex');
    const otpHash = hashOtp(otp, salt);
    const expiresAt = Date.now() + OTP_TTL * 1000;

    otpStore.set(target, { otpHash, salt, expiresAt, attempts: 0 });

    if (type === 'email') {
        const mailerSend = new MailerSend({
          apiKey: process.env.MAILERSEND_KEY || '',
        });

        const sentFrom = new Sender(
          process.env.SENDER_EMAIL || 'you@yourverifieddomain.com',
          'Nipher OTP'
        );
        const recipients = [new Recipient(target, 'Nipher User')];

        const emailParams = new EmailParams()
          .setFrom(sentFrom)
          .setTo(recipients)
          .setSubject('Your Nipher Verification Code')
          .setHtml(
            `<p>Your OTP is <strong>${otp}</strong>. It expires in 5 minutes.</p>`
          )
          .setText(`Your OTP is ${otp}. It expires in 5 minutes.`);

        await mailerSend.email.send(emailParams);
        return NextResponse.json({ok: true, message: 'OTP sent to email'});
    } else if (type === 'phone') {
        // SIMULATE SENDING SMS
        console.log(`SIMULATED OTP for ${target}: Your code is ${otp}`);
        return NextResponse.json({ok: true, message: 'OTP sent to phone (simulated)'});
    } else {
        return NextResponse.json({error: 'Invalid type specified'}, {status: 400});
    }

  } catch (error: any) {
    console.error('OTP Send Error:', error?.response?.body || error.message);
    return NextResponse.json(
      {error: 'Failed to send OTP'},
      {status: 500}
    );
  }
}
