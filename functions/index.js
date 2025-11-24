
'use strict';

const functions = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");
const QRCode = require("qrcode");

if (!admin.apps.length) {
  admin.initializeApp();
}
const db = admin.firestore();

const ODIDIT_API_BASE = "https://api.odidit.example"; // <-- REPLACE with real Odidit base URL

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
      logger.error("ODIDIT_API_KEY missing from environment");
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
    logger.error("startVerification error", err);
    return res.status(500).json({ error: err.message || "internal" });
  }
}

async function handleStatus(req, res) {
    try {
        const sessionId = req.query.sessionId;
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
        logger.error("status error", err);
        return res.status(500).json({ error: err.message || "internal" });
    }
}


// --- Main onRequest Function ---
exports.verifyFlow = functions.https.onRequest(
  { secrets: ["ODIDIT_API_KEY"], cors: true },
  async (req, res) => {
    // Route based on a query parameter or path segment
    if (req.path.endsWith('/startVerification')) {
        return handleStartVerification(req, res);
    }
    if (req.path.endsWith('/status')) {
        return handleStatus(req, res);
    }
    // Default response if no route matches
    return res.status(404).send('Not Found');
  }
);
