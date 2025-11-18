const functions = require("firebase-functions");
const admin = require("firebase-admin");
const {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} = require("@simplewebauthn/server");

// Load environment variables from .env file
require('dotenv').config();

admin.initializeApp();
const db = admin.firestore();

// Environment-aware configuration for WebAuthn
// Supports both local development and production
const isEmulator = process.env.FUNCTIONS_EMULATOR === 'true';
const isLocalDev = !process.env.WEBAUTHN_RELYING_PARTY_ID; // No env var = local dev

const rpID = isEmulator || isLocalDev
  ? "localhost" 
  : (process.env.WEBAUTHN_RELYING_PARTY_ID || "curiosity-pwa.web.app");

const expectedOrigin = isEmulator || isLocalDev
  ? "http://localhost:5173"
  : (process.env.WEBAUTHN_EXPECTED_ORIGIN || "https://curiosity-pwa.web.app");

const rpName = "Curiosity PWA";

console.log(`WebAuthn Configuration: rpID=${rpID}, expectedOrigin=${expectedOrigin}, isEmulator=${isEmulator}, isLocalDev=${isLocalDev}`);

const getCredentialsCollection = (userId) => {
  return db.collection("users").doc(userId).collection("webauthn_credentials");
};

const getAuthenticator = async (userId, credentialID) => {
  const doc = await getCredentialsCollection(userId).doc(credentialID).get();
  if (!doc.exists) {
    return null;
  }
  return doc.data();
};

exports.generateRegistrationOptions = functions.https.onCall(
    async (data, context) => {
      if (!context.auth) {
        throw new functions.https.HttpsError(
            "unauthenticated",
            "You must be logged in.",
        );
      }

      const {uid, token} = context.auth;
      const user = await admin.auth().getUser(uid);
      const username = user.email || user.uid;

      const credentialDocs = await getCredentialsCollection(uid).get();
      const existingAuthenticators = credentialDocs.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        transports: doc.data().transports || [],
      }));

      try {
        // Convert userID string to Uint8Array as required by SimpleWebAuthn v10+
        const userIDBuffer = new TextEncoder().encode(uid);
        
        const options = await generateRegistrationOptions({
          rpName,
          rpID,
          userID: userIDBuffer,
          userName: username,
          attestationType: "none",
          excludeCredentials: existingAuthenticators.map((auth) => ({
            id: auth.id,
            type: "public-key",
            transports: auth.transports,
          })),
          authenticatorSelection: {
            userVerification: "preferred",
            residentKey: "required",
            requireResidentKey: true,
          },
        });

        await db.collection("users").doc(uid).set({webAuthnChallenge: options.challenge}, {merge: true});

        return options;
      } catch (e) {
        console.error("Error generating registration options:", e);
        throw new functions.https.HttpsError(
            "internal",
            "Error generating registration options.",
        );
      }
    },
);

exports.verifyRegistration = functions.https.onCall(
    async (data, context) => {
      if (!context.auth) {
        throw new functions.https.HttpsError(
            "unauthenticated",
            "You must be logged in.",
        );
      }
      const {uid} = context.auth;
      const response = data.response;

      const userDoc = await db.collection("users").doc(uid).get();
      const expectedChallenge = userDoc.data()?.webAuthnChallenge;

      if (!expectedChallenge) {
        throw new functions.https.HttpsError(
            "failed-precondition",
            "No challenge found.",
        );
      }

      try {
        const verification = await verifyRegistrationResponse({
          response,
          expectedChallenge,
          expectedOrigin,
          expectedRPID: rpID,
          requireUserVerification: true,
        });

        const {verified, registrationInfo} = verification;

        if (verified && registrationInfo) {
          const {credentialID, credentialPublicKey, counter, credentialDeviceType} =
            registrationInfo;

          const newAuthenticator = {
            id: credentialID,
            credentialPublicKey: Buffer.from(credentialPublicKey).toString("base64"),
            counter,
            credentialDeviceType,
            transports: response.response.transports || [],
          };

          await getCredentialsCollection(uid)
              .doc(credentialID)
              .set(newAuthenticator);
          
          await db.collection("users").doc(uid).set({webAuthnChallenge: null}, {merge: true});
          
          return {verified: true};
        }

        return {verified: false, error: "Verification failed."};
      } catch (e) {
        console.error("Error verifying registration:", e);
        throw new functions.https.HttpsError(
            "internal",
            "Error verifying registration.",
        );
      }
    },
);

exports.generateAuthenticationOptions = functions.https.onCall(
    async (data, context) => {
      if (!context.auth) {
        throw new functions.https.HttpsError(
            "unauthenticated",
            "You must be logged in.",
        );
      }

      const {uid} = context.auth;
      const credentialDocs = await getCredentialsCollection(uid).get();

      if (credentialDocs.empty) {
        throw new functions.https.HttpsError(
            "failed-precondition",
            "No registered credentials found.",
        );
      }

      const allowCredentials = credentialDocs.docs.map((doc) => ({
        id: doc.id,
        type: "public-key",
        transports: doc.data().transports || [],
      }));

      try {
        const options = await generateAuthenticationOptions({
          rpID,
          allowCredentials,
          userVerification: "required",
        });

        await db.collection("users").doc(uid).set(
            {webAuthnChallenge: options.challenge},
            {merge: true},
        );

        return options;
      } catch (e) {
        console.error("Error generating authentication options:", e);
        throw new functions.https.HttpsError(
            "internal",
            "Error generating authentication options.",
        );
      }
    },
);

exports.verifyAuthentication = functions.https.onCall(
    async (data, context) => {
      if (!context.auth) {
        throw new functions.https.HttpsError(
            "unauthenticated",
            "You must be logged in.",
        );
      }

      const {uid} = context.auth;
      const response = data.response;
      const userDoc = await db.collection("users").doc(uid).get();
      const expectedChallenge = userDoc.data()?.webAuthnChallenge;

      if (!expectedChallenge) {
        throw new functions.https.HttpsError(
            "failed-precondition",
            "No challenge found.",
        );
      }

      const authenticator = await getAuthenticator(uid, response.id);
      if (!authenticator) {
        throw new functions.https.HttpsError(
            "not-found",
            "Credential not found.",
        );
      }

      try {
        const verification = await verifyAuthenticationResponse({
          response,
          expectedChallenge,
          expectedOrigin,
          expectedRPID: rpID,
          authenticator: {
            credentialID: authenticator.id,
            credentialPublicKey: Buffer.from(
                authenticator.credentialPublicKey,
                "base64",
            ),
            counter: authenticator.counter,
          },
          requireUserVerification: true,
        });

        const {verified, authenticationInfo} = verification;

        if (verified) {
          await getCredentialsCollection(uid)
              .doc(response.id)
              .update({counter: authenticationInfo.newCounter});

          await db.collection("users").doc(uid).set(
              {webAuthnChallenge: null},
              {merge: true},
          );

          return {verified: true};
        }

        return {verified: false, error: "Verification failed."};
      } catch (e) {
        console.error("Error verifying authentication:", e);
        throw new functions.https.HttpsError(
            "internal",
            "Error verifying authentication.",
        );
      }
    },
);

exports.deleteAllUserData = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
        "unauthenticated",
        "You must be logged in to delete data.",
    );
  }

  const uid = context.auth.uid;
  const appId = data.appId;
  const path = `artifacts/${appId}/users/${uid}`;

  console.log(`Deleting all data for user ${uid} at path ${path}`);

  try {
    const bucket = admin.storage().bucket();
    await bucket.deleteFiles({prefix: path});
    console.log(`Storage files deleted for path: ${path}`);
    
    await admin.firestore().recursiveDelete(db.collection(path));
    console.log(`Firestore data deleted for path: ${path}`);
    
    await db.collection("users").doc(uid).delete();
    console.log(`User-level data deleted for ${uid}`);

    return {success: true, message: "All user data deleted successfully."};
  } catch (error) {
    console.error("Error deleting user data:", error);
    throw new functions.https.HttpsError(
        "internal",
        "Failed to delete user data.",
    );
  }
});

// Push Notification Functions
exports.sendPushNotification = functions.https.onCall(
  async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "You must be logged in to send notifications."
      );
    }

    const { title, body, icon, badge, tag, url, userId } = data;

    if (!title || !body) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Title and body are required."
      );
    }

    try {
      // Get user's FCM token from Firestore
      const userDoc = await db.collection("users").doc(userId || context.auth.uid).get();
      const userData = userDoc.data();

      if (!userData || !userData.fcmToken) {
        throw new functions.https.HttpsError(
          "failed-precondition",
          "User has not enabled push notifications."
        );
      }

      const message = {
        token: userData.fcmToken,
        notification: {
          title: title,
          body: body,
        },
        webpush: {
          fcmOptions: {
            link: url || "https://curiosity-pwa.web.app"
          },
          notification: {
            icon: icon || "/icons/icon-192x192.png",
            badge: badge || "/icons/icon-72x72.png",
            tag: tag || "curiosity-notification",
            requireInteraction: true,
            actions: [
              {
                action: "view",
                title: "View"
              },
              {
                action: "dismiss",
                title: "Dismiss"
              }
            ]
          }
        },
        data: {
          url: url || "https://curiosity-pwa.web.app",
          tag: tag || "curiosity-notification"
        }
      };

      const response = await admin.messaging().send(message);
      console.log("Notification sent successfully:", response);

      return { success: true, messageId: response };
    } catch (error) {
      console.error("Error sending push notification:", error);
      throw new functions.https.HttpsError(
        "internal",
        "Failed to send push notification."
      );
    }
  }
);

// Update user's FCM token
exports.updateFCMToken = functions.https.onCall(
  async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "You must be logged in to update FCM token."
      );
    }

    const { fcmToken } = data;

    if (!fcmToken) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "FCM token is required."
      );
    }

    try {
      await db.collection("users").doc(context.auth.uid).set({
        fcmToken: fcmToken,
        notificationsEnabled: true,
        fcmTokenUpdatedAt: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });

      console.log(`FCM token updated for user ${context.auth.uid}`);
      return { success: true };
    } catch (error) {
      console.error("Error updating FCM token:", error);
      throw new functions.https.HttpsError(
        "internal",
        "Failed to update FCM token."
      );
    }
  }
);

// Background Reminder Notification Function
// Checks all users' reminders every minute and sends push notifications
exports.checkAndSendReminders = functions.pubsub
  .schedule("* * * * *") // Every minute
  .timeZone("UTC") // Use UTC for consistent timezone handling
  .onRun(async (context) => {
    try {
      console.log("Checking reminders for all users...");
      
      // Get all users who have enabled notifications
      const usersSnapshot = await db.collection("users")
        .where("notificationsEnabled", "==", true)
        .get();

      if (usersSnapshot.empty) {
        console.log("No users with notifications enabled");
        return null;
      }

      console.log(`Found ${usersSnapshot.docs.length} users with notifications enabled`);

      const now = new Date();
      const twoMinutesFromNow = new Date(now.getTime() + 2 * 60 * 1000); // Check 2-minute window
      let notificationsSent = 0;

      for (const userDoc of usersSnapshot.docs) {
        const userData = userDoc.data();
        const userId = userDoc.id;

        if (!userData.fcmToken) {
          continue; // Skip users without FCM token
        }

        try {
          // Get user's reminders from their specific collection
          const projectId = process.env.GCLOUD_PROJECT || process.env.PROJECT_ID || 'curiosity-pwa';
          const remindersPath = `artifacts/${projectId}/users/${userId}/reminders`;
          console.log(`Checking reminders for user ${userId} at path: ${remindersPath}`);
          
          const remindersRef = db.collection(remindersPath);
          const remindersSnapshot = await remindersRef
            .where("isDeleted", "==", false)
            .where("notified", "==", false)
            .get();

          console.log(`Found ${remindersSnapshot.docs.length} reminders for user ${userId}`);

          for (const reminderDoc of remindersSnapshot.docs) {
            const reminder = reminderDoc.data();
            
            if (!reminder.date) continue;

            const reminderDate = reminder.date.toDate ? reminder.date.toDate() : new Date(reminder.date);
            console.log(`Reminder ${reminderDoc.id}: ${reminder.text}, due at ${reminderDate.toISOString()}, now=${now.toISOString()}, window=${twoMinutesFromNow.toISOString()}`);
            
            // Send notification if reminder is due within the next 2 minutes
            if (reminderDate >= now && reminderDate <= twoMinutesFromNow) {
              const message = {
                token: userData.fcmToken,
                notification: {
                  title: "⏰ Curiosity Reminder",
                  body: reminder.text || "You have a reminder!",
                },
                webpush: {
                  fcmOptions: {
                    link: `https://${process.env.WEBAUTHN_RELYING_PARTY_ID || 'curiosity-pwa.web.app'}`
                  },
                  notification: {
                    icon: "/icons/icon-192x192.png",
                    badge: "/icons/icon-72x72.png",
                    tag: `reminder-${reminderDoc.id}`,
                    requireInteraction: false,
                    vibrate: [200, 100, 200]
                  }
                },
                data: {
                  type: "reminder",
                  reminderId: reminderDoc.id,
                  url: "/"
                }
              };

              try {
                await admin.messaging().send(message);
                
                // Mark reminder as notified
                await reminderDoc.ref.update({
                  notified: true,
                  notifiedAt: admin.firestore.FieldValue.serverTimestamp()
                });
                
                notificationsSent++;
                console.log(`Sent reminder ${reminderDoc.id} to user ${userId}`);
              } catch (sendError) {
                console.error(`Error sending notification for reminder ${reminderDoc.id}:`, sendError);
                
                // If token is invalid, remove it
                if (sendError.code === 'messaging/invalid-registration-token' || 
                    sendError.code === 'messaging/registration-token-not-registered') {
                  await db.collection("users").doc(userId).update({
                    fcmToken: admin.firestore.FieldValue.delete(),
                    notificationsEnabled: false
                  });
                  console.log(`Removed invalid FCM token for user ${userId}`);
                }
              }
            }
          }
        } catch (userError) {
          console.error(`Error processing reminders for user ${userId}:`, userError);
        }
      }

      console.log(`Reminder check complete. Sent ${notificationsSent} notifications.`);
      return null;
    } catch (error) {
      console.error("Error in checkAndSendReminders:", error);
      return null;
    }
  });