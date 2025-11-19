require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { MailerSend, EmailParams, Recipient } = require('mailersend');
const crypto = require('crypto'); // built-in, no installation needed

const app = express();
app.use(cors());
app.use(bodyParser.json());

// MailerSend setup
const mailer = new MailerSend({
  apiKey: process.env.MAILERSEND_API_KEY || "",
});

const OTP_TTL = 300; // 5 minutes
const otpStore = new Map();

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000)); // 6-digit OTP
}

function hashOtp(otp, salt) {
  return crypto.createHmac("sha256", salt).update(otp).digest("hex");
}

app.post("/send-otp", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email required" });

  const otp = generateOtp();
  const salt = crypto.randomBytes(16).toString("hex");
  const otpHash = hashOtp(otp, salt);
  const expiresAt = Date.now() + OTP_TTL * 1000;

  otpStore.set(email, { otpHash, salt, expiresAt, attempts: 0 });

  const params = new EmailParams()
    .setFrom("no-reply@yourdomain.com")
    .setFromName("StreamCart OTP")
    .setRecipients([new Recipient(email)])
    .setSubject("Your OTP Code")
    .setHtml(`<p>Your OTP is <strong>${otp}</strong>. It expires in 5 minutes.</p>`)
    .setText(`Your OTP is ${otp}. It expires in 5 minutes.`);

  try {
    await mailer.email.send(params);
    return res.json({ ok: true, message: "OTP sent" });
  } catch (err) {
    console.error("MailerSend Error:", err);
    return res.status(500).json({ error: "Failed to send OTP" });
  }
});

app.post("/verify-otp", (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp)
    return res.status(400).json({ error: "Email and OTP required" });

  const record = otpStore.get(email);
  if (!record) return res.status(400).json({ error: "No OTP found" });

  if (Date.now() > record.expiresAt) {
    otpStore.delete(email);
    return res.status(400).json({ error: "OTP expired" });
  }

  record.attempts++;
  if (record.attempts > 5) {
    otpStore.delete(email);
    return res.status(429).json({ error: "Too many attempts" });
  }

  const candidate = hashOtp(otp, record.salt);
  if (candidate === record.otpHash) {
    otpStore.delete(email);
    return res.json({ ok: true, message: "OTP verified successfully" });
  }

  return res.status(400).json({ error: "Invalid OTP" });
});

app.listen(3000, () => {
  console.log("OTP Server running on port 3000");
});
