
const { onRequest } = require("firebase-functions/v2/http");
const functions = require("firebase-functions");
const sgMail = require("@sendgrid/mail");
const admin = require("firebase-admin");
const client = require("@sendgrid/client");

admin.initializeApp();
const db = admin.firestore();


// Existing function to send email via HTTP request
exports.sendEmail = onRequest(
  { secrets: ["SENDGRID_KEY"] },
  async (req, res) => {
    try {
      if (req.method !== "POST") {
        return res.status(405).send({ error: "Use POST" });
      }

      const { to, subject, text, html } = req.body || {};
      if (!to || !subject || (!text && !html)) {
        return res.status(400).json({ error: "Missing required fields: to, subject, text/html" });
      }

      const SENDGRID_KEY = process.env.SENDGRID_KEY;
      if (!SENDGRID_KEY) {
        console.error("Missing SENDGRID_KEY env var");
        return res.status(500).json({ error: "Server misconfigured" });
      }

      sgMail.setApiKey(SENDGRID_KEY);

      // build the message object without empty content fields
      const msg = {
        to,
        from: "kamleshkp9916@gmail.com", // your verified single sender
        subject,
      };

      // only include text/html if non-empty strings
      if (typeof text === "string" && text.trim().length > 0) {
        msg.text = text;
      }
      if (typeof html === "string" && html.trim().length > 0) {
        msg.html = html;
      }

      // final sanity: require at least one content field
      if (!msg.text && !msg.html) {
        return res.status(400).json({ error: "Missing required fields: text or html must be present and non-empty" });
      }


      await sgMail.send(msg);
      return res.status(200).json({ success: true });
    } catch (err) {
      console.error("sendEmail error:", err && err.toString ? err.toString() : err);

      // log SendGrid's detailed error if available
      try {
        const sgBody = err?.response?.body || err?.response?.data;
        if (sgBody) console.error("SendGrid response body (debug):", JSON.stringify(sgBody, null, 2));
      } catch (e) {
        console.error("Failed to log SendGrid error body:", e.toString());
      }

      return res.status(500).json({ error: "Email sending failed" });
    }
  }
);


// New function to send a welcome email on user signup
exports.sendWelcomeEmail = functions.runWith({ secrets: ["SENDGRID_KEY"] }).auth.user().onCreate(async (user) => {
  const SENDGRID_KEY = process.env.SENDGRID_KEY;
  if (!SENDGRID_KEY) {
    console.error("Missing SENDGRID_KEY env var. Cannot send welcome email.");
    return;
  }
  sgMail.setApiKey(SENDGRID_KEY);

  const msg = {
    to: user.email,
    from: "kamleshkp9916@gmail.com",
    subject: "Welcome to StreamCart!",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Welcome to StreamCart, ${user.displayName || 'Friend'}!</h2>
        <p>We're thrilled to have you join our community of live shoppers and sellers.</p>
        <p>With StreamCart, you can:</p>
        <ul>
          <li>Discover unique products through live video streams.</li>
          <li>Interact with sellers in real-time.</li>
          <li>Shop with confidence and have fun!</li>
        </ul>
        <p>To get started, check out the latest <a href="https://your-app-url/live-selling">live streams</a>.</p>
        <p>Happy shopping!</p>
        <br>
        <p>The StreamCart Team</p>
      </div>
    `,
  };

  try {
    await sgMail.send(msg);
    console.log(`Welcome email sent to ${user.email}`);
  } catch (error) {
    console.error("Error sending welcome email:", error);
     // log SendGrid's detailed error if available
      try {
        const sgBody = error?.response?.body || error?.response?.data;
        if (sgBody) console.error("SendGrid response body (debug):", JSON.stringify(sgBody, null, 2));
      } catch (e) {
        console.error("Failed to log SendGrid error body:", e.toString());
      }
  }
});

// Replaced the Firestore-triggered function with a robust HTTP-triggered one for notifications.
exports.sendNotificationEmail = onRequest(
  { secrets: ["SENDGRID_KEY"] },
  async (req, res) => {
    try {
      if (req.method !== "POST") {
        return res.status(405).json({ error: "Use POST" });
      }
      
      const body = req.body || {};
      const subject = body.subject;
      const text = body.text || null;
      const html = body.html || null;
      const fromEmail = body.from || "kamleshkp9916@gmail.com";
      const recipients = body.recipients || [];

      if (!subject || (!text && !html) || !Array.isArray(recipients) || recipients.length === 0) {
        return res.status(400).json({
          error: "Missing required fields: subject, (text or html), recipients (non-empty array)"
        });
      }

      const SENDGRID_KEY = process.env.SENDGRID_KEY;
      if (!SENDGRID_KEY) {
        console.error("Missing SENDGRID_KEY env var");
        return res.status(500).json({ error: "Server misconfigured" });
      }

      client.setApiKey(SENDGRID_KEY);

      const personalizations = recipients.map((r) => {
        if (typeof r === "string") {
          return { to: [{ email: r }] };
        } else {
          const p = { to: [{ email: r.email }] };
          if (r.name) p.to[0].name = r.name;
          if (r.data && typeof r.data === "object") {
            p.dynamic_template_data = r.data;
          }
          return p;
        }
      });

      const MAX_PER_BATCH = 500;
      const batches = [];
      for (let i = 0; i < personalizations.length; i += MAX_PER_BATCH) {
        batches.push(personalizations.slice(i, i + MAX_PER_BATCH));
      }

      const content = [];
      if (text) content.push({ type: "text/plain", value: text });
      if (html) content.push({ type: "text/html", value: html });

      for (const batchPersonalizations of batches) {
        const msg = {
          personalizations: batchPersonalizations,
          from: { email: fromEmail },
          subject,
          content
        };
        await client.request({
          method: "POST",
          url: "/v3/mail/send",
          body: msg
        });
      }

      return res.status(200).json({ success: true, sent: recipients.length });
    } catch (err) {
      try {
        const sgBody = err && err.response && (err.response.body || err.response.data)
          ? (err.response.body || err.response.data)
          : null;
        console.error("sendNotificationEmail error:", err && err.toString ? err.toString() : err);
        if (sgBody) console.error("SendGrid response body (debug):", JSON.stringify(sgBody, null, 2));
      } catch (logErr) {
        console.error("Error logging send error:", logErr);
      }

      return res.status(500).json({ error: "Email sending failed" });
    }
  }
);

    