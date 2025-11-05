import React from 'react';
import { LayoutDashboard, Book, Calendar, Target, Shield, Settings } from 'lucide-react';
import { useAppState } from '../contexts/StateProvider';
import CreateEntryMenu from './CreateEntryMenu';

const NavItem = ({ icon, label, isActive, onClick }) => {
    const Icon = icon;
    const activeClass = isActive ? 'text-primary' : 'text-slate-500 dark:text-gray-400';

    return (
        <button
            onClick={onClick}
            className={`flex flex-col items-center justify-center space-y-1 w-full py-2 px-1 min-h-[3rem] ${activeClass} active:scale-95 transition-transform`}
            style={{ color: isActive ? 'var(--color-primary-hex)' : '' }}
        >
            <Icon size={20} />
            <span className="text-xs font-medium leading-tight">{label}</span>
        </button>
    );
};

export default function BottomNavBar() {
    const { currentView, handleViewChange } = useAppState();

    return (
        <div className="fixed bottom-0 left-0 right-0 h-16 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 md:hidden z-20 shadow-lg">
            <div className="flex items-stretch min-w-max px-1 h-full">
                <NavItem
                    icon={LayoutDashboard}
                    label="Home"
                    isActive={currentView === 'dashboard'}
                    onClick={() => handleViewChange('dashboard')}
                />
                <NavItem
                    icon={Book}
                    label="Entries"
                    isActive={currentView === 'list'}
                    onClick={() => handleViewChange('list')}
                />

                <div className="w-16 flex justify-center items-center">
                     <CreateEntryMenu isExpanded={false} />
                </div>

                <NavItem
                    icon={Calendar}
                    label="Calendar"
                    isActive={currentView === 'calendar'}
                    onClick={() => handleViewChange('calendar')}
                />
                <NavItem
                    icon={Target}
                    label="Goals"
                    isActive={currentView === 'goals'}
                    onClick={() => handleViewChange('goals')}
                />
                <NavItem
                    icon={Settings}
                    label="Settings"
                    isActive={currentView === 'settings'}
                    onClick={() => handleViewChange('settings')}
                />
            </div>
        </div>
    );
}