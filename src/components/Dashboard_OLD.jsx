import React from 'react';
import { motion } from 'framer-motion';
import { useAppState } from '../contexts/StateProvider';
import { format, getDay, parseISO } from 'date-fns';
import { Book, CheckSquare, Edit3, Clock, Gift, Target, ArrowRight } from 'lucide-react';
import { ENTRY_TYPES, getEntryType } from '../constants.js';
import { stripMarkdown, formatTimestamp } from '../utils.js';
import ThemedAvatar from './ThemedAvatar';
import MotivationalQuote from './MotivationalQuote';
import Logo from './Logo';

const DashboardEntryItem = ({ entry, onSelect }) => {
    const entryType = getEntryType(entry.type);
    const snippet = stripMarkdown(entry.content || '').substring(0, 80);

    return (
        <article
            className="p-4 rounded-xl shadow-sm border transition-all cursor-pointer active:scale-95"
            style={{
                backgroundColor: 'var(--color-bg-content)',
                borderColor: 'var(--color-border)'
            }}
            onClick={() => onSelect(entry.id)}
        >
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
        </article>
    );
};

const DashboardGoalItem = ({ goal, onSelect }) => {
    return (
        <article
            className="p-4 rounded-xl shadow-sm border transition-all cursor-pointer active:scale-95"
            style={{
                backgroundColor: 'var(--color-bg-content)',
                borderColor: 'var(--color-border)'
            }}
            onClick={onSelect}
        >
            <h3 className="text-base font-semibold mb-3 line-clamp-1" style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-text-primary)' }}>
                {goal.title}
            </h3>

            <div className="w-full rounded-full h-2 mb-2" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
                <div
                    className="h-2 rounded-full transition-all"
                    style={{ width: `${goal.progress}%`, backgroundColor: 'var(--color-primary-hex)' }}
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
        </article>
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
        handleToggleSidebar
    } = useAppState();
    
    const username = localSettings?.username || 'User';
    const profilePicUrl = localSettings?.profilePicUrl || '';

    const recentEntries = React.useMemo(() => {
        if (!allEntries) return [];
        return [...allEntries].sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()).slice(0, 3);
    }, [allEntries]);

    return (
        <div className="flex flex-col h-full bg-transparent overflow-y-auto custom-scrollbar">
            {/* Mobile Layout - Simplified and Intentional */}
            <div className="md:hidden">
                {/* App Branding Header */}
                <header className="px-4 py-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <Logo className="w-7 h-7" animate={false} />
                            <span style={{ fontFamily: 'var(--font-logo)' }} className="text-lg text-slate-900 dark:text-white italic">Curiosity</span>
                        </div>
                        <div className="text-xs text-slate-500 dark:text-gray-400">
                            {format(new Date(), "MMM d")}
                        </div>
                    </div>
                </header>

                {/* Welcome Section - Compact but prominent */}
                <header className="px-4 py-6">
                    <div className="flex items-center space-x-3 mb-2">
                        <ThemedAvatar
                            profilePicUrl={profilePicUrl}
                            username={username}
                            className="w-10 h-10"
                        />
                        <div>
                            <h1 className="text-xl font-bold text-slate-900 dark:text-white" style={{fontFamily: 'var(--font-serif)'}}>
                                {getGreeting()}, {username.split(' ')[0]}!
                            </h1>
                            <p className="text-sm text-slate-600 dark:text-gray-400">
                                {format(new Date(), "EEEE, MMMM d")}
                            </p>
                        </div>
                    </div>
                    <MotivationalQuote />
                </header>

                {/* Quick Actions - Large, touch-friendly buttons */}
                <section className="px-4 mb-8">
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 text-center" style={{fontFamily: 'var(--font-serif)'}}>
                        What would you like to do?
                    </h2>
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={() => handleCreateEntry('journal')}
                            className="flex flex-col items-center justify-center p-5 bg-primary/10 dark:bg-primary/20 rounded-xl border border-primary/20 dark:border-primary/30 transition-all text-primary dark:text-primary-light hover:bg-primary/20 dark:hover:bg-primary/30 active:scale-95"
                        >
                            <Book size={28} className="mb-2" />
                            <span className="font-semibold text-sm">Write Journal</span>
                        </button>
                        <button
                            onClick={() => handleCreateEntry('note')}
                            className="flex flex-col items-center justify-center p-5 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 transition-all text-slate-700 dark:text-gray-200 hover:text-primary dark:hover:text-primary-light active:scale-95"
                        >
                            <Edit3 size={28} className="mb-2" />
                            <span className="font-semibold text-sm">Quick Note</span>
                        </button>
                        <button
                            onClick={() => handleCreateEntry('task')}
                            className="flex flex-col items-center justify-center p-5 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 transition-all text-slate-700 dark:text-gray-200 hover:text-primary dark:hover:text-primary-light active:scale-95"
                        >
                            <CheckSquare size={28} className="mb-2" />
                            <span className="font-semibold text-sm">Add Task</span>
                        </button>
                        <button
                            onClick={() => handleViewChange('goals')}
                            className="flex flex-col items-center justify-center p-5 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 transition-all text-slate-700 dark:text-gray-200 hover:text-primary dark:hover:text-primary-light active:scale-95"
                        >
                            <Target size={28} className="mb-2" />
                            <span className="font-semibold text-sm">Set Goals</span>
                        </button>
                    </div>
                </section>

                {/* Recent Activity - Only show if there's content */}
                {(recentEntries.length > 0 || (activeGoals && activeGoals.length > 0)) && (
                    <section className="px-4 mb-8">
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4" style={{fontFamily: 'var(--font-serif)'}}>
                            Recent Activity
                        </h2>

                        {/* Recent Entries - Show max 2 */}
                        {recentEntries.length > 0 && (
                            <div className="mb-6">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-base font-medium text-slate-700 dark:text-gray-300">Latest Entries</h3>
                                    <button
                                        onClick={() => handleViewChange('list')}
                                        className="text-sm text-primary font-medium"
                                        style={{ color: 'var(--color-primary-hex)' }}
                                    >
                                        View All →
                                    </button>
                                </div>
                                <div className="space-y-3">
                                    {recentEntries.slice(0, 2).map(entry => (
                                        <DashboardEntryItem
                                            key={entry.id}
                                            entry={entry}
                                            onSelect={handleSelectEntry}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Active Goals - Show max 2 */}
                        {activeGoals && activeGoals.length > 0 && (
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-base font-medium text-slate-700 dark:text-gray-300">Active Goals</h3>
                                    <button
                                        onClick={() => handleViewChange('goals')}
                                        className="text-sm text-primary font-medium"
                                        style={{ color: 'var(--color-primary-hex)' }}
                                    >
                                        View All →
                                    </button>
                                </div>
                                <div className="space-y-3">
                                    {activeGoals.slice(0, 2).map(goal => (
                                        <DashboardGoalItem
                                            key={goal.id}
                                            goal={goal}
                                            onSelect={() => handleViewChange('goals')}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </section>
                )}

                {/* On This Day - Only show if there's content */}
                {onThisDayEntries.length > 0 && (
                    <section className="px-4 mb-8">
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center" style={{fontFamily: 'var(--font-serif)'}}>
                            <Gift size={18} className="mr-2 text-primary" style={{color: 'var(--color-primary-hex)'}} />
                            On This Day
                        </h2>
                        <div className="space-y-3">
                            {onThisDayEntries.slice(0, 1).map(entry => (
                                <DashboardEntryItem
                                    key={entry.id}
                                    entry={entry}
                                    onSelect={handleSelectEntry}
                                />
                            ))}
                        </div>
                    </section>
                )}

                {/* Empty State - Only show if truly empty */}
                {recentEntries.length === 0 && (!activeGoals || activeGoals.length === 0) && onThisDayEntries.length === 0 && (
                    <section className="px-4 pb-8">
                        <div className="text-center py-12">
                            <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 dark:bg-primary/20 rounded-full flex items-center justify-center">
                                <Book size={24} className="text-primary" style={{color: 'var(--color-primary-hex)'}} />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2" style={{fontFamily: 'var(--font-serif)'}}>
                                Welcome to Curiosity!
                            </h3>
                            <p className="text-slate-600 dark:text-gray-400 mb-6 max-w-sm mx-auto">
                                Start your journey of self-discovery. Create your first journal entry or set a goal to get started.
                            </p>
                            <button
                                onClick={() => handleCreateEntry('journal')}
                                className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors active:scale-95"
                                style={{ backgroundColor: 'var(--color-primary-hex)' }}
                            >
                                Write Your First Entry
                            </button>
                        </div>
                    </section>
                )}
            </div>

            {/* Desktop Layout - Original implementation */}
            <div className="hidden md:flex flex-col h-full bg-transparent overflow-y-auto custom-scrollbar p-4 md:p-6 lg:p-8">
                <header className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white" style={{fontFamily: 'var(--font-serif)'}}>
                            {getGreeting()}, {username.split(' ')[0]}!
                        </h1>
                        <p className="text-base text-slate-600 dark:text-gray-400">
                            {format(new Date(), "EEEE, MMMM d")}
                        </p>
                        <MotivationalQuote />
                    </div>
                    <ThemedAvatar
                        profilePicUrl={profilePicUrl}
                        username={username}
                        className="w-12 h-12"
                    />
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">

                    <main className="lg:col-span-2 space-y-8">
                        <section>
                            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-3" style={{fontFamily: 'var(--font-serif)'}}>
                                Quick Add
                            </h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                <button
                                    onClick={() => handleCreateEntry('journal')}
                                    className="flex flex-col items-center justify-center p-6 bg-primary/10 dark:bg-primary/20 rounded-lg shadow-md hover:shadow-lg border border-primary/20 dark:border-primary/30 transition-all text-primary dark:text-primary-light hover:bg-primary/20 dark:hover:bg-primary/30 transform hover:-translate-y-1"
                                >
                                    <Book size={32} className="mb-2" />
                                    <span className="font-semibold">New Journal</span>
                                </button>
                                <button
                                    onClick={() => handleCreateEntry('note')}
                                    className="flex flex-col items-center justify-center p-6 bg-white dark:bg-slate-800 rounded-lg shadow-md hover:shadow-lg border border-slate-200 dark:border-slate-700 transition-all text-slate-700 dark:text-gray-200 hover:text-primary dark:hover:text-primary-light transform hover:-translate-y-1"
                                >
                                    <Edit3 size={32} className="mb-2" />
                                    <span className="font-semibold">New Note</span>
                                </button>
                                <button
                                    onClick={() => handleCreateEntry('task')}
                                    className="flex flex-col items-center justify-center p-6 bg-white dark:bg-slate-800 rounded-lg shadow-md hover:shadow-lg border border-slate-200 dark:border-slate-700 transition-all text-slate-700 dark:text-gray-200 hover:text-primary dark:hover:text-primary-light transform hover:-translate-y-1"
                                >
                                    <CheckSquare size={32} className="mb-2" />
                                    <span className="font-semibold">New Task</span>
                                </button>
                            </div>
                        </section>
                    
                    <section>
                        <div className="flex items-center space-x-2 mb-3">
                            <Clock size={20} className="text-slate-600 dark:text-gray-400" />
                            <h2 className="text-xl font-semibold text-slate-900 dark:text-white" style={{fontFamily: 'var(--font-serif)'}}>
                                Recent Entries
                            </h2>
                        </div>
                         {recentEntries.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {recentEntries.map(entry => (
                                    <DashboardEntryItem 
                                        key={entry.id} 
                                        entry={entry}
                                        onSelect={handleSelectEntry} 
                                    />
                                ))}
                            </div>
                         ) : (
                            <div className="text-center py-10 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
                                <p className="text-slate-500 dark:text-gray-400">You haven't written any entries yet.</p>
                                <p className="text-slate-500 dark:text-gray-400 text-sm">Click "Quick Add" to get started!</p>
                            </div>
                         )}
                    </section>
                </main>
                
                <aside className="lg:col-span-1 space-y-8">
                    <section>
                        <div className="flex items-center justify-between space-x-2 mb-3">
                            <div className="flex items-center space-x-2">
                                <Target size={20} className="text-slate-600 dark:text-gray-400" />
                                <h2 className="text-xl font-semibold text-slate-900 dark:text-white" style={{fontFamily: 'var(--font-serif)'}}>
                                    Active Goals
                                </h2>
                            </div>
                            <button 
                                onClick={() => handleViewChange('goals')}
                                className="flex items-center space-x-1 text-sm font-medium text-primary"
                                style={{ color: 'var(--color-primary-hex)' }}
                            >
                                <span>View All</span>
                                <ArrowRight size={16} />
                            </button>
                        </div>
                         {activeGoals && activeGoals.length > 0 ? (
                            <div className="grid grid-cols-1 gap-4">
                                {activeGoals.slice(0, 3).map(goal => (
                                    <DashboardGoalItem 
                                        key={goal.id} 
                                        goal={goal}
                                        onSelect={() => handleViewChange('goals')} 
                                    />
                                ))}
                            </div>
                         ) : (
                            <div className="text-center py-10 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
                                <p className="text-slate-500 dark:text-gray-400">You have no active goals.</p>
                                <p className="text-slate-500 dark:text-gray-400 text-sm">Click "View All" to create one!</p>
                            </div>
                         )}
                    </section>
                    
                    {onThisDayEntries.length > 0 && (
                        <section>
                            <div className="flex items-center space-x-2 mb-3">
                                <Gift size={20} className="text-primary" style={{color: 'var(--color-primary-hex)'}} />
                                <h2 className="text-xl font-semibold text-slate-900 dark:text-white" style={{fontFamily: 'var(--font-serif)'}}>
                                    On This Day
                                </h2>
                            </div>
                            <div className="grid grid-cols-1 gap-4">
                                {onThisDayEntries.slice(0, 2).map(entry => (
                                    <DashboardEntryItem 
                                        key={entry.id} 
                                        entry={entry}
                                        onSelect={handleSelectEntry} 
                                    />
                                ))}
                            </div>
                        </section>
                    )}
                </aside>

            </div>
            </div>
        </div>
    );
}