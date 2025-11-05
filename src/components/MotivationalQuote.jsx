
import React, { useState, useEffect } from 'react';

const quotes = [
    "The only way to do great work is to love what you do.",
    "The best way to predict the future is to create it.",
    "Believe you can and you're halfway there.",
    "The future belongs to those who believe in the beauty of their dreams.",
    "The secret of getting ahead is getting started.",
    "It does not matter how slowly you go as long as you do not stop.",
    "The journey of a thousand miles begins with a single step.",
    "Either you run the day, or the day runs you.",
    "I am not a product of my circumstances. I am a product of my decisions.",
    "When you have a dream, you've got to grab it and never let go."
];

export default function MotivationalQuote() {
    const [quote, setQuote] = useState('');

    useEffect(() => {
        setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
    }, []);

    return (
        <p className="text-sm text-slate-500 dark:text-gray-400 italic">
            &ldquo;{quote}&rdquo;
        </p>
    );
}
