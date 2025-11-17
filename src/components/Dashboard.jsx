import React from 'react';
import { motion } from 'framer-motion';
import { useAppState } from '../contexts/StateProvider';
import { format } from 'date-fns';
import { Book, BookOpen, CheckSquare, Edit3, Clock, Gift, Target, ArrowRight, PenTool, Trash2 } from 'lucide-react';
import { getEntryType } from '../constants.js';
import { stripMarkdown, formatTimestamp } from '../utils.js';
import ThemedAvatar from './ThemedAvatar';
import MotivationalQuote from './MotivationalQuote';
import Logo from './Logo';
import FeatureHighlights, { useFeatureHighlights } from './FeatureHighlights';
const DashboardEntryItem = ({ entry, onSelect, onDelete }) => {
    const entryType = getEntryType(entry.type);
    const snippet = stripMarkdown(entry.content || '').substring(0, 80);
    
    return (
        <motion.article
            className="relative p-4 rounded-xl shadow-sm border transition-all cursor-pointer group overflow-hidden"
            style={{
                backgroundColor: 'var(--color-bg-content)',
                borderColor: 'var(--color-border)'
            }}
            onClick={() => onSelect(entry.id)}
            whileHover={{ y: -3, shadow: "lg" }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            {/* Gradient shine effect on hover */}
            <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent"
                initial={{ x: '-100%' }}
                whileHover={{ 
                    x: '100%',
                    transition: { duration: 0.6 }
                }}
                style={{ pointerEvents: 'none' }}
            />
            
            {}
            {onDelete && (
                <motion.button
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-gradient-to-br from-red-500 to-red-600 text-white opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow-md"
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(entry.id);
                    }}
                    whileHover={{ scale: 1.15, rotate: 5 }}
                    whileTap={{ scale: 0.9 }}
                    title="Delete entry"
                >
                    <Trash2 size={14} />
                </motion.button>
            )}
            
            <div className="relative z-10">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-base font-semibold line-clamp-1 flex-1 mr-2" style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-text-primary)' }}>
                        {entry.title || "Untitled Entry"}
                    </h3>
                    <motion.span 
                        className="flex-shrink-0 p-1.5 bg-primary-light rounded-full" 
                        style={{ backgroundColor: 'rgba(var(--color-primary-rgb), 0.1)'}}
                        whileHover={{ scale: 1.2, rotate: 360 }}
                        transition={{ type: "spring", stiffness: 300 }}
                    >
                        <entryType.icon size={12} style={{ color: 'var(--color-primary-hex)'}} />
                    </motion.span>
                </div>
                <p className="text-xs mb-2 flex items-center" style={{ color: 'var(--color-text-muted)' }}>
                    <Clock size={10} className="mr-1" />
                    {formatTimestamp(entry.updatedAt || entry.createdAt, true)}
                </p>
                <p className="text-sm leading-relaxed line-clamp-2" style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-text-secondary)' }}>
                    {snippet}{snippet.length === 80 && '...'}
                </p>
            </div>
        </motion.article>
    );
};
const DashboardGoalItem = ({ goal, onSelect }) => {
    return (
        <motion.article
            className="p-4 rounded-xl shadow-sm border transition-all cursor-pointer relative overflow-hidden group"
            style={{
                backgroundColor: 'var(--color-bg-content)',
                borderColor: 'var(--color-border)'
            }}
            onClick={onSelect}
            whileHover={{ y: -3, shadow: "lg" }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
        >
            {/* Gradient shine effect */}
            <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent"
                initial={{ x: '-100%' }}
                whileHover={{ 
                    x: '100%',
                    transition: { duration: 0.6 }
                }}
                style={{ pointerEvents: 'none' }}
            />
            
            <div className="relative z-10">
                <h3 className="text-base font-semibold mb-3 line-clamp-1" style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-text-primary)' }}>
                    {goal.title}
                </h3>
                <div className="relative w-full rounded-full h-2.5 mb-3 overflow-hidden" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
                    {/* Background shimmer */}
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                        animate={{
                            x: ['-100%', '100%']
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "linear"
                        }}
                    />
                    
                    {/* Progress bar */}
                    <motion.div
                        className="h-2.5 rounded-full relative overflow-hidden"
                        style={{ 
                            backgroundColor: 'var(--color-primary-hex)',
                        }}
                        initial={{ width: 0 }}
                        animate={{ width: `${goal.progress}%` }}
                        transition={{ 
                            duration: 1, 
                            ease: "easeOut",
                            delay: 0.2
                        }}
                    >
                        {/* Shine effect */}
                        <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                            animate={{
                                x: ['-100%', '100%']
                            }}
                            transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                ease: "linear"
                            }}
                        />
                    </motion.div>
                </div>
                <div className="flex justify-between items-center">
                    <p className="text-xs text-slate-500 dark:text-gray-400">
                        {goal.completedTaskCount} of {goal.taskCount} tasks
                    </p>
                    <motion.p 
                        className="text-xs font-semibold px-2 py-1 rounded-full bg-primary/10"
                        style={{ color: 'var(--color-primary-hex)' }}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ 
                            type: "spring",
                            stiffness: 500,
                            damping: 15,
                            delay: 0.3
                        }}
                    >
                        {Math.round(goal.progress)}%
                    </motion.p>
                </div>
            </div>
        </motion.article>
    );
};
const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
};
export default function Dashboard() {
    const {
        localSettings,
        allEntries,
        onThisDayEntries,
        activeGoals,
        handleSelectEntry,
        handleCreateEntry,
        handleViewChange,
        handleToggleSidebar,
        handleDeleteEntry
    } = useAppState();
    const {
        visibleHighlights,
        dismissHighlight,
        hasHighlights
    } = useFeatureHighlights();
    const username = localSettings?.username || 'User';
    const profilePicUrl = localSettings?.profilePicUrl || '';
    const recentEntries = React.useMemo(() => {
        if (!allEntries) return [];
        return [...allEntries].sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()).slice(0, 3);
    }, [allEntries]);
    return (
        <div className="flex flex-col h-full overflow-y-auto overflow-x-hidden custom-scrollbar bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
            {}
            <header className="md:hidden px-4 py-4 border-b border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm sticky top-0 z-10">
                <div className="flex items-center justify-between">
                    <button
                        onClick={handleToggleSidebar}
                        className="p-2 -ml-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        aria-label="Menu"
                    >
                        <svg className="w-6 h-6 text-slate-900 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                    <div className="flex items-center space-x-2">
                        <Logo className="w-7 h-7" animate={false} />
                        <span style={{ fontFamily: 'var(--font-logo)' }} className="text-lg text-slate-900 dark:text-white italic">Curiosity</span>
                    </div>
                    <div className="text-xs text-slate-500 dark:text-gray-400">
                        {format(new Date(), "MMM d")}
                    </div>
                </div>
            </header>
            {}
            <motion.header
                className="relative px-4 md:px-8 pt-4 md:pt-8 pb-4 md:pb-8 mb-4 md:mb-6 overflow-visible"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                {}
                <div className="hidden md:block absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="hidden md:block absolute bottom-0 left-0 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 md:gap-4">
                    <div className="flex-1 space-y-2 md:space-y-3">
                        <motion.h1
                            className="text-xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 dark:from-white dark:via-gray-100 dark:to-gray-200 bg-clip-text text-transparent leading-normal md:leading-tight pb-1 md:pb-2"
                            style={{fontFamily: 'var(--font-serif)'}}
                            initial={{ x: -20 }}
                            animate={{ x: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            {getGreeting()}, {username.split(' ')[0]}! 👋
                        </motion.h1>
                        <motion.p
                            className="text-sm md:text-lg text-slate-600 dark:text-gray-400"
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                        >
                            {format(new Date(), "EEEE, MMMM d")}
                        </motion.p>
                        <motion.div
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                        >
                            <MotivationalQuote />
                        </motion.div>
                    </div>
                    <motion.div
                        whileHover={{ scale: 1.05, rotate: 5 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                        className="hidden md:block flex-shrink-0"
                    >
                        <ThemedAvatar
                            profilePicUrl={profilePicUrl}
                            username={username}
                            className="w-16 h-16 ring-4 ring-white/50 dark:ring-slate-700/50 shadow-xl"
                        />
                    </motion.div>
                </div>
            </motion.header>
            <div className="px-4 md:px-8 pb-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
                {}
                <main className="lg:col-span-2 space-y-6">
                    {}
                    <motion.section
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                    >
                        <h2 className="text-lg md:text-2xl font-semibold text-slate-900 dark:text-white mb-4 flex items-center" style={{fontFamily: 'var(--font-serif)'}}>
                            <span className="mr-2">✨</span> Quick Actions
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                            <motion.button
                                onClick={() => handleCreateEntry('journal')}
                                className="group relative overflow-hidden flex flex-col items-center justify-center p-4 md:p-6 rounded-2xl shadow-lg border-2 transition-all"
                                style={{
                                    backgroundColor: '#8b5cf615',
                                    borderColor: '#8b5cf625'
                                }}
                                whileHover={{ y: -4, scale: 1.02, boxShadow: "0 20px 25px -5px rgba(139, 92, 246, 0.1)" }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <motion.div
                                    className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
                                />
                                {/* Shimmer effect */}
                                <motion.div
                                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                                    initial={{ x: '-100%' }}
                                    whileHover={{ 
                                        x: '100%',
                                        transition: { duration: 0.6 }
                                    }}
                                />
                                <motion.div
                                    whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
                                    transition={{ duration: 0.5 }}
                                    className="relative z-10"
                                >
                                    <PenTool size={28} className="md:mb-3 mb-2 text-purple-600 dark:text-purple-400" />
                                </motion.div>
                                <span className="font-semibold text-sm md:text-base text-purple-700 dark:text-purple-300 relative z-10">New Journal</span>
                                <span className="text-xs text-purple-600/70 dark:text-purple-400/70 mt-1 hidden md:block relative z-10">Document your day</span>
                            </motion.button>
                            <motion.button
                                onClick={() => handleCreateEntry('note')}
                                className="group relative overflow-hidden flex flex-col items-center justify-center p-4 md:p-6 rounded-2xl shadow-lg border-2 transition-all"
                                style={{
                                    backgroundColor: '#f59e0b15',
                                    borderColor: '#f59e0b25'
                                }}
                                whileHover={{ y: -4, scale: 1.02, boxShadow: "0 20px 25px -5px rgba(245, 158, 11, 0.1)" }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <motion.div
                                    className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
                                />
                                {/* Shimmer effect */}
                                <motion.div
                                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                                    initial={{ x: '-100%' }}
                                    whileHover={{ 
                                        x: '100%',
                                        transition: { duration: 0.6 }
                                    }}
                                />
                                <motion.div
                                    whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
                                    transition={{ duration: 0.5 }}
                                    className="relative z-10"
                                >
                                    <Edit3 size={28} className="md:mb-3 mb-2 text-amber-600 dark:text-amber-400" />
                                </motion.div>
                                <span className="font-semibold text-sm md:text-base text-amber-700 dark:text-amber-300 relative z-10">Quick Note</span>
                                <span className="text-xs text-amber-600/70 dark:text-amber-400/70 mt-1 hidden md:block relative z-10">Capture a thought</span>
                            </motion.button>
                            <motion.button
                                onClick={() => handleCreateEntry('task')}
                                className="group relative overflow-hidden flex flex-col items-center justify-center p-4 md:p-6 rounded-2xl shadow-lg border-2 transition-all col-span-2 md:col-span-1"
                                style={{
                                    backgroundColor: '#14b8a615',
                                    borderColor: '#14b8a625'
                                }}
                                whileHover={{ y: -4, scale: 1.02, boxShadow: "0 20px 25px -5px rgba(20, 184, 166, 0.1)" }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <motion.div
                                    className="absolute inset-0 bg-gradient-to-br from-teal-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
                                />
                                {/* Shimmer effect */}
                                <motion.div
                                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                                    initial={{ x: '-100%' }}
                                    whileHover={{ 
                                        x: '100%',
                                        transition: { duration: 0.6 }
                                    }}
                                />
                                <motion.div
                                    whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
                                    transition={{ duration: 0.5 }}
                                    className="relative z-10"
                                >
                                    <CheckSquare size={28} className="md:mb-3 mb-2 text-teal-600 dark:text-teal-400" />
                                </motion.div>
                                <span className="font-semibold text-sm md:text-base text-teal-700 dark:text-teal-300 relative z-10">Task List</span>
                                <span className="text-xs text-teal-600/70 dark:text-teal-400/70 mt-1 hidden md:block relative z-10">Stay organized</span>
                            </motion.button>
                        </div>
                    </motion.section>
                    {}
                    <motion.section
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.5 }}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg md:text-2xl font-semibold text-slate-900 dark:text-white flex items-center" style={{fontFamily: 'var(--font-serif)'}}>
                                <Clock className="w-5 h-5 md:w-6 md:h-6 mr-2 text-slate-600 dark:text-gray-400" />
                                Recent Entries
                            </h2>
                            <motion.button
                                onClick={() => handleViewChange('list')}
                                className="flex items-center space-x-1 text-sm font-medium text-primary hover:underline"
                                style={{ color: 'var(--color-primary-hex)' }}
                                whileHover={{ x: 3 }}
                            >
                                <span>View All</span>
                                <ArrowRight size={16} />
                            </motion.button>
                        </div>
                        {recentEntries.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {recentEntries.map((entry, index) => (
                                    <motion.div
                                        key={entry.id}
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ delay: 0.6 + index * 0.1 }}
                                    >
                                        <DashboardEntryItem
                                            entry={entry}
                                            onSelect={handleSelectEntry}
                                            onDelete={handleDeleteEntry}
                                        />
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <motion.div
                                className="text-center py-12 bg-white/50 dark:bg-slate-800/50 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700"
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.6 }}
                            >
                                <motion.div
                                    animate={{ y: [0, -10, 0] }}
                                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                                >
                                    <BookOpen size={48} className="mx-auto mb-4 text-slate-400 dark:text-gray-600" />
                                </motion.div>
                                <p className="text-slate-600 dark:text-gray-400 font-medium">No entries yet</p>
                                <p className="text-slate-500 dark:text-gray-500 text-sm mt-1">Start writing to see them here!</p>
                            </motion.div>
                        )}
                    </motion.section>
                </main>
                {}
                <aside className="lg:col-span-1 space-y-6">
                    {}
                    <motion.section
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.7 }}
                        className="lg:sticky lg:top-6"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg md:text-xl font-semibold text-slate-900 dark:text-white flex items-center" style={{fontFamily: 'var(--font-serif)'}}>
                                <Target className="w-5 h-5 md:w-6 md:h-6 mr-2 text-green-600 dark:text-green-400" />
                                Active Goals
                            </h2>
                            <motion.button
                                onClick={() => handleViewChange('goals')}
                                className="text-sm font-medium text-primary hover:underline"
                                style={{ color: 'var(--color-primary-hex)' }}
                                whileHover={{ x: 3 }}
                            >
                                <ArrowRight size={16} />
                            </motion.button>
                        </div>
                        {activeGoals && activeGoals.length > 0 ? (
                            <div className="space-y-3">
                                {activeGoals.slice(0, 3).map((goal, index) => (
                                    <motion.div
                                        key={goal.id}
                                        initial={{ x: 20, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        transition={{ delay: 0.8 + index * 0.1 }}
                                    >
                                        <DashboardGoalItem
                                            goal={goal}
                                            onSelect={() => handleViewChange('goals')}
                                        />
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <motion.div
                                className="text-center py-8 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 rounded-2xl border-2 border-dashed border-green-300 dark:border-green-700"
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.8 }}
                                whileHover={{ scale: 1.02 }}
                            >
                                <motion.div
                                    animate={{ scale: [1, 1.1, 1] }}
                                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                                >
                                    <Target size={40} className="mx-auto mb-3 text-green-500 dark:text-green-400" />
                                </motion.div>
                                <p className="text-green-700 dark:text-green-300 font-medium text-sm">No active goals yet</p>
                                <motion.button
                                    onClick={() => handleViewChange('goals')}
                                    className="mt-3 px-4 py-2 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700 transition-colors"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    Set Your First Goal
                                </motion.button>
                            </motion.div>
                        )}
                    </motion.section>
                    {}
                    {onThisDayEntries.length > 0 && (
                        <motion.section
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.9 }}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center space-x-2">
                                    <motion.div
                                        animate={{ rotate: [0, 10, -10, 0] }}
                                        transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                                    >
                                        <Gift className="w-5 h-5 md:w-6 md:h-6 text-pink-600 dark:text-pink-400" />
                                    </motion.div>
                                    <h2 className="text-lg md:text-xl font-semibold text-slate-900 dark:text-white" style={{fontFamily: 'var(--font-serif)'}}>
                                        On This Day
                                    </h2>
                                </div>
                                <div className="text-sm text-slate-600 dark:text-gray-400 font-medium">
                                    {format(new Date(), "MMM d")}
                                </div>
                            </div>
                            <div className="space-y-3">
                                {onThisDayEntries.slice(0, 2).map((entry, index) => (
                                    <motion.div
                                        key={entry.id}
                                        initial={{ x: 20, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        transition={{ delay: 1.0 + index * 0.1 }}
                                        whileHover={{ scale: 1.02 }}
                                    >
                                        <div className="relative">
                                            {}
                                            <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg z-10">
                                                <span className="text-xs">🎁</span>
                                            </div>
                                            <DashboardEntryItem
                                                entry={entry}
                                                onSelect={handleSelectEntry}
                                                onDelete={handleDeleteEntry}
                                            />
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.section>
                    )}
                </aside>
            </div>
            {}
            {hasHighlights && (
                <FeatureHighlights
                    visibleHighlights={visibleHighlights}
                    onHighlightDismiss={dismissHighlight}
                    onAction={(actionType) => {
                        switch (actionType) {
                            case 'create-entry':
                                handleCreateEntry('journal');
                                break;
                            case 'search':
                                handleViewChange('list');
                                break;
                            case 'tags':
                                handleViewChange('list');
                                break;
                            case 'reminder':
                                handleViewChange('reminders');
                                break;
                            case 'vault':
                                handleViewChange('vault');
                                break;
                            case 'settings':
                                handleViewChange('settings');
                                break;
                            default:
                                break;
                        }
                    }}
                />
            )}
        </div>
    );
}
