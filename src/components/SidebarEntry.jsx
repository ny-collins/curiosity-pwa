import React from 'react';
import { motion } from 'framer-motion';
import { LayoutDashboard, Book, Calendar, Target, Shield, Bell, Settings, ArrowLeftToLine, ArrowRightToLine, Lock } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import Logo from './Logo';
import CreateEntryMenu from './CreateEntryMenu';
import ThemedAvatar from './ThemedAvatar';

const NavItem = ({ icon, label, isActive, isExpanded, onClick }) => {
    const Icon = icon;
    const activeClass = isActive ? 'bg-primary/10 text-primary' : 'text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-slate-700';
    
    return (
        <button
            onClick={onClick}
            className={`flex items-center space-x-3 h-10 px-3 rounded-lg transition-colors duration-150 ${activeClass} ${isExpanded ? 'w-full' : 'w-10'}`}
            style={{ 
                color: isActive ? 'var(--color-primary-hex)' : '',
                backgroundColor: isActive ? 'rgba(var(--color-primary-rgb), 0.1)' : ''
            }}
            title={label}
        >
            <Icon size={20} className="flex-shrink-0" />
            {isExpanded && <span className="text-sm font-medium truncate">{label}</span>}
        </button>
    );
};

export default function Sidebar() {
    const { 
        currentView, 
        handleViewChange, 
        isSidebarExpanded, 
        handleToggleSidebar,
        handleLockApp,
        appPin,
        settings,
        currentUser
    } = useAppContext();

    return (
        <motion.div
            layout
            transition={{ type: 'spring', stiffness: 400, damping: 40 }}
            className={`flex flex-col h-full bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 shadow-lg ${isSidebarExpanded ? 'w-64' : 'w-16'}`}
        >
            <div className={`flex items-center h-16 px-3 border-b border-slate-200 dark:border-slate-700 ${isSidebarExpanded ? 'justify-between' : 'justify-center'}`}>
                {isSidebarExpanded && (
                    <div className="flex items-center space-x-2">
                        <Logo className="w-8 h-8" animate={false} />
                        <span style={{ fontFamily: 'var(--font-logo)' }} className="text-2xl text-slate-900 dark:text-white italic">Curiosity</span>
                    </div>
                )}
                <button 
                    onClick={handleToggleSidebar} 
                    className="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                    {isSidebarExpanded ? <ArrowLeftToLine size={18} /> : <ArrowRightToLine size={18} />}
                </button>
            </div>
            
            <div className="flex-1 flex flex-col p-3 space-y-2 overflow-y-auto">
                <CreateEntryMenu isExpanded={isSidebarExpanded} />
                
                <nav className="space-y-1">
                    <NavItem 
                        icon={LayoutDashboard} 
                        label="Dashboard" 
                        isActive={currentView === 'dashboard'}
                        isExpanded={isSidebarExpanded}
                        onClick={() => handleViewChange('dashboard')}
                    />
                    <NavItem 
                        icon={Book} 
                        label="Entries" 
                        isActive={currentView === 'list'}
                        isExpanded={isSidebarExpanded}
                        onClick={() => handleViewChange('list')}
                    />
                    <NavItem 
                        icon={Calendar} 
                        label="Calendar" 
                        isActive={currentView === 'calendar'}
                        isExpanded={isSidebarExpanded}
                        onClick={() => handleViewChange('calendar')}
                    />
                    <NavItem 
                        icon={Target} 
                        label="Goals" 
                        isActive={currentView === 'goals'}
                        isExpanded={isSidebarExpanded}
                        onClick={() => handleViewChange('goals')}
                    />
                    <NavItem 
                        icon={Shield} 
                        label="Vault" 
                        isActive={currentView === 'vault'}
                        isExpanded={isSidebarExpanded}
                        onClick={() => handleViewChange('vault')}
                    />
                    <NavItem 
                        icon={Bell} 
                        label="Reminders" 
                        isActive={currentView === 'reminders'}
                        isExpanded={isSidebarExpanded}
                        onClick={() => handleViewChange('reminders')}
                    />
                </nav>
            </div>
            
            <div className="p-3 border-t border-slate-200 dark:border-slate-700 space-y-2">
                {appPin && (
                     <NavItem 
                        icon={Lock} 
                        label="Lock App" 
                        isActive={false}
                        isExpanded={isSidebarExpanded}
                        onClick={handleLockApp}
                    />
                )}
                <div 
                    onClick={() => handleViewChange('settings')}
                    className="flex items-center space-x-2 p-2 rounded-lg cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                    <ThemedAvatar 
                        profilePicUrl={settings?.profilePicUrl || currentUser?.photoURL}
                        username={settings?.username}
                        className="w-8 h-8"
                    />
                    {isSidebarExpanded && (
                        <div className="flex-1 truncate">
                            <span className="text-sm font-semibold text-slate-800 dark:text-white block truncate">
                                {settings?.username || 'Curious User'}
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}