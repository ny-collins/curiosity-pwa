import React, { useState } from 'react';
import { THEME_COLORS } from '../constants.js';
import Logo from './Logo';

export default function OnboardingModal({ onComplete }) {
    const [username, setUsername] = useState('');
    const [selectedColor, setSelectedColor] = useState(THEME_COLORS[0].hex);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (username.trim()) {
            onComplete(username.trim(), selectedColor);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-6 md:p-8 max-w-md w-full">
                <div className="flex flex-col items-center text-center">
                    <Logo className="w-16 h-16" />
                    <h1 
                        style={{ fontFamily: 'var(--font-logo)' }} 
                        className="text-4xl text-slate-900 dark:text-white mt-2"
                    >
                        Curiosity
                    </h1>
                    <p className="text-lg mt-2 text-slate-600 dark:text-gray-300">
                        Welcome! Let's get your journal set up.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                    <div>
                        <label 
                            htmlFor="username" 
                            className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2"
                        >
                            What should we call you?
                        </label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="form-input w-full bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white rounded-md border-slate-300 dark:border-slate-600 focus:border-primary focus:ring-primary"
                            placeholder="Your Name"
                            required
                            style={{'--tw-ring-color': 'var(--color-primary-hex)', '--tw-border-color': 'var(--color-primary-hex)'}}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-3">
                            Pick a color that inspires you
                        </label>
                        <div className="flex flex-wrap gap-3 justify-center">
                            {THEME_COLORS.map(color => (
                                <button
                                    type="button"
                                    key={color.hex}
                                    title={color.name}
                                    onClick={() => setSelectedColor(color.hex)}
                                    className={`w-9 h-9 rounded-full cursor-pointer focus:outline-none transition-transform duration-100 ${
                                        selectedColor === color.hex 
                                            ? 'ring-2 ring-offset-2 scale-110' 
                                            : 'hover:scale-110'
                                    }`}
                                    style={{
                                        backgroundColor: color.hex,
                                        ringColor: color.hex,
                                        ringOffsetColor: 'var(--color-bg-base)'
                                    }}
                                />
                            ))}
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2"
                        style={{ backgroundColor: selectedColor, '--tw-ring-color': selectedColor }}
                    >
                        Start Writing
                    </button>
                </form>
            </div>
        </div>
    );
}
