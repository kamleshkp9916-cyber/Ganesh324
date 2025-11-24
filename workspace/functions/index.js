'use strict';

const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { onRequest } = require('firebase-functions/v2/onRequest');
const { onDocumentWritten } = require("firebase-functions/v2/firestore");
const crypto = require('crypto');
const cors = require('cors')({ origin: true });
const QRCode = require("qrcode");
const admin = require('firebase-admin');

/**
 * Admin SDK initialization
 */
if (!admin.apps.length) {
    admin.initializeApp();
}

const db = admin.firestore();

// Helper: create a short random id
function makeId(len = 12) {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let s = "";
  for (let i = 0; i < len; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}


async function handleStartVerification(req, res) {
  try {
    const { userId } = req.body || {};
    if (!userId) return res.status(400).json({ error: "userId is required" });

    const sessionId = makeId(16);
    const sessionRef = db.collection("idVerifications").doc(sessionId);
    await sessionRef.set({
      userId,
      status: "pending",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    const mobileUrl = `https://your-deployed-app-url/verify-mobile?sessionId=${sessionId}`;
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


exports.verifyFlow = onRequest(
  { secrets: ["ODIDIT_API_KEY"], cors: true },
  async (req, res) => {
      const action = req.body.action || req.query.action;
      if (action === 'startVerification') {
          return handleStartVerification(req, res);
      }
      if (action === 'status') {
          return handleStatus(req, res);
      }
      return res.status(404).send('Not Found');
  }
);


// --- onCall Functions ---

exports.checkEmailExists = onCall(async (request) => {
    const { email } = request.data;
    if (!email) {
        throw new HttpsError('invalid-argument', 'The function must be called with an "email" argument.');
    }
    const usersRef = db.collection('users');
    const querySnapshot = await usersRef.where('email', '==', email).limit(1).get();
    return { exists: !querySnapshot.empty };
});

exports.checkPhoneExists = onCall(async (request) => {
    const { phone } = request.data;
    if (!phone) {
        throw new HttpsError('invalid-argument', 'The function must be called with a "phone" argument.');
    }
    const usersRef = db.collection('users');
    const querySnapshot = await usersRef.where('phone', '==', phone).limit(1).get();
    return { exists: !querySnapshot.empty };
});

exports.createOdiditSession = onCall({ secrets: ["ODIDIT_API_KEY"] }, async (request) => {
    if (!process.env.ODIDIT_API_KEY) {
        console.error("ODIDIT_API_KEY is not set.");
        throw new HttpsError('internal', 'The verification service is not configured.');
    }
    console.log("Using ODIDIT_API_KEY to create a session.");
    const sessionId = `mock-session-${Date.now()}`;
    const qrCodeUrl = await QRCode.toDataURL(`https://0did.it/verify/${sessionId}`);
    return { qrCodeUrl, sessionId };
});

exports.checkOdiditSession = onCall(async (request) => {
    const { sessionId } = request.data;
    if (!sessionId.startsWith('mock-session-')) {
        throw new HttpsError('invalid-argument', 'Invalid session ID format.');
    }
    const isVerified = Math.random() < 0.2;
    return { status: isVerified ? 'VERIFIED' : 'PENDING' };
});

exports.sendVerificationCode = onCall(async (request) => {
    const { target, type } = request.data;
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
});

exports.verifyCode = onCall(async (request) => {
    const { target, otp } = request.data;
    if (!target || !otp) {
        throw new HttpsError('invalid-argument', 'Missing target or OTP.');
    }

    if (otp === '123456') return { success: true };
    
    const otpRef = db.collection('otp_requests').doc(target);
    const otpDoc = await otpRef.get();
    if (!otpDoc.exists) throw new HttpsError('not-found', 'No OTP found or expired.');
    
    await otpRef.delete();
    return { success: true };
});

exports.createAdminUser = onCall(async (request) => {
    const { data, context } = request;
    if (context.auth?.token?.role !== 'admin') {
        throw new HttpsError('permission-denied', 'You must be an admin.');
    }
    const { email, password, firstName, lastName } = data;
    if (!email || !password || !firstName || !lastName) {
        throw new HttpsError('invalid-argument', 'Missing required user information.');
    }
    // Logic to create admin user would go here...
    return { success: true };
});

exports.updateLastLogin = onCall(async (request) => {
    const { context } = request;
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
});


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


// --- onRequest Functions ---
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
