import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Keyboard, Command, Search, Plus, Settings, Lock, Home, Book, Calendar, Target, Shield, Bell } from 'lucide-react';

const ShortcutGroup = ({ title, shortcuts }) => {
    return (
        <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
                {title}
            </h3>
            <div className="space-y-2">
                {shortcuts.map((shortcut, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
                        <div className="flex items-center space-x-3">
                            {shortcut.icon && <shortcut.icon size={16} style={{ color: 'var(--color-primary-hex)' }} />}
                            <span className="text-sm" style={{ color: 'var(--color-text-primary)' }}>{shortcut.description}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                            {shortcut.keys.map((key, i) => (
                                <React.Fragment key={i}>
                                    <kbd 
                                        className="px-2 py-1 text-xs font-mono rounded shadow-sm"
                                        style={{ 
                                            backgroundColor: 'var(--color-bg-primary)',
                                            color: 'var(--color-text-primary)',
                                            border: '1px solid var(--color-border)'
                                        }}
                                    >
                                        {key}
                                    </kbd>
                                    {i < shortcut.keys.length - 1 && <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>+</span>}
                                </React.Fragment>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default function KeyboardShortcutsPanel({ isOpen, onClose }) {
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
            if ((e.metaKey || e.ctrlKey) && e.key === '/' && !isOpen) {
                e.preventDefault();
                // This will be triggered from App.jsx
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    const isMac = typeof window !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const modKey = isMac ? '⌘' : 'Ctrl';

    const shortcuts = [
        {
            title: 'General',
            items: [
                { icon: Search, description: 'Open search', keys: [modKey, 'K'] },
                { icon: Keyboard, description: 'Show keyboard shortcuts', keys: [modKey, '/'] },
                { icon: Plus, description: 'Create new entry', keys: [modKey, 'N'] },
                { icon: null, description: 'Close modal/dialog', keys: ['Esc'] },
                { icon: null, description: 'Save entry', keys: [modKey, 'S'] },
            ]
        },
        {
            title: 'Navigation',
            items: [
                { icon: Home, description: 'Go to Dashboard', keys: [modKey, 'D'] },
                { icon: Book, description: 'View all entries', keys: [modKey, 'E'] },
                { icon: Calendar, description: 'Open calendar', keys: [modKey, 'C'] },
                { icon: Target, description: 'View goals', keys: [modKey, 'G'] },
                { icon: Shield, description: 'Open vault', keys: [modKey, 'V'] },
                { icon: Bell, description: 'View reminders', keys: [modKey, 'R'] },
                { icon: Settings, description: 'Open settings', keys: [modKey, ','] },
            ]
        },
        {
            title: 'Security',
            items: [
                { icon: Lock, description: 'Lock app', keys: [modKey, 'L'] },
            ]
        },
        {
            title: 'Editor',
            items: [
                { icon: null, description: 'Bold text', keys: [modKey, 'B'] },
                { icon: null, description: 'Italic text', keys: [modKey, 'I'] },
                { icon: null, description: 'Heading', keys: [modKey, 'H'] },
                { icon: null, description: 'Insert link', keys: [modKey, 'K'] },
                { icon: null, description: 'Toggle preview', keys: [modKey, 'P'] },
                { icon: null, description: 'Toggle focus mode', keys: [modKey, 'Shift', 'F'] },
            ]
        }
    ];

    const filteredShortcuts = searchQuery
        ? shortcuts.map(group => ({
            ...group,
            items: group.items.filter(item =>
                item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.keys.some(key => key.toLowerCase().includes(searchQuery.toLowerCase()))
            )
        })).filter(group => group.items.length > 0)
        : shortcuts;

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
            >
                <motion.div
                    className="w-full max-w-4xl max-h-[85vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
                    style={{ backgroundColor: 'var(--color-bg-primary)' }}
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 20 }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="p-6 border-b" style={{ borderColor: 'var(--color-border)' }}>
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(var(--color-primary-rgb), 0.1)' }}>
                                    <Keyboard size={24} style={{ color: 'var(--color-primary-hex)' }} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-serif)' }}>
                                        Keyboard Shortcuts
                                    </h2>
                                    <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                                        Master these shortcuts to boost your productivity
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-lg hover:bg-opacity-10 transition-colors"
                                style={{ color: 'var(--color-text-muted)' }}
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Search */}
                        <div className="relative">
                            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} />
                            <input
                                type="text"
                                placeholder="Search shortcuts..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 rounded-lg border outline-none focus:ring-2"
                                style={{
                                    backgroundColor: 'var(--color-bg-secondary)',
                                    color: 'var(--color-text-primary)',
                                    borderColor: 'var(--color-border)'
                                }}
                            />
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {filteredShortcuts.length === 0 ? (
                            <div className="text-center py-12">
                                <Keyboard size={48} className="mx-auto mb-4 opacity-30" style={{ color: 'var(--color-text-muted)' }} />
                                <p className="text-lg font-medium" style={{ color: 'var(--color-text-primary)' }}>
                                    No shortcuts found
                                </p>
                                <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                                    Try a different search term
                                </p>
                            </div>
                        ) : (
                            filteredShortcuts.map((group, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <ShortcutGroup title={group.title} shortcuts={group.items} />
                                </motion.div>
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-4 border-t flex items-center justify-between" style={{ 
                        borderColor: 'var(--color-border)',
                        backgroundColor: 'var(--color-bg-secondary)'
                    }}>
                        <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                            Press <kbd className="px-1.5 py-0.5 rounded text-xs" style={{ backgroundColor: 'var(--color-bg-primary)' }}>{modKey}</kbd> + <kbd className="px-1.5 py-0.5 rounded text-xs" style={{ backgroundColor: 'var(--color-bg-primary)' }}>/</kbd> to toggle
                        </span>
                        <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                            <kbd className="px-2 py-1 rounded" style={{ backgroundColor: 'var(--color-bg-primary)' }}>ESC</kbd> to close
                        </span>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
