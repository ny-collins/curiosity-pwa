import { formatDistanceToNow } from 'date-fns';

export function formatTimestamp(timestamp) {
    if (!timestamp) return '...';
    try {
        const date = timestamp.toDate();
        return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
        console.error("Error formatting timestamp:", error);
        return '...';
    }
}

export function stripMarkdown(markdown) {
    if (!markdown) return '';
    return markdown
        .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // Remove links
        .replace(/(\*\*|__)(.*?)\1/g, '$2')     // Remove bold
        .replace(/(\*|_)(.*?)\1/g, '$2')       // Remove italic
        .replace(/`{1,3}(.*?)`{1,3}/g, '$1')     // Remove code
        .replace(/^[#\s>*-]+/gm, '')          // Remove headers, lists, blockquotes
        .replace(/\n{2,}/g, '\n')             // Replace multiple newlines
        .trim();
}

export function dateToKey(date, dayOnly = false) {
    try {
        const pad = (num) => String(num).padStart(2, '0');
        const year = date.getFullYear();
        const month = pad(date.getMonth() + 1);
        const day = pad(date.getDate());
        if (dayOnly) {
            return `${year}-${month}-${day}`;
        }
        const hours = pad(date.getHours());
        const minutes = pad(date.getMinutes());
        return `${year}-${month}-${day}-${hours}-${minutes}`;
    } catch (error) {
        console.error("Error creating date key:", error);
        return null;
    }
}

export function keyToDate(key) {
    try {
        const parts = key.split('-').map(part => parseInt(part, 10));
        if (parts.length === 3) { // YYYY-MM-DD
            return new Date(parts[0], parts[1] - 1, parts[2]);
        }
        if (parts.length === 5) { // YYYY-MM-DD-HH-MM
            return new Date(parts[0], parts[1] - 1, parts[2], parts[3], parts[4]);
        }
        return new Date(key);
    } catch (error) {
        console.error("Error parsing date key:", error);
        return null;
    }
}

// --- NEW PIN SECURITY FUNCTIONS ---

// Helper to convert ArrayBuffer to hex string
function bufferToHex(buffer) {
    return Array.from(new Uint8Array(buffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

/**
 * Hashes a plaintext PIN using SHA-256.
 * @param {string} pin - The plaintext PIN.
 * @returns {Promise<string>} The hex-encoded hash.
 */
export async function hashPin(pin) {
    try {
        const encoder = new TextEncoder();
        const data = encoder.encode(pin);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        return bufferToHex(hashBuffer);
    } catch (error) {
        console.error("Error hashing PIN:", error);
        // Fallback for environments without crypto.subtle (unlikely)
        return `unhashed_${pin}`; 
    }
}

/**
 * Verifies a plaintext PIN against a stored hash.
 * @param {string} pin - The plaintext PIN to check.
 * @param {string} storedHash - The stored SHA-256 hash.
 * @returns {Promise<boolean>} True if the PIN is correct.
 */
export async function verifyPin(pin, storedHash) {
    // Handle fallback for pins stored before hashing
    if (storedHash.startsWith('unhashed_')) {
        return `unhashed_${pin}` === storedHash;
    }
    
    try {
        const pinHash = await hashPin(pin);
        return pinHash === storedHash;
    } catch (error) {
        console.error("Error verifying PIN:", error);
        return false;
    }
}
