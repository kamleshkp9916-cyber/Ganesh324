/**
 * functions/index.js
 *
 * Firebase Functions v2 (Node.js 20). Exposes three endpoints:
 *  - POST /startVerification
 *  - POST /mobileVerify
 *  - GET  /status?sessionId=...
 *
 * Requirements:
 *  - Secret: ODIDIT_API_KEY (you already set it via firebase functions:secrets:set)
 *  - Firestore enabled in your project
 *
 * Deploy: firebase deploy --only functions:verifyFlow
 *
 * Note: Replace ODIDIT_API_BASE with the real Odidit base URL and adjust payloads per Odidit's docs.
 */

'use strict';

import * as functions from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";
import QRCode from "qrcode";

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

/**
 * POST /startVerification
 * Body: { userId: string, optional: metadata }
 *
 * Flow:
 *  - Call Odidit to create a session (server-side) using ODIDIT_API_KEY
 *  - Store a session record in Firestore with status "pending"
 *  - Generate a QR code that encodes the mobile verification URL
 *  - Return { sessionId, qrDataUrl, mobileUrl }
 *
 * If caller is on phone and wants to skip QR, they can just call /mobileVerify with sessionId.
 */
export const startVerification = functions.onRequest(
  { secrets: ["ODIDIT_API_KEY"], cors: true },
  async (req, res) => {
    try {
      if (req.method !== "POST") return res.status(405).json({ error: "Use POST" });

      const { userId, metadata } = req.body || {};
      if (!userId) return res.status(400).json({ error: "userId is required" });

      const odiditKey = process.env.ODIDIT_API_KEY;
      if (!odiditKey) {
        logger.error("ODIDIT_API_KEY missing from environment");
        return res.status(500).json({ error: "server-misconfigured" });
      }

      // 1) Create a server-side session with Odidit (example API - adapt to actual)
      const createResp = await fetch(`${ODIDIT_API_BASE}/v1/sessions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${odiditKey}`,
        },
        body: JSON.stringify({
          user_id: userId,
          purpose: "id_verification",
          metadata: metadata || {},
        }),
      });

      // MOCK RESPONSE FOR DEMO
      const createJson = {
          session_token: `mock-token-${makeId(16)}`,
          verify_url: `${ODIDIT_API_BASE}/verify/mock-token-${makeId(16)}`
      };
      
      if (!createResp.ok && createResp.status !== 404) { // Allow 404 for mock
        logger.error("Odidit session creation failed", { status: createResp.status, body: createJson });
        // return res.status(502).json({ error: "odidit-create-failed", details: createJson });
      }

      const odiditSessionToken = createJson.session_token || createJson.token || makeId(24);
      const odiditVerifyUrl = createJson.verify_url || `${ODIDIT_API_BASE}/verify/${odiditSessionToken}`;

      const sessionId = makeId(16);
      const sessionRef = db.collection("idVerifications").doc(sessionId);
      await sessionRef.set({
        userId,
        odiditSessionToken,
        odiditVerifyUrl,
        status: "pending",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
      });

      const projectRegion = "us-central1"; 
      const projectId = process.env.GCP_PROJECT || process.env.GCLOUD_PROJECT || "streamcart-login";
      const mobileUrl = `https://${projectRegion}-${projectId}.cloudfunctions.net/mobileVerify?sessionId=${sessionId}`;
      
      const qrDataUrl = await QRCode.toDataURL(mobileUrl, { margin: 2, scale: 6 });

      return res.status(200).json({
        sessionId,
        qrDataUrl,
        mobileUrl,
        odiditSessionTokenPreview: odiditSessionToken ? odiditSessionToken.slice(0, 6) + "..." : undefined,
      });
    } catch (err) {
      logger.error("startVerification error", err);
      return res.status(500).json({ error: err.message || "internal" });
    }
  }
);

/**
 * POST /mobileVerify
 * Body: { sessionId: string, idImageBase64: string }
 */
export const mobileVerify = functions.onRequest(
  { secrets: ["ODIDIT_API_KEY"], cors: true },
  async (req, res) => {
    try {
      if (req.method !== "POST") return res.status(405).json({ error: "Use POST" });

      const { sessionId, idImageBase64 } = req.body || {};
      if (!sessionId || !idImageBase64) return res.status(400).json({ error: "sessionId and idImageBase64 required" });

      const sessionRef = db.collection("idVerifications").doc(sessionId);
      const snap = await sessionRef.get();
      if (!snap.exists) return res.status(404).json({ error: "session-not-found" });

      const session = snap.data();
      if (!session) return res.status(500).json({ error: "session-data-missing" });

      const odiditKey = process.env.ODIDIT_API_KEY;
      if (!odiditKey) {
        logger.error("ODIDIT_API_KEY missing from environment");
        return res.status(500).json({ error: "server-misconfigured" });
      }

      const verifyResp = await fetch(`${ODIDIT_API_BASE}/v1/verify`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${odiditKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          session_token: session.odiditSessionToken,
          id_image_base64: idImageBase64,
        }),
      });

      const verifyJson = { status: 'verified', details: 'Mock verification successful' }; // MOCK RESPONSE
      const now = admin.firestore.FieldValue.serverTimestamp();

      // MOCK SUCCESS
      await sessionRef.update({ status: "completed", result: verifyJson, lastUpdated: now });
      
      return res.status(200).json({ success: true, result: verifyJson });
    } catch (err) {
      logger.error("mobileVerify error", err);
      return res.status(500).json({ error: err.message || "internal" });
    }
  }
);


/**
 * GET /status?sessionId=...
 */
export const status = functions.onRequest({ cors: true }, async (req, res) => {
  try {
    if (req.method !== "GET") return res.status(405).json({ error: "Use GET" });
    const sessionId = req.query.sessionId;
    if (!sessionId) return res.status(400).json({ error: "sessionId required" });

    const snap = await db.collection("idVerifications").doc(String(sessionId)).get();
    if (!snap.exists) return res.status(404).json({ error: "session-not-found" });

    const data = snap.data() || {};
    return res.status(200).json({
      sessionId,
      status: data.status || "unknown",
      lastUpdated: data.lastUpdated || null,
      result: data.result || null,
      error: data.error || null,
    });
  } catch (err) {
    logger.error("status error", err);
    return res.status(500).json({ error: err.message || "internal" });
  }
});
