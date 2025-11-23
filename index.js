/**
 * Minimal sendEmail Cloud Function (Gen2)
 * Expects JSON body: { to, subject, text OR html }
 * Uses secrets injected as env vars (SENDGRID_KEY).
 * Replace or extend this with your real function logic.
 */
exports.sendEmail = async (req, res) => {
  try {
    if (req.method !== 'POST') return res.status(405).send({ error: 'Use POST' });
    const { to, subject, text, html } = req.body || {};
    if (!to || !subject || !(text || html)) {
      return res.status(400).json({ error: 'Missing required fields: to, subject, text/html' });
    }
    // Example check for sendgrid key (we attached SENDGRID_KEY earlier via --set-secrets)
    const sendgridKey = process.env.SENDGRID_KEY || null;
    if (!sendgridKey) {
      // Not sending real mail — show what would happen
      return res.status(200).json({ ok: true, note: 'SENDGRID_KEY not configured, skipping send', payload: { to, subject, text: !!text, html: !!html } });
    }

    // If you actually want to send mail, enable SendGrid and uncomment next lines
    // const sgMail = require('@sendgrid/mail');
    // sgMail.setApiKey(sendgridKey);
    // await sgMail.send({ to, from: 'noreply@yourdomain.com', subject, text, html });

    return res.status(200).json({ ok: true, note: 'would send via SendGrid', to, subject });
  } catch (err) {
    console.error('sendEmail error', err);
    return res.status(500).json({ error: err.message || 'internal' });
  }
};
