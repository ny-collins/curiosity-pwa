# API Reference

This document provides detailed information about the Curiosity PWA APIs, including Firebase Functions, data structures, and client-side utilities.

## Firebase Cloud Functions

### Authentication Functions

#### `generateRegistrationOptions`

Generates WebAuthn registration options for biometric authentication setup.

**Parameters:**
```javascript
{
  // No parameters required - uses authenticated user context
}
```

**Returns:**
```javascript
{
  challenge: "string", // Base64URL encoded challenge
  rp: {
    name: "Curiosity PWA",
    id: "your-domain.com"
  },
  user: {
    id: "string", // User ID
    name: "string", // Username/email
    displayName: "string" // Display name
  },
  pubKeyCredParams: [
    {
      alg: -7, // ES256
      type: "public-key"
    },
    {
      alg: -257, // RS256
      type: "public-key"
    }
  ],
  authenticatorSelection: {
    userVerification: "preferred",
    residentKey: "required",
    requireResidentKey: true
  },
  attestation: "none",
  excludeCredentials: [] // Array of existing credentials
}
```

**Error Codes:**
- `unauthenticated`: User not logged in
- `internal`: Server error during generation

#### `verifyRegistration`

Verifies WebAuthn registration response and stores credential.

**Parameters:**
```javascript
{
  id: "string", // Credential ID
  rawId: "string", // Base64URL encoded raw ID
  response: {
    clientDataJSON: "string",
    attestationObject: "string",
    transports: ["string"] // Array of transport types
  },
  type: "public-key",
  clientExtensionResults: {}
}
```

**Returns:**
```javascript
{
  verified: true
}
```

**Error Codes:**
- `unauthenticated`: User not logged in
- `failed-precondition`: No challenge found
- `internal`: Verification failed

### Data Management Functions

#### `deleteAllUserData`

Permanently deletes all user data from the application.

**Parameters:**
```javascript
{
  appId: "string" // Application identifier
}
```

**Returns:**
```javascript
{
  success: true,
  message: "All user data deleted successfully."
}
```

**Error Codes:**
- `unauthenticated`: User not logged in
- `internal`: Deletion failed

## Data Models

### User Document

```javascript
interface User {
  username?: string;
  email?: string;
  profilePicUrl?: string;
  settings: {
    themeMode: "light" | "dark" | "auto";
    themeColor: string; // Hex color code
    fontFamily: string;
    fontSize: "small" | "medium" | "large";
    // ... other settings
  };
  webAuthnChallenge?: string; // Temporary challenge
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### Entry Document

```javascript
interface Entry {
  id: string;
  title?: string;
  content: string; // Markdown content
  type: "journal" | "note" | "task";
  tags: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
  isDeleted: boolean;
}
```

### Goal Document

```javascript
interface Goal {
  id: string;
  title: string;
  description?: string;
  status: "pending" | "in-progress" | "completed";
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### Task Document

```javascript
interface Task {
  id: string;
  goalId: string;
  text: string;
  completed: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### Vault Item Document

```javascript
interface VaultItem {
  id: string;
  title: string;
  type: "password" | "contact" | "note";
  encryptedData: string; // Base64 encoded encrypted data
  createdAt: Timestamp;
}
```

### WebAuthn Credential Document

```javascript
interface WebAuthnCredential {
  id: string; // Base64 encoded credential ID
  credentialPublicKey: string; // Base64 encoded public key
  counter: number;
  credentialDeviceType: string;
  transports: string[]; // Array of transport types
  createdAt: Timestamp;
}
```

## Client-Side APIs

### State Management Context

#### `useAppState()`

Main hook for accessing application state and actions.

**Available Properties:**
```javascript
const {
  // User state
  currentUser,
  isAnonymous,
  localSettings,

  // App state
  currentView,
  isSidebarExpanded,
  isAppFocusMode,
  isCreating,
  activeEntryId,

  // Data
  allEntries,
  filteredEntries,
  activeGoals,
  reminders,

  // UI state
  themeMode,
  themeColor,
  fontSize,
  fontFamily,

  // Actions
  handleViewChange,
  handleCreateEntry,
  handleSelectEntry,
  handleSaveSettings,
  handleAddGoal,
  handleAddReminder,

  // Authentication
  handleLinkAccount,
  checkPin,
  handleForgotPin,

  // Loading states
  isLoading,
  error
} = useAppState();
```

### Authentication API

#### `signInWithGoogle()`

Initiates Google OAuth sign-in flow.

```javascript
import { signInWithGoogle } from '../utils/auth';

const user = await signInWithGoogle();
```

#### `signOut()`

Signs out the current user.

```javascript
import { signOut } from '../utils/auth';

await signOut();
```

#### `checkPin(pin: string)`

Validates a PIN against stored hash.

```javascript
const isValid = await checkPin("1234");
```

### Data Management API

#### Entry Operations

```javascript
// Create new entry
const entryId = await handleCreateEntry("journal");

// Update existing entry
await handleUpdateEntry(entryId, {
  title: "New Title",
  content: "Updated content",
  tags: ["tag1", "tag2"]
});

// Delete entry
await handleDeleteEntry(entryId);
```

#### Goal Operations

```javascript
// Create goal
const goalId = await handleAddGoal("Learn React", "Master React development");

// Add task to goal
await handleAddTask(goalId, "Complete tutorial");

// Update goal status
await handleUpdateGoalStatus(goalId, "in-progress");

// Delete goal
await handleDeleteGoal(goalId);
```

#### Reminder Operations

```javascript
// Create reminder
await handleAddReminder("Doctor appointment", new Date("2024-01-15T10:00"));

// Delete reminder
await handleDeleteReminder(reminderId);
```

### Utility Functions

#### `formatTimestamp(timestamp, includeTime = false)`

Formats a timestamp for display.

```javascript
import { formatTimestamp } from '../utils';

const displayDate = formatTimestamp(entry.createdAt, true);
// Output: "Jan 15, 2024 at 2:30 PM"
```

#### `stripMarkdown(content)`

Removes Markdown formatting from text.

```javascript
import { stripMarkdown } from '../utils';

const plainText = stripMarkdown("# Hello **world**");
// Output: "Hello world"
```

#### `encryptData(data, key)`

Encrypts data using AES encryption.

```javascript
import { encryptData } from '../utils/crypto';

const encrypted = await encryptData(sensitiveData, encryptionKey);
```

#### `decryptData(encryptedData, key)`

Decrypts previously encrypted data.

```javascript
import { decryptData } from '../utils/crypto';

const decrypted = await decryptData(encryptedData, encryptionKey);
```

## Firebase Security Rules

### Firestore Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Entries are user-scoped
    match /users/{userId}/entries/{entryId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Goals are user-scoped
    match /users/{userId}/goals/{goalId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Tasks are user-scoped
    match /users/{userId}/tasks/{taskId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Vault items are user-scoped
    match /users/{userId}/vault/{itemId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // WebAuthn credentials are user-scoped
    match /users/{userId}/webauthn_credentials/{credentialId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### Storage Rules

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // User-specific file access
    match /artifacts/{appId}/users/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Public assets (if any)
    match /public/{allPaths=**} {
      allow read: if true;
    }
  }
}
```

## Error Handling

### Client-Side Errors

```javascript
// Firebase errors
const handleFirebaseError = (error) => {
  switch (error.code) {
    case 'auth/user-not-found':
      return 'User not found';
    case 'auth/wrong-password':
      return 'Incorrect password';
    case 'permission-denied':
      return 'Access denied';
    default:
      return 'An error occurred';
  }
};

// Network errors
const handleNetworkError = (error) => {
  if (!navigator.onLine) {
    return 'You are offline';
  }
  return 'Network error';
};
```

### Function Error Codes

```javascript
// Function error responses
const functionErrors = {
  'unauthenticated': 'Please sign in to continue',
  'failed-precondition': 'Invalid request state',
  'internal': 'Server error, please try again',
  'not-found': 'Resource not found',
  'permission-denied': 'Access denied'
};
```

## Rate Limiting

### Function Limits
- **generateRegistrationOptions**: 10 calls per minute per user
- **verifyRegistration**: 5 calls per minute per user
- **deleteAllUserData**: 1 call per hour per user

### Client-Side Throttling
```javascript
// Debounce function calls
const debouncedSave = debounce(handleSave, 1000);

// Rate limit API calls
const rateLimitedCall = rateLimit(apiCall, 1000, 5); // 5 calls per second
```

## Webhooks & Integrations

### Future Webhook Support

```javascript
// Planned webhook structure
interface WebhookPayload {
  event: 'entry.created' | 'entry.updated' | 'goal.completed';
  userId: string;
  data: any;
  timestamp: number;
}
```

### Third-Party Integrations

#### Google Calendar (Planned)
```javascript
// Sync reminders with Google Calendar
await integrateWithGoogleCalendar(reminderData);
```

#### Slack Notifications (Planned)
```javascript
// Send reminder notifications to Slack
await sendSlackNotification(reminder, slackWebhookUrl);
```

## Migration Guide

### Data Migration

#### From v1.x to v2.x
```javascript
// Migration script example
const migrateUserData = async (userId) => {
  const oldEntries = await getLegacyEntries(userId);
  const migratedEntries = oldEntries.map(migrateEntryFormat);
  await batchWriteEntries(userId, migratedEntries);
};
```

### API Changes

#### Breaking Changes in v2.0
- WebAuthn functions now require Firebase config setup
- Vault encryption changed from AES-128 to AES-256
- Reminder notifications moved to background functions

#### Backward Compatibility
- Old entry formats automatically migrated
- Legacy authentication methods still supported
- Graceful degradation for unsupported features

## Performance Metrics

### API Response Times
- **generateRegistrationOptions**: < 500ms
- **verifyRegistration**: < 1000ms
- **Data queries**: < 200ms (with indexing)

### Cache Strategies
- **Static assets**: Cache-first, 1 year TTL
- **API responses**: Network-first, 5 minute TTL
- **User data**: Cache with background sync

### Monitoring Endpoints

```javascript
// Health check endpoint
GET /api/health
Response: { status: "ok", timestamp: 1234567890 }

// Metrics endpoint
GET /api/metrics
Response: {
  uptime: 123456,
  requests: 1234,
  errors: 12
}
```

This API reference provides comprehensive information for developers working with the Curiosity PWA backend and frontend APIs. For additional support, please check the troubleshooting guide or create an issue on GitHub.