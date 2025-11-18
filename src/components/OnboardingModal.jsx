import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { THEME_COLORS } from '../constants.js';
import Logo from './Logo';
import { User, Palette, Sparkles, Check, Heart, BookOpen, Zap, Lock, Cloud } from 'lucide-react';

const FloatingParticle = ({ delay }) => (
    <motion.div
        className="absolute w-2 h-2 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 opacity-20"
        style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
        }}
        animate={{
            y: [0, -30, 0],
            x: [0, Math.random() * 20 - 10, 0],
            scale: [1, 1.5, 1],
            opacity: [0.2, 0.4, 0.2]
        }}
        transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: delay
        }}
    />
);

export default function OnboardingModal({ onComplete }) {
    const [username, setUsername] = useState('');
    const [selectedColor, setSelectedColor] = useState(THEME_COLORS[0].hex);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (username.trim()) {
            setIsSubmitting(true);
            await new Promise(resolve => setTimeout(resolve, 800));
            onComplete(username.trim(), selectedColor);
        }
    };
    const isValid = username.trim().length > 0;
    return (
        <div className="fixed inset-0 bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-lg flex items-center justify-center z-50 p-4">
            {/* Animated background particles */}
            {[...Array(8)].map((_, i) => (
                <FloatingParticle key={i} delay={i * 0.3} />
            ))}
            
            <motion.div
                initial={{ scale: 0.8, opacity: 0, y: 30 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: -20 }}
                transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
                className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl p-8 md:p-10 max-w-lg w-full relative overflow-hidden"
            >
                {/* Gradient orbs */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-blue-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-pink-500/20 to-orange-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
                
                <div className="relative z-10 flex flex-col items-center text-center">
                    {/* Logo with enhanced animation */}
                    <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 15 }}
                        className="mb-6"
                    >
                        <Logo className="w-20 h-20" />
                    </motion.div>
                    
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        style={{ fontFamily: 'var(--font-logo)' }}
                        className="text-4xl md:text-5xl text-slate-900 dark:text-white mb-3 font-bold"
                    >
                        Welcome to Curiosity! 🎉
                    </motion.h1>
                    
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="text-lg mb-8 text-slate-600 dark:text-gray-300 max-w-md"
                    >
                        Your personal space for ideas, thoughts, and discoveries
                    </motion.p>
                    
                    {/* Feature badges with staggered animation */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="flex flex-wrap justify-center gap-3 mb-8"
                    >
                        {[
                            { icon: BookOpen, text: "Rich Editor", color: "from-blue-500 to-blue-600" },
                            { icon: Lock, text: "Secure & Private", color: "from-green-500 to-green-600" },
                            { icon: Cloud, text: "Cloud Sync", color: "from-purple-500 to-purple-600" },
                            { icon: Sparkles, text: "Beautiful UI", color: "from-pink-500 to-pink-600" }
                        ].map((feature, index) => (
                            <motion.div
                                key={feature.text}
                                initial={{ scale: 0, rotate: -10 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ delay: 0.6 + index * 0.1, type: "spring", stiffness: 200 }}
                                whileHover={{ scale: 1.05, y: -2 }}
                                className={`flex items-center space-x-2 px-4 py-2 bg-gradient-to-r ${feature.color} rounded-full shadow-lg`}
                            >
                                <feature.icon size={16} className="text-white" />
                                <span className="text-sm font-medium text-white">{feature.text}</span>
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
                            id="username-onboarding"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="themed-input w-full rounded-xl px-4 py-3 text-lg transition-all duration-200 focus:ring-2"
                            placeholder="Enter your name"
                            required
                            autoFocus
                            whileFocus={{ scale: 1.02 }}
                            style={{
                                backgroundColor: 'var(--color-bg-secondary)',
                                color: 'var(--color-text-primary)',
                                '--tw-ring-color': 'var(--color-primary-hex)',
                                borderColor: isValid ? 'var(--color-primary-hex)' : undefined
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
                            This color will be used throughout your jotter
                        </p>
                    </div>
                    <motion.button
                        type="submit"
                        disabled={!isValid || isSubmitting}
                        className="w-full text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 focus:outline-none focus:ring-4 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-2xl relative overflow-hidden"
                        style={{
                            backgroundColor: isValid ? selectedColor : '#cbd5e1',
                            '--tw-ring-color': `${selectedColor}40`
                        }}
                        whileHover={isValid ? { scale: 1.02, y: -2 } : {}}
                        whileTap={isValid ? { scale: 0.98 } : {}}
                    >
                        {/* Shimmer effect */}
                        {isValid && !isSubmitting && (
                            <motion.div
                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                                animate={{ x: ['-100%', '200%'] }}
                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            />
                        )}
                        
                        <AnimatePresence mode="wait">
                            {isSubmitting ? (
                                <motion.div
                                    key="loading"
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    className="flex items-center space-x-3"
                                >
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                    >
                                        <Sparkles size={22} />
                                    </motion.div>
                                    <span className="text-lg">Setting up your jotter...</span>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="ready"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="flex items-center space-x-2"
                                >
                                    <span>Continue to Your Jotter</span>
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
                {}
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
