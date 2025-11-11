import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { THEME_COLORS } from '../constants.js';
import Logo from './Logo';
import { User, Palette, Sparkles, Check, Heart, BookOpen } from 'lucide-react';

export default function OnboardingModal({ onComplete }) {
    const [username, setUsername] = useState('');
    const [selectedColor, setSelectedColor] = useState(THEME_COLORS[0].hex);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (username.trim()) {
            setIsSubmitting(true);
            // Add a small delay for better UX
            await new Promise(resolve => setTimeout(resolve, 800));
            onComplete(username.trim(), selectedColor);
        }
    };

    const isValid = username.trim().length > 0;

    return (
        <div className="fixed inset-0 bg-gradient-to-br from-slate-900/90 via-slate-800/90 to-slate-900/90 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: -20 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 md:p-8 max-w-md w-full relative overflow-hidden"
            >
                {/* Decorative background elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-500/10 to-purple-500/10 rounded-full blur-2xl" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-pink-500/10 to-orange-500/10 rounded-full blur-2xl" />

                <div className="relative z-10 flex flex-col items-center text-center">
                    {/* Animated logo */}
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                        className="mb-4"
                    >
                        <Logo className="w-16 h-16" />
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        style={{ fontFamily: 'var(--font-logo)' }}
                        className="text-4xl text-slate-900 dark:text-white mb-2"
                    >
                        Welcome Back! 🎉
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="text-lg mb-6 text-slate-600 dark:text-gray-300"
                    >
                        Let's personalize your experience
                    </motion.p>

                    {/* Feature highlights */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="flex flex-wrap justify-center gap-3 mb-8"
                    >
                        {[
                            { icon: BookOpen, text: "Rich Editor" },
                            { icon: Heart, text: "Personal Space" },
                            { icon: Sparkles, text: "Beautiful Design" }
                        ].map((feature, index) => (
                            <motion.div
                                key={feature.text}
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.6 + index * 0.1, type: "spring" }}
                                className="flex items-center space-x-2 px-3 py-2 bg-slate-100 dark:bg-slate-700 rounded-full"
                            >
                                <feature.icon size={14} className="text-slate-600 dark:text-slate-400" />
                                <span className="text-sm text-slate-700 dark:text-slate-300">{feature.text}</span>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>

                <motion.form
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    onSubmit={handleSubmit}
                    className="relative z-10 space-y-6"
                >
                    <div>
                        <label
                            htmlFor="username"
                            className="flex items-center text-sm font-medium text-slate-700 dark:text-gray-300 mb-2"
                        >
                            <User size={16} className="mr-2" />
                            What's your name?
                        </label>
                        <motion.input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="form-input w-full bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white rounded-xl border-2 border-slate-300 dark:border-slate-600 focus:border-primary focus:ring-primary px-4 py-3 text-lg transition-all duration-200"
                            placeholder="Enter your name"
                            required
                            autoFocus
                            whileFocus={{ scale: 1.02 }}
                            style={{
                                '--tw-ring-color': 'var(--color-primary-hex)',
                                '--tw-border-color': isValid ? 'var(--color-primary-hex)' : undefined
                            }}
                        />
                        {username && (
                            <motion.p
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-2 text-sm text-green-600 dark:text-green-400 flex items-center"
                            >
                                <Check size={14} className="mr-1" />
                                Perfect! Hello, {username} 👋
                            </motion.p>
                        )}
                    </div>

                    <div>
                        <label className="flex items-center text-sm font-medium text-slate-700 dark:text-gray-300 mb-3">
                            <Palette size={16} className="mr-2" />
                            Choose your accent color
                        </label>
                        <div className="flex flex-wrap gap-3 justify-center">
                            {THEME_COLORS.map(color => (
                                <motion.button
                                    key={color.hex}
                                    type="button"
                                    title={color.name}
                                    onClick={() => setSelectedColor(color.hex)}
                                    className={`w-10 h-10 rounded-full cursor-pointer focus:outline-none transition-all duration-200 ${
                                        selectedColor === color.hex
                                            ? 'ring-2 ring-offset-2 scale-110 shadow-lg'
                                            : 'hover:scale-110'
                                    }`}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                    style={{
                                        backgroundColor: color.hex,
                                        ringColor: color.hex,
                                        ringOffsetColor: 'var(--color-bg-base)'
                                    }}
                                >
                                    {selectedColor === color.hex && (
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="w-full h-full rounded-full flex items-center justify-center bg-white/20"
                                        >
                                            <Check size={16} className="text-white" />
                                        </motion.div>
                                    )}
                                </motion.button>
                            ))}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 text-center">
                            This color will be used throughout your journal
                        </p>
                    </div>

                    <motion.button
                        type="submit"
                        disabled={!isValid || isSubmitting}
                        className="w-full text-white font-semibold py-4 px-4 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-lg"
                        style={{
                            backgroundColor: isValid ? selectedColor : '#cbd5e1',
                            '--tw-ring-color': selectedColor
                        }}
                        whileHover={isValid ? { scale: 1.02 } : {}}
                        whileTap={isValid ? { scale: 0.98 } : {}}
                    >
                        <AnimatePresence mode="wait">
                            {isSubmitting ? (
                                <motion.div
                                    key="loading"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="flex items-center space-x-2"
                                >
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                    >
                                        <Sparkles size={20} />
                                    </motion.div>
                                    <span>Setting up your journal...</span>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="ready"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="flex items-center space-x-2"
                                >
                                    <span>Continue to Your Journal</span>
                                    <motion.div
                                        animate={{ x: [0, 4, 0] }}
                                        transition={{ duration: 1.5, repeat: Infinity }}
                                    >
                                        →
                                    </motion.div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.button>
                </motion.form>

                {/* Subtle hint */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2 }}
                    className="text-xs text-slate-500 dark:text-slate-400 text-center mt-4 relative z-10"
                >
                    You can change these settings anytime in your profile
                </motion.p>
            </motion.div>
        </div>
    );
}
