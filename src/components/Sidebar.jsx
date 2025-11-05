import React from 'react';
import { motion } from 'framer-motion';
import { LayoutDashboard, Book, Calendar, Target, Shield, Bell, Settings, ArrowLeftToLine, ArrowRightToLine, Lock } from 'lucide-react';
import { useAppState } from '../contexts/StateProvider';
import Logo from './Logo';
import CreateEntryMenu from './CreateEntryMenu';
import ThemedAvatar from './ThemedAvatar';

const NavItem = ({ icon, label, isActive, isExpanded, onClick }) => {
    const Icon = icon;
    const activeClass = isActive ? 'text-primary' : 'text-secondary hover:bg-secondary';
    
    return (
        <button
            onClick={onClick}
            className={`flex items-center space-x-3 h-10 px-3 rounded-lg transition-colors duration-150 ${activeClass} ${isExpanded ? 'w-full' : 'w-10'}`}
            style={{ 
                color: isActive ? 'var(--color-primary-hex)' : 'var(--color-text-secondary)',
                backgroundColor: isActive ? 'rgba(var(--color-primary-rgb), 0.1)' : '',
                '--tw-hover-bg': isActive ? '' : 'var(--color-bg-secondary)'
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
        localSettings,
        currentUser
    } = useAppState();

    return (
        <motion.div
            layout
            transition={{ type: 'spring', stiffness: 400, damping: 40 }}
            className={`flex flex-col h-full shadow-lg ${isSidebarExpanded ? 'w-64' : 'w-16'}`}
            style={{
                backgroundColor: 'var(--color-bg-content)',
                borderRightColor: 'var(--color-border)'
            }}
        >
            <div className={`flex items-center h-16 px-3 ${isSidebarExpanded ? 'justify-between' : 'justify-center'}`}
                 style={{ borderBottomColor: 'var(--color-border)' }}>
                {isSidebarExpanded && (
                    <div className="flex items-center space-x-2">
                        <Logo className="w-8 h-8" animate={false} />
                        <span style={{ fontFamily: 'var(--font-logo)', color: 'var(--color-text-primary)' }} className="text-2xl italic">Curiosity</span>
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
                        isExpanded={true}
                        onClick={() => handleViewChange('dashboard')}
                    />
                    <NavItem 
                        icon={Book} 
                        label="Entries" 
                        isActive={currentView === 'list'}
                        isExpanded={true}
                        onClick={() => handleViewChange('list')}
                    />
                    <NavItem 
                        icon={Calendar} 
                        label="Calendar" 
                        isActive={currentView === 'calendar'}
                        isExpanded={true}
                        onClick={() => handleViewChange('calendar')}
                    />
                    <NavItem 
                        icon={Target} 
                        label="Goals" 
                        isActive={currentView === 'goals'}
                        isExpanded={true}
                        onClick={() => handleViewChange('goals')}
                    />
                    <NavItem 
                        icon={Shield} 
                        label="Vault" 
                        isActive={currentView === 'vault'}
                        isExpanded={true}
                        onClick={() => handleViewChange('vault')}
                    />
                    <NavItem 
                        icon={Bell} 
                        label="Reminders" 
                        isActive={currentView === 'reminders'}
                        isExpanded={true}
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
                        profilePicUrl={localSettings?.profilePicUrl || currentUser?.photoURL}
                        username={localSettings?.username}
                        className="w-8 h-8"
                    />
                    {isSidebarExpanded && (
                        <div className="flex-1 truncate">
                            <span className="text-sm font-semibold text-slate-800 dark:text-white block truncate">
                                {localSettings?.username || 'Curious User'}
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}