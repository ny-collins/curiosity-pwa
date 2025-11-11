import { format, isToday, isYesterday } from 'date-fns';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { hash, compare } from 'bcrypt-ts';
import CryptoJS from 'crypto-js';
import { getPerformance, trace } from 'firebase/performance';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatTimestamp(ts, short = false) {
    if (!ts) return '';
    const date = ts.toDate ? ts.toDate() : new Date(ts);
    
    if (short) {
        if (isToday(date)) {
            return format(date, 'p');
        }
        if (isYesterday(date)) {
            return 'Yesterday';
        }
        return format(date, 'MMM d, yyyy');
    }
    
    if (isToday(date)) {
        return `Today at ${format(date, 'p')}`;
    }
    if (isYesterday(date)) {
        return `Yesterday at ${format(date, 'p')}`;
    }
    return format(date, 'MMM d, yyyy');
}

export function dateToKey(date) {
    if (!date) return null;
    try {
        return format(date, 'yyyy-MM-dd');
    } catch (error) {
        console.error("Error formatting date:", error);
        return null;
    }
}

export async function hashPin(pin) {
    const saltRounds = 10;
    return await hash(pin, saltRounds);
}

export async function comparePin(pin, hash) {
    if (!pin || !hash) return false;
    return await compare(pin, hash);
}

export function stripMarkdown(markdown) {
    if (!markdown) return '';
    return markdown
        .replace(/!\[.*?\]\(.*?\)/g, '[Image]')
        .replace(/\[.*?\]\(.*?\)/g, (match) => match.replace(/\[(.*?)\]\(.*?\)/, '$1'))
        .replace(/#{1,6}\s/g, '')
        .replace(/(\*|_|`|~|>|\|)/g, '')
        .replace(/\n/g, ' ')
        .trim();
}

export function encryptData(data, key) {
    try {
        return CryptoJS.AES.encrypt(JSON.stringify(data), key).toString();
    } catch (error) {
        console.error("Encryption failed:", error);
        return null;
    }
}

export function decryptData(ciphertext, key) {
    try {
        const bytes = CryptoJS.AES.decrypt(ciphertext, key);
        const decryptedData = bytes.toString(CryptoJS.enc.Utf8);
        return JSON.parse(decryptedData);
    } catch (error) {
        console.error("Decryption failed:", error);
        return null;
    }
}

// Performance Monitoring Utilities
let perf = null;

export function initPerformanceMonitoring() {
    if (typeof window !== 'undefined') {
        try {
            perf = getPerformance();
        } catch (error) {
            console.warn('Performance monitoring not available:', error);
        }
    }
}

export function startTrace(name) {
    if (perf && typeof window !== 'undefined') {
        try {
            return trace(perf, name);
        } catch (error) {
            console.warn('Failed to start performance trace:', error);
        }
    }
    return null;
}

export function stopTrace(trace) {
    if (trace) {
        try {
            trace.stop();
        } catch (error) {
            console.warn('Failed to stop performance trace:', error);
        }
    }
}

// Performance wrapper for async functions
export function withPerformanceTrace(name, fn) {
    return async (...args) => {
        const trace = startTrace(name);
        try {
            const result = await fn(...args);
            return result;
        } finally {
            stopTrace(trace);
        }
    };
}