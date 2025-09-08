
const { onRequest } = require("firebase-functions/v2/http");
const functions = require("firebase-functions");
const sgMail = require("@sendgrid/mail");
const admin = require("firebase-admin");

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


// New function to send emails based on notifications created in Firestore
exports.sendNotificationEmail = functions.runWith({ secrets: ["SENDGRID_KEY"] }).firestore.document('notifications/{notificationId}').onCreate(async (snap, context) => {
    const notificationData = snap.data();
    if (!notificationData) {
        console.log("No data associated with the event");
        return;
    }

    const SENDGRID_KEY = process.env.SENDGRID_KEY;
    if (!SENDGRID_KEY) {
        console.error("Missing SENDGRID_KEY env var. Cannot send notification email.");
        return;
    }
    sgMail.setApiKey(SENDGRID_KEY);

    const { type, title, message, userId } = notificationData;

    if (type === 'announcement') {
        // Send to all users
        try {
            const usersSnapshot = await db.collection('users').get();
            if (usersSnapshot.empty) {
                console.log("No users found to send announcement to.");
                return;
            }

            const emails = usersSnapshot.docs.map(doc => doc.data().email).filter(email => !!email);
            
            if (emails.length === 0) {
                 console.log("No valid user emails found.");
                return;
            }
            
            const personalizations = emails.map(email => ({ to: [{ email }] }));
            
            const msg = {
                personalizations: personalizations,
                from: {
                    email: "kamleshkp9916@gmail.com",
                    name: "StreamCart"
                },
                subject: `Announcement: ${title}`,
                html: `<h2>${title}</h2><p>${message}</p>`,
            };

            await sgMail.send(msg);
            console.log(`Announcement email sent to ${emails.length} users.`);

        } catch (error) {
            console.error("Error sending announcement email:", error.toString());
            if (error.response) {
                console.error(error.response.body)
            }
        }
    } else if (type === 'warning') {
        // Send to a specific user
        try {
            if (!userId) {
                console.error("Warning notification is missing userId.");
                return;
            }
            
            // Try to fetch user by UID first, then by email as a fallback
            let userDoc = await db.collection('users').doc(userId).get();
            let userEmail;

            if (userDoc.exists) {
                userEmail = userDoc.data().email;
            } else {
                 const usersQuery = await db.collection('users').where('email', '==', userId).limit(1).get();
                 if (!usersQuery.empty) {
                     userEmail = usersQuery.docs[0].data().email;
                 }
            }
            
            if (!userEmail) {
                console.error(`Could not find email for user: ${userId}`);
                return;
            }

            const msg = {
                to: userEmail,
                from: "kamleshkp9916@gmail.com",
                subject: `Important: A Warning Regarding Your Account`,
                html: `<h2>Warning</h2><p>This is a formal warning regarding your StreamCart account.</p><p><strong>Message from Admin:</strong> ${message}</p><p>Please adhere to our community guidelines to avoid further action.</p>`,
            };

            await sgMail.send(msg);
            console.log(`Warning email sent to ${userEmail}`);

        } catch (error) {
            console.error(`Error sending warning email to ${userId}:`, error);
        }
    }
});
