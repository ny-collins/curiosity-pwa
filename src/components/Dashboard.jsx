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
            className="p-4 rounded-xl shadow-sm border transition-all cursor-pointer group relative"
            style={{
                backgroundColor: 'var(--color-bg-content)',
                borderColor: 'var(--color-border)'
            }}
            onClick={() => onSelect(entry.id)}
            whileHover={{ y: -2, shadow: "lg" }}
            whileTap={{ scale: 0.98 }}
        >
            {/* Delete button - appears on hover */}
            {onDelete && (
                <motion.button
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity z-10"
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(entry.id);
                    }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    title="Delete entry"
                >
                    <Trash2 size={14} />
                </motion.button>
            )}

            <div className="flex justify-between items-start mb-2">
                <h3 className="text-base font-semibold line-clamp-1 flex-1 mr-2" style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-text-primary)' }}>
                    {entry.title || "Untitled Entry"}
                </h3>
                <span className="flex-shrink-0 p-1.5 bg-primary-light rounded-full" style={{ backgroundColor: 'rgba(var(--color-primary-rgb), 0.1)'}}>
                    <entryType.icon size={12} style={{ color: 'var(--color-primary-hex)'}} />
                </span>
            </div>
            <p className="text-xs mb-2" style={{ color: 'var(--color-text-muted)' }}>
                {formatTimestamp(entry.updatedAt || entry.createdAt, true)}
            </p>
            <p className="text-sm leading-relaxed line-clamp-2" style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-text-secondary)' }}>
                {snippet}{snippet.length === 80 && '...'}
            </p>
        </motion.article>
    );
};

const DashboardGoalItem = ({ goal, onSelect }) => {
    return (
        <motion.article
            className="p-4 rounded-xl shadow-sm border transition-all cursor-pointer"
            style={{
                backgroundColor: 'var(--color-bg-content)',
                borderColor: 'var(--color-border)'
            }}
            onClick={onSelect}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
        >
            <h3 className="text-base font-semibold mb-3 line-clamp-1" style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-text-primary)' }}>
                {goal.title}
            </h3>

            <div className="w-full rounded-full h-2 mb-2" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
                <motion.div
                    className="h-2 rounded-full"
                    style={{ backgroundColor: 'var(--color-primary-hex)' }}
                    initial={{ width: 0 }}
                    animate={{ width: `${goal.progress}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                />
            </div>
            <div className="flex justify-between items-center">
                <p className="text-xs text-slate-500 dark:text-gray-400">
                    {goal.completedTaskCount} of {goal.taskCount} tasks
                </p>
                <p className="text-xs font-semibold text-primary" style={{ color: 'var(--color-primary-hex)' }}>
                    {Math.round(goal.progress)}%
                </p>
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
            {/* Mobile Header with Hamburger */}
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

            {/* Vibrant Header with gradient and decorative elements */}
            <motion.header 
                className="relative px-4 md:px-8 pt-4 md:pt-8 pb-4 md:pb-8 mb-4 md:mb-6 overflow-visible"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                {/* Decorative background blobs - desktop only */}
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
                {/* Main Content Area */}
                <main className="lg:col-span-2 space-y-6">
                    {/* Quick Actions - Redesigned with animations */}
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
                                whileHover={{ y: -4, scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <motion.div
                                    className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
                                />
                                <motion.div
                                    whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
                                    transition={{ duration: 0.5 }}
                                >
                                    <PenTool size={28} className="md:mb-3 mb-2 text-purple-600 dark:text-purple-400" />
                                </motion.div>
                                <span className="font-semibold text-sm md:text-base text-purple-700 dark:text-purple-300">New Journal</span>
                                <span className="text-xs text-purple-600/70 dark:text-purple-400/70 mt-1 hidden md:block">Document your day</span>
                            </motion.button>

                            <motion.button
                                onClick={() => handleCreateEntry('note')}
                                className="group relative overflow-hidden flex flex-col items-center justify-center p-4 md:p-6 rounded-2xl shadow-lg border-2 transition-all"
                                style={{
                                    backgroundColor: '#f59e0b15',
                                    borderColor: '#f59e0b25'
                                }}
                                whileHover={{ y: -4, scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <motion.div
                                    className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
                                />
                                <motion.div
                                    whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
                                    transition={{ duration: 0.5 }}
                                >
                                    <Edit3 size={28} className="md:mb-3 mb-2 text-amber-600 dark:text-amber-400" />
                                </motion.div>
                                <span className="font-semibold text-sm md:text-base text-amber-700 dark:text-amber-300">Quick Note</span>
                                <span className="text-xs text-amber-600/70 dark:text-amber-400/70 mt-1 hidden md:block">Capture a thought</span>
                            </motion.button>

                            <motion.button
                                onClick={() => handleCreateEntry('task')}
                                className="group relative overflow-hidden flex flex-col items-center justify-center p-4 md:p-6 rounded-2xl shadow-lg border-2 transition-all col-span-2 md:col-span-1"
                                style={{
                                    backgroundColor: '#14b8a615',
                                    borderColor: '#14b8a625'
                                }}
                                whileHover={{ y: -4, scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <motion.div
                                    className="absolute inset-0 bg-gradient-to-br from-teal-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
                                />
                                <motion.div
                                    whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
                                    transition={{ duration: 0.5 }}
                                >
                                    <CheckSquare size={28} className="md:mb-3 mb-2 text-teal-600 dark:text-teal-400" />
                                </motion.div>
                                <span className="font-semibold text-sm md:text-base text-teal-700 dark:text-teal-300">Task List</span>
                                <span className="text-xs text-teal-600/70 dark:text-teal-400/70 mt-1 hidden md:block">Stay organized</span>
                            </motion.button>
                        </div>
                    </motion.section>
                
                    {/* Recent Entries with staggered animation */}
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
            
                {/* Sidebar with Goals and Special Content */}
                <aside className="lg:col-span-1 space-y-6">
                    {/* Active Goals */}
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
                    
                    {/* On This Day - Memory Lane */}
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
                                            {/* Decorative corner ribbon */}
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

            {/* Feature Highlights */}
            {hasHighlights && (
                <FeatureHighlights
                    visibleHighlights={visibleHighlights}
                    onHighlightDismiss={dismissHighlight}
                    onAction={(actionType) => {
                        // Handle feature highlight actions
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
