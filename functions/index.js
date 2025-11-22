
'use strict';

const admin = require('firebase-admin');
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { onRequest } = require('firebase-functions/v2/onRequest');
const functions = require('firebase-functions');
const { onDocumentWritten } = require("firebase-functions/v2/firestore");
const crypto = require('crypto');
const cors = require('cors')({origin: true});

/**
 * Admin SDK initialization
 */
if (!admin.apps.length) {
  if (process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_PROJECT_ID) {
    const fixedPrivateKey = (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n');
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: fixedPrivateKey,
      }),
    });
  } else {
    admin.initializeApp();
  }
}

// --- DEPRECATED: These functions are now handled by Next.js API routes ---
// exports.checkEmailExists = onRequest(...)
// exports.checkPhoneExists = onRequest(...)

// --- onCall Functions (for actions where security is handled by callable context) ---

const createOdiditSessionImpl = async (data) => {
    const sessionId = `mock-session-${Date.now()}`;
    const verificationLink = `https://0did.it/verify/${sessionId}`;
    return { verificationLink, sessionId };
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
    const db = admin.firestore();
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
    if (otp === '123456') return { success: true }; // Mock success
    
    const db = admin.firestore();
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
    return { success: true };
};


// Export the onCall functions
exports.createOdiditSession = onCall(createOdiditSessionImpl);
exports.checkOdiditSession = onCall(checkOdiditSessionImpl);
exports.sendVerificationCode = onCall(sendVerificationCodeImpl);
exports.verifyCode = onCall(verifyCodeImpl);
exports.createAdminUser = onCall(createAdminUserImpl);


// --- Existing onRequest and trigger functions ---

/**
 * Updates the `lastLogin` timestamp in the user's Firestore document
 * whenever their ID token is refreshed (e.g., on sign-in).
 * This is used for session management to enforce a single login.
 */
exports.updateLastLogin = functions.auth.user().beforeSignIn((user) => {
    if (user.uid) {
        return admin.firestore().collection('users').doc(user.uid).set({
            lastLogin: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
    }
    return;
});


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
  { secrets: ['MAILERSEND_KEY'], cors: true }, // Enable CORS directly on the function
  async (req, res) => {
    // The cors middleware is no longer needed here since it's handled by the function config
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
exports.addBankAccount = onRequest(async (req, res) => {
    cors(req, res, async () => {
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
});

// Function to get bank accounts for a user
exports.getBankAccounts = onRequest(async (req, res) => {
    cors(req, res, async () => {
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
});

exports.notifyDeliveryPartner = onRequest(async (req, res) => {
    cors(req, res, async () => {
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
});
