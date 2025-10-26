// src/utils.js

// Formats Firestore Timestamps or JS Dates for display
function formatTimestamp(timestamp) {
    if (!timestamp) return '...';
    
    if (timestamp && typeof timestamp.seconds === 'number') {
        try {
            return timestamp.toDate().toLocaleString(); 
        } catch (e) {
            console.error("Timestamp conversion failed:", e);
            return 'Invalid Date';
        }
    }

    if (timestamp instanceof Date) {
        try {
            return timestamp.toLocaleString();
        } catch (e) {
             console.error("Date formatting failed:", e);
            return 'Invalid Date';
        }
    }
    
    return 'Pending...';
}

// Helper: Convert JS Date to 'YYYY-MM-DD' string based on LOCAL date parts
const dateToKey = (date) => {
    if (!date || !(date instanceof Date)) return null; // Added check
    try {
        // Use local date components directly
        const year = date.getFullYear();
        // getMonth() is 0-indexed, add 1 and pad
        const month = (date.getMonth() + 1).toString().padStart(2, '0'); 
        // getDate() returns the day of the month (1-31)
        const day = date.getDate().toString().padStart(2, '0'); 
        return `${year}-${month}-${day}`;
    }
    catch(e) { 
        console.error("dateToKey conversion failed:", e);
        return null; 
    }
};

// Helper: Get JS Date object from 'YYYY-MM-DD' string (treat as local)
// Assumes the key represents a local date
const keyToDate = (key) => {
    if (!key || typeof key !== 'string') return null; // Added check
    try {
        const parts = key.split('-');
        if (parts.length !== 3) return null; // Basic validation
        // Construct date assuming local timezone from the key parts
        // Use noon to avoid potential timezone shifts around midnight
        return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10), 12, 0, 0); 
    } catch (e) { 
        console.error("keyToDate conversion failed:", e);
        return null; 
    }
};


export { formatTimestamp, dateToKey, keyToDate };
