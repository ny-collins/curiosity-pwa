import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Edit3, Search, Tag, Bell, Lock, Palette,
    X, ChevronRight, Sparkles, Star, FileText
} from 'lucide-react';

const FEATURE_HIGHLIGHTS = [
    {
        id: 'rich-editor',
        title: 'Rich Text Editor',
        description: 'Write with formatting, links, and markdown support',
        icon: Edit3,
        color: '#3b82f6',
        action: 'Try creating a new entry',
        actionType: 'create-entry'
    },
    {
        id: 'smart-search',
        title: 'Smart Search',
        description: 'Find entries instantly with advanced filters and highlighting',
        icon: Search,
        color: '#8b5cf6',
        action: 'Search your entries',
        actionType: 'search'
    },
    {
        id: 'organization',
        title: 'Smart Organization',
        description: 'Use tags and categories to keep your thoughts organized',
        icon: Tag,
        color: '#f59e0b',
        action: 'Add tags to entries',
        actionType: 'tags'
    },
    {
        id: 'reminders',
        title: 'Smart Reminders',
        description: 'Never forget important thoughts with date-based reminders',
        icon: Bell,
        color: '#ef4444',
        action: 'Set a reminder',
        actionType: 'reminder'
    },
    {
        id: 'secure-vault',
        title: 'Secure Vault',
        description: 'Keep sensitive information safe with PIN protection',
        icon: Lock,
        color: '#06b6d4',
        action: 'Explore the vault',
        actionType: 'vault'
    },
    {
        id: 'customization',
        title: 'Personalization',
        description: 'Customize themes, fonts, and colors to match your style',
        icon: Palette,
        color: '#ec4899',
        action: 'Change your theme',
        actionType: 'settings'
    }
];

export default function FeatureHighlights({
    onDismiss,
    onAction,
    visibleHighlights = [],
    onHighlightDismiss
}) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isVisible, setIsVisible] = useState(true);

    const currentHighlight = FEATURE_HIGHLIGHTS.find(h => h.id === visibleHighlights[currentIndex]);

    useEffect(() => {
        if (visibleHighlights.length === 0) {
            setIsVisible(false);
            onDismiss && onDismiss();
        }
    }, [visibleHighlights, onDismiss]);

    const handleNext = () => {
        if (currentIndex < visibleHighlights.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            handleDismiss();
        }
    };

    const handleDismiss = () => {
        setIsVisible(false);
        setTimeout(() => {
            onDismiss && onDismiss();
        }, 300);
    };

    const handleAction = (actionType) => {
        onAction && onAction(actionType);
        handleNext();
    };

    const handleSkipHighlight = () => {
        if (currentHighlight) {
            onHighlightDismiss && onHighlightDismiss(currentHighlight.id);
            handleNext();
        }
    };

    if (!isVisible || !currentHighlight) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="fixed bottom-4 right-4 z-40 max-w-sm"
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
                        <div className="flex items-center space-x-3">
                            <div
                                className="w-10 h-10 rounded-lg flex items-center justify-center"
                                style={{ backgroundColor: `${currentHighlight.color}20` }}
                            >
                                <currentHighlight.icon
                                    size={20}
                                    style={{ color: currentHighlight.color }}
                                />
                            </div>
                            <div>
                                <h3 className="font-semibold text-slate-900 dark:text-white">
                                    {currentHighlight.title}
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Feature {currentIndex + 1} of {visibleHighlights.length}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleDismiss}
                            className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                        >
                            <X size={16} className="text-slate-500" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-4">
                        <p className="text-sm text-slate-700 dark:text-slate-300 mb-4">
                            {currentHighlight.description}
                        </p>

                        <div className="flex items-center justify-between">
                            <button
                                onClick={() => handleAction(currentHighlight.actionType)}
                                className="flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium text-white hover:opacity-90 transition-opacity"
                                style={{ backgroundColor: currentHighlight.color }}
                            >
                                <span>{currentHighlight.action}</span>
                                <ChevronRight size={14} />
                            </button>

                            <button
                                onClick={handleSkipHighlight}
                                className="px-3 py-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                            >
                                Skip
                            </button>
                        </div>
                    </div>

                    {/* Progress Indicator */}
                    <div className="px-4 pb-3">
                        <div className="flex space-x-1">
                            {visibleHighlights.map((_, index) => (
                                <div
                                    key={index}
                                    className={`h-1 flex-1 rounded-full transition-colors ${
                                        index === currentIndex
                                            ? 'bg-slate-900 dark:bg-white'
                                            : index < currentIndex
                                            ? 'bg-slate-400 dark:bg-slate-600'
                                            : 'bg-slate-200 dark:bg-slate-700'
                                    }`}
                                />
                            ))}
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

// Hook for managing feature highlights
export const useFeatureHighlights = () => {
    const [dismissedHighlights, setDismissedHighlights] = useState(() => {
        const stored = localStorage.getItem('dismissedHighlights');
        return stored ? JSON.parse(stored) : [];
    });

    const [visibleHighlights, setVisibleHighlights] = useState([]);

    useEffect(() => {
        // Show highlights that haven't been dismissed
        const availableHighlights = FEATURE_HIGHLIGHTS
            .filter(highlight => !dismissedHighlights.includes(highlight.id))
            .map(highlight => highlight.id);

        setVisibleHighlights(availableHighlights);
    }, [dismissedHighlights]);

    const dismissHighlight = (highlightId) => {
        const newDismissed = [...dismissedHighlights, highlightId];
        setDismissedHighlights(newDismissed);
        localStorage.setItem('dismissedHighlights', JSON.stringify(newDismissed));
    };

    const resetHighlights = () => {
        setDismissedHighlights([]);
        localStorage.removeItem('dismissedHighlights');
    };

    return {
        visibleHighlights,
        dismissHighlight,
        resetHighlights,
        hasHighlights: visibleHighlights.length > 0
    };
};