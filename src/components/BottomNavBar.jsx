import React from 'react';
import { BookOpen, CalendarDays, Plus, User, Settings } from 'lucide-react';
import ThemedAvatar from './ThemedAvatar';

const NavButton = ({ icon: Icon, label, onClick, isActive }) => (
    <button
        onClick={onClick}
        className={`flex flex-col items-center justify-center w-full h-full pt-1 focus:outline-none transition-colors duration-200 ${isActive ? 'text-primary' : 'text-slate-500 dark:text-gray-400 hover:text-slate-800 dark:hover:text-gray-200'}`}
        style={{ color: isActive ? 'var(--color-primary-hex)' : '' }}
    >
        <Icon size={22} />
        <span className="text-xs font-medium">{label}</span>
    </button>
);

const CreateButton = ({ onClick }) => (
    <button
        onClick={onClick}
        className="w-14 h-14 rounded-full text-white shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-800 -mt-6"
        style={{ backgroundColor: 'var(--color-primary-hex)', '--tw-ring-color': 'var(--color-primary-hex)'}}
        title="New Entry"
    >
        <Plus size={28} className="mx-auto" />
    </button>
);

export default function BottomNavBar({ onCreate, currentView, onViewChange, onShowSettings, settings }) {
    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 shadow-lg z-40">
            <div className="flex justify-around items-center h-full max-w-md mx-auto">
                <NavButton
                    icon={BookOpen}
                    label="Entries"
                    onClick={() => onViewChange('list')}
                    isActive={currentView === 'list'}
                />
                <NavButton
                    icon={CalendarDays}
                    label="Calendar"
                    onClick={() => onViewChange('calendar')}
                    isActive={currentView === 'calendar'}
                />
                
                <CreateButton onClick={onCreate} />

                <NavButton
                    icon={Settings}
                    label="Settings"
                    onClick={() => onViewChange('settings')}
                    isActive={currentView === 'settings'}
                />

                <button
                    onClick={() => alert("Profile Clicked")}
                    className={`flex flex-col items-center justify-center w-full h-full pt-1 focus:outline-none`}
                >
                    <ThemedAvatar
                        profilePicUrl={settings?.profilePicUrl}
                        username={settings?.username}
                        className="w-7 h-7"
                    />
                    <span className="text-xs font-medium text-slate-500 dark:text-gray-400">Me</span>
                </button>
            </div>
        </div>
    );
}
