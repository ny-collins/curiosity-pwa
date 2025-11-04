import React from 'react';
import { useAppContext } from '../context/AppContext';
import { format, getDay, parseISO } from 'date-fns';
import { Book, CheckSquare, Edit3, Clock, Gift, Target, ArrowRight } from 'lucide-react';
import { ENTRY_TYPES, getEntryType } from '../constants.js';
import { stripMarkdown, formatTimestamp } from '../utils.js';
import ThemedAvatar from './ThemedAvatar';

const DashboardEntryItem = ({ entry, onSelect }) => {
    const entryType = getEntryType(entry.type);
    const snippet = stripMarkdown(entry.content || '').substring(0, 100);

    return (
        <article 
            className="p-4 rounded-lg bg-white dark:bg-slate-800 shadow-md hover:shadow-lg border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
            onClick={() => onSelect(entry.id)}
        >
            <div className="flex justify-between items-start">
                <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-1 line-clamp-1" style={{ fontFamily: 'var(--font-serif)' }}>
                    {entry.title || "Untitled Entry"}
                </h3>
                <span className="flex-shrink-0 p-1.5 bg-primary-light rounded-full ml-2" style={{ backgroundColor: 'rgba(var(--color-primary-rgb), 0.1)'}}>
                    <entryType.icon size={12} style={{ color: 'var(--color-primary-hex)'}} />
                </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-gray-400 mb-2">
                {formatTimestamp(entry.updatedAt || entry.createdAt, true)}
            </p>
            <p className="text-sm text-slate-600 dark:text-gray-300 leading-relaxed line-clamp-2" style={{ fontFamily: 'var(--font-serif)' }}>
                {snippet}{snippet.length === 100 && '...'}
            </p>
        </article>
    );
};

const DashboardGoalItem = ({ goal, onSelect }) => {
    return (
        <article 
            className="p-4 rounded-lg bg-white dark:bg-slate-800 shadow-md hover:shadow-lg border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
            onClick={onSelect}
        >
            <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-2 line-clamp-1" style={{ fontFamily: 'var(--font-serif)' }}>
                {goal.title}
            </h3>
            
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 mb-1">
                <div 
                    className="h-2 rounded-full transition-all" 
                    style={{ width: `${goal.progress}%`, backgroundColor: 'var(--color-primary-hex)' }}
                />
            </div>
            <p className="text-xs text-slate-500 dark:text-gray-400">
                {goal.completedTaskCount} of {goal.taskCount} tasks complete
            </p>
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
        settings,
        allEntries,
        onThisDayEntries,
        activeGoals,
        handleSelectEntry,
        handleCreateEntry,
        handleViewChange
    } = useAppContext();
    
    const username = settings?.username || 'User';
    const profilePicUrl = settings?.profilePicUrl || '';

    const recentEntries = React.useMemo(() => {
        if (!allEntries) return [];
        return [...allEntries].sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()).slice(0, 3);
    }, [allEntries]);

    return (
        <div className="flex flex-col h-full bg-transparent overflow-y-auto custom-scrollbar p-4 md:p-6 lg:p-8">
            <header className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white" style={{fontFamily: 'var(--font-serif)'}}>
                        {getGreeting()}, {username.split(' ')[0]}!
                    </h1>
                    <p className="text-base text-slate-600 dark:text-gray-400">
                        {format(new Date(), "EEEE, MMMM d")}
                    </p>
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
                                className="flex flex-col items-center justify-center p-6 bg-white dark:bg-slate-800 rounded-lg shadow-md hover:shadow-lg border border-slate-200 dark:border-slate-700 transition-all text-slate-700 dark:text-gray-200 hover:text-primary dark:hover:text-primary-light"
                            >
                                <Book size={24} className="mb-2" />
                                <span className="font-semibold">New Journal</span>
                            </button>
                            <button
                                onClick={() => handleCreateEntry('note')}
                                className="flex flex-col items-center justify-center p-6 bg-white dark:bg-slate-800 rounded-lg shadow-md hover:shadow-lg border border-slate-200 dark:border-slate-700 transition-all text-slate-700 dark:text-gray-200 hover:text-primary dark:hover:text-primary-light"
                            >
                                <Edit3 size={24} className="mb-2" />
                                <span className="font-semibold">New Note</span>
                            </button>
                            <button
                                onClick={() => handleCreateEntry('task')}
                                className="flex flex-col items-center justify-center p-6 bg-white dark:bg-slate-800 rounded-lg shadow-md hover:shadow-lg border border-slate-200 dark:border-slate-700 transition-all text-slate-700 dark:text-gray-200 hover:text-primary dark:hover:text-primary-light"
                            >
                                <CheckSquare size={24} className="mb-2" />
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
    );
}