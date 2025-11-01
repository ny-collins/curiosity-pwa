import React from 'react';
import { Settings, Plus, BookOpen, CalendarDays, LogOut, ChevronLeft, ChevronRight, User } from 'lucide-react';
import { signOut } from "firebase/auth";
import { auth } from '../firebaseConfig';
import ThemedAvatar from './ThemedAvatar';
import Logo from './Logo';

const SidebarHeader = ({ isExpanded, onToggleExpand, settings }) => (
    <div className={`flex items-center justify-between p-4 ${isExpanded ? 'flex-row' : 'flex-col'} relative`}>
        <div className={`flex items-center ${isExpanded ? 'space-x-2' : ''}`}>
            <Logo className="w-8 h-8 flex-shrink-0" />
            <span 
                style={{ fontFamily: 'var(--font-logo)' }} 
                className={`text-2xl text-slate-900 dark:text-white font-medium overflow-hidden transition-all duration-300 ${isExpanded ? 'opacity-100 max-w-xs' : 'opacity-0 max-w-0'}`}
            >
                Curiosity
            </span>
        </div>
        <button 
            onClick={onToggleExpand} 
            className="p-1 rounded-full text-slate-500 dark:text-gray-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white focus:outline-none focus:ring-2"
            style={{'--tw-ring-color': 'var(--color-primary-hex)'}}
            title={isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
        >
            {isExpanded ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>
    </div>
);

const UserProfile = ({ settings, isExpanded }) => {
    const handleSignOut = () => {
        signOut(auth).catch((error) => console.error("Sign out error", error));
    };

    return (
        <div className={`p-4 border-t border-slate-200 dark:border-slate-700 ${isExpanded ? 'flex items-center justify-between' : 'flex flex-col items-center'}`}>
            <div className={`flex items-center ${isExpanded ? 'space-x-2' : ''}`}>
                <ThemedAvatar 
                    profilePicUrl={settings?.profilePicUrl}
                    username={settings?.username}
                    className="w-8 h-8 flex-shrink-0"
                />
                <span className={`text-sm font-medium text-slate-800 dark:text-gray-200 overflow-hidden transition-all duration-300 ${isExpanded ? 'opacity-100 max-w-xs' : 'opacity-0 max-w-0'}`}>
                    {settings?.username || 'User'}
                </span>
            </div>
            <button 
                onClick={handleSignOut} 
                className={`p-1.5 rounded-md text-slate-500 dark:text-gray-400 hover:bg-red-100 dark:hover:bg-red-800/20 hover:text-red-600 dark:hover:text-red-500 transition-colors ${isExpanded ? '' : 'mt-2'}`}
                title="Sign Out"
            >
                <LogOut size={18} />
            </button>
        </div>
    );
};

const SidebarNavLink = ({ icon: Icon, label, isExpanded, isActive, isPrimary, onClick }) => {
    const primaryClasses = "text-white dark:text-white";
    const activeClasses = "bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white";
    const inactiveClasses = "text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700";

    const baseClasses = "flex items-center p-3 rounded-lg transition-colors duration-200 w-full";
    const expandedClasses = "space-x-3";
    const collapsedClasses = "justify-center";

    return (
        <button
            onClick={onClick}
            className={`
                ${baseClasses} 
                ${isExpanded ? expandedClasses : collapsedClasses}
                ${isPrimary ? primaryClasses : (isActive ? activeClasses : inactiveClasses)}
            `}
            style={{ 
                backgroundColor: isPrimary ? 'var(--color-primary-hex)' : undefined,
                '--tw-ring-color': 'var(--color-primary-hex)'
            }}
        >
            <Icon size={20} className="flex-shrink-0" />
            <span className={`font-medium text-sm whitespace-nowrap overflow-hidden transition-all duration-300 ${isExpanded ? 'opacity-100 max-w-xs' : 'opacity-0 max-w-0'}`}>
                {label}
            </span>
        </button>
    );
};


export default function Sidebar({ 
    onCreate, 
    onShowSettings, 
    className, 
    settings,
    currentView,
    onViewChange,
    isExpanded,
    onToggleExpand 
}) {
    return (
        <aside className={`flex flex-col bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 shadow-lg transition-all duration-300 ease-in-out ${isExpanded ? 'w-64' : 'w-16'} ${className}`}>
            <SidebarHeader isExpanded={isExpanded} onToggleExpand={onToggleExpand} settings={settings} />
            
            <nav className="flex-1 flex flex-col p-2 space-y-1 overflow-y-auto custom-scrollbar">
                <SidebarNavLink 
                    icon={Plus} 
                    label="New Entry" 
                    onClick={onCreate}
                    isExpanded={isExpanded}
                    isPrimary={true}
                />
                <hr className="border-t border-slate-200 dark:border-slate-700 mx-2 my-2"/>
                <SidebarNavLink 
                    icon={BookOpen} 
                    label="Entries" 
                    onClick={() => onViewChange('list')}
                    isActive={currentView === 'list'}
                    isExpanded={isExpanded}
                />
                <SidebarNavLink 
                    icon={CalendarDays} 
                    label="Calendar" 
                    onClick={() => onViewChange('calendar')}
                    isActive={currentView === 'calendar'}
                    isExpanded={isExpanded}
                />
            </nav>

            <div className="p-2 border-t border-slate-200 dark:border-slate-700">
                <SidebarNavLink 
                    icon={Settings} 
                    label="Settings" 
                    onClick={() => onViewChange('settings')}
                    isActive={currentView === 'settings'}
                    isExpanded={isExpanded}
                />
                 <UserProfile settings={settings} isExpanded={isExpanded} />
            </div>
        </aside>
    );
}
