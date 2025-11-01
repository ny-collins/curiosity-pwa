import React from 'react';
import { Plus, Settings, BookOpen, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import Logo from './Logo';
import ThemedAvatar from './ThemedAvatar';
import SidebarEntry from './SidebarEntry';
import CreateEntryMenu from './CreateEntryMenu';

function NavButton({ icon: Icon, label, onClick, isActive, isExpanded }) {
    return (
        <button
            onClick={onClick}
            title={isExpanded ? '' : label}
            className={`flex items-center w-full rounded-lg transition-colors duration-200 ${
                isActive
                    ? 'bg-primary-light text-primary-dark'
                    : 'text-slate-600 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            } ${isExpanded ? 'p-3 space-x-3' : 'p-3 justify-center'}`}
            style={{
                backgroundColor: isActive ? 'var(--color-primary-light)' : 'transparent',
                color: isActive ? 'var(--color-primary-hex)' : '',
            }}
        >
            <Icon size={isExpanded ? 20 : 22} className="flex-shrink-0" />
            {isExpanded && <span className="text-sm font-semibold">{label}</span>}
        </button>
    );
}

export default function Sidebar({ className }) {
    const {
        settings,
        currentView,
        isSidebarExpanded,
        handleCreateEntry,
        handleViewChange,
        handleToggleSidebar
    } = useAppContext();

    const getUsername = () => {
        if (!settings) return 'User';
        return settings.username || 'User';
    };

    const getProfilePicUrl = () => {
        if (!settings) return null;
        return settings.profilePicUrl || null;
    };

    return (
        <aside
            className={`flex flex-col border-r border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 transition-all duration-300 ease-in-out ${
                isSidebarExpanded ? 'w-64' : 'w-16'
            } ${className}`}
        >
            <div className={`p-4 ${isSidebarExpanded ? 'flex justify-between' : 'flex justify-center'}`}>
                {isSidebarExpanded && (
                    <div className="flex items-center space-x-2">
                        <Logo className="w-8 h-8 flex-shrink-0" />
                        <span
                            style={{ fontFamily: 'var(--font-logo)' }}
                            className="text-2xl text-slate-900 dark:text-white"
                        >
                            Curiosity
                        </span>
                    </div>
                )}
                <button
                    onClick={handleToggleSidebar}
                    className="p-1 rounded-full text-slate-500 dark:text-gray-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                    title={isSidebarExpanded ? "Collapse" : "Expand"}
                >
                    {isSidebarExpanded ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
                </button>
            </div>

            <div className="p-3">
                <CreateEntryMenu onCreate={handleCreateEntry} position="right">
                    <button
                        className="flex items-center justify-center space-x-2 w-full text-white font-semibold py-3 px-3 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2"
                        style={{ backgroundColor: 'var(--color-primary-hex)', '--tw-ring-color': 'var(--color-primary-hex)' }}
                    >
                        <Plus size={isSidebarExpanded ? 20 : 22} />
                        {isSidebarExpanded && <span>New Entry</span>}
                    </button>
                </CreateEntryMenu>
            </div>

            <nav className="flex-1 p-3 space-y-2">
                <NavButton
                    icon={BookOpen}
                    label="Entries"
                    onClick={() => handleViewChange('list')}
                    isActive={currentView === 'list' || currentView === 'editor'}
                    isExpanded={isSidebarExpanded}
                />
                <NavButton
                    icon={Calendar}
                    label="Calendar"
                    onClick={() => handleViewChange('calendar')}
                    isActive={currentView === 'calendar'}
                    isExpanded={isSidebarExpanded}
                />
            </nav>

            <div className="p-3 mt-auto">
                <button
                    onClick={() => handleViewChange('settings')}
                    className={`flex items-center w-full rounded-lg transition-colors duration-200 ${
                        currentView === 'settings'
                            ? 'bg-primary-light text-primary-dark'
                            : 'text-slate-600 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    } ${isSidebarExpanded ? 'p-3 space-x-3' : 'p-3 justify-center'}`}
                    style={{
                        backgroundColor: currentView === 'settings' ? 'var(--color-primary-light)' : 'transparent',
                        color: currentView === 'settings' ? 'var(--color-primary-hex)' : '',
                    }}
                >
                    <ThemedAvatar
                        profilePicUrl={getProfilePicUrl()}
                        username={getUsername()}
                        className={isSidebarExpanded ? 'w-8 h-8' : 'w-8 h-8'}
                    />
                    {isSidebarExpanded && (
                        <div className="flex flex-col items-start overflow-hidden">
                            <span className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                                {getUsername()}
                            </span>
                            <span className="text-xs text-slate-500 dark:text-gray-400">
                                View Settings
                            </span>
                        </div>
                    )}
                </button>
            </div>
        </aside>
    );
}
