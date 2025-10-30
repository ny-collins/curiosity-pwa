import { useState, useEffect } from 'react';

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

const dateToKey = (date) => {
    if (!date || !(date instanceof Date)) return null;
    try {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0'); 
        const day = date.getDate().toString().padStart(2, '0'); 
        return `${year}-${month}-${day}`;
    }
    catch(e) { 
        console.error("dateToKey conversion failed:", e);
        return null; 
    }
};

const keyToDate = (key) => {
    if (!key || typeof key !== 'string') return null;
    try {
        const parts = key.split('-');
        if (parts.length !== 3) return null;
        return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10), 12, 0, 0); 
    } catch (e) { 
        console.error("keyToDate conversion failed:", e);
        return null; 
    }
};

function stripMarkdown(markdown) {
    if (!markdown) return '';
    return markdown
        .replace(/!\[.*\]\(.*\)/g, '[Image]')
        .replace(/\[(.*?)\]\(.*?\)/g, '$1')
        .replace(/([*_~`#]|> |-{3,})/g, '')
        .replace(/(\r\n|\n|\r)/gm, " ")
        .replace(/\s+/g, ' ')
        .trim();
}

export { formatTimestamp, dateToKey, keyToDate, stripMarkdown };
