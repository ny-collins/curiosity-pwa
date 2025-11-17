import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Book, Calendar, Target, Shield, Bell, Settings, Lock, LogOut, ChevronRight, PanelLeftClose, PanelLeft, Search, HelpCircle } from 'lucide-react';
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
            className={`relative flex items-center w-full ${isCollapsed ? 'justify-center px-0' : 'px-4'} py-2.5 rounded-xl transition-all duration-200 group overflow-hidden`}
            style={{
                color: isActive ? 'var(--color-primary-hex)' : 'var(--color-text-secondary)',
                backgroundColor: isActive ? 'rgba(var(--color-primary-rgb), 0.1)' : 'transparent',
            }}
            whileHover={{ x: isCollapsed ? 0 : 4, scale: isCollapsed ? 1.05 : 1 }}
            whileTap={{ scale: 0.98 }}
            title={isCollapsed ? label : ''}
        >
            {/* Shine effect on hover */}
            <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                initial={{ x: '-100%' }}
                animate={{ x: isHovered ? '100%' : '-100%' }}
                transition={{ duration: 0.6 }}
            />
            
            {}
            <motion.div
                className="absolute left-0 top-1/2 -translate-y-1/2 w-1 rounded-r-full"
                style={{ backgroundColor: 'var(--color-primary-hex)' }}
                initial={{ height: 0, opacity: 0 }}
                animate={{
                    height: isActive ? '60%' : 0,
                    opacity: isActive ? 1 : 0
                }}
                transition={{ 
                    type: "spring",
                    stiffness: 400,
                    damping: 20
                }}
            />
            
            {}
            <motion.div
                className="relative z-10"
                animate={{
                    scale: isHovered ? 1.15 : 1,
                    rotate: isHovered ? [0, -8, 8, -8, 0] : 0
                }}
                transition={{ 
                    duration: 0.4,
                    type: isHovered ? "spring" : "tween",
                    stiffness: 300
                }}
            >
                <Icon size={20} className="flex-shrink-0" />
            </motion.div>
            
            {}
            {!isCollapsed && (
                <motion.span 
                    className="ml-3 text-sm font-medium relative z-10"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2 }}
                >
                    {label}
                </motion.span>
            )}
            
            {}
            {badge && !isCollapsed && (
                <motion.span
                    className="ml-auto bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-md relative z-10"
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                    whileHover={{ scale: 1.1 }}
                >
                    {badge}
                </motion.span>
            )}
            
            {}
            {!isCollapsed && (
                <motion.div
                    className="ml-auto relative z-10"
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
export default function Sidebar({ onSearchClick, onShortcutsClick }) {
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
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    const username = localSettings?.username || 'User';
    const profilePicUrl = localSettings?.profilePicUrl || '';
    const upcomingRemindersCount = reminders?.filter(r => new Date(r.date) > new Date()).length || 0;
    return (
        <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{
                x: 0,
                opacity: 1,
                width: windowWidth >= 768 ? (isSidebarExpanded ? 256 : 64) : 256
            }}
            transition={{ duration: 0.3, type: 'spring', stiffness: 300, damping: 30 }}
            className="flex flex-col h-full shadow-2xl relative"
            style={{
                backgroundColor: 'var(--color-bg-content)',
                borderRight: '1px solid var(--color-border)'
            }}
        >
            {}
            <div className="flex items-center justify-between h-16 px-4 border-b relative overflow-hidden" style={{ borderBottomColor: 'var(--color-border)' }}>
                {/* Subtle gradient background */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent" />
                
                <motion.div
                    className={`flex items-center ${isSidebarExpanded ? 'space-x-2.5' : 'justify-center w-full'} relative z-10`}
                    whileHover={{ scale: 1.03 }}
                    transition={{ type: "spring", stiffness: 400 }}
                >
                    <Logo className="w-8 h-8" animate={true} />
                    <AnimatePresence>
                    {isSidebarExpanded && (
                        <motion.span
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.2 }}
                            style={{ fontFamily: 'var(--font-logo)', color: 'var(--color-text-primary)' }}
                            className="text-2xl italic font-bold bg-gradient-to-r from-primary via-primary to-primary bg-clip-text"
                        >
                            Curiosity
                        </motion.span>
                    )}
                    </AnimatePresence>
                </motion.div>
                <AnimatePresence>
                {isSidebarExpanded && (
                    <motion.button
                        initial={{ opacity: 0, scale: 0.8, rotate: -90 }}
                        animate={{ opacity: 1, scale: 1, rotate: 0 }}
                        exit={{ opacity: 0, scale: 0.8, rotate: 90 }}
                        transition={{ type: "spring", stiffness: 400, damping: 20 }}
                        onClick={handleToggleSidebar}
                        className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative z-10"
                        whileHover={{ scale: 1.1, rotate: -15 }}
                        whileTap={{ scale: 0.95 }}
                        title="Collapse sidebar"
                    >
                        <PanelLeftClose size={18} style={{ color: 'var(--color-text-muted)' }} />
                    </motion.button>
                )}
                </AnimatePresence>
            </div>
            {}
            <div className="flex-1 flex flex-col px-3 py-4 space-y-6 overflow-y-auto custom-scrollbar">
                {}
                {!isSidebarExpanded && (
                    <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ type: "spring", stiffness: 400, damping: 20 }}
                        onClick={handleToggleSidebar}
                        className="w-full p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-center relative overflow-hidden group"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        title="Expand sidebar"
                    >
                        {/* Ripple effect */}
                        <motion.div
                            className="absolute inset-0 bg-primary/10 rounded-lg"
                            initial={{ scale: 0, opacity: 0.5 }}
                            whileHover={{ scale: 2, opacity: 0 }}
                            transition={{ duration: 0.6 }}
                        />
                        <PanelLeft size={20} style={{ color: 'var(--color-text-muted)' }} className="relative z-10" />
                    </motion.button>
                )}
                {}
                <div>
                    <CreateEntryMenu isExpanded={isSidebarExpanded} />
                </div>
                {}
                <nav className="space-y-1">
                    {!isSidebarExpanded ? null : (
                        <motion.div 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-xs font-semibold text-slate-500 dark:text-gray-400 px-4 mb-2 uppercase tracking-wider"
                        >
                            Navigation
                        </motion.div>
                    )}
                    <motion.button
                        onClick={onSearchClick}
                        className={`relative flex items-center w-full ${isSidebarExpanded ? 'px-4 justify-between' : 'px-0 justify-center'} py-2.5 rounded-xl transition-all duration-200 group overflow-hidden`}
                        style={{
                            color: 'var(--color-text-secondary)',
                            backgroundColor: 'transparent',
                        }}
                        whileHover={{ x: isSidebarExpanded ? 4 : 0, scale: isSidebarExpanded ? 1 : 1.05 }}
                        whileTap={{ scale: 0.98 }}
                        title={isSidebarExpanded ? '' : 'Search (⌘K)'}
                    >
                        {/* Shine effect */}
                        <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/10 to-transparent"
                            initial={{ x: '-100%' }}
                            whileHover={{ x: '100%' }}
                            transition={{ duration: 0.6 }}
                        />
                        
                        <div className="flex items-center relative z-10">
                            <motion.div
                                whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.15 }}
                                transition={{ duration: 0.4 }}
                            >
                                <Search size={20} className="flex-shrink-0" />
                            </motion.div>
                            <AnimatePresence>
                            {isSidebarExpanded && (
                                <motion.span 
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    className="ml-3 text-sm font-medium"
                                >
                                    Search
                                </motion.span>
                            )}
                            </AnimatePresence>
                        </div>
                        <AnimatePresence>
                        {isSidebarExpanded && (
                            <motion.kbd 
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                className="px-2 py-1 text-xs rounded shadow-sm relative z-10" 
                                style={{ 
                                    backgroundColor: 'var(--color-bg-secondary)',
                                    color: 'var(--color-text-muted)'
                                }}
                            >
                                ⌘K
                            </motion.kbd>
                        )}
                        </AnimatePresence>
                    </motion.button>
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
            {}
            <motion.div
                className="p-3 border-t space-y-2"
                style={{ borderTopColor: 'var(--color-border)' }}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
            >
                {}
                {appPin && (
                    <NavItem
                        icon={Lock}
                        label="Lock App"
                        isActive={false}
                        onClick={handleLockApp}
                        isCollapsed={!isSidebarExpanded}
                    />
                )}
                {}
                {onShortcutsClick && (
                    <motion.button
                        onClick={onShortcutsClick}
                        className={`relative flex items-center w-full ${isSidebarExpanded ? 'px-4 justify-between' : 'px-0 justify-center'} py-2.5 rounded-xl transition-all duration-200 group overflow-hidden`}
                        style={{
                            color: 'var(--color-text-secondary)',
                            backgroundColor: 'transparent',
                        }}
                        whileHover={{ x: isSidebarExpanded ? 4 : 0, scale: isSidebarExpanded ? 1 : 1.05 }}
                        whileTap={{ scale: 0.98 }}
                        title={isSidebarExpanded ? '' : 'Keyboard Shortcuts (⌘/)'}
                    >
                        {/* Shine effect */}
                        <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/10 to-transparent"
                            initial={{ x: '-100%' }}
                            whileHover={{ x: '100%' }}
                            transition={{ duration: 0.6 }}
                        />
                        
                        <div className="flex items-center relative z-10">
                            <motion.div
                                whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.15 }}
                                transition={{ duration: 0.4 }}
                            >
                                <HelpCircle size={20} className="flex-shrink-0" />
                            </motion.div>
                            <AnimatePresence>
                            {isSidebarExpanded && (
                                <motion.span
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    className="ml-3 text-sm font-medium"
                                >
                                    Shortcuts
                                </motion.span>
                            )}
                            </AnimatePresence>
                        </div>
                        <AnimatePresence>
                        {isSidebarExpanded && (
                            <motion.kbd 
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                className="px-2 py-1 text-xs rounded shadow-sm relative z-10" 
                                style={{ 
                                    backgroundColor: 'var(--color-bg-secondary)',
                                    color: 'var(--color-text-muted)'
                                }}
                            >
                                ⌘/
                            </motion.kbd>
                        )}
                        </AnimatePresence>
                    </motion.button>
                )}
                {}
                <motion.div
                    onClick={() => handleViewChange('settings')}
                    className={`flex items-center ${isSidebarExpanded ? 'space-x-3 px-3 py-3' : 'justify-center p-2'} rounded-xl cursor-pointer transition-all duration-200 group relative overflow-hidden`}
                    style={{
                        backgroundColor: currentView === 'settings' ? 'var(--color-primary-light)' : 'var(--color-bg-secondary)',
                        border: currentView === 'settings' ? '1px solid var(--color-primary-hex)' : '1px solid transparent'
                    }}
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    title="Settings & Profile"
                >
                    {/* Animated gradient background */}
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5"
                        initial={{ opacity: 0 }}
                        whileHover={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                    />
                    
                    {/* Shine effect */}
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                        initial={{ x: '-100%' }}
                        whileHover={{ x: '100%' }}
                        transition={{ duration: 0.6 }}
                    />
                    
                    <motion.div
                        whileHover={{ scale: 1.1, rotate: 360 }}
                        transition={{ duration: 0.5 }}
                    >
                        <ThemedAvatar
                            profilePicUrl={profilePicUrl || currentUser?.photoURL}
                            username={username}
                            className={`${isSidebarExpanded ? 'w-10 h-10' : 'w-6 h-6'} ring-2 ring-white/20 relative z-10`}
                        />
                    </motion.div>
                    <AnimatePresence>
                    {isSidebarExpanded && (
                        <>
                            <motion.div 
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                className="flex-1 truncate relative z-10"
                            >
                                <div className="text-sm font-semibold text-slate-800 dark:text-white truncate">
                                    {username}
                                </div>
                                <div className="text-xs truncate" style={{
                                    color: currentView === 'settings' ? 'var(--color-primary-hex)' : 'var(--color-text-muted)'
                                }}>
                                    {currentUser?.email || 'View Settings'}
                                </div>
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, rotate: -90 }}
                                animate={{ 
                                    opacity: currentView === 'settings' ? 1 : 0,
                                    rotate: currentView === 'settings' ? 0 : -90
                                }}
                                transition={{ type: "spring", stiffness: 400 }}
                                className="relative z-10 transition-opacity"
                                style={{
                                    color: 'var(--color-primary-hex)'
                                }}
                            >
                                <Settings size={18} />
                            </motion.div>
                            <motion.div
                                className="text-slate-400 relative z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                                whileHover={{ x: 2 }}
                            >
                                <ChevronRight size={16} />
                            </motion.div>
                        </>
                    )}
                    </AnimatePresence>
                </motion.div>
            </motion.div>
        </motion.div>
    );
}
