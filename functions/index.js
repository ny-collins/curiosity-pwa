const functions = require("firebase-functions");
const admin = require("firebase-admin");
const {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} = require("@simplewebauthn/server");

admin.initializeApp();
const db = admin.firestore();

const rpID = functions.config().webauthn.relying_party_id || "localhost";
const expectedOrigin = functions.config().webauthn.expected_origin || `http://${rpID}:5173`;
const rpName = "Curiosity PWA";

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
        const options = await generateRegistrationOptions({
          rpName,
          rpID,
          userID: uid,
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
    async (response, context) => {
      if (!context.auth) {
        throw new functions.https.HttpsError(
            "unauthenticated",
            "You must be logged in.",
        );
      }
      const {uid} = context.auth;

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