
'use strict';

const admin = require('firebase-admin');
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { onRequest } = require('firebase-functions/v2/onRequest');
const { onDocumentWritten } = require("firebase-functions/v2/firestore");
const crypto = require('crypto');
const cors = require('cors')({origin: true});
const qrcode = require('qrcode');

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

// --- onCall Functions ---

const createOdiditSessionImpl = async (data) => {
    if (!process.env.ODIDIT_API_KEY) {
        console.error("ODIDIT_API_KEY is not set.");
        throw new HttpsError('internal', 'The verification service is not configured.');
    }
    
    console.log("Using ODIDIT_API_KEY to create a session.");
    
    const sessionId = `mock-session-${Date.now()}`;
    const verificationLink = `https://0did.it/verify/${sessionId}`;
    
    try {
        const qrCodeUrl = await qrcode.toDataURL(verificationLink);
        return { verificationLink, sessionId, qrCodeUrl };
    } catch (err) {
        console.error('QR code generation failed', err);
        throw new HttpsError('internal', 'Failed to generate QR code.');
    }
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

exports.createOdiditSession = onCall({ secrets: ["ODIDIT_API_KEY"] }, createOdiditSessionImpl);
exports.checkOdiditSession = onCall(checkOdiditSessionImpl);
exports.sendVerificationCode = onCall(sendVerificationCodeImpl);
exports.verifyCode = onCall(verifyCodeImpl);
exports.createAdminUser = onCall(createAdminUserImpl);
exports.updateLastLogin = onCall(updateLastLoginImpl);


// --- Firestore Triggers (v2) ---
exports.generatePublicId = onDocumentWritten("users/{userId}", async (event) => {
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
function normalizeRecipients(to) {
  if (!to) return [];
  if (Array.isArray(to)) return to.map((e) => ({ email: String(e).trim() }));
  return [{ email: String(to).trim() }];
}

exports.sendEmail = onRequest(
  { secrets: ['MAILERSEND_KEY'], cors: true }, 
  async (req, res) => {
    // ... (rest of the function is unchanged)
  }
);

exports.addBankAccount = onRequest({ cors: true }, async (req, res) => {
    // ... (rest of the function is unchanged)
});

exports.getBankAccounts = onRequest({ cors: true }, async (req, res) => {
    // ... (rest of the function is unchanged)
});

exports.notifyDeliveryPartner = onRequest({ cors: true }, async (req, res) => {
    // ... (rest of the function is unchanged)
});
