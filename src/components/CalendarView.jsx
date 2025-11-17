import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { useAppState } from '../contexts/StateProvider';
import { format, isSameDay } from 'date-fns';
import { BookOpen, Calendar as CalendarIcon, TrendingUp, Sparkles } from 'lucide-react';
import { getEntryType } from '../constants';

const EntryTile = ({ entry, onSelect, index }) => {
    const type = getEntryType(entry.type);
    
    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ 
                delay: index * 0.05,
                type: "spring",
                stiffness: 400,
                damping: 25
            }}
            onClick={() => onSelect(entry.id)}
            className="group flex items-center space-x-3 p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer transition-all relative overflow-hidden"
            whileHover={{ x: 4, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
        >
            {/* Shine effect */}
            <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                initial={{ x: '-100%' }}
                whileHover={{ x: '100%' }}
                transition={{ duration: 0.6 }}
            />
            
            <motion.div
                className="p-2 rounded-lg flex-shrink-0 relative z-10"
                style={{ backgroundColor: 'var(--color-primary-light)' }}
                whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                transition={{ duration: 0.4 }}
            >
                <type.icon size={16} className="text-primary" style={{ color: 'var(--color-primary-hex)' }} />
            </motion.div>
            
            <div className="flex-1 truncate relative z-10">
                <h4 className="text-sm font-semibold text-slate-800 dark:text-white truncate group-hover:text-primary transition-colors" style={{ '--primary': 'var(--color-primary-hex)' }}>
                    {entry.title || "Untitled"}
                </h4>
                <p className="text-xs text-slate-500 dark:text-gray-400 truncate">
                    {entry.content?.replace(/<[^>]+>/g, '').substring(0, 60) || "No content"}
                    {entry.content?.length > 60 && '...'}
                </p>
            </div>
            
            <motion.div
                className="opacity-0 group-hover:opacity-100 transition-opacity relative z-10"
                whileHover={{ x: 2 }}
            >
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
            </motion.div>
        </motion.div>
    );
};
export default function CalendarView() {
    const { allEntries, handleSelectEntry } = useAppState();
    const [activeDate, setActiveDate] = useState(new Date());

    const entriesByDate = useMemo(() => {
        const map = new Map();
        if (!allEntries) return map;
        
        allEntries.forEach(entry => {
            const date = entry.createdAt;
            if (!date) return;
            
            const dateKey = format(date, 'yyyy-MM-dd');
            if (!map.has(dateKey)) {
                map.set(dateKey, []);
            }
            map.get(dateKey).push(entry);
        });
        
        return map;
    }, [allEntries]);

    const entriesOnSelectedDate = useMemo(() => {
        const dateKey = format(activeDate, 'yyyy-MM-dd');
        return entriesByDate.get(dateKey) || [];
    }, [activeDate, entriesByDate]);
    
    // Calculate statistics
    const stats = useMemo(() => {
        const currentMonth = format(activeDate, 'yyyy-MM');
        let monthEntries = 0;
        let totalEntries = entriesByDate.size;
        
        entriesByDate.forEach((entries, dateKey) => {
            if (dateKey.startsWith(currentMonth)) {
                monthEntries += entries.length;
            }
        });
        
        return { monthEntries, totalEntries };
    }, [entriesByDate, activeDate]);

    const tileClassName = ({ date, view }) => {
        if (view === 'month') {
            const dateKey = format(date, 'yyyy-MM-dd');
            if (entriesByDate.has(dateKey)) {
                return 'has-entry';
            }
        }
        return null;
    };

    const tileContent = ({ date, view }) => {
        if (view === 'month') {
            const dateKey = format(date, 'yyyy-MM-dd');
            const entries = entriesByDate.get(dateKey);
            if (entries && entries.length > 0) {
                return (
                    <motion.div 
                        className="entry-dot" 
                        style={{ backgroundColor: 'var(--color-primary-hex)' }}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ 
                            type: "spring",
                            stiffness: 500,
                            damping: 15
                        }}
                    >
                        {entries.length > 1 && (
                            <span className="entry-count">{entries.length}</span>
                        )}
                    </motion.div>
                );
            }
        }
        return null;
    };

    return (
        <div className="flex flex-col md:flex-row h-full overflow-hidden bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
            {/* Calendar Section */}
            <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4 }}
                className="md:w-1/2 lg:w-3/5 p-4 md:p-6 overflow-y-auto custom-scrollbar"
            >
                {/* Stats Cards */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-100 dark:border-blue-800/30"
                        whileHover={{ scale: 1.02, y: -2 }}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-1">This Month</p>
                                <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{stats.monthEntries}</p>
                            </div>
                            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-800/30">
                                <CalendarIcon size={20} className="text-blue-600 dark:text-blue-400" />
                            </div>
                        </div>
                    </motion.div>
                    
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-100 dark:border-purple-800/30"
                        whileHover={{ scale: 1.02, y: -2 }}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-purple-600 dark:text-purple-400 font-medium mb-1">Active Days</p>
                                <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">{stats.totalEntries}</p>
                            </div>
                            <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-800/30">
                                <TrendingUp size={20} className="text-purple-600 dark:text-purple-400" />
                            </div>
                        </div>
                    </motion.div>
                </div>
                
                {/* Calendar Component */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3, type: "spring", stiffness: 300 }}
                    className="calendar-wrapper"
                >
                    <Calendar
                        onChange={setActiveDate}
                        value={activeDate}
                        className="w-full border-none p-2 rounded-2xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-lg"
                        tileClassName={tileClassName}
                        tileContent={tileContent}
                    />
                </motion.div>
            </motion.div>

            {/* Entries Section */}
            <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="md:w-1/2 lg:w-2/5 p-4 md:p-6 border-l border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex flex-col overflow-y-auto custom-scrollbar"
            >
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mb-4"
                >
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1 flex items-center">
                        <Sparkles size={20} className="mr-2 text-yellow-500" />
                        {format(activeDate, 'MMMM d, yyyy')}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-gray-400">
                        {entriesOnSelectedDate.length} {entriesOnSelectedDate.length === 1 ? 'entry' : 'entries'} on this day
                    </p>
                </motion.div>

                {/* Entries List */}
                <div className="space-y-2 flex-1">
                    <AnimatePresence mode="wait">
                        {entriesOnSelectedDate.length > 0 ? (
                            <motion.div
                                key={format(activeDate, 'yyyy-MM-dd')}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="space-y-2"
                            >
                                {entriesOnSelectedDate.map((entry, index) => (
                                    <EntryTile 
                                        key={entry.id} 
                                        entry={entry} 
                                        onSelect={handleSelectEntry}
                                        index={index}
                                    />
                                ))}
                            </motion.div>
                        ) : (
                            <motion.div
                                key="empty"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ type: "spring", stiffness: 300 }}
                                className="flex flex-col items-center justify-center h-full text-center text-slate-500 dark:text-gray-400 pt-10"
                            >
                                <motion.div
                                    animate={{ 
                                        y: [0, -10, 0],
                                        rotate: [0, 5, -5, 0]
                                    }}
                                    transition={{ 
                                        duration: 2,
                                        repeat: Infinity,
                                        ease: "easeInOut"
                                    }}
                                    className="mb-4"
                                >
                                    <BookOpen size={48} className="text-slate-300 dark:text-slate-600" />
                                </motion.div>
                                <p className="text-base font-medium mb-1">No entries yet</p>
                                <p className="text-sm">Start writing to populate this date</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
}
