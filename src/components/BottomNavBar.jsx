import React from 'react';
import { Home, BookOpen, Calendar, Plus, Settings, User } from 'lucide-react';
import ThemedAvatar from './ThemedAvatar';
import CreateEntryMenu from './CreateEntryMenu'; // Import the new menu

function NavButton({ icon: Icon, label, onClick, isActive }) {
    return (
        <button
            onClick={onClick}
            className={`flex flex-col items-center justify-center w-full h-full transition-colors duration-200 ${
                isActive ? 'text-primary' : 'text-slate-500 dark:text-gray-400 hover:text-primary-dark'
            }`}
            style={{ color: isActive ? 'var(--color-primary-hex)' : '' }}
        >
            <Icon size={24} />
            <span className="text-xs font-medium mt-1">{label}</span>
        </button>
    );
}

export default function BottomNavBar({ onCreate, currentView, onViewChange, onShowSettings, settings }) {
    const getUsername = () => {
        if (!settings) return 'User';
        return settings.username || 'User';
    };

    const getProfilePicUrl = () => {
        if (!settings) return null;
        return settings.profilePicUrl || null;
    };

    return (
        <div className="fixed bottom-0 left-0 right-0 h-16 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex md:hidden z-30">
            <div className="w-1/5">
                <NavButton
                    icon={BookOpen}
                    label="Entries"
                    onClick={() => onViewChange('list')}
                    isActive={currentView === 'list' || currentView === 'editor'}
                />
            </div>
            <div className="w-1/5">
                <NavButton
                    icon={Calendar}
                    label="Calendar"
                    onClick={() => onViewChange('calendar')}
                    isActive={currentView === 'calendar'}
                />
            </div>
            
            <div className="w-1/5 flex items-center justify-center">
                <CreateEntryMenu onCreate={onCreate} position="top">
                    <button
                        className="flex items-center justify-center w-14 h-14 -mt-4 rounded-full text-white shadow-lg transition-transform duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-800"
                        style={{ backgroundColor: 'var(--color-primary-hex)', '--tw-ring-color': 'var(--color-primary-hex)' }}
                    >
                        <Plus size={30} />
                    </button>
                </CreateEntryMenu>
            </div>
            
            <div className="w-1/5">
                <NavButton
                    icon={Settings}
                    label="Settings"
                    onClick={onShowSettings}
                    isActive={currentView === 'settings'}
                />
            </div>
            <div className="w-1/5">
                <button
                    onClick={onShowSettings}
                    className={`flex flex-col items-center justify-center w-full h-full transition-colors duration-200 ${
                        currentView === 'settings' ? 'text-primary' : 'text-slate-500 dark:text-gray-400 hover:text-primary-dark'
                    }`}
                >
                    <ThemedAvatar
                        profilePicUrl={getProfilePicUrl()}
                        username={getUsername()}
                        className="w-7 h-7"
                    />
                    <span className="text-xs font-medium mt-1">Me</span>
                </button>
            </div>
        </div>
    );
}
