import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppState } from './contexts/StateProvider';
import LoadingSpinner from './components/LoadingSpinner';
import PinLockScreen from './components/PinLockScreen';
import SettingsPage from './components/SettingsPage';
import Sidebar from './components/Sidebar';
import ModernEditor from './components/ModernEditor';
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
import InitialSetupModal from './components/InitialSetupModal';
import InteractiveTutorial from './components/InteractiveTutorial';
import { db } from './db.js';

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

const MobileHeader = ({ currentView, onMenuClick }) => {
    if (currentView === 'settings' || currentView === 'editor' || currentView === 'dashboard') {
        return null;
    }

    return (
        <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 flex items-center md:hidden flex-shrink-0 bg-white dark:bg-slate-900 z-10 fixed top-0 left-0 right-0">
            <button
                onClick={onMenuClick}
                className="p-2 -ml-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
                <svg className="w-6 h-6 text-slate-900 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
            </button>
            <div className="flex items-center space-x-2 flex-1 justify-center mr-10">
                <Logo className="w-7 h-7" animate={false} />
                <span style={{ fontFamily: 'var(--font-logo)' }} className="text-lg text-slate-900 dark:text-white italic">Curiosity</span>
            </div>
        </div>
    );
};

export default function App() {
    const {
        checkingPin, isLocked, handleForgotPin, setIsLocked, checkPin, 
        currentView, isSidebarExpanded, showOnboarding, themeFont, fontSize, isAppFocusMode, 
        isCreating, activeEntryId, activeEntry, newEntryType, handleEditorSaveComplete, forceEditorSave,
        handleOnboardingComplete, handleInitialSetup, handleModalSave, handleModalDiscard, handleModalCancel, localSettings, showUnsavedModal,
        handleToggleSidebar
    } = useAppState();

    const [minSplashTimeElapsed, setMinSplashTimeElapsed] = useState(false);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            setMinSplashTimeElapsed(true);
        }, 2000);
        
        return () => clearTimeout(timer);
    }, []);

    // Check if user should see tutorial (first time after setup)
    const [showTutorial, setShowTutorial] = useState(() => {
        const hasSeenTutorial = localStorage.getItem('hasSeenTutorial');
        return !hasSeenTutorial && localSettings?.hasCompletedSetup;
    });

    const handleTutorialComplete = () => {
        setShowTutorial(false);
        localStorage.setItem('hasSeenTutorial', 'true');
    };

    const handleTutorialSkip = () => {
        setShowTutorial(false);
        localStorage.setItem('hasSeenTutorial', 'true');
    };

    if (checkingPin || !localSettings || !minSplashTimeElapsed) {
        return <SplashScreen />;
    }

    // Show initial setup for new users
    if (!localSettings.hasCompletedSetup) {
        return <InitialSetupModal onComplete={handleInitialSetup} />;
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
    
    if (showTutorial) {
        return <InteractiveTutorial
            onComplete={handleTutorialComplete}
            onSkip={handleTutorialSkip}
            db={db}
            userId={userId}
            toast={toast}
        />;
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
                <ModernEditor 
                    entry={activeEntry}
                    isCreating={isCreating}
                    newEntryType={newEntryType}
                    handleEditorSaveComplete={handleEditorSaveComplete}
                    forceEditorSave={forceEditorSave}
                />
            </motion.div>
        );
    } else if (effectiveView === 'settings') {
         mainContent = (
            <motion.div 
                key="settings" 
                className="flex flex-col flex-grow h-full pb-16 md:pb-0"
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
                className="flex flex-col flex-grow h-full pb-16 md:pb-0"
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
                className="flex flex-col flex-grow h-full pb-16 md:pb-0"
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
                className="flex flex-col flex-grow h-full pb-16 md:pb-0"
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
                className="flex flex-col flex-grow h-full pb-16 md:pb-0"
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
                className="flex flex-col flex-grow h-full pb-16 md:pb-0"
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
                className="flex flex-col flex-grow h-full pb-16 md:pb-0"
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
                    <>
                        {/* Desktop Sidebar */}
                        <div className="hidden md:block fixed top-0 left-0 h-full z-30">
                            <Sidebar />
                        </div>
                        
                        {/* Mobile Sidebar Overlay */}
                        {isSidebarExpanded && (
                            <>
                                {/* Backdrop */}
                                <div 
                                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                                    onClick={handleToggleSidebar}
                                />
                                {/* Sidebar */}
                                <div className="fixed top-0 left-0 h-full z-50 md:hidden">
                                    <Sidebar />
                                </div>
                            </>
                        )}
                    </>
                 )}
                
                {!isAppFocusMode && <MobileHeader currentView={effectiveView} onMenuClick={handleToggleSidebar} />}

                <main 
                    className={`flex-1 h-full overflow-hidden transition-all duration-300 ease-in-out ${effectiveView === 'settings' || effectiveView === 'editor' ? 'flex flex-col' : ''} ${effectiveView === 'dashboard' ? 'pt-0 md:pt-0' : effectiveView !== 'editor' && effectiveView !== 'settings' ? 'pt-12 md:pt-0' : ''} md:ml-0`}
                    style={{
                        paddingLeft: windowWidth >= 768 ? (isAppFocusMode ? '0' : (isSidebarExpanded ? '256px' : '64px')) : '0'
                    }}
                >
                    <AnimatePresence mode="wait">
                        {mainContent}
                    </AnimatePresence>
                </main>
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
