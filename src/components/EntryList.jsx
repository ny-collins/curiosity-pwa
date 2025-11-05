import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, X, Calendar, List, Tag, SlidersHorizontal, BookOpen, CheckSquare, Brain } from 'lucide-react';
import { useAppState } from '../contexts/StateProvider';
import { format, formatDistanceToNow, parseISO } from 'date-fns';
import { ENTRY_TYPES, getEntryType } from '../constants';

const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June', 
    'July', 'August', 'September', 'October', 'November', 'December'
];

const getMonthName = (monthNum) => MONTHS[monthNum - 1] || '';

const EntryCard = ({ entry, onSelect }) => {
    const type = getEntryType(entry.type);
    const date = entry.updatedAt || entry.createdAt;
    
    let formattedDate = 'No date';
    if (date) {
        try {
            const dateObj = typeof date === 'string' ? parseISO(date) : date;
            formattedDate = formatDistanceToNow(dateObj, { addSuffix: true });
        } catch (error) {
            console.warn("Could not parse date:", date, error);
        }
    }

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            onClick={() => onSelect(entry.id)}
            className="bg-white dark:bg-slate-800 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer border border-slate-200 dark:border-slate-700 overflow-hidden"
            style={{
                backgroundColor: 'var(--color-bg-content)',
                borderColor: 'var(--color-border)'
            }}
        >
            <div className="p-4">
                <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center space-x-2">
                        <type.icon size={16} className="text-primary" style={{ color: 'var(--color-primary-hex)' }} />
                        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-primary-hex)' }}>
                            {type.label}
                        </span>
                    </div>
                    <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                        {formattedDate}
                    </span>
                </div>
                <h3 className="text-lg font-semibold mb-2 truncate" style={{ color: 'var(--color-text-primary)' }}>
                    {entry.title || "Untitled Entry"}
                </h3>
                <p className="text-sm line-clamp-2 mb-3" style={{ color: 'var(--color-text-secondary)' }}>
                    {entry.content?.replace(/<[^>]+>/g, '') || "No content"}
                </p>
                {entry.tags && entry.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                        {entry.tags.slice(0, 3).map((tag, index) => (
                            <span key={index} className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-gray-300 px-2 py-0.5 rounded-full">
                                {tag}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </motion.div>
    );
};

const Filters = () => {
    const {
        searchTerm, setSearchTerm,
        filterYear, setFilterYear,
        filterMonth, setFilterMonth,
        filterTag, setFilterTag,
        filterType, setFilterType,
        availableYears, availableTags,
        handleClearFilters, handleViewChange,
        currentView
    } = useAppState();

    return (
        <div className="p-4 space-y-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
            <div className="relative">
                <input
                    type="text"
                    placeholder="Search entries..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="form-input w-full pl-10 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 rounded-md shadow-sm"
                />
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                {searchTerm && (
                    <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                        <X size={18} />
                    </button>
                )}
            </div>
            
            <div className="flex flex-col md:flex-row md:items-center gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="form-select text-sm bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 rounded-md"
                    >
                        <option value="All">All Types</option>
                        {ENTRY_TYPES.map(type => (
                            <option key={type.value} value={type.value}>{type.label}</option>
                        ))}
                    </select>

                    <select
                        value={filterTag}
                        onChange={(e) => setFilterTag(e.target.value)}
                        className="form-select text-sm bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 rounded-md"
                    >
                        <option value="All">All Tags</option>
                        {availableTags.map(tag => (
                            <option key={tag} value={tag}>{tag}</option>
                        ))}
                    </select>

                    <select
                        value={filterYear}
                        onChange={(e) => setFilterYear(e.target.value)}
                        className="form-select text-sm bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 rounded-md"
                    >
                        <option value="All">All Years</option>
                        {availableYears.map(year => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </select>

                    {filterYear !== 'All' && (
                        <select
                            value={filterMonth}
                            onChange={(e) => setFilterMonth(e.target.value)}
                            className="form-select text-sm bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 rounded-md"
                        >
                            <option value="All">All Months</option>
                            {MONTHS.map((month, index) => (
                                <option key={month} value={index + 1}>{month}</option>
                            ))}
                        </select>
                    )}
                </div>
                
                <div className="flex-1 flex justify-end">
                     <button
                        onClick={handleClearFilters}
                        className="text-sm text-primary dark:text-primary-light hover:underline"
                        style={{ color: 'var(--color-primary-hex)' }}
                    >
                        Clear Filters
                    </button>
                </div>
            </div>
            
             <div className="flex items-center justify-between md:hidden">
                <span className="text-sm font-medium text-slate-700 dark:text-gray-300">View Mode</span>
                <div className="flex items-center space-x-1 rounded-lg bg-slate-200 dark:bg-slate-700 p-1">
                    <button
                        onClick={() => handleViewChange('list')}
                        className={`flex justify-center items-center space-x-2 py-1 px-3 rounded-md text-sm transition-colors ${
                            currentView === 'list' ? 'bg-white dark:bg-slate-800 shadow-sm text-primary font-semibold' : 'text-slate-600 dark:text-gray-300'
                        }`}
                        style={{ color: currentView === 'list' ? 'var(--color-primary-hex)' : '' }}
                    >
                        <List size={16} />
                    </button>
                    <button
                        onClick={() => handleViewChange('calendar')}
                        className={`flex justify-center items-center space-x-2 py-1 px-3 rounded-md text-sm transition-colors ${
                            currentView === 'calendar' ? 'bg-white dark:bg-slate-800 shadow-sm text-primary font-semibold' : 'text-slate-600 dark:text-gray-300'
                        }`}
                        style={{ color: currentView === 'calendar' ? 'var(--color-primary-hex)' : '' }}
                    >
                        <Calendar size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default function EntryList() {
    const { filteredEntries, handleSelectEntry, handleCreateEntry } = useAppState();

    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900">
            <Filters />
            
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6">
                <AnimatePresence>
                    {filteredEntries && filteredEntries.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredEntries.map(entry => (
                                <EntryCard key={entry.id} entry={entry} onSelect={handleSelectEntry} />
                            ))}
                        </div>
                    ) : (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex flex-col items-center justify-center h-full text-center"
                        >
                            <BookOpen size={48} className="text-slate-400 dark:text-slate-500 mb-4" />
                            <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-1">
                                No entries found
                            </h3>
                            <p className="text-sm text-slate-600 dark:text-gray-400 mb-4">
                                Your journal is empty or no entries match your filters.
                            </p>
                            <button
                                onClick={() => handleCreateEntry('note')}
                                className="flex items-center space-x-1 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2"
                                style={{ backgroundColor: 'var(--color-primary-hex)', '--tw-ring-color': 'var(--color-primary-hex)' }}
                            >
                                <Plus size={20} />
                                <span>Create Your First Entry</span>
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}