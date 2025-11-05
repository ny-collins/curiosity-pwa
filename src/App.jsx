
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppState } from './contexts/StateProvider';
import LoadingSpinner from './components/LoadingSpinner';
import PinLockScreen from './components/PinLockScreen';
import SettingsPage from './components/SettingsPage';
import Sidebar from './components/Sidebar';
import Editor from './components/Editor';
import BottomNavBar from './components/BottomNavBar';
import EntryList from './components/EntryList';
import CalendarView from './components/CalendarView';
import GoalsView from './components/GoalsView';
import Dashboard from './components/Dashboard';
import VaultView from './components/VaultView';
import RemindersView from './components/RemindersView';
import ReloadPrompt from './components/ReloadPrompt';
import SplashScreen from './components/SplashScreen';
import Logo from './components/Logo';
import UnsavedChangesModal from './components/UnsavedChangesModal';
import OnboardingModal from './components/OnboardingModal';

const viewVariants = {
    initial: { opacity: 0, x: 10 },
    in: { opacity: 1, x: 0 },
    out: { opacity: 0, x: -10 }
};

const viewTransition = {
    type: 'tween',
    ease: 'easeInOut',
    duration: 0.2
};

const MobileHeader = ({ currentView }) => {
    if (currentView === 'settings' || currentView === 'editor' || currentView === 'dashboard') {
        return null;
    }

    return (
        <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between md:hidden flex-shrink-0 bg-white dark:bg-slate-900">
            <div className="flex items-center space-x-3">
                <Logo className="w-7 h-7" animate={false} />
                <span style={{ fontFamily: 'var(--font-logo)' }} className="text-lg text-slate-900 dark:text-white italic">Curiosity</span>
            </div>
            <div className="text-xs text-slate-500 dark:text-gray-400">
                {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </div>
        </div>
    );
};

export default function App() {
    const {
        checkingPin, isLocked, handleForgotPin, setIsLocked, checkPin, 
        currentView, isSidebarExpanded, showOnboarding, themeFont, fontSize, isAppFocusMode, 
        isCreating, activeEntryId, handleOnboardingComplete, handleModalSave, handleModalDiscard, handleModalCancel, localSettings, showUnsavedModal 
    } = useAppState();

    const [minSplashTimeElapsed, setMinSplashTimeElapsed] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setMinSplashTimeElapsed(true);
        }, 2000);
        
        return () => clearTimeout(timer);
    }, []);

    console.log({ checkingPin, localSettings, minSplashTimeElapsed });

    if (checkingPin || !localSettings || !minSplashTimeElapsed) {
        return <SplashScreen />;
    }
    
    if (isLocked) {
        return <PinLockScreen
                  onUnlock={() => setIsLocked(false)}
                  onForgotPin={handleForgotPin}
                  checkPin={checkPin}
               />;
    }

    if (showOnboarding) {
        return <OnboardingModal onComplete={handleOnboardingComplete} />;
    }
    
    let effectiveView = currentView;
    if (isCreating || activeEntryId) {
        effectiveView = 'editor';
    }

    let mainContent;
    if (effectiveView === 'editor') {
        mainContent = (
            <motion.div 
                key="editor" 
                className="h-full"
                variants={viewVariants} 
                initial="initial" 
                animate="in" 
                exit="out" 
                transition={viewTransition}
            >
                <Editor />
            </motion.div>
        );
    } else if (effectiveView === 'settings') {
         mainContent = (
            <motion.div 
                key="settings" 
                className="flex flex-col flex-grow h-full overflow-hidden pb-16 md:pb-0"
                variants={viewVariants} 
                initial="initial" 
                animate="in" 
                exit="out" 
                transition={viewTransition}
            >
                <SettingsPage />
            </motion.div>
         );
    } else if (effectiveView === 'list') {
        mainContent = (
             <motion.div 
                key="list" 
                className="flex flex-col flex-grow h-full overflow-hidden pb-16 md:pb-0"
                variants={viewVariants} 
                initial="initial" 
                animate="in" 
                exit="out" 
                transition={viewTransition}
            >
                <EntryList />
             </motion.div>
        );
    } else if (effectiveView === 'calendar') {
        mainContent = (
             <motion.div 
                key="calendar" 
                className="flex flex-col flex-grow h-full overflow-hidden pb-16 md:pb-0"
                variants={viewVariants} 
                initial="initial" 
                animate="in" 
                exit="out" 
                transition={viewTransition}
            >
                 <CalendarView />
             </motion.div>
        );
    } else if (effectiveView === 'goals') {
        mainContent = (
             <motion.div 
                key="goals" 
                className="flex flex-col flex-grow h-full overflow-hidden pb-16 md:pb-0"
                variants={viewVariants} 
                initial="initial" 
                animate="in" 
                exit="out" 
                transition={viewTransition}
            >
                 <GoalsView />
             </motion.div>
        );
    } else if (effectiveView === 'vault') {
        mainContent = (
             <motion.div 
                key="vault" 
                className="flex flex-col flex-grow h-full overflow-hidden pb-16 md:pb-0"
                variants={viewVariants} 
                initial="initial" 
                animate="in" 
                exit="out" 
                transition={viewTransition}
            >
                 <VaultView />
             </motion.div>
        );
    } else if (effectiveView === 'reminders') {
        mainContent = (
             <motion.div 
                key="reminders" 
                className="flex flex-col flex-grow h-full overflow-hidden pb-16 md:pb-0"
                variants={viewVariants} 
                initial="initial" 
                animate="in" 
                exit="out" 
                transition={viewTransition}
            >
                 <RemindersView />
             </motion.div>
        );
    } else {
         mainContent = (
             <motion.div 
                key="dashboard" 
                className="flex flex-col flex-grow h-full overflow-hidden pb-16 md:pb-0"
                variants={viewVariants} 
                initial="initial" 
                animate="in" 
                exit="out" 
                transition={viewTransition}
            >
                <Dashboard />
             </motion.div>
        );
    }

    return (
        <>
            <div className="h-full relative flex md:flex-row overflow-hidden bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-200" style={{ fontFamily: themeFont, fontSize: fontSize }}>
                 {!isAppFocusMode && (
                    <div className="hidden md:block fixed top-0 left-0 h-full z-30">
                        <Sidebar />
                    </div>
                 )}
                
                {!isAppFocusMode && <MobileHeader currentView={effectiveView} />}

                <main className={`flex-1 h-full overflow-hidden transition-all duration-300 ease-in-out ${isAppFocusMode ? 'md:pl-0' : (isSidebarExpanded ? 'md:pl-64' : 'md:pl-16')} ${effectiveView === 'settings' || effectiveView === 'editor' ? 'flex flex-col' : ''} ${effectiveView === 'dashboard' ? 'pt-0 md:pt-0' : effectiveView !== 'editor' && effectiveView !== 'settings' ? 'pt-12 md:pt-0' : ''}`}>
                    <AnimatePresence mode="wait">
                        {mainContent}
                    </AnimatePresence>
                </main>

                 {!isAppFocusMode && <BottomNavBar />}
            </div>
            
             <ReloadPrompt />
             
             {showUnsavedModal && (
                <UnsavedChangesModal
                    onSave={handleModalSave}
                    onDiscard={handleModalDiscard}
                    onCancel={handleModalCancel}
                />
             )}
        </>
    );
}
