import React from 'react';
import { LayoutDashboard, Book, Target, Shield, Bell } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import CreateEntryMenu from './CreateEntryMenu';

const NavItem = ({ icon, label, isActive, onClick }) => {
    const Icon = icon;
    const activeClass = isActive ? 'text-primary' : 'text-slate-500 dark:text-gray-400';
    
    return (
        <button
            onClick={onClick}
            className={`flex flex-col items-center justify-center space-y-1 w-full ${activeClass}`}
            style={{ color: isActive ? 'var(--color-primary-hex)' : '' }}
        >
            <Icon size={22} />
            <span className="text-xs font-medium">{label}</span>
        </button>
    );
};

export default function BottomNavBar() {
    const { currentView, handleViewChange } = useAppContext();

    return (
        <div className="fixed bottom-0 left-0 right-0 h-16 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex md:hidden items-center z-20">
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
            
            <div className="w-20 flex justify-center">
                 <CreateEntryMenu isExpanded={false} />
            </div>
           
            <NavItem 
                icon={Target} 
                label="Goals" 
                isActive={currentView === 'goals'}
                onClick={() => handleViewChange('goals')}
            />
            <NavItem 
                icon={Bell} 
                label="Reminders" 
                isActive={currentView === 'reminders'}
                onClick={() => handleViewChange('reminders')}
            />
        </div>
    );
}