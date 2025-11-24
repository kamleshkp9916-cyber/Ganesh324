'use strict';

const functions = require("firebase-functions");
const admin = require('firebase-admin');

exports.odiditWebhook = functions.https.onRequest(async (req, res) => {
  try {
    const body = req.body || {};

    const sessionId =
      body.sessionId ||
      body.id ||
      (body.data && body.data.id);

    const status =
      body.status ||
      (body.data && body.data.status);

    if (!sessionId || !status) {
      console.warn('odiditWebhook: missing sessionId/status', body);
      return res.status(400).json({ error: 'invalid payload' });
    }

    await admin.firestore()
      .collection('odidit_sessions')
      .doc(sessionId)
      .set(
        {
          status,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        },
        { merge: true }
      );

    console.log(`Saved Odidit webhook: ${sessionId} => ${status}`);

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Webhook error:', err);
    return res.status(500).json({ error: 'internal' });
  }
});
