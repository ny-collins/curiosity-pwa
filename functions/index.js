// functions/index.js

const admin = require("firebase-admin");
const functions = require("firebase-functions/v1"); // Use v1 for schedule trigger

try {
  admin.initializeApp();
} catch (e) {
  console.error("Firebase Admin initialization error:", e);
}

// Helper: Get 'YYYY-MM-DD' string for today in the function's timezone (UTC)
const getTodayDateString = () => {
  const today = new Date();
  // Use UTC date parts for a consistent server-side check
  const year = today.getUTCFullYear();
  const month = (today.getUTCMonth() + 1).toString().padStart(2, "0");
  const day = today.getUTCDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Scheduled function to check for reminders and send notifications
exports.sendReminderNotifications = functions.pubsub
  .schedule("every 5 minutes") // Runs every 5 minutes
  .onRun(async (context) => {
    console.log("Running scheduled reminder check...");
    const todayDateString = getTodayDateString();
    console.log("Checking for reminders due on (UTC):", todayDateString);

    const db = admin.firestore();

    try {
      // 1. Find reminders due today
      const remindersSnapshot = await db
        .collectionGroup("reminders")
        .where("date", "==", todayDateString)
        .get();

      if (remindersSnapshot.empty) {
        console.log("No reminders due today.");
        return null;
      }

      console.log(`Found ${remindersSnapshot.size} reminders due.`);
      const processedDocRefs = []; // Store refs of docs to delete
      const userNotificationMap = new Map(); // Map to group reminders by user

      // 2. Group reminders by user
      for (const reminderDoc of remindersSnapshot.docs) {
        const reminder = reminderDoc.data();
        // Path: artifacts/{appId}/users/{userId}/reminders/{reminderId}
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
        processedDocRefs.push(reminderDoc.ref); // Add reminder for deletion
      }

      // 3. Process notifications for each user
      for (const [userId, reminderTexts] of userNotificationMap.entries()) {
        console.log(
          `Processing ${reminderTexts.length} reminders for user ${userId}`,
        );

        // 4. Get user's push subscriptions (FCM tokens)
        const subscriptionsSnapshot = await db
          .collection(`artifacts/curiosity-pwa/users/${userId}/subscriptions`)
          .get();

        if (subscriptionsSnapshot.empty) {
          console.log(`No subscriptions found for user ${userId}.`);
          continue;
        }

        const tokens = [];
        const tokenToSubRefMap = new Map(); // Map token string to Firestore doc ref
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

        // 5. Send notification(s)
        // Combine multiple reminders into one notification
        const body = (reminderTexts.length > 1) ?
          `You have ${reminderTexts.length} reminders today:\n- ${
            reminderTexts.join("\n- ")
          }` :
          reminderTexts[0];

        const message = {
          notification: {
            title: "Curiosity Reminder",
            body: body,
          },
          webpush: {
            notification: {
              icon: "/icons/icon-192x192.png",
              badge: "/icons/icon-96x96.png",
              // Tag to group/replace notifications for this user/day
              tag: `reminder-group-${userId}-${todayDateString}`,
              data: JSON.stringify({ url: "/" }),
            },
            headers: {
              "Urgency": "normal",
              "TTL": String(60 * 60 * 24 * 7), // 1 week
            },
          },
          tokens: tokens, // Target the user's FCM tokens
        };

        // Send multicast message
        const response = await admin.messaging().sendEachForMulticast(message);

        console.log(
          `Sent ${response.successCount} messages successfully for user ${userId}.`,
        );

        // 6. Handle invalid/failed tokens
        response.responses.forEach((result, index) => {
          if (!result.success) {
            const errorInfo = result.error;
            const failedToken = tokens[index];
            console.error(`Failed to send to token: ${failedToken}`, errorInfo);

            // Check for errors indicating an invalid token
            if (
              errorInfo.code === "messaging/registration-token-not-registered" ||
              errorInfo.code === "messaging/invalid-registration-token"
            ) {
              const subRefToDelete = tokenToSubRefMap.get(failedToken);
              if (subRefToDelete) {
                processedDocRefs.push(subRefToDelete); // Add invalid sub for deletion
                console.log(
                  "Marking invalid subscription for deletion:",
                  subRefToDelete.id,
                );
              }
            }
          }
        });
      }

      // 7. Batch delete all processed reminders and invalid subscriptions
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
