const { onRequest } = require("firebase-functions/v2/https");
const sgMail = require("@sendgrid/mail");

// Exported function uses secret SENDGRID_KEY injected at runtime
exports.sendEmail = onRequest(
  { secrets: ["SENDGRID_KEY"] },
  async (req, res) => {
    try {
      // Allow only POST
      if (req.method !== "POST") {
        return res.status(405).send({ error: "Use POST" });
      }

      const body = req.body || {};
      const to = body.to || null;
      const subject = body.subject || null;
      const text = body.text || null;
      const html = body.html || null;

      if (!to || !subject || (!text && !html)) {
        return res.status(400).json({ error: "Missing required fields: to, subject, text/html" });
      }

      const SENDGRID_KEY = process.env.SENDGRID_KEY;
      if (!SENDGRID_KEY) {
        console.error("Missing SENDGRID_KEY env var");
        return res.status(500).json({ error: "Server misconfigured" });
      }

      sgMail.setApiKey(SENDGRID_KEY);

      const msg = {
        to,
        from: "kamleshkp9916@gmail.com", // <- ensure this sender is VERIFIED in SendGrid
        subject,
        text: text || "",
        html: html || ""
      };

      await sgMail.send(msg);

      return res.status(200).json({ success: true });
    } catch (err) {
      console.error("sendEmail error:", err);
      return res.status(500).json({ error: "Email sending failed" });
    }
  }
);

