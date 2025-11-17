import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Filter, Calendar, Tag, FileText, Clock } from 'lucide-react';
import { useAppState } from '../contexts/StateProvider';
import { getEntryType } from '../constants';
import { stripMarkdown, formatTimestamp } from '../utils';
import { format } from 'date-fns';

export default function SearchModal({ isOpen, onClose }) {
    const { entries, handleOpenEntry } = useAppState();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedType, setSelectedType] = useState('all');
    const [selectedTags, setSelectedTags] = useState([]);
    const [dateRange, setDateRange] = useState('all');
    const [showFilters, setShowFilters] = useState(false);
    const searchInputRef = useRef(null);

    useEffect(() => {
        if (isOpen && searchInputRef.current) {
            setTimeout(() => searchInputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                if (isOpen) {
                    onClose();
                }
            }
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    const allTags = useMemo(() => {
        if (!entries) return [];
        const tagSet = new Set();
        entries.forEach(entry => {
            entry.tags?.forEach(tag => tagSet.add(tag));
        });
        return Array.from(tagSet).sort();
    }, [entries]);

    const filteredEntries = useMemo(() => {
        if (!entries) return [];

        let filtered = [...entries];

        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(entry => {
                const titleMatch = entry.title?.toLowerCase().includes(query);
                const contentMatch = entry.content?.toLowerCase().includes(query);
                const tagsMatch = entry.tags?.some(tag => tag.toLowerCase().includes(query));
                return titleMatch || contentMatch || tagsMatch;
            });
        }

        if (selectedType !== 'all') {
            filtered = filtered.filter(entry => entry.type === selectedType);
        }

        if (selectedTags.length > 0) {
            filtered = filtered.filter(entry => 
                selectedTags.every(tag => entry.tags?.includes(tag))
            );
        }

        if (dateRange !== 'all') {
            const now = new Date();
            const filterDate = new Date();
            
            switch (dateRange) {
                case 'today':
                    filterDate.setHours(0, 0, 0, 0);
                    break;
                case 'week':
                    filterDate.setDate(now.getDate() - 7);
                    break;
                case 'month':
                    filterDate.setMonth(now.getMonth() - 1);
                    break;
                case 'year':
                    filterDate.setFullYear(now.getFullYear() - 1);
                    break;
            }

            filtered = filtered.filter(entry => {
                const entryDate = new Date(entry.updatedAt || entry.createdAt);
                return entryDate >= filterDate;
            });
        }

        return filtered.sort((a, b) => 
            new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt)
        );
    }, [entries, searchQuery, selectedType, selectedTags, dateRange]);

    const handleSelectEntry = (entryId) => {
        handleOpenEntry(entryId);
        onClose();
    };

    const toggleTag = (tag) => {
        setSelectedTags(prev => 
            prev.includes(tag) 
                ? prev.filter(t => t !== tag)
                : [...prev, tag]
        );
    };

    const clearFilters = () => {
        setSelectedType('all');
        setSelectedTags([]);
        setDateRange('all');
    };

    const hasActiveFilters = selectedType !== 'all' || selectedTags.length > 0 || dateRange !== 'all';

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black bg-opacity-50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
            >
                <motion.div
                    className="w-full max-w-3xl mt-20 rounded-2xl shadow-2xl overflow-hidden"
                    style={{ backgroundColor: 'var(--color-bg-primary)' }}
                    initial={{ scale: 0.9, y: -20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: -20 }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="p-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
                        <div className="flex items-center space-x-3">
                            <Search size={20} style={{ color: 'var(--color-text-muted)' }} />
                            <input
                                ref={searchInputRef}
                                type="text"
                                placeholder="Search entries by title, content, or tags..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="flex-1 bg-transparent outline-none text-lg"
                                style={{ color: 'var(--color-text-primary)' }}
                            />
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="p-2 rounded-lg hover:bg-opacity-10"
                                style={{ 
                                    backgroundColor: hasActiveFilters ? 'rgba(var(--color-primary-rgb), 0.1)' : 'transparent',
                                    color: hasActiveFilters ? 'var(--color-primary-hex)' : 'var(--color-text-muted)'
                                }}
                                title="Toggle filters"
                            >
                                <Filter size={18} />
                            </button>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-lg hover:bg-opacity-10"
                                style={{ color: 'var(--color-text-muted)' }}
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <AnimatePresence>
                            {showFilters && (
                                <motion.div
                                    className="mt-4 space-y-4"
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                >
                                    <div>
                                        <label className="text-xs font-semibold mb-2 block" style={{ color: 'var(--color-text-secondary)' }}>
                                            <FileText size={14} className="inline mr-1" />
                                            Entry Type
                                        </label>
                                        <div className="flex flex-wrap gap-2">
                                            <button
                                                onClick={() => setSelectedType('all')}
                                                className="px-3 py-1.5 rounded-lg text-sm transition-colors"
                                                style={{
                                                    backgroundColor: selectedType === 'all' ? 'var(--color-primary-hex)' : 'var(--color-bg-secondary)',
                                                    color: selectedType === 'all' ? 'white' : 'var(--color-text-secondary)'
                                                }}
                                            >
                                                All Types
                                            </button>
                                            {['note', 'journal', 'idea', 'goal', 'milestone', 'question', 'discovery', 'reflection', 'task'].map(type => {
                                                const entryType = getEntryType(type);
                                                return (
                                                    <button
                                                        key={type}
                                                        onClick={() => setSelectedType(type)}
                                                        className="px-3 py-1.5 rounded-lg text-sm transition-colors flex items-center space-x-1"
                                                        style={{
                                                            backgroundColor: selectedType === type ? 'var(--color-primary-hex)' : 'var(--color-bg-secondary)',
                                                            color: selectedType === type ? 'white' : 'var(--color-text-secondary)'
                                                        }}
                                                    >
                                                        <span>{entryType.emoji}</span>
                                                        <span>{entryType.label}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-xs font-semibold mb-2 block" style={{ color: 'var(--color-text-secondary)' }}>
                                            <Calendar size={14} className="inline mr-1" />
                                            Date Range
                                        </label>
                                        <div className="flex flex-wrap gap-2">
                                            {[
                                                { value: 'all', label: 'All Time' },
                                                { value: 'today', label: 'Today' },
                                                { value: 'week', label: 'Past Week' },
                                                { value: 'month', label: 'Past Month' },
                                                { value: 'year', label: 'Past Year' }
                                            ].map(option => (
                                                <button
                                                    key={option.value}
                                                    onClick={() => setDateRange(option.value)}
                                                    className="px-3 py-1.5 rounded-lg text-sm transition-colors"
                                                    style={{
                                                        backgroundColor: dateRange === option.value ? 'var(--color-primary-hex)' : 'var(--color-bg-secondary)',
                                                        color: dateRange === option.value ? 'white' : 'var(--color-text-secondary)'
                                                    }}
                                                >
                                                    {option.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {allTags.length > 0 && (
                                        <div>
                                            <label className="text-xs font-semibold mb-2 block" style={{ color: 'var(--color-text-secondary)' }}>
                                                <Tag size={14} className="inline mr-1" />
                                                Tags
                                            </label>
                                            <div className="flex flex-wrap gap-2">
                                                {allTags.map(tag => (
                                                    <button
                                                        key={tag}
                                                        onClick={() => toggleTag(tag)}
                                                        className="px-3 py-1.5 rounded-lg text-sm transition-colors"
                                                        style={{
                                                            backgroundColor: selectedTags.includes(tag) ? 'var(--color-primary-hex)' : 'var(--color-bg-secondary)',
                                                            color: selectedTags.includes(tag) ? 'white' : 'var(--color-text-secondary)'
                                                        }}
                                                    >
                                                        #{tag}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {hasActiveFilters && (
                                        <button
                                            onClick={clearFilters}
                                            className="text-sm px-3 py-1.5 rounded-lg hover:opacity-80"
                                            style={{ color: 'var(--color-primary-hex)' }}
                                        >
                                            Clear all filters
                                        </button>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="max-h-[60vh] overflow-y-auto">
                        {filteredEntries.length === 0 ? (
                            <div className="p-12 text-center">
                                <Search size={48} className="mx-auto mb-4 opacity-30" style={{ color: 'var(--color-text-muted)' }} />
                                <p className="text-lg font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                                    {searchQuery || hasActiveFilters ? 'No results found' : 'Start typing to search'}
                                </p>
                                <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                                    {searchQuery || hasActiveFilters 
                                        ? 'Try adjusting your search or filters'
                                        : 'Search across titles, content, and tags'
                                    }
                                </p>
                            </div>
                        ) : (
                            <div className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
                                {filteredEntries.map(entry => {
                                    const entryType = getEntryType(entry.type);
                                    const snippet = stripMarkdown(entry.content || '').substring(0, 120);
                                    
                                    return (
                                        <motion.button
                                            key={entry.id}
                                            onClick={() => handleSelectEntry(entry.id)}
                                            className="w-full p-4 text-left hover:bg-opacity-5 transition-colors"
                                            style={{ backgroundColor: 'transparent' }}
                                            whileHover={{ backgroundColor: 'rgba(var(--color-primary-rgb), 0.05)' }}
                                        >
                                            <div className="flex items-start space-x-3">
                                                <div className="flex-shrink-0 p-2 rounded-lg" style={{ backgroundColor: 'rgba(var(--color-primary-rgb), 0.1)' }}>
                                                    <entryType.icon size={16} style={{ color: 'var(--color-primary-hex)' }} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-semibold mb-1 truncate" style={{ color: 'var(--color-text-primary)' }}>
                                                        {entry.title || 'Untitled Entry'}
                                                    </h3>
                                                    <p className="text-sm mb-2 line-clamp-2" style={{ color: 'var(--color-text-secondary)' }}>
                                                        {snippet}{snippet.length === 120 && '...'}
                                                    </p>
                                                    <div className="flex items-center space-x-3 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                                                        <span className="flex items-center space-x-1">
                                                            <Clock size={12} />
                                                            <span>{formatTimestamp(entry.updatedAt || entry.createdAt, true)}</span>
                                                        </span>
                                                        {entry.tags && entry.tags.length > 0 && (
                                                            <span className="flex items-center space-x-1">
                                                                <Tag size={12} />
                                                                <span>{entry.tags.slice(0, 2).join(', ')}{entry.tags.length > 2 && '...'}</span>
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.button>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <div className="p-3 border-t text-xs flex items-center justify-between" style={{ 
                        borderColor: 'var(--color-border)',
                        backgroundColor: 'var(--color-bg-secondary)',
                        color: 'var(--color-text-muted)'
                    }}>
                        <span>{filteredEntries.length} result{filteredEntries.length !== 1 ? 's' : ''}</span>
                        <span className="flex items-center space-x-2">
                            <kbd className="px-2 py-1 rounded" style={{ backgroundColor: 'var(--color-bg-primary)' }}>ESC</kbd>
                            <span>to close</span>
                        </span>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
