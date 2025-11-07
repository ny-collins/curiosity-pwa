import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Book, Calendar, Target, Shield, Bell, Settings, Lock, LogOut, ChevronRight, PanelLeftClose, PanelLeft } from 'lucide-react';
import { useAppState } from '../contexts/StateProvider';
import Logo from './Logo';
import CreateEntryMenu from './CreateEntryMenu';
import ThemedAvatar from './ThemedAvatar';

const NavItem = ({ icon, label, isActive, onClick, badge, isCollapsed }) => {
    const Icon = icon;
    const [isHovered, setIsHovered] = useState(false);
    
    return (
        <motion.button
            onClick={onClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={`relative flex items-center w-full ${isCollapsed ? 'justify-center px-0' : 'px-4'} py-2.5 rounded-xl transition-all duration-200 group`}
            style={{ 
                color: isActive ? 'var(--color-primary-hex)' : 'var(--color-text-secondary)',
                backgroundColor: isActive ? 'rgba(var(--color-primary-rgb), 0.1)' : 'transparent',
            }}
            whileHover={{ x: isCollapsed ? 0 : 4 }}
            whileTap={{ scale: 0.98 }}
            title={isCollapsed ? label : ''}
        >
            {/* Active indicator bar */}
            <motion.div
                className="absolute left-0 top-1/2 -translate-y-1/2 w-1 rounded-r-full"
                style={{ backgroundColor: 'var(--color-primary-hex)' }}
                initial={{ height: 0, opacity: 0 }}
                animate={{ 
                    height: isActive ? '60%' : 0,
                    opacity: isActive ? 1 : 0
                }}
                transition={{ duration: 0.2 }}
            />
            
            {/* Icon with subtle animation */}
            <motion.div
                animate={{ 
                    scale: isHovered ? 1.1 : 1,
                    rotate: isHovered ? [0, -5, 5, 0] : 0
                }}
                transition={{ duration: 0.3 }}
            >
                <Icon size={20} className="flex-shrink-0" />
            </motion.div>
            
            {/* Label - hidden when collapsed */}
            {!isCollapsed && (
                <span className="ml-3 text-sm font-medium">{label}</span>
            )}
            
            {/* Badge (e.g., for notifications) - hidden when collapsed */}
            {badge && !isCollapsed && (
                <motion.span
                    className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                >
                    {badge}
                </motion.span>
            )}
            
            {/* Hover arrow - hidden when collapsed */}
            {!isCollapsed && (
                <motion.div
                    className="ml-auto"
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ 
                        opacity: isHovered && !isActive ? 1 : 0,
                        x: isHovered && !isActive ? 0 : -5
                    }}
                    transition={{ duration: 0.2 }}
                >
                    <ChevronRight size={16} />
                </motion.div>
            )}
        </motion.button>
    );
};

export default function Sidebar() {
    const { 
        currentView, 
        handleViewChange, 
        handleLockApp,
        handleToggleSidebar,
        isSidebarExpanded,
        appPin,
        localSettings,
        currentUser,
        reminders
    } = useAppState();

    const username = localSettings?.username || 'User';
    const profilePicUrl = localSettings?.profilePicUrl || '';
    
    // Count upcoming reminders for badge
    const upcomingRemindersCount = reminders?.filter(r => new Date(r.date) > new Date()).length || 0;

    return (
        <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ 
                x: 0, 
                opacity: 1,
                width: 256
            }}
            transition={{ duration: 0.3, type: 'spring', stiffness: 300, damping: 30 }}
            className="flex flex-col h-full shadow-2xl relative md:w-auto"
            style={{
                backgroundColor: 'var(--color-bg-content)',
                borderRight: '1px solid var(--color-border)',
                width: window.innerWidth >= 768 ? (isSidebarExpanded ? 256 : 64) : 256
            }}
        >
            {/* App Branding */}
            <div className="flex items-center justify-between h-16 px-4 border-b" style={{ borderBottomColor: 'var(--color-border)' }}>
                <motion.div 
                    className={`flex items-center ${isSidebarExpanded ? 'space-x-2.5' : 'justify-center w-full'}`}
                    whileHover={{ scale: 1.02 }}
                >
                    <Logo className="w-8 h-8" animate={true} />
                    {isSidebarExpanded && (
                        <span 
                            style={{ fontFamily: 'var(--font-logo)', color: 'var(--color-text-primary)' }} 
                            className="text-2xl italic font-bold bg-gradient-to-r from-primary via-primary to-primary bg-clip-text"
                        >
                            Curiosity
                        </span>
                    )}
                </motion.div>
                {isSidebarExpanded && (
                    <motion.button
                        onClick={handleToggleSidebar}
                        className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        title="Collapse sidebar"
                    >
                        <PanelLeftClose size={18} style={{ color: 'var(--color-text-muted)' }} />
                    </motion.button>
                )}
            </div>
            
            {/* Main Navigation */}
            <div className="flex-1 flex flex-col px-3 py-4 space-y-6 overflow-y-auto custom-scrollbar">
                {/* Expand button when collapsed */}
                {!isSidebarExpanded && (
                    <motion.button
                        onClick={handleToggleSidebar}
                        className="w-full p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-center"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        title="Expand sidebar"
                    >
                        <PanelLeft size={20} style={{ color: 'var(--color-text-muted)' }} />
                    </motion.button>
                )}
                
                {/* Create Entry Button */}
                <div>
                    <CreateEntryMenu isExpanded={isSidebarExpanded} />
                </div>
                
                {/* Navigation Links */}
                <nav className="space-y-1">
                    {!isSidebarExpanded ? null : (
                        <div className="text-xs font-semibold text-slate-500 dark:text-gray-400 px-4 mb-2 uppercase tracking-wider">
                            Navigation
                        </div>
                    )}
                    <NavItem 
                        icon={LayoutDashboard} 
                        label="Dashboard" 
                        isActive={currentView === 'dashboard'}
                        onClick={() => handleViewChange('dashboard')}
                        isCollapsed={!isSidebarExpanded}
                    />
                    <NavItem 
                        icon={Book} 
                        label="All Entries" 
                        isActive={currentView === 'list'}
                        onClick={() => handleViewChange('list')}
                        isCollapsed={!isSidebarExpanded}
                    />
                    <NavItem 
                        icon={Calendar} 
                        label="Calendar" 
                        isActive={currentView === 'calendar'}
                        onClick={() => handleViewChange('calendar')}
                        isCollapsed={!isSidebarExpanded}
                    />
                    <NavItem 
                        icon={Target} 
                        label="Goals" 
                        isActive={currentView === 'goals'}
                        onClick={() => handleViewChange('goals')}
                        isCollapsed={!isSidebarExpanded}
                    />
                    <NavItem 
                        icon={Shield} 
                        label="Vault" 
                        isActive={currentView === 'vault'}
                        onClick={() => handleViewChange('vault')}
                        isCollapsed={!isSidebarExpanded}
                    />
                    <NavItem 
                        icon={Bell} 
                        label="Reminders" 
                        isActive={currentView === 'reminders'}
                        onClick={() => handleViewChange('reminders')}
                        badge={upcomingRemindersCount > 0 ? upcomingRemindersCount : null}
                        isCollapsed={!isSidebarExpanded}
                    />
                </nav>
            </div>
            
            {/* Profile Section */}
            <motion.div 
                className="p-3 border-t space-y-2" 
                style={{ borderTopColor: 'var(--color-border)' }}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
            >
                {/* Lock App */}
                {appPin && (
                    <NavItem 
                        icon={Lock} 
                        label="Lock App" 
                        isActive={false}
                        onClick={handleLockApp}
                        isCollapsed={!isSidebarExpanded}
                    />
                )}
                
                {/* User Profile Card - Single access point for Settings */}
                <motion.div 
                    onClick={() => handleViewChange('settings')}
                    className={`flex items-center ${isSidebarExpanded ? 'space-x-3' : 'justify-center'} p-3 rounded-xl cursor-pointer transition-all duration-200 group relative overflow-hidden`}
                    style={{ 
                        backgroundColor: currentView === 'settings' ? 'var(--color-primary-light)' : 'var(--color-bg-secondary)',
                        border: currentView === 'settings' ? '1px solid var(--color-primary-hex)' : '1px solid transparent'
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    title="Settings & Profile"
                >
                    {/* Gradient overlay on hover */}
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-primary/5 to-primary/10"
                        initial={{ opacity: 0 }}
                        whileHover={{ opacity: 1 }}
                        transition={{ duration: 0.2 }}
                    />
                    
                    <ThemedAvatar 
                        profilePicUrl={profilePicUrl || currentUser?.photoURL}
                        username={username}
                        className="w-10 h-10 ring-2 ring-white/20 relative z-10"
                    />
                    {isSidebarExpanded && (
                        <>
                            <div className="flex-1 truncate relative z-10">
                                <div className="text-sm font-semibold text-slate-800 dark:text-white truncate">
                                    {username}
                                </div>
                                <div className="text-xs truncate" style={{ 
                                    color: currentView === 'settings' ? 'var(--color-primary-hex)' : 'var(--color-text-muted)' 
                                }}>
                                    {currentUser?.email || 'View Settings'}
                                </div>
                            </div>
                            <motion.div
                                className="relative z-10 transition-opacity"
                                style={{ 
                                    opacity: currentView === 'settings' ? 1 : 0,
                                    color: 'var(--color-primary-hex)'
                                }}
                            >
                                <Settings size={18} />
                            </motion.div>
                            <motion.div
                                className="text-slate-400 relative z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <ChevronRight size={16} />
                            </motion.div>
                        </>
                    )}
                </motion.div>
            </motion.div>
        </motion.div>
    );
}