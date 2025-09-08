// functions/index.js
'use strict';

const admin = require('firebase-admin');
const { onRequest } = require('firebase-functions/v2/https');
const functions = require('firebase-functions'); // if you use env/secret config in firebase.json
const sgMail = require('@sendgrid/mail');

/**
 * Admin SDK initialization:
 * - If FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY are present, use cert init (useful locally).
 * - Otherwise fall back to default application credentials (GCP runtime service account).
 */
if (!admin.apps.length) {
  if (process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_PROJECT_ID) {
    // private key will usually have literal "\n" sequences when stored in env; convert them
    const fixedPrivateKey = (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n');

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: fixedPrivateKey,
      }),
    });
    console.log('Admin SDK initialized from env cert');
  } else {
    admin.initializeApp();
    console.log('Admin SDK initialized with default application credentials');
  }
}

/**
 * Configure SendGrid API key.
 * In Cloud Functions you should configure SENDGRID_KEY as a Secret (you already have this).
 * Locally you can set SENDGRID_KEY env var.
 */
if (process.env.SENDGRID_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_KEY);
} else {
  console.warn('SENDGRID_KEY not set in env; send attempts will fail until it is configured.');
}

/**
 * Utility: normalize recipients.
 * Accept either:
 *   to: "single@domain" OR to: ["one@domain","two@domain"]
 * Returns array of { email } for personalizations or a single string for simple send.
 */
function normalizeRecipients(to) {
  if (!to) return [];
  if (Array.isArray(to)) return to.map((e) => ({ email: String(e).trim() }));
  return [{ email: String(to).trim() }];
}

/**
 * Main function: sendEmail
 *
 * POST payload (JSON) examples:
 * Single recipient:
 * {
 *   "to":"user@example.com",
 *   "subject":"Hello",
 *   "text":"plain text body",
 *   "html":"<b>HTML body</b>"
 * }
 *
 * Multiple recipients (keeps recipients private via personalizations):
 * {
 *   "to":["a@example.com","b@example.com"],
 *   "subject":"Announcement",
 *   "text":"announcement text"
 * }
 *
 * Optional: overrideFrom: "verified@your-sender.com" (if you want to change per-call)
 */
exports.sendEmail = onRequest(
  { secrets: ['SENDGRID_KEY'] },
  async (req, res) => {
    try {
      if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Use POST' });
      }

      const body = req.body || {};
      const to = body.to || body.recipients || null; // accept different keys
      const subject = body.subject || null;
      const text = body.text || '';
      const html = body.html || '';

      if (!to || !subject || (!text && !html)) {
        return res.status(400).json({ error: 'Missing required fields: to, subject, and text or html' });
      }

      // Sender email: use env if set (recommended), otherwise fallback to your verified single sender
      const FROM_EMAIL = process.env.SENDER_EMAIL || 'kamleshkp9916@gmail.com';

      // ensure SendGrid key present
      if (!process.env.SENDGRID_KEY) {
        console.error('SENDGRID_KEY is not set in environment; aborting send.');
        return res.status(500).json({ error: 'SendGrid API key not configured' });
      }

      // Build message
      // If multiple recipients provided, use personalizations so recipients cannot see each other.
      const recipients = normalizeRecipients(to);

      // Build content array ensuring non-empty strings (SendGrid rejects empty content items)
      const content = [];
      if (text && String(text).trim().length > 0) content.push({ type: 'text/plain', value: String(text) });
      if (html && String(html).trim().length > 0) content.push({ type: 'text/html', value: String(html) });

      if (content.length === 0) {
        return res.status(400).json({ error: 'Both text and html are empty after trimming' });
      }

      let msg = {
        from: FROM_EMAIL,
        subject: subject,
        content: content,
        mail_settings: {
          /* example: sandbox_mode: { enable: true } */
        },
      };

      if (recipients.length === 1) {
        // Single recipient -> simple to field
        msg.to = recipients[0].email;
      } else {
        // Multiple recipients -> personalizations: each recipient gets its own personalization
        msg.personalizations = recipients.map((r) => ({ to: [r] }));
      }

      // Optional: reply-to (if provided)
      if (body.replyTo) msg.replyTo = { email: body.replyTo };

      // Send
      const result = await sgMail.send(msg, false); // second param false avoids implicit multiple sends
      // sgMail.send returns an array for multiple recipients; include helpful info
      console.log('SendGrid result:', Array.isArray(result) ? result.map(r => r.statusCode) : result && result.statusCode);
      return res.status(200).json({ success: true, debug: Array.isArray(result) ? result.map(r => r.statusCode) : result && result.statusCode });
    } catch (err) {
      // grab SendGrid response body if present
      let sgBody = null;
      try {
        if (err && err.response && (err.response.body || err.response.data)) {
          sgBody = err.response.body || err.response.data;
        }
      } catch (e) {
        console.error('Failed to extract sendgrid body:', e && e.toString ? e.toString() : e);
      }

      console.error('sendEmail error:', err && err.toString ? err.toString() : err);
      if (sgBody) console.error('SendGrid response body (debug):', JSON.stringify(sgBody, null, 2));

      // Return structured error for debugging
      return res.status(500).json({
        error: 'Email sending failed',
        sendgrid_error: sgBody || (err && err.toString ? err.toString() : 'no sendgrid body available'),
      });
    }
  }
);
