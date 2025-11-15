import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, X, Calendar, List, Tag, SlidersHorizontal, BookOpen, CheckSquare, Brain, Trash2, Filter, Clock, ChevronDown, Grid3X3, ChevronLeft, ChevronRight, ArrowUpDown } from 'lucide-react';
import { useAppState } from '../contexts/StateProvider';
import { format, formatDistanceToNow, parseISO, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import { ENTRY_TYPES, getEntryType } from '../constants';

const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June', 
    'July', 'August', 'September', 'October', 'November', 'December'
];

const getMonthName = (monthNum) => MONTHS[monthNum - 1] || '';

const EntryCard = ({ entry, onSelect, onDelete }) => {
    const [isHovered, setIsHovered] = useState(false);
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
    
    const handleDelete = (e) => {
        e.stopPropagation(); // Prevent card click
        if (window.confirm('Are you sure you want to delete this entry?')) {
            onDelete(entry.id);
        }
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            onClick={() => onSelect(entry.id)}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="relative bg-white dark:bg-slate-800 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer border border-slate-200 dark:border-slate-700 overflow-hidden group"
            style={{
                backgroundColor: 'var(--color-bg-content)',
                borderColor: 'var(--color-border)'
            }}
        >
            {/* Delete Button */}
            <AnimatePresence>
                {isHovered && (
                    <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.15 }}
                        onClick={handleDelete}
                        className="absolute top-2 right-2 z-10 p-2 rounded-lg bg-red-500 hover:bg-red-600 text-white shadow-lg"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        title="Delete entry"
                    >
                        <Trash2 size={16} />
                    </motion.button>
                )}
            </AnimatePresence>
            
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

const EntryListItem = ({ entry, onSelect, onDelete }) => {
    const [isHovered, setIsHovered] = useState(false);
    const type = getEntryType(entry.type);
    const date = entry.updatedAt || entry.createdAt;

    let formattedDate = 'No date';
    if (date) {
        try {
            const dateObj = typeof date === 'string' ? parseISO(date) : date;
            formattedDate = format(dateObj, 'MMM d, yyyy');
        } catch (error) {
            console.warn("Could not parse date:", date, error);
        }
    }

    const handleDelete = (e) => {
        e.stopPropagation();
        if (window.confirm('Are you sure you want to delete this entry?')) {
            onDelete(entry.id);
        }
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            onClick={() => onSelect(entry.id)}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="relative group cursor-pointer border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
            style={{
                backgroundColor: 'var(--color-bg-content)',
                borderColor: 'var(--color-border)'
            }}
        >
            <div className="p-4">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                            <type.icon size={16} className="text-primary flex-shrink-0" style={{ color: 'var(--color-primary-hex)' }} />
                            <h3 className="text-base font-semibold truncate" style={{ color: 'var(--color-text-primary)' }}>
                                {entry.title || "Untitled Entry"}
                            </h3>
                            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-gray-300 flex-shrink-0">
                                {type.label}
                            </span>
                        </div>

                        <p className="text-sm line-clamp-2 mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                            {entry.content?.replace(/<[^>]+>/g, '') || "No content"}
                        </p>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                                <span>{formattedDate}</span>
                                {entry.tags && entry.tags.length > 0 && (
                                    <div className="flex gap-1">
                                        {entry.tags.slice(0, 2).map((tag, index) => (
                                            <span key={index} className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-gray-300 px-2 py-0.5 rounded">
                                                {tag}
                                            </span>
                                        ))}
                                        {entry.tags.length > 2 && (
                                            <span className="text-slate-500">+{entry.tags.length - 2} more</span>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Delete Button */}
                    <AnimatePresence>
                        {isHovered && (
                            <motion.button
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                transition={{ duration: 0.15 }}
                                onClick={handleDelete}
                                className="flex-shrink-0 p-2 rounded-lg bg-red-500 hover:bg-red-600 text-white shadow-lg"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                title="Delete entry"
                            >
                                <Trash2 size={14} />
                            </motion.button>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </motion.div>
    );
};

const PaginationControls = ({ currentPage, totalPages, onPageChange, totalEntries, entriesPerPage }) => {
    if (totalPages <= 1) return null;

    const startEntry = (currentPage - 1) * entriesPerPage + 1;
    const endEntry = Math.min(currentPage * entriesPerPage, totalEntries);

    return (
        <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
            <div className="text-sm text-slate-600 dark:text-gray-400">
                Showing {startEntry} to {endEntry} of {totalEntries} entries
            </div>

            <div className="flex items-center space-x-2">
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="Previous page"
                >
                    <ChevronLeft size={16} />
                </button>

                <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                            pageNum = i + 1;
                        } else if (currentPage <= 3) {
                            pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                        } else {
                            pageNum = currentPage - 2 + i;
                        }

                        return (
                            <button
                                key={pageNum}
                                onClick={() => onPageChange(pageNum)}
                                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                                    currentPage === pageNum
                                        ? 'bg-primary text-white'
                                        : 'hover:bg-slate-100 dark:hover:bg-slate-700'
                                }`}
                                style={{
                                    backgroundColor: currentPage === pageNum ? 'var(--color-primary-hex)' : ''
                                }}
                            >
                                {pageNum}
                            </button>
                        );
                    })}
                </div>

                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="Next page"
                >
                    <ChevronRight size={16} />
                </button>
            </div>
        </div>
    );
};

const Filters = ({ viewMode, setViewMode, sortBy, setSortBy, sortOrder, setSortOrder }) => {
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
                    className="themed-input w-full pl-10 rounded-md shadow-sm"
                    style={{
                        backgroundColor: 'var(--color-bg-secondary)',
                        color: 'var(--color-text-primary)'
                    }}
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
                
                <div className="flex-1 flex justify-end gap-4">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-700 dark:text-gray-300">Sort by:</span>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="form-select text-sm bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 rounded-md"
                        >
                            <option value="updatedAt">Date Modified</option>
                            <option value="createdAt">Date Created</option>
                            <option value="title">Title</option>
                            <option value="type">Type</option>
                        </select>
                        <button
                            onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                            className="p-2 rounded-lg border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                            title={`Sort ${sortOrder === 'desc' ? 'ascending' : 'descending'}`}
                        >
                            <ArrowUpDown size={16} className={sortOrder === 'desc' ? 'rotate-180' : ''} />
                        </button>
                    </div>

                    <div className="hidden md:flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-700 dark:text-gray-300">View:</span>
                        <div className="flex items-center space-x-1 rounded-lg bg-slate-200 dark:bg-slate-700 p-1">
                            <button
                                onClick={() => setViewMode('list')}
                                className={`flex justify-center items-center space-x-2 py-1 px-3 rounded-md text-sm transition-colors ${
                                    viewMode === 'list' ? 'bg-white dark:bg-slate-800 shadow-sm text-primary font-semibold' : 'text-slate-600 dark:text-gray-300'
                                }`}
                                style={{ color: viewMode === 'list' ? 'var(--color-primary-hex)' : '' }}
                            >
                                <List size={16} />
                                <span>List</span>
                            </button>
                            <button
                                onClick={() => setViewMode('cards')}
                                className={`flex justify-center items-center space-x-2 py-1 px-3 rounded-md text-sm transition-colors ${
                                    viewMode === 'cards' ? 'bg-white dark:bg-slate-800 shadow-sm text-primary font-semibold' : 'text-slate-600 dark:text-gray-300'
                                }`}
                                style={{ color: viewMode === 'cards' ? 'var(--color-primary-hex)' : '' }}
                            >
                                <Grid3X3 size={16} />
                                <span>Cards</span>
                            </button>
                        </div>
                    </div>

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
                        onClick={() => setViewMode('list')}
                        className={`flex justify-center items-center space-x-2 py-1 px-3 rounded-md text-sm transition-colors ${
                            viewMode === 'list' ? 'bg-white dark:bg-slate-800 shadow-sm text-primary font-semibold' : 'text-slate-600 dark:text-gray-300'
                        }`}
                        style={{ color: viewMode === 'list' ? 'var(--color-primary-hex)' : '' }}
                    >
                        <List size={16} />
                        <span>List</span>
                    </button>
                    <button
                        onClick={() => setViewMode('cards')}
                        className={`flex justify-center items-center space-x-2 py-1 px-3 rounded-md text-sm transition-colors ${
                            viewMode === 'cards' ? 'bg-white dark:bg-slate-800 shadow-sm text-primary font-semibold' : 'text-slate-600 dark:text-gray-300'
                        }`}
                        style={{ color: viewMode === 'cards' ? 'var(--color-primary-hex)' : '' }}
                    >
                        <Grid3X3 size={16} />
                        <span>Cards</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default function EntryList() {
    const { filteredEntries, handleSelectEntry, handleCreateEntry, handleDeleteEntry } = useAppState();

    // View and pagination state
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'cards'
    const [currentPage, setCurrentPage] = useState(1);
    const [sortBy, setSortBy] = useState('updatedAt'); // 'updatedAt', 'createdAt', 'title', 'type'
    const [sortOrder, setSortOrder] = useState('desc'); // 'asc' or 'desc'

    const entriesPerPage = 20;

    // Sort entries
    const sortedEntries = useMemo(() => {
        if (!filteredEntries) return [];

        return [...filteredEntries].sort((a, b) => {
            let aValue, bValue;

            switch (sortBy) {
                case 'title':
                    aValue = (a.title || '').toLowerCase();
                    bValue = (b.title || '').toLowerCase();
                    break;
                case 'type':
                    aValue = a.type || '';
                    bValue = b.type || '';
                    break;
                case 'createdAt':
                    aValue = new Date(a.createdAt || 0).getTime();
                    bValue = new Date(b.createdAt || 0).getTime();
                    break;
                case 'updatedAt':
                default:
                    aValue = new Date(a.updatedAt || a.createdAt || 0).getTime();
                    bValue = new Date(b.updatedAt || b.createdAt || 0).getTime();
                    break;
            }

            if (sortOrder === 'asc') {
                return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
            } else {
                return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
            }
        });
    }, [filteredEntries, sortBy, sortOrder]);

    // Paginate entries
    const totalEntries = sortedEntries.length;
    const totalPages = Math.ceil(totalEntries / entriesPerPage);
    const paginatedEntries = sortedEntries.slice(
        (currentPage - 1) * entriesPerPage,
        currentPage * entriesPerPage
    );

    // Reset to page 1 when filters change
    React.useEffect(() => {
        setCurrentPage(1);
    }, [filteredEntries]);

    const handlePageChange = (page) => {
        setCurrentPage(page);
        // Scroll to top of entries
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900">
            <Filters
                viewMode={viewMode}
                setViewMode={setViewMode}
                sortBy={sortBy}
                setSortBy={setSortBy}
                sortOrder={sortOrder}
                setSortOrder={setSortOrder}
            />

            <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="p-4 md:p-6">
                    <AnimatePresence mode="wait">
                        {paginatedEntries && paginatedEntries.length > 0 ? (
                            <motion.div
                                key={`${viewMode}-${currentPage}`}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                {viewMode === 'cards' ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {paginatedEntries.map(entry => (
                                            <EntryCard key={entry.id} entry={entry} onSelect={handleSelectEntry} onDelete={handleDeleteEntry} />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="space-y-0">
                                        {paginatedEntries.map(entry => (
                                            <EntryListItem key={entry.id} entry={entry} onSelect={handleSelectEntry} onDelete={handleDeleteEntry} />
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex flex-col items-center justify-center h-full text-center py-12"
                            >
                                <BookOpen size={48} className="text-slate-400 dark:text-slate-500 mb-4" />
                                <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-1">
                                    {filteredEntries && filteredEntries.length === 0 ? 'No entries found' : 'No entries yet'}
                                </h3>
                                <p className="text-sm text-slate-600 dark:text-gray-400 mb-4">
                                    {filteredEntries && filteredEntries.length === 0
                                        ? 'Your journal is empty or no entries match your filters.'
                                        : 'Start writing to see your entries here!'
                                    }
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

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <PaginationControls
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                        totalEntries={totalEntries}
                        entriesPerPage={entriesPerPage}
                    />
                )}
            </div>
        </div>
    );
}