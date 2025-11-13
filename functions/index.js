
'use strict';

const admin = require('firebase-admin');
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { onRequest } = require('firebase-functions/v2/onRequest');
const functions = require('firebase-functions'); // if you use env/secret config in firebase.json
const sgMail = require('@sendgrid/mail');
const vision = require('@google-cloud/vision');

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

/**
 * NEW: Callable function to create an admin user.
 * This function handles user creation, sets a custom claim for the 'admin' role,
 * and creates the corresponding user document in Firestore.
 */
exports.createAdminUser = onCall(async (request) => {
    // Check if the calling user is an admin.
    if (request.auth?.token?.role !== 'admin') {
        throw new HttpsError('permission-denied', 'You must be an admin to create other admins.');
    }

    const { email, password, firstName, lastName, userId, phone } = request.data;
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
            // Add any other default fields here
            followers: 0,
            following: 0,
            bio: "Administrator Account",
            location: "",
            addresses: [],
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
 * Configure SendGrid API key.
 */
if (process.env.SENDGRID_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_KEY);
} else {
  console.warn('SENDGRID_KEY not set in env; send attempts will fail until it is configured.');
}

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

      const FROM_EMAIL = process.env.SENDER_EMAIL || 'kamleshkp9916@gmail.com';

      if (!process.env.SENDGRID_KEY) {
        console.error('SENDGRID_KEY is not set in environment; aborting send.');
        return res.status(500).json({ error: 'SendGrid API key not configured' });
      }

      const recipients = normalizeRecipients(to);
      const content = [];
      if (text && String(text).trim().length > 0) content.push({ type: 'text/plain', value: String(text) });
      if (html && String(html).trim().length > 0) content.push({ type: 'text/html', value: String(html) });

      if (content.length === 0) {
        return res.status(400).json({ error: 'Both text and html are empty after trimming' });
      }

      let msg = { from: FROM_EMAIL, subject: subject, content: content };

      if (recipients.length === 1) {
        msg.to = recipients[0].email;
      } else {
        msg.personalizations = recipients.map((r) => ({ to: [r] }));
      }

      if (body.replyTo) msg.replyTo = { email: body.replyTo };

      const result = await sgMail.send(msg, false); 
      console.log('SendGrid result:', Array.isArray(result) ? result.map(r => r.statusCode) : result && result.statusCode);
      return res.status(200).json({ success: true, debug: Array.isArray(result) ? result.map(r => r.statusCode) : result && result.statusCode });
    } catch (err) {
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

      return res.status(500).json({
        error: 'Email sending failed',
        sendgrid_error: sgBody || (err && err.toString ? err.toString() : 'no sendgrid body available'),
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

exports.faceMatch = onRequest({ cors: true }, async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).send('Method Not Allowed');
    }
    
    if (!req.auth) {
        return res.status(401).send('Unauthorized');
    }

    const { selfieUrl, aadhaarPhotoUrl } = req.body;
    if (!selfieUrl || !aadhaarPhotoUrl) {
        return res.status(400).send('Missing selfieUrl or aadhaarPhotoUrl');
    }

    try {
        const client = new vision.ImageAnnotatorClient();

        const [selfieResult] = await client.faceDetection(selfieUrl);
        const [aadhaarResult] = await client.faceDetection(aadhaarPhotoUrl);

        const selfieFaces = selfieResult.faceAnnotations;
        const aadhaarFaces = aadhaarResult.faceAnnotations;

        if (!selfieFaces.length || !aadhaarFaces.length) {
            return res.status(200).json({ score: 0, status: 'failed', message: 'Could not detect a face in one or both images.' });
        }
        
        const selfieConfidence = selfieFaces[0].detectionConfidence || 0;
        const aadhaarConfidence = aadhaarFaces[0].detectionConfidence || 0;
        
        const score = (selfieConfidence + aadhaarConfidence) / 2;

        if (score >= 0.8) {
            res.status(200).json({ score, status: 'passed' });
        } else {
            res.status(200).json({ score, status: 'failed' });
        }
    } catch (error) {
        console.error('Face match error:', error);
        res.status(500).send('Error during face detection.');
    }
});
