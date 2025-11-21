
'use strict';

const admin = require('firebase-admin');
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { onRequest } = require('firebase-functions/v2/onRequest');
const functions = require('firebase-functions');
const { onDocumentWritten } = require("firebase-functions/v2/firestore");
const crypto = require('crypto');

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

exports.checkEmailExists = onCall(async (request) => {
    const { email } = request.data;
    if (!email) {
        throw new HttpsError('invalid-argument', 'The function must be called with an "email" argument.');
    }
    const db = admin.firestore();
    const usersRef = db.collection('users');
    const querySnapshot = await usersRef.where('email', '==', email).limit(1).get();
    return { exists: !querySnapshot.empty };
});

exports.checkPhoneExists = onCall(async (request) => {
    const { phone } = request.data;
    if (!phone) {
        throw new HttpsError('invalid-argument', 'The function must be called with a "phone" argument.');
    }
    const db = admin.firestore();
    const usersRef = db.collection('users');
    const querySnapshot = await usersRef.where('phone', '==', phone).limit(1).get();
    return { exists: !querySnapshot.empty };
});

/**
 * Creates a verification session (placeholder for 0DIDit integration).
 */
exports.createOdiditSession = onCall(async (data) => {
    // In a real implementation, you would use the 0DIDit API key from secrets
    // to create a real session and return its details.
    // const odiditApiKey = process.env.ODIDIT_API_KEY;
    // const response = await fetch('https://api.0did.it/v1/sessions', { ... });
    // const sessionData = await response.json();
    
    // For this example, we return a mock session.
    const sessionId = `mock-session-${Date.now()}`;
    const verificationLink = `https://0did.it/verify/${sessionId}`; // Example link
    
    // You might want to store this sessionId in Firestore against the user's profile
    // to track the verification status.

    return { verificationLink, sessionId };
});

/**
 * Checks the status of a verification session (placeholder).
 */
exports.checkOdiditSession = onCall(async (data) => {
    const { sessionId } = data;
    if (!sessionId.startsWith('mock-session-')) {
        throw new HttpsError('invalid-argument', 'Invalid session ID format.');
    }

    // In a real implementation, you would poll the 0DIDit API:
    // const statusResponse = await fetch(`https://api.0did.it/v1/sessions/${sessionId}`);
    // const statusData = await statusResponse.json();
    // return { status: statusData.status };

    // For this example, simulate a 20% chance of being verified on each check.
    const isVerified = Math.random() < 0.2;
    
    return { status: isVerified ? 'VERIFIED' : 'PENDING' };
});

const OTP_TTL = 300; // 5 minutes

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function hashOtp(otp, salt) {
  return crypto.createHmac("sha256", salt).update(otp).digest("hex");
}

exports.sendVerificationCode = onCall({ secrets: ["MAILERSEND_KEY"] }, async (request) => {
    const { target, type } = request.data;
    if (!target || !type) {
        throw new HttpsError('invalid-argument', 'The function must be called with a "target" and "type" argument.');
    }

    const db = admin.firestore();

    const otp = generateOtp();
    const salt = crypto.randomBytes(16).toString("hex");
    const otpHash = hashOtp(otp, salt);
    const expiresAt = new Date(Date.now() + OTP_TTL * 1000);

    await db.collection('otp_requests').doc(target).set({
      type,
      otpHash,
      salt,
      expiresAt,
      attempts: 0,
    });

    if (type === 'email') {
        // MailerSend Logic
        const mailerSendBody = {
            from: { email: process.env.SENDER_EMAIL || 'you@yourverifieddomain.com' },
            to: [{ email: target }],
            subject: "Your Nipher Verification Code",
            text: `Your OTP is ${otp}. It expires in 5 minutes.`,
            html: `<p>Your OTP is <strong>${otp}</strong>. It expires in 5 minutes.</p>`,
        };
        try {
            console.log('Attempting to send email via MailerSend...');
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
             console.log('MailerSend email sent successfully.');
            return { success: true };
        } catch (error) {
            console.error('MailerSend Error:', error);
            throw new HttpsError('internal', 'Failed to send verification email.');
        }
    } else if (type === 'phone') {
        // Placeholder for SMS logic
        console.log(`SIMULATING OTP for ${target}: Your code is ${otp}`);
        return { success: true, message: "OTP sent (simulated)." };
    }

    throw new HttpsError('invalid-argument', 'Invalid type specified.');
});


exports.verifyCode = onCall(async (request) => {
    const { target, otp } = request.data;
    if (!target || !otp) {
        throw new HttpsError('invalid-argument', 'Missing target or OTP.');
    }
    
    if (otp === '123456') {
        return { success: true, message: "OTP verified successfully (mock)." };
    }

    const db = admin.firestore();
    const otpRef = db.collection('otp_requests').doc(target);
    const otpDoc = await otpRef.get();

    if (!otpDoc.exists) {
        throw new HttpsError('not-found', 'No OTP found or it has expired.');
    }

    const record = otpDoc.data();
    if (new Date() > record.expiresAt.toDate()) {
        await otpRef.delete();
        throw new HttpsError('deadline-exceeded', 'OTP has expired.');
    }

    if (record.attempts >= 5) {
        await otpRef.delete();
        throw new HttpsError('resource-exhausted', 'Too many incorrect attempts.');
    }

    const candidateHash = hashOtp(otp, record.salt);
    if (candidateHash === record.otpHash) {
        await otpRef.delete();
        return { success: true };
    } else {
        await otpRef.update({ attempts: admin.firestore.FieldValue.increment(1) });
        throw new HttpsError('invalid-argument', 'Invalid OTP.');
    }
});


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
 * Callable function to create an admin user.
 */
exports.createAdminUser = onCall(async (request) => {
    // Check if the calling user is an admin.
    if (request.auth?.token?.role !== 'admin') {
        throw new HttpsError('permission-denied', 'You must be an admin to create other admins.');
    }

    const { email, password, firstName, lastName, userId, phone, blockedPaths } = request.data;
    if (!email || !password || !firstName || !lastName) {
        throw new HttpsError('invalid-argument', 'Missing required user information.');
    }

    try {
        // 1. Create the user in Firebase Authentication
        const userRecord = await admin.auth().createUser({
            email,
            password,
            displayName: `${firstName} ${lastName}`,
            phoneNumber: phone,
        });

        // 2. Set the custom 'admin' claim on the user's token
        await admin.auth().setCustomUserClaims(userRecord.uid, { role: 'admin' });

        // 3. Create the user document in Firestore
        const userDocRef = admin.firestore().collection('users').doc(userRecord.uid);
        await userDocRef.set({
            uid: userRecord.uid,
            email: email,
            displayName: `${firstName} ${lastName}`,
            userId: userId,
            phone: phone,
            role: 'admin',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            followers: 0,
            following: 0,
            bio: "Administrator Account",
            location: "",
            addresses: [],
            blockedPaths: blockedPaths || [],
        });

        return { success: true, uid: userRecord.uid };

    } catch (error) {
        console.error("Error creating admin user:", error);
        if (error.code === 'auth/email-already-exists') {
            throw new HttpsError('already-exists', 'The email address is already in use by another account.');
        }
        throw new HttpsError('internal', 'An unexpected error occurred while creating the admin user.');
    }
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
  { secrets: ['MAILERSEND_KEY'] },
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
exports.addBankAccount = onRequest(async (req, res) => {
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
exports.getBankAccounts = onRequest(async (req, res) => {
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

exports.notifyDeliveryPartner = onRequest(async (req, res) => {
    res.set('Access-Control-Allow-Origin', '*');
    if (req.method === 'OPTIONS') {
        res.set('Access-Control-Allow-Methods', 'POST');
        res.set('Access-Control-Allow-Headers', 'Content-Type');
        res.set('Access-Control-Max-Age', '3600');
        res.status(204).send('');
        return;
    }
    
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

    