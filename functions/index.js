const admin = require("firebase-admin");
const functions = require("firebase-functions/v1");

try {
  admin.initializeApp();
} catch (e) {
  console.error("Firebase Admin initialization error:", e);
}

const db = admin.firestore();

function getCurrentTimeKey() {
  const now = new Date();
  const pad = (num) => String(num).padStart(2, '0');
  const year = now.getFullYear();
  const month = pad(now.getMonth() + 1);
  const day = pad(now.getDate());
  const hours = pad(now.getHours());
  const minutes = pad(now.getMinutes());
  
  return `${year}-${month}-${day}-${hours}-${minutes}`;
}

exports.sendReminderNotifications = functions.pubsub
  .schedule("every 5 minutes")
  .onRun(async (context) => {
    
    const keysToCheck = [
        getCurrentTimeKey(new Date(Date.now())),
        getCurrentTimeKey(new Date(Date.now() - 60*1000)),
        getCurrentTimeKey(new Date(Date.now() - 120*1000)),
        getCurrentTimeKey(new Date(Date.now() - 180*1000)),
        getCurrentTimeKey(new Date(Date.now() - 240*1000)),
    ];
    
    const remindersQuery = db.collectionGroup("reminders").where("date", "in", keysToCheck);
    
    console.log(`Checking for reminders with keys: ${keysToCheck.join(', ')}`);
    
    try {
      const querySnapshot = await remindersQuery.get();
      if (querySnapshot.empty) {
        console.log("No reminders found for this time.");
        return null;
      }

      const batch = db.batch();
      let notificationPayloads = [];

      console.log(`Found ${querySnapshot.size} reminders.`);

      for (const doc of querySnapshot.docs) {
        const reminder = doc.data();
        const ref = doc.ref;
        
        const userId = ref.parent.parent.id;
        const appId = ref.parent.parent.parent.parent.id;
        
        notificationPayloads.push({
          userId: userId,
          appId: appId,
          text: reminder.text,
          reminderRef: ref
        });
      }

      for (const payload of notificationPayloads) {
        const subscriptionsQuery = await db.collection(`artifacts/${payload.appId}/users/${payload.userId}/subscriptions`).get();
        
        if (subscriptionsQuery.empty) {
          console.warn(`User ${payload.userId} has a reminder but no subscriptions.`);
          batch.delete(payload.reminderRef);
          continue; 
        }
        
        const tokens = subscriptionsQuery.docs.map(doc => doc.data().fcmToken);
        
        const message = {
          notification: {
            title: "Curiosity Reminder",
            body: payload.text,
          },
          webpush: {
             notification: {
               icon: "/icons/icon-192x192.png",
               badge: "/icons/icon-96x96.png",
             },
           },
          tokens: tokens,
        };

        console.log(`Sending notification to user ${payload.userId} for reminder: ${payload.text}`);
        const response = await admin.messaging().sendMulticast(message);
        
        if (response.failureCount > 0) {
          console.warn(`Failed to send notification to ${response.failureCount} tokens for user ${payload.userId}.`);
        }

        batch.delete(payload.reminderRef);
      }

      await batch.commit();
      console.log("Successfully sent notifications and deleted reminders.");
      return null;

    } catch (error) {
      console.error("Error checking reminders:", error);
      return null;
    }
  });


exports.deleteAllUserData = functions.https.onCall(async (data, context) => {

  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "User must be authenticated to delete data.",
    );
  }

  const uid = context.auth.uid;
  const appId = data.appId || "curiosity-pwa"; 
  console.log(`Received request to delete all data for user: ${uid} in app: ${appId}`);


  const basePath = `artifacts/${appId}/users/${uid}`;
  const entriesRef = db.collection(`${basePath}/entries`);
  const remindersRef = db.collection(`${basePath}/reminders`);
  const settingsRef = db.collection(`${basePath}/settings`);
  const subscriptionsRef = db.collection(`${basePath}/subscriptions`);
  const bucket = admin.storage().bucket();
  const storagePath = `artifacts/${appId}/users/${uid}/`;

  try {

    console.log(`Deleting ${entriesRef.path}...`);
    await db.recursiveDelete(entriesRef);
    
    console.log(`Deleting ${remindersRef.path}...`);
    await db.recursiveDelete(remindersRef);
    
    console.log(`Deleting ${subscriptionsRef.path}...`);
    await db.recursiveDelete(subscriptionsRef);
    
    console.log(`Deleting ${settingsRef.path}...`);
    await db.recursiveDelete(settingsRef);


    console.log(`Deleting files in ${storagePath}...`);
    await bucket.deleteFiles({ prefix: storagePath });

    console.log(`Successfully deleted all data for user: ${uid}`);
    return { success: true, message: "All user data deleted." };
  } catch (error) {
    console.error(`Error deleting data for user: ${uid}`, error);
    throw new functions.https.HttpsError(
      "internal",
      "An error occurred while deleting user data.",
      error.message,
    );
  }
});
