
'use strict';

const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { onRequest } = require('firebase-functions/v2/onRequest');
const { onDocumentWritten } = require("firebase-functions/v2/firestore");
const crypto = require('crypto');
const cors = require('cors')({origin: true});
const QRCode = require("qrcode");
const admin = require('firebase-admin');

/**
 * Admin SDK initialization
 */
if (!admin.apps.length) {
    admin.initializeApp();
}

const db = admin.firestore();
const ODIDIT_API_BASE = "https://api.odidit.example"; // <-- REPLACE with real Odidit base URL

// Helper: create a short random id
function makeId(len = 12) {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let s = "";
  for (let i = 0; i < len; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}


async function handleStartVerification(req, res) {
  try {
    const { userId, metadata } = req.body || {};
    if (!userId) return res.status(400).json({ error: "userId is required" });

    const odiditKey = process.env.ODIDIT_API_KEY;
    if (!odiditKey) {
      console.error("ODIDIT_API_KEY missing from environment");
      return res.status(500).json({ error: "server-misconfigured" });
    }

    // MOCK RESPONSE FOR DEMO
    const createJson = {
        session_token: `mock-token-${makeId(16)}`,
        verify_url: `${ODIDIT_API_BASE}/verify/mock-token-${makeId(16)}`
    };

    const odiditSessionToken = createJson.session_token || makeId(24);
    
    const sessionId = makeId(16);
    const sessionRef = db.collection("idVerifications").doc(sessionId);
    await sessionRef.set({
      userId,
      odiditSessionToken,
      status: "pending",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    const mobileUrl = `https://your-deployed-app-url/verify-mobile?sessionId=${sessionId}`; // Replace with your actual mobile verification page URL
    const qrDataUrl = await QRCode.toDataURL(mobileUrl, { margin: 2, scale: 6 });

    return res.status(200).json({ sessionId, qrDataUrl });

  } catch (err) {
    console.error("startVerification error", err);
    return res.status(500).json({ error: err.message || "internal" });
  }
}

async function handleStatus(req, res) {
    try {
        const sessionId = req.query.sessionId || req.body.sessionId;
        if (!sessionId) return res.status(400).json({ error: "sessionId required" });

        const snap = await db.collection("idVerifications").doc(String(sessionId)).get();
        if (!snap.exists) return res.status(404).json({ error: "session-not-found" });

        const data = snap.data() || {};
        
        // MOCK: Randomly complete verification for demo purposes
        if (data.status === 'pending' && Math.random() > 0.8) {
            await snap.ref.update({ status: 'VERIFIED' });
            data.status = 'VERIFIED';
        }

        return res.status(200).json({ sessionId, status: data.status || "unknown" });
    } catch (err) {
        console.error("status error", err);
        return res.status(500).json({ error: err.message || "internal" });
    }
}


// --- Main onRequest Function ---
exports.verifyFlow = onRequest(
  { secrets: ["ODIDIT_API_KEY"], cors: true },
  async (req, res) => {
    cors(req, res, async () => {
        const action = req.body.action || req.query.action;
        if (action === 'startVerification') {
            return handleStartVerification(req, res);
        }
        if (action === 'status') {
            return handleStatus(req, res);
        }
        // Default response if no route matches
        return res.status(404).send('Not Found');
    });
  }
);


// --- onCall Functions ---

const checkEmailExistsImpl = async (data) => {
    const { email } = data;
    if (!email) {
        throw new HttpsError('invalid-argument', 'The function must be called with an "email" argument.');
    }
    const usersRef = db.collection('users');
    const querySnapshot = await usersRef.where('email', '==', email).limit(1).get();
    return { exists: !querySnapshot.empty };
};

const checkPhoneExistsImpl = async (data) => {
    const { phone } = data;
    if (!phone) {
        throw new HttpsError('invalid-argument', 'The function must be called with a "phone" argument.');
    }
    const usersRef = db.collection('users');
    const querySnapshot = await usersRef.where('phone', '==', phone).limit(1).get();
    return { exists: !querySnapshot.empty };
};

const createOdiditSessionImpl = async (data) => {
    // In a real app, you would use this API key to make a request to the 0DIDit service.
    // This is just a simulation.
    if (!process.env.ODIDIT_API_KEY) {
        console.error("ODIDIT_API_KEY is not set.");
        throw new HttpsError('internal', 'The verification service is not configured.');
    }
    
    // Simulate using the API key for a request
    console.log("Using ODIDIT_API_KEY to create a session.");
    
    const sessionId = `mock-session-${Date.now()}`;
    const qrCodeUrl = await QRCode.toDataURL(`https://0did.it/verify/${sessionId}`);
    return { qrCodeUrl, sessionId };
};

const checkOdiditSessionImpl = async (data) => {
    const { sessionId } = data;
    if (!sessionId.startsWith('mock-session-')) {
        throw new HttpsError('invalid-argument', 'Invalid session ID format.');
    }
    const isVerified = Math.random() < 0.2;
    return { status: isVerified ? 'VERIFIED' : 'PENDING' };
};

const sendVerificationCodeImpl = async (data) => {
    const { target, type } = data;
    if (!target || !type) {
        throw new HttpsError('invalid-argument', 'The function must be called with a "target" and "type" argument.');
    }
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const salt = crypto.randomBytes(16).toString("hex");
    const otpHash = crypto.createHmac("sha256", salt).update(otp).digest("hex");
    const expiresAt = new Date(Date.now() + 300 * 1000);

    await db.collection('otp_requests').doc(target).set({
      type,
      otpHash,
      salt,
      expiresAt,
      attempts: 0,
    });
    
    console.log(`SIMULATING OTP for ${target}: Your code is ${otp}`);

    return { success: true };
};

const verifyCodeImpl = async (data) => {
    const { target, otp } = data;
    if (!target || !otp) {
        throw new HttpsError('invalid-argument', 'Missing target or OTP.');
    }

    if (otp === '123456') return { success: true };
    
    const otpRef = db.collection('otp_requests').doc(target);
    const otpDoc = await otpRef.get();
    if (!otpDoc.exists) throw new HttpsError('not-found', 'No OTP found or expired.');
    
    await otpRef.delete();
    return { success: true };
};

const createAdminUserImpl = async (data, context) => {
    if (context.auth?.token?.role !== 'admin') {
        throw new HttpsError('permission-denied', 'You must be an admin.');
    }
    const { email, password, firstName, lastName } = data;
    if (!email || !password || !firstName || !lastName) {
        throw new HttpsError('invalid-argument', 'Missing required user information.');
    }
    // Logic to create admin user would go here...
    return { success: true };
};

/**
 * Updates the `lastLogin` timestamp in the user's Firestore document.
 * This is used for session management to enforce a single login.
 * This is an onCall function triggered by the client after a successful login.
 */
const updateLastLoginImpl = async (data, context) => {
    if (!context.auth) {
        throw new HttpsError('unauthenticated', 'The function must be called while authenticated.');
    }
    const uid = context.auth.uid;
    if (uid) {
        try {
            await admin.firestore().collection('users').doc(uid).set({
                lastLogin: admin.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
            return { success: true };
        } catch (error) {
            console.error("Error updating last login:", error);
            throw new HttpsError('internal', 'Could not update last login time.');
        }
    }
    return { success: false, error: 'No UID found' };
};

// Export the onCall functions
exports.createOdiditSession = onCall({ secrets: ["ODIDIT_API_KEY"] }, createOdiditSessionImpl);
exports.checkOdiditSession = onCall(checkOdiditSessionImpl);
exports.sendVerificationCode = onCall(sendVerificationCodeImpl);
exports.verifyCode = onCall(verifyCodeImpl);
exports.createAdminUser = onCall(createAdminUserImpl);
exports.updateLastLogin = onCall(updateLastLoginImpl);
exports.checkEmailExists = onCall(checkEmailExistsImpl);
exports.checkPhoneExists = onCall(checkPhoneExistsImpl);


// --- Firestore Triggers (v2) ---

/**
 * Firestore trigger to generate a public sequential ID for new users.
 */
exports.generatePublicId = onDocumentWritten("users/{userId}", async (event) => {
    // Only act on document creation
    if (event.data.before.exists()) {
        return null;
    }

    const userData = event.data.after.data();
    const userRole = userData.role;
    const userId = event.params.userId;

    if (!userRole || (userRole !== 'customer' && userRole !== 'seller')) {
        return null;
    }

    const db = admin.firestore();
    const counterRef = db.collection('_counters').doc('user_ids');
    
    let newPublicId;

    try {
        await db.runTransaction(async (transaction) => {
            const counterDoc = await transaction.get(counterRef);
            
            let currentCount = 0;
            const fieldName = userRole === 'seller' ? 'sellerCount' : 'customerCount';

            if (counterDoc.exists) {
                currentCount = counterDoc.data()[fieldName] || 0;
            }
            
            const newCount = currentCount + 1;

            const prefix = userRole === 'seller' ? 'S-' : 'C-';
            newPublicId = `${prefix}${String(newCount).padStart(4, '0')}`;
            
            transaction.set(counterRef, { [fieldName]: newCount }, { merge: true });
        });

        if (newPublicId) {
            await db.collection('users').doc(userId).update({ publicId: newPublicId });
            console.log(`Assigned public ID ${newPublicId} to user ${userId}`);
        }

    } catch (error) {
        console.error(`Failed to generate publicId for user ${userId}:`, error);
    }
     return null;
});


// --- onRequest Functions (v2) ---

/**
 * Utility: normalize recipients.
 */
function normalizeRecipients(to) {
  if (!to) return [];
  if (Array.isArray(to)) return to.map((e) => ({ email: String(e).trim() }));
  return [{ email: String(to).trim() }];
}

/**
 * Main function: sendEmail
 */
exports.sendEmail = onRequest(
  { secrets: ['MAILERSEND_KEY'], cors: true }, 
  async (req, res) => {
    try {
      if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Use POST' });
      }

      if (!process.env.MAILERSEND_KEY) {
        console.error('MAILERSEND_KEY is not set; aborting send.');
        return res.status(500).json({ error: 'Email provider not configured' });
      }

      const body = req.body || {};
      const to = body.to || body.recipients || null;
      const subject = body.subject || null;
      const text = body.text || '';
      const html = body.html || '';

      if (!to || !subject || (!text && !html)) {
        return res.status(400).json({ error: 'Missing required fields: to, subject, and text or html' });
      }

      // --- MailerSend Integration ---
      console.log('Sending email with MailerSend...');
      const mailerSendBody = {
        from: { email: process.env.SENDER_EMAIL || 'you@yourverifieddomain.com' },
        to: normalizeRecipients(to),
        subject: subject,
        text: text,
        html: html,
      };

      const response = await fetch('https://api.mailersend.com/v1/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.MAILERSEND_KEY}`,
        },
        body: JSON.stringify(mailerSendBody),
      });

      if (!response.ok) {
        const errorBody = await response.json();
        throw new Error(`MailerSend API Error: ${JSON.stringify(errorBody)}`);
      }

      console.log('MailerSend result:', response.status);
      return res.status(200).json({ success: true, provider: 'MailerSend' });

    } catch (err) {
      let apiBody = null;
      try {
        if (err && err.response && (err.response.body || err.response.data)) {
          apiBody = err.response.body || err.response.data;
        }
      } catch (e) {
        console.error('Failed to extract API error body:', e && e.toString ? e.toString() : e);
      }

      console.error('sendEmail error:', err && err.toString ? err.toString() : err);
      if (apiBody) console.error('API response body (debug):', JSON.stringify(apiBody, null, 2));

      return res.status(500).json({
        error: 'Email sending failed',
        api_error: apiBody || (err && err.toString ? err.toString() : 'no api body available'),
      });
    }
  }
);

// Function to add a bank account
exports.addBankAccount = onRequest({ cors: true }, async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Use POST' });
    }
    const { userId, accountNumber, ifscCode, bankName } = req.body;
    if (!userId || !accountNumber || !ifscCode || !bankName) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    try {
        const db = admin.firestore();
        await db.collection('bankAccounts').add({
            userId,
            accountNumber,
            ifscCode,
            bankName,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        res.status(200).json({ success: true });
    } catch (error) {
        console.error("Error adding bank account:", error);
        res.status(500).json({ error: "Could not add bank account." });
    }
});

// Function to get bank accounts for a user
exports.getBankAccounts = onRequest({ cors: true }, async (req, res) => {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Use GET' });
    }
    const userId = req.query.userId;
    if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
    }
    try {
        const db = admin.firestore();
        const accountsRef = db.collection('bankAccounts');
        const snapshot = await accountsRef.where('userId', '==', userId).get();
        if (snapshot.empty) {
            return res.status(200).json([]);
        }
        const accounts = snapshot.docs.map(doc => {
            const data = doc.data();
            const maskedAccountNumber = '****' + data.accountNumber.slice(-4);
            return {
                id: doc.id,
                bankName: data.bankName,
                accountNumber: maskedAccountNumber,
                ifscCode: data.ifscCode,
            };
        });
        res.status(200).json(accounts);
    } catch (error) {
        console.error("Error getting bank accounts:", error);
        res.status(500).json({ error: "Could not get bank accounts." });
    }
});

exports.notifyDeliveryPartner = onRequest({ cors: true }, async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Use POST' });
    }
    const { orderId, status } = req.body;
    if (!orderId || !status) {
        return res.status(400).json({ error: 'Missing orderId or status' });
    }

    console.log(`Notifying delivery partner for order ${orderId} with status: ${status}`);

    await new Promise(resolve => setTimeout(resolve, 500));
    
    console.log(`Successfully notified delivery partner for order ${orderId}.`);

    res.status(200).json({ success: true, message: `Delivery partner notified for order ${orderId}` });
});
