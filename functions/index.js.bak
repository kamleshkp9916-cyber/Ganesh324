
/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {setGlobalOptions} = require("firebase-functions");
const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

const {onRequest} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");

// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// functions should each use functions.runWith({ maxInstances: 10 }) instead.
// In the v1 API, each function can only serve one request per container, so
// this will be the maximum concurrent request count.
setGlobalOptions({ maxInstances: 10 });

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

exports.helloWorld = onRequest((request, response) => {
  logger.info("Hello logs!", {structuredData: true});
  response.send("Hello from Firebase!");
});


/**
 * Triggered when a new user signs up.
 * This function creates a corresponding user document in Firestore.
 */
exports.onUserCreate = functions.auth.user().onCreate(async (user) => {
  logger.info(`New user created: ${user.uid}`, {structuredData: true});

  const { uid, email, displayName, photoURL } = user;

  const userData = {
    uid,
    email,
    displayName: displayName || 'New User',
    photoURL: photoURL || `https://placehold.co/128x128.png?text=${(displayName || 'U').charAt(0)}`,
    role: 'customer', // Default role for all new sign-ups
    followers: 0,
    following: 0,
    bio: "",
    location: "",
    phone: "",
    addresses: [],
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  try {
    await admin.firestore().collection('users').doc(uid).set(userData);
    logger.info(`Successfully created Firestore document for user: ${uid}`);

    // Placeholder for sending a welcome email
    // In a real app, you would integrate an email service like SendGrid or Mailgun here.
    logger.info(`(Placeholder) Sending welcome email to ${email}`);

  } catch (error) {
    logger.error(`Error creating Firestore document for user: ${uid}`, {error, structuredData: true});
  }
});
