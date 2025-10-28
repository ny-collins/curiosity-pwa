// functions/index.js

const admin = require("firebase-admin");
const functions = require("firebase-functions/v1");

try {
  admin.initializeApp();
} catch (e) {
  console.error("Firebase Admin initialization error:", e);
}

// Helper: Get 'YYYY-MM-DD' string for today
const getTodayDateString = () => {
  // ... (existing function) ...
  const today = new Date();
  const year = today.getUTCFullYear();
  const month = (today.getUTCMonth() + 1).toString().padStart(2, "0");
  const day = today.getUTCDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// --- Scheduled Function for Reminders ---
exports.sendReminderNotifications = functions.pubsub
  .schedule("every 5 minutes")
  .onRun(async (context) => {
    // ... (all existing reminder logic) ...
    console.log("Running scheduled reminder check...");
    const todayDateString = getTodayDateString();
    const db = admin.firestore();
    try {
      const remindersSnapshot = await db
        .collectionGroup("reminders")
        .where("date", "==", todayDateString)
        .get();

      if (remindersSnapshot.empty) {
        console.log("No reminders due today.");
        return null;
      }
      
      // ... (rest of reminder logic) ...
       console.log(`Found ${remindersSnapshot.size} reminders due.`);
       const processedDocRefs = []; 
       const userNotificationMap = new Map(); 

       for (const reminderDoc of remindersSnapshot.docs) {
         const reminder = reminderDoc.data();
         const pathParts = reminderDoc.ref.parent.parent.path.split("/");
         if (pathParts.length < 4 || pathParts[2] !== "users") {
           console.warn("Could not extract userId:", reminderDoc.ref.path);
           continue;
         }
         const userId = pathParts[3];

         if (!userNotificationMap.has(userId)) {
           userNotificationMap.set(userId, []);
         }
         userNotificationMap.get(userId).push(reminder.text);
         processedDocRefs.push(reminderDoc.ref); 
       }

       for (const [userId, reminderTexts] of userNotificationMap.entries()) {
         console.log(
           `Processing ${reminderTexts.length} reminders for user ${userId}`,
         );

         const subscriptionsSnapshot = await db
           .collection(`artifacts/curiosity-pwa/users/${userId}/subscriptions`)
           .get();

         if (subscriptionsSnapshot.empty) {
           console.log(`No subscriptions found for user ${userId}.`);
           continue;
         }

         const tokens = [];
         const tokenToSubRefMap = new Map(); 
         subscriptionsSnapshot.forEach((subDoc) => {
           const subData = subDoc.data();
           if (subData.fcmToken) {
             tokens.push(subData.fcmToken);
             tokenToSubRefMap.set(subData.fcmToken, subDoc.ref);
           }
         });

         if (tokens.length === 0) {
           console.log(`No valid FCM tokens found for user ${userId}.`);
           continue;
         }

         const body = (reminderTexts.length > 1) ?
           `You have ${reminderTexts.length} reminders today:\n- ${
             reminderTexts.join("\n- ")
           }` :
           reminderTexts[0];

         const message = {
           notification: { title: "Curiosity Reminder", body: body },
           webpush: {
             notification: {
               icon: "/icons/icon-192x192.png",
               badge: "/icons/icon-96x96.png",
               tag: `reminder-group-${userId}-${todayDateString}`,
               data: JSON.stringify({ url: "/" }),
             },
             headers: { "Urgency": "normal", "TTL": String(60 * 60 * 24 * 7) },
           },
           tokens: tokens, 
         };

         const response = await admin.messaging().sendEachForMulticast(message);

         console.log(
           `Sent ${response.successCount} messages successfully for user ${userId}.`,
         );

         response.responses.forEach((result, index) => {
           if (!result.success) {
             const errorInfo = result.error;
             const failedToken = tokens[index];
             console.error(`Failed to send to token: ${failedToken}`, errorInfo);
             if (
               errorInfo.code === "messaging/registration-token-not-registered" ||
               errorInfo.code === "messaging/invalid-registration-token"
             ) {
               const subRefToDelete = tokenToSubRefMap.get(failedToken);
               if (subRefToDelete) {
                 processedDocRefs.push(subRefToDelete); 
                 console.log(
                   "Marking invalid subscription for deletion:",
                   subRefToDelete.id,
                 );
               }
             }
           }
         });
       }

       if (processedDocRefs.length > 0) {
         console.log(
           `Deleting ${processedDocRefs.length} processed reminders/subscriptions...`,
         );
         const batch = db.batch();
         processedDocRefs.forEach((ref) => batch.delete(ref));
         await batch.commit();
         console.log("Processed documents deleted.");
       }

    } catch (error) {
      console.error("Error checking/sending reminders:", error);
      return null;
    }
    return null;
  });

// --- NEW: Callable Function to Delete All User Data ---
exports.deleteAllUserData = functions.https.onCall(async (data, context) => {
  // 1. Check Authentication
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "User must be authenticated to delete data.",
    );
  }

  const uid = context.auth.uid;
  const appId = "curiosity-pwa"; // Ensure this matches your appId
  console.log(`Received request to delete all data for user: ${uid}`);

  const db = admin.firestore();
  
  // 2. Define references to all user data collections
  const basePath = `artifacts/${appId}/users/${uid}`;
  const entriesRef = db.collection(`${basePath}/entries`);
  const remindersRef = db.collection(`${basePath}/reminders`);
  const settingsRef = db.collection(`${basePath}/settings`);
  const subscriptionsRef = db.collection(`${basePath}/subscriptions`);

  try {
    // 3. Delete collections recursively
    // Note: recursiveDelete() is powerful. It deletes all docs and subcollections.
    console.log(`Deleting ${entriesRef.path}...`);
    await db.recursiveDelete(entriesRef);
    
    console.log(`Deleting ${remindersRef.path}...`);
    await db.recursiveDelete(remindersRef);
    
    console.log(`Deleting ${subscriptionsRef.path}...`);
    await db.recursiveDelete(subscriptionsRef);
    
    console.log(`Deleting ${settingsRef.path}...`);
    await db.recursiveDelete(settingsRef); // Deletes settings doc(s)

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
