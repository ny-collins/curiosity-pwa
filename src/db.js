import Dexie from 'dexie';

export const db = new Dexie('CuriosityDB_v5');

db.version(1).stores({
  entries: 'id, title, content, type, createdAt, updatedAt, *tags, isSynced',
  reminders: 'id, text, date, createdAt, isSynced',
  settings: 'id, username, profilePicUrl, themeColor, fontFamily, themeMode, fontSize, updatedAt',
  goals: 'id, title, description, status, createdAt, updatedAt, isSynced',
  tasks: 'id, goalId, text, completed, createdAt, isSynced',
  vaultItems: 'id, title, type, encryptedData, createdAt, updatedAt, isSynced'
});

db.open().catch(err => {
    console.error(`Failed to open Dexie db: ${err.stack || err}`);
});

export async function getSettings() {
  return await db.settings.get(1);
}

export async function saveSettings(settings) {
  const settingsToSave = {
    ...settings,
    id: 1,
    updatedAt: new Date()
  };
  return await db.settings.put(settingsToSave);
}

export default db;