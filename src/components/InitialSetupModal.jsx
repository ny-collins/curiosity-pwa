import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Palette, Type, Sparkles, Check, ChevronRight, Sun, Moon, Laptop } from 'lucide-react';
import Logo from './Logo';
import ThemedAvatar from './ThemedAvatar';
import { THEME_COLORS, FONT_CATEGORIES } from '../constants';

// Convert hex to RGB for the accent color
const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result 
        ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
        : '59, 130, 246';
};

const THEME_OPTIONS = [
    { id: 'light', label: 'Light', description: 'Bright and clean', icon: Sun },
    { id: 'dark', label: 'Dark', description: 'Easy on the eyes', icon: Moon },
    { id: 'system', label: 'Auto', description: 'Follows system', icon: Laptop },
];

export default function InitialSetupModal({ onComplete }) {
    const [step, setStep] = useState(1);
    const [username, setUsername] = useState('');
    const [selectedTheme, setSelectedTheme] = useState('system');
    const [selectedAccent, setSelectedAccent] = useState(THEME_COLORS[0]);
    const [selectedFont, setSelectedFont] = useState(FONT_CATEGORIES[0].fonts[0]);
    const [isCompleting, setIsCompleting] = useState(false);

    const totalSteps = 4;
    const progress = (step / totalSteps) * 100;

    // Live preview - Apply selections to the modal itself
    const modalStyle = {
        '--color-primary-hex': selectedAccent.hex,
        '--color-primary-rgb': hexToRgb(selectedAccent.hex),
        fontFamily: selectedFont.value === 'Inter' ? 'Inter, sans-serif' : 
                    selectedFont.value === 'Roboto' ? 'Roboto, sans-serif' :
                    selectedFont.value === 'Lato' ? 'Lato, sans-serif' :
                    selectedFont.value === 'Lora' ? 'Lora, serif' :
                    selectedFont.value === 'Merriweather' ? 'Merriweather, serif' :
                    selectedFont.value === 'Playfair Display' ? '"Playfair Display", serif' :
                    selectedFont.value === 'JetBrains Mono' ? '"JetBrains Mono", monospace' :
                    selectedFont.value === 'Source Code Pro' ? '"Source Code Pro", monospace' :
                    selectedFont.value === 'Pacifico' ? 'Pacifico, cursive' :
                    selectedFont.value === 'Caveat' ? 'Caveat, cursive' :
                    'Inter, sans-serif'
    };

    const handleNext = () => {
        if (step < totalSteps) {
            setStep(step + 1);
        } else {
            handleComplete();
        }
    };

    const handleBack = () => {
        if (step > 1) {
            setStep(step - 1);
        }
    };

    const handleComplete = async () => {
        setIsCompleting(true);
        
        const settings = {
            username: username.trim() || 'User',
            theme: selectedTheme,
            accentColor: selectedAccent.hex,
            accentColorRgb: hexToRgb(selectedAccent.hex),
            themeFont: selectedFont.value,
            hasCompletedSetup: true,
        };

        await new Promise(resolve => setTimeout(resolve, 500));
        onComplete(settings);
    };

    const canProceed = () => {
        if (step === 1) return username.trim().length > 0;
        return true;
    };

    return (
        <div 
            className="fixed inset-0 z-50 bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 overflow-y-auto"
            style={modalStyle}
        >
            <div className="min-h-screen flex flex-col">
                {/* Header */}
                <div className="flex-shrink-0 border-b border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm sticky top-0 z-10">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2 sm:space-x-3">
                                <Logo className="w-8 h-8 sm:w-10 sm:h-10" animate={true} />
                                <div>
                                    <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white" style={{ fontFamily: 'var(--font-logo)' }}>
                                        Welcome to Curiosity
                                    </h1>
                                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                                        Step {step} of {totalSteps}: {step === 1 ? 'About You' : step === 2 ? 'Theme' : step === 3 ? 'Color' : 'Typography'}
                                    </p>
                                </div>
                            </div>
                            <Sparkles className="text-primary hidden sm:block" size={28} style={{ color: selectedAccent.hex }} />
                        </div>
                        
                        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 mt-3">
                            <motion.div
                                className="h-full rounded-full"
                                style={{ backgroundColor: selectedAccent.hex }}
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 0.3 }}
                            />
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
                    <div className="w-full max-w-6xl">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={step}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                {/* Step 1: Username */}
                                {step === 1 && (
                                    <div className="text-center">
                                        <motion.div 
                                            initial={{ scale: 0.9 }}
                                            animate={{ scale: 1 }}
                                            className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full mb-4 sm:mb-6"
                                            style={{ backgroundColor: `${selectedAccent.hex}20` }}
                                        >
                                            <User size={32} style={{ color: selectedAccent.hex }} />
                                        </motion.div>
                                        <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4 text-slate-900 dark:text-white">
                                            What should we call you?
                                        </h2>
                                        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 mb-6 sm:mb-8 max-w-2xl mx-auto">
                                            Choose a name that makes this space feel like yours
                                        </p>
                                        <div className="max-w-md mx-auto">
                                            <input
                                                type="text"
                                                value={username}
                                                onChange={(e) => setUsername(e.target.value)}
                                                placeholder="Enter your name"
                                                autoFocus
                                                className="w-full px-6 py-4 text-xl text-center rounded-2xl border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none transition-all shadow-sm"
                                                style={{ borderColor: username ? selectedAccent.hex : undefined }}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter' && canProceed()) {
                                                        handleNext();
                                                    }
                                                }}
                                            />
                                            {username && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: -10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="mt-6 flex items-center justify-center space-x-3"
                                                >
                                                    <ThemedAvatar username={username} className="w-16 h-16" />
                                                    <div className="text-left">
                                                        <p className="text-sm text-slate-600 dark:text-slate-400">Looks great!</p>
                                                        <p className="text-lg font-semibold text-slate-900 dark:text-white">
                                                            Hello, {username}
                                                        </p>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Step 2: Theme */}
                                {step === 2 && (
                                    <div className="text-center">
                                        <motion.div 
                                            initial={{ scale: 0.9 }}
                                            animate={{ scale: 1 }}
                                            className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full mb-4 sm:mb-6"
                                            style={{ backgroundColor: `${selectedAccent.hex}20` }}
                                        >
                                            <Palette size={32} style={{ color: selectedAccent.hex }} />
                                        </motion.div>
                                        <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4 text-slate-900 dark:text-white">
                                            Choose your theme
                                        </h2>
                                        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 mb-6 sm:mb-8 max-w-2xl mx-auto">
                                            Pick the look that suits your style
                                        </p>
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto">
                                            {THEME_OPTIONS.map((theme) => {
                                                const Icon = theme.icon;
                                                return (
                                                    <motion.button
                                                        key={theme.id}
                                                        onClick={() => setSelectedTheme(theme.id)}
                                                        whileHover={{ scale: 1.02 }}
                                                        whileTap={{ scale: 0.98 }}
                                                        className={`relative p-6 rounded-2xl border-2 transition-all text-left ${
                                                            selectedTheme === theme.id
                                                                ? 'shadow-xl'
                                                                : 'border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500'
                                                        } bg-white dark:bg-slate-800`}
                                                        style={selectedTheme === theme.id ? { borderColor: selectedAccent.hex } : {}}
                                                    >
                                                        {selectedTheme === theme.id && (
                                                            <motion.div
                                                                initial={{ scale: 0 }}
                                                                animate={{ scale: 1 }}
                                                                className="absolute top-3 right-3"
                                                            >
                                                                <div className="rounded-full p-1" style={{ backgroundColor: selectedAccent.hex }}>
                                                                    <Check size={14} className="text-white" />
                                                                </div>
                                                            </motion.div>
                                                        )}
                                                        <div className="mb-3">
                                                            <Icon size={28} className="text-slate-700 dark:text-slate-300" />
                                                        </div>
                                                        <h3 className="font-bold text-lg mb-1 text-slate-900 dark:text-white">
                                                            {theme.label}
                                                        </h3>
                                                        <p className="text-sm text-slate-600 dark:text-slate-400">
                                                            {theme.description}
                                                        </p>
                                                    </motion.button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Step 3: Accent Color */}
                                {step === 3 && (
                                    <div className="text-center">
                                        <motion.div 
                                            initial={{ scale: 0.9 }}
                                            animate={{ scale: 1 }}
                                            className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full mb-4 sm:mb-6"
                                            style={{ backgroundColor: `${selectedAccent.hex}20` }}
                                        >
                                            <Sparkles size={32} style={{ color: selectedAccent.hex }} />
                                        </motion.div>
                                        <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4 text-slate-900 dark:text-white">
                                            Pick your accent color
                                        </h2>
                                        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 mb-6 sm:mb-8 max-w-2xl mx-auto">
                                            This color will be used for highlights and interactive elements
                                        </p>
                                        <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 sm:gap-4 max-w-3xl mx-auto">
                                            {THEME_COLORS.map((color) => (
                                                <motion.button
                                                    key={color.hex}
                                                    onClick={() => setSelectedAccent(color)}
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    className="group relative"
                                                >
                                                    <div 
                                                        className="w-full aspect-square rounded-2xl shadow-lg transition-all"
                                                        style={{ backgroundColor: color.hex }}
                                                    >
                                                        {selectedAccent.hex === color.hex && (
                                                            <motion.div
                                                                initial={{ scale: 0 }}
                                                                animate={{ scale: 1 }}
                                                                className="absolute inset-0 flex items-center justify-center"
                                                            >
                                                                <div className="bg-white rounded-full p-2 shadow-lg">
                                                                    <Check size={24} style={{ color: color.hex }} />
                                                                </div>
                                                            </motion.div>
                                                        )}
                                                    </div>
                                                    <p className="mt-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                                                        {color.name}
                                                    </p>
                                                </motion.button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Step 4: Typography */}
                                {step === 4 && (
                                    <div className="text-center">
                                        <motion.div 
                                            initial={{ scale: 0.9 }}
                                            animate={{ scale: 1 }}
                                            className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full mb-4 sm:mb-6"
                                            style={{ backgroundColor: `${selectedAccent.hex}20` }}
                                        >
                                            <Type size={32} style={{ color: selectedAccent.hex }} />
                                        </motion.div>
                                        <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4 text-slate-900 dark:text-white">
                                            Choose your typography
                                        </h2>
                                        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 mb-6 sm:mb-8 max-w-2xl mx-auto">
                                            Select a font family that's easy on your eyes
                                        </p>
                                        <div className="space-y-4 sm:space-y-6 max-w-4xl mx-auto overflow-y-auto max-h-[50vh]">
                                            {FONT_CATEGORIES.map((category) => (
                                                <div key={category.name} className="text-left">
                                                    <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                                                        {category.name}
                                                    </h3>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                                        {category.fonts.map((font) => (
                                                            <motion.button
                                                                key={font.name}
                                                                onClick={() => setSelectedFont(font)}
                                                                whileHover={{ scale: 1.02 }}
                                                                whileTap={{ scale: 0.98 }}
                                                                className={`relative p-4 rounded-xl border-2 transition-all text-left ${
                                                                    selectedFont.name === font.name
                                                                        ? 'shadow-xl'
                                                                        : 'border-slate-300 dark:border-slate-600 hover:border-slate-400'
                                                                } bg-white dark:bg-slate-800`}
                                                                style={selectedFont.name === font.name ? { borderColor: selectedAccent.hex } : {}}
                                                            >
                                                                {selectedFont.name === font.name && (
                                                                    <motion.div
                                                                        initial={{ scale: 0 }}
                                                                        animate={{ scale: 1 }}
                                                                        className="absolute top-2 right-2"
                                                                    >
                                                                        <div className="rounded-full p-1" style={{ backgroundColor: selectedAccent.hex }}>
                                                                            <Check size={12} className="text-white" />
                                                                        </div>
                                                                    </motion.div>
                                                                )}
                                                                <h4 className="font-bold text-base mb-2 text-slate-900 dark:text-white" style={{ fontFamily: font.value }}>
                                                                    {font.name}
                                                                </h4>
                                                                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed" style={{ fontFamily: font.value }}>
                                                                    The quick brown fox jumps
                                                                </p>
                                                            </motion.button>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex-shrink-0 border-t border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm sticky bottom-0">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
                        <div className="flex items-center justify-between gap-4">
                            <button
                                onClick={handleBack}
                                disabled={step === 1}
                                className="px-6 py-3 rounded-xl font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Back
                            </button>
                            
                            <motion.button
                                onClick={handleNext}
                                disabled={!canProceed() || isCompleting}
                                whileHover={{ scale: canProceed() ? 1.02 : 1 }}
                                whileTap={{ scale: canProceed() ? 0.98 : 1 }}
                                className="px-8 py-3 rounded-xl font-semibold text-white shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                                style={{ backgroundColor: canProceed() ? selectedAccent.hex : '#cbd5e1' }}
                            >
                                <span>{step === totalSteps ? 'Get Started' : 'Next'}</span>
                                {isCompleting ? (
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                    >
                                        <Sparkles size={18} />
                                    </motion.div>
                                ) : step === totalSteps ? (
                                    <Check size={18} />
                                ) : (
                                    <ChevronRight size={18} />
                                )}
                            </motion.button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
