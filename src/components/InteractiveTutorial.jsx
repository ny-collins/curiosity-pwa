import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BookOpen, Edit3, Search, Tag, Calendar, Bell, Lock,
    ChevronRight, ChevronLeft, X, Check, Sparkles, Star,
    FileText, Filter, Palette, Type, Zap
} from 'lucide-react';
import Logo from './Logo';

const TUTORIAL_STEPS = [
    {
        id: 'welcome',
        title: 'Welcome to Curiosity!',
        description: 'Your personal journaling companion that adapts to your style.',
        icon: Sparkles,
        color: '#14b8a6',
        content: {
            features: [
                'Rich text editing with markdown support',
                'Advanced search and filtering',
                'Beautiful themes and typography',
                'Secure vault for sensitive notes',
                'Reminders and goal tracking'
            ]
        }
    },
    {
        id: 'create-entry',
        title: 'Creating Your First Entry',
        description: 'Let\'s create your first journal entry together.',
        icon: Edit3,
        color: '#3b82f6',
        content: {
            instructions: [
                'Click the "New Entry" button in the sidebar',
                'Choose between Note, Task, or Event',
                'Write your thoughts using rich formatting',
                'Add tags to organize your entries'
            ],
            tip: 'Use keyboard shortcuts: Ctrl+S to save, Ctrl+B for bold text'
        }
    },
    {
        id: 'search-filter',
        title: 'Finding Your Entries',
        description: 'Discover powerful search and filtering tools.',
        icon: Search,
        color: '#8b5cf6',
        content: {
            features: [
                'Search through titles, content, and tags',
                'Filter by date ranges and entry types',
                'Sort by date, title, or relevance',
                'See search terms highlighted in results'
            ],
            tip: 'Try searching for keywords or use advanced filters'
        }
    },
    {
        id: 'organization',
        title: 'Stay Organized',
        description: 'Keep your thoughts organized with tags and categories.',
        icon: Tag,
        color: '#f59e0b',
        content: {
            features: [
                'Add multiple tags to entries',
                'Filter entries by tags',
                'Create custom categories',
                'Visual tag suggestions'
            ],
            tip: 'Tags help you find related entries quickly'
        }
    },
    {
        id: 'reminders',
        title: 'Never Forget Important Thoughts',
        description: 'Set reminders for future inspiration.',
        icon: Bell,
        color: '#ef4444',
        content: {
            features: [
                'Set date-based reminders',
                'Get notifications when due',
                'Link reminders to specific entries',
                'Track upcoming important dates'
            ],
            tip: 'Perfect for capturing ideas you want to revisit'
        }
    },
    {
        id: 'vault',
        title: 'Secure Your Private Thoughts',
        description: 'Keep sensitive information safe in your encrypted vault.',
        icon: Lock,
        color: '#06b6d4',
        content: {
            features: [
                'PIN-protected secure storage',
                'Biometric authentication support',
                'Store passwords, ideas, or sensitive notes',
                'Automatic encryption and decryption'
            ],
            tip: 'Access vault from the sidebar menu'
        }
    },
    {
        id: 'customization',
        title: 'Make It Yours',
        description: 'Customize Curiosity to match your personality.',
        icon: Palette,
        color: '#ec4899',
        content: {
            features: [
                'Choose from beautiful color themes',
                'Select fonts that are easy on your eyes',
                'Light, dark, or automatic theme modes',
                'Personalize with your preferred accent color'
            ],
            tip: 'Settings are accessible from the sidebar'
        }
    },
    {
        id: 'shortcuts',
        title: 'Power User Shortcuts',
        description: 'Boost your productivity with keyboard shortcuts.',
        icon: Zap,
        color: '#10b981',
        content: {
            shortcuts: [
                { keys: 'Ctrl+S', action: 'Save current entry' },
                { keys: 'Ctrl+B', action: 'Bold text' },
                { keys: 'Ctrl+I', action: 'Italic text' },
                { keys: 'Ctrl+/', action: 'Show all shortcuts' },
                { keys: 'Ctrl+1-6', action: 'Heading levels' },
                { keys: 'Ctrl+K', action: 'Insert link' }
            ],
            tip: 'Press Ctrl+/ anytime to see all available shortcuts'
        }
    }
];

export default function InteractiveTutorial({ onComplete, onSkip, db, userId, toast }) {
    const [currentStep, setCurrentStep] = useState(0);
    const [isVisible, setIsVisible] = useState(true);

    const currentTutorialStep = TUTORIAL_STEPS[currentStep];
    const progress = ((currentStep + 1) / TUTORIAL_STEPS.length) * 100;

    const handleNext = () => {
        if (currentStep < TUTORIAL_STEPS.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            handleComplete();
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleComplete = () => {
        setIsVisible(false);
        setTimeout(() => {
            onComplete && onComplete();
        }, 300);
    };

    const handleSkip = () => {
        setIsVisible(false);
        setTimeout(() => {
            onSkip && onSkip();
        }, 300);
    };

    if (!isVisible) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center p-4"
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
                >
                    {/* Header */}
                    <div className="relative p-6 border-b border-slate-200 dark:border-slate-700">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <Logo className="w-8 h-8" animate={true} />
                                <div>
                                    <h1 className="text-lg font-bold text-slate-900 dark:text-white">
                                        Getting Started
                                    </h1>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">
                                        Step {currentStep + 1} of {TUTORIAL_STEPS.length}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={handleSkip}
                                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                            >
                                <X size={20} className="text-slate-500" />
                            </button>
                        </div>

                        {/* Progress Bar */}
                        <div className="mt-4 w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                            <motion.div
                                className="h-full rounded-full"
                                style={{ backgroundColor: currentTutorialStep.color }}
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 0.3 }}
                            />
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 overflow-y-auto max-h-[60vh]">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentStep}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                {/* Step Header */}
                                <div className="text-center mb-6">
                                    <motion.div
                                        initial={{ scale: 0.8 }}
                                        animate={{ scale: 1 }}
                                        className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
                                        style={{ backgroundColor: `${currentTutorialStep.color}20` }}
                                    >
                                        <currentTutorialStep.icon
                                            size={32}
                                            style={{ color: currentTutorialStep.color }}
                                        />
                                    </motion.div>
                                    <h2 className="text-2xl font-bold mb-2 text-slate-900 dark:text-white">
                                        {currentTutorialStep.title}
                                    </h2>
                                    <p className="text-lg text-slate-600 dark:text-slate-400">
                                        {currentTutorialStep.description}
                                    </p>
                                </div>

                                {/* Step Content */}
                                <div className="space-y-6">
                                    {currentTutorialStep.content.features && (
                                        <div>
                                            <h3 className="font-semibold mb-3 text-slate-900 dark:text-white">
                                                What you'll discover:
                                            </h3>
                                            <ul className="space-y-2">
                                                {currentTutorialStep.content.features.map((feature, index) => (
                                                    <motion.li
                                                        key={index}
                                                        initial={{ opacity: 0, x: -10 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: index * 0.1 }}
                                                        className="flex items-start space-x-3"
                                                    >
                                                        <Check size={18} className="text-green-500 mt-0.5 flex-shrink-0" />
                                                        <span className="text-slate-700 dark:text-slate-300">{feature}</span>
                                                    </motion.li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {currentTutorialStep.content.instructions && (
                                        <div>
                                            <h3 className="font-semibold mb-3 text-slate-900 dark:text-white">
                                                Let's try it:
                                            </h3>
                                            <ol className="space-y-2">
                                                {currentTutorialStep.content.instructions.map((instruction, index) => (
                                                    <motion.li
                                                        key={index}
                                                        initial={{ opacity: 0, x: -10 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: index * 0.1 }}
                                                        className="flex items-start space-x-3"
                                                    >
                                                        <span className="bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium flex-shrink-0 mt-0.5">
                                                            {index + 1}
                                                        </span>
                                                        <span className="text-slate-700 dark:text-slate-300">{instruction}</span>
                                                    </motion.li>
                                                ))}
                                            </ol>
                                        </div>
                                    )}

                                    {currentTutorialStep.content.shortcuts && (
                                        <div>
                                            <h3 className="font-semibold mb-3 text-slate-900 dark:text-white">
                                                Keyboard shortcuts:
                                            </h3>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                {currentTutorialStep.content.shortcuts.map((shortcut, index) => (
                                                    <motion.div
                                                        key={index}
                                                        initial={{ opacity: 0, scale: 0.9 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        transition={{ delay: index * 0.05 }}
                                                        className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg"
                                                    >
                                                        <span className="text-slate-700 dark:text-slate-300">{shortcut.action}</span>
                                                        <kbd className="px-2 py-1 bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-slate-200 rounded text-sm font-mono">
                                                            {shortcut.keys}
                                                        </kbd>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {currentTutorialStep.content.tip && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4"
                                        >
                                            <div className="flex items-start space-x-3">
                                                <Star size={20} className="text-blue-500 flex-shrink-0 mt-0.5" />
                                                <div>
                                                    <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                                                        Pro Tip
                                                    </h4>
                                                    <p className="text-blue-800 dark:text-blue-200 text-sm">
                                                        {currentTutorialStep.content.tip}
                                                    </p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}

                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Footer */}
                    <div className="p-6 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                        <div className="flex items-center justify-between">
                            <button
                                onClick={handleBack}
                                disabled={currentStep === 0}
                                className="flex items-center space-x-2 px-4 py-2 rounded-lg font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft size={18} />
                                <span>Back</span>
                            </button>

                            <div className="flex space-x-3">
                                <button
                                    onClick={handleSkip}
                                    className="px-4 py-2 rounded-lg font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                                >
                                    Skip Tutorial
                                </button>

                                <motion.button
                                    onClick={handleNext}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="flex items-center space-x-2 px-6 py-2 rounded-lg font-medium text-white shadow-lg"
                                    style={{ backgroundColor: currentTutorialStep.color }}
                                >
                                    <span>
                                        {currentStep === TUTORIAL_STEPS.length - 1 ? 'Get Started' : 'Next'}
                                    </span>
                                    <ChevronRight size={18} />
                                </motion.button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}