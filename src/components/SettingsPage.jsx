import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, ArrowLeft, AlertTriangle, Upload, Download, CheckCircle, BellRing,
    LogIn, User, FileOutput, Sun, Moon, Laptop, CaseLower, CaseUpper,
    Loader2, UserCircle, Palette, Lock, SlidersHorizontal, Database, Fingerprint,
    Bell
} from 'lucide-react';
import { getFunctions, httpsCallable } from "firebase/functions";
import { functions, storage, appId, firestoreDb, auth } from '../firebaseConfig';
import { collection, query, getDocs, writeBatch, doc, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { deleteUser } from "firebase/auth";
import { useAppState } from '../contexts/StateProvider';
import { db } from '../db';
import DeleteDataModal from './DeleteDataModal';
import ThemedAvatar from './ThemedAvatar';
import ExportModal from './ExportModal';
import { useNotifications } from './PushNotificationProvider';
import { THEME_COLORS, FONT_CATEGORIES, THEME_MODES, FONT_SIZES, LIMITS, PIN_STORAGE_KEY, WEBAUTHN_CREDENTIAL_ID_KEY } from '../constants.js';
const settingsTabs = [
    { id: 'profile', name: 'Profile', icon: UserCircle },
    { id: 'appearance', name: 'Appearance', icon: Palette },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'security', name: 'Security', icon: Lock },
    { id: 'application', name: 'Application', icon: SlidersHorizontal },
    { id: 'data', name: 'Data', icon: Database },
];
function SettingsPage() {
    const { handleViewChange } = useAppState();
    const [activeTab, setActiveTab] = useState('profile');
    const renderActiveTab = () => {
        switch (activeTab) {
            case 'profile':
                return <SettingsProfile />;
            case 'appearance':
                return <SettingsAppearance />;
            case 'notifications':
                return <SettingsNotifications />;
            case 'security':
                return <SettingsSecurity />;
            case 'application':
                return <SettingsApplication />;
            case 'data':
                return <SettingsData />;
            default:
                return <SettingsProfile />;
        }
    };
    return (
        <div className="flex flex-col h-full overflow-hidden bg-gradient-to-br from-slate-50 via-purple-50/20 to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900" style={{ backgroundColor: 'var(--color-bg-base)' }}>
            {}
            <motion.div 
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="md:hidden p-4 flex justify-between items-center space-x-2 flex-shrink-0 border-b bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl"
                 style={{
                     borderBottomColor: 'var(--color-border)',
                     backgroundColor: 'var(--color-bg-content)'
                 }}>
                <motion.button
                    onClick={() => handleViewChange('dashboard')}
                    whileHover={{ scale: 1.1, x: -2 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2 -ml-2 rounded-full text-slate-500 dark:text-gray-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus:ring-2"
                    style={{'--tw-ring-color': 'var(--color-primary-hex)'}}
                    aria-label="Back to dashboard"
                    title="Back to dashboard"
                >
                    <ArrowLeft size={22} />
                </motion.button>
                <div className="flex items-center space-x-2">
                    <motion.div
                        whileHover={{ rotate: 180 }}
                        transition={{ duration: 0.3 }}
                        className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500"
                    >
                        <SlidersHorizontal size={20} className="text-white" />
                    </motion.div>
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-white" style={{fontFamily: 'var(--font-serif)'}}>
                        Settings
                    </h2>
                </div>
                <div className="w-8"></div>
            </motion.div>
            <div className="flex-1 flex overflow-hidden">
                {}
                <div className="md:hidden flex-1 overflow-y-auto custom-scrollbar">
                    <div className="divide-y divide-slate-200 dark:divide-slate-700">
                        {}
                        <MobileSettingsSection
                            title="Profile"
                            icon={UserCircle}
                            isActive={activeTab === 'profile'}
                            onClick={() => setActiveTab('profile')}
                        >
                            <SettingsProfile />
                        </MobileSettingsSection>
                        {}
                        <MobileSettingsSection
                            title="Appearance"
                            icon={Palette}
                            isActive={activeTab === 'appearance'}
                            onClick={() => setActiveTab('appearance')}
                        >
                            <SettingsAppearance />
                        </MobileSettingsSection>
                        {}
                        <MobileSettingsSection
                            title="Notifications"
                            icon={Bell}
                            isActive={activeTab === 'notifications'}
                            onClick={() => setActiveTab('notifications')}
                        >
                            <SettingsNotifications />
                        </MobileSettingsSection>
                        {}
                        <MobileSettingsSection
                            title="Security"
                            icon={Lock}
                            isActive={activeTab === 'security'}
                            onClick={() => setActiveTab('security')}
                        >
                            <SettingsSecurity />
                        </MobileSettingsSection>
                        {}
                        <MobileSettingsSection
                            title="Application"
                            icon={SlidersHorizontal}
                            isActive={activeTab === 'application'}
                            onClick={() => setActiveTab('application')}
                        >
                            <SettingsApplication />
                        </MobileSettingsSection>
                        {}
                        <MobileSettingsSection
                            title="Data"
                            icon={Database}
                            isActive={activeTab === 'data'}
                            onClick={() => setActiveTab('data')}
                        >
                            <SettingsData />
                        </MobileSettingsSection>
                    </div>
                </div>
                {}
                <div className="hidden md:flex flex-1 overflow-hidden">
                    {}
                    <motion.nav 
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="flex flex-col w-64 border-r border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-4 space-y-1 flex-shrink-0"
                    >
                        {settingsTabs.map((tab, index) => (
                            <motion.div
                                key={tab.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 + index * 0.05 }}
                            >
                                <SettingsTabButton
                                    icon={tab.icon}
                                    label={tab.name}
                                    isActive={activeTab === tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                />
                            </motion.div>
                        ))}
                    </motion.nav>
                    {}
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6 lg:p-8 bg-slate-50 dark:bg-slate-800">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                transition={{ duration: 0.15 }}
                            >
                                {renderActiveTab()}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
}
const SettingsTabButton = ({ icon, label, isActive, onClick }) => {
    const Icon = icon;
    const activeClass = isActive ? 'bg-primary/10 text-primary' : 'text-slate-600 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-slate-700';
    
    return (
        <motion.button
            onClick={onClick}
            whileHover={{ scale: 1.02, x: isActive ? 0 : 4 }}
            whileTap={{ scale: 0.98 }}
            className={`relative flex items-center space-x-3 w-full h-10 px-3 rounded-lg transition-colors duration-150 overflow-hidden ${activeClass}`}
            style={{
                color: isActive ? 'var(--color-primary-hex)' : '',
                backgroundColor: isActive ? 'rgba(var(--color-primary-rgb), 0.1)' : ''
            }}
        >
            {/* Shine effect on active */}
            {isActive && (
                <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />
            )}
            
            <motion.div
                animate={isActive ? { rotate: [0, 10, -10, 0] } : {}}
                transition={{ duration: 0.5 }}
                className="relative z-10"
            >
                <Icon size={20} className="flex-shrink-0" />
            </motion.div>
            <span className="text-sm font-medium truncate relative z-10">{label}</span>
            
            {/* Active indicator */}
            {isActive && (
                <motion.div
                    layoutId="activeTab"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full"
                    style={{ backgroundColor: 'var(--color-primary-hex)' }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
            )}
        </motion.button>
    );
};
const MobileSettingsTabButton = ({ icon, label, isActive, onClick }) => {
    const Icon = icon;
    const activeClass = isActive ? 'border-primary text-primary' : 'border-transparent text-slate-600 dark:text-gray-300 hover:text-slate-800 dark:hover:text-white';
    return (
        <button
            onClick={onClick}
            className={`flex flex-col items-center justify-center space-y-1 px-4 py-3 border-b-2 transition-colors duration-150 ${activeClass}`}
            style={{
                color: isActive ? 'var(--color-primary-hex)' : '',
                borderBottomColor: isActive ? 'var(--color-primary-hex)' : ''
            }}
        >
            <Icon size={18} className="flex-shrink-0" />
            <span className="text-xs font-medium whitespace-nowrap">{label}</span>
        </button>
    );
};
const SettingsSection = ({ title, children }) => (
    <motion.section 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
    >
        <motion.h3 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl font-semibold text-slate-900 dark:text-white" 
            style={{fontFamily: 'var(--font-serif)'}}
        >
            {title}
        </motion.h3>
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
        >
            {children}
        </motion.div>
    </motion.section>
);
const SettingsProfile = () => {
    const { localSettings, handleSaveSettings, currentUser, isAnonymous, handleLinkAccount, toast } = useAppState();
    const [username, setUsername] = useState('');
    const [profilePicUrl, setProfilePicUrl] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef(null);
    useEffect(() => {
        if (localSettings) {
            setUsername(localSettings.username || (currentUser && !isAnonymous ? currentUser.displayName : ''));
            setProfilePicUrl(localSettings.profilePicUrl || (currentUser && !isAnonymous ? currentUser.photoURL : ''));
        }
    }, [localSettings, currentUser, isAnonymous]);
    const handleSave = () => {
        handleSaveSettings({
            settings: { ...localSettings, username, profilePicUrl },
            pin: null
        });
        toast.success("Profile saved!");
    };
    const handleImageUpload = async (event) => {
        const file = event.target.files[0];
        if (!file || !currentUser || isAnonymous) {
             if (isAnonymous) toast.error("Please link your account to enable image uploads.");
             return;
        }
        if (file.size > LIMITS.MAX_FILE_SIZE) {
             toast.error(`File is too large. Please select an image under ${LIMITS.MAX_FILE_SIZE / 1024 / 1024}MB.`);
             return;
        }
        setIsUploading(true);
        const storageRef = ref(storage, `artifacts/${appId}/users/${currentUser.uid}/profile.jpg`);
        try {
            const snapshot = await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(snapshot.ref);
            setProfilePicUrl(downloadURL);
            handleSaveSettings({
                settings: { ...localSettings, username, profilePicUrl: downloadURL },
                pin: null
            });
            toast.success("Profile picture updated!");
        } catch (error) {
            console.error("Error uploading profile picture:", error);
            toast.error("Failed to upload image. Please try again.");
        } finally {
            setIsUploading(false);
        }
    };
    let accountSection;
    if (isAnonymous) {
        accountSection = (
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center p-5 bg-slate-100 dark:bg-slate-700 rounded-xl"
            >
                <p className="text-sm text-slate-700 dark:text-gray-300 mb-4">Sync & backup your data by linking your account. This also enables PIN recovery.</p>
                <motion.button 
                    onClick={handleLinkAccount} 
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className="relative w-full flex items-center justify-center space-x-2 bg-white dark:bg-slate-800 text-slate-800 dark:text-white font-semibold py-3 px-4 rounded-xl border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors duration-200 focus:outline-none focus:ring-2 shadow-md overflow-hidden" 
                    style={{'--tw-ring-color': 'var(--color-primary-hex)'}}
                >
                    {/* Shine effect */}
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/10 to-transparent"
                        initial={{ x: '-100%' }}
                        whileHover={{ x: '100%' }}
                        transition={{ duration: 0.6 }}
                    />
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google icon" className="w-5 h-5 relative z-10"/>
                    <span className="relative z-10">Sign in with Google</span>
                </motion.button>
            </motion.div>
        );
    } else if (currentUser) {
         accountSection = (
            <div className="text-left p-4 bg-slate-100 dark:bg-slate-700 rounded-md">
                <p className="text-sm text-slate-700 dark:text-gray-300 mb-3">You are signed in and your data is synced.</p>
                <div className="flex items-center space-x-3">
                    <ThemedAvatar
                        profilePicUrl={currentUser.photoURL}
                        username={currentUser.displayName}
                        className="w-10 h-10"
                    />
                    <div className="flex flex-col">
                        <span className="text-slate-900 dark:text-white font-semibold">{currentUser.displayName || "User"}</span>
                        <span className="text-xs text-slate-600 dark:text-gray-400">{currentUser.email}</span>
                    </div>
                </div>
            </div>
         );
    }
    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <SettingsSection title="Account & Sync">
                {accountSection}
            </SettingsSection>
            <SettingsSection title="Profile">
                <div>
                    <label htmlFor="username-profile" className="block text-sm font-medium text-slate-600 dark:text-gray-300 mb-1">Username</label>
                    <input type="text" id="username-profile" value={username} onChange={(e) => setUsername(e.target.value)} className="themed-input w-full rounded-md" style={{ backgroundColor: 'var(--color-bg-secondary)', color: 'var(--color-text-primary)' }} placeholder="Your Name" />
                </div>
                <div>
                    <label htmlFor="profilePicUrl-profile" className="block text-sm font-medium text-slate-600 dark:text-gray-300 mb-1">Profile Picture URL</label>
                    <input type="text" id="profilePicUrl-profile" value={profilePicUrl} onChange={(e) => setProfilePicUrl(e.target.value)} className="themed-input w-full rounded-md" style={{ backgroundColor: 'var(--color-bg-secondary)', color: 'var(--color-text-primary)' }} placeholder="https://your-image-url.com/pic.png" />
                </div>
                 <div>
                      <label className="block text-sm font-medium text-slate-600 dark:text-gray-300 mb-1">Upload Picture</label>
                      <input
                        type="file"
                        accept="image/png, image/jpeg"
                        ref={fileInputRef}
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <motion.button
                        onClick={() => fileInputRef.current.click()}
                        disabled={isUploading || isAnonymous}
                        whileHover={!isUploading && !isAnonymous ? { scale: 1.01 } : {}}
                        whileTap={!isUploading && !isAnonymous ? { scale: 0.99 } : {}}
                        className="relative w-full flex items-center justify-center space-x-2 bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-white font-semibold py-3 px-4 rounded-xl border border-slate-300 dark:border-slate-600 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors duration-200 focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
                        style={{'--tw-ring-color': 'var(--color-primary-hex)'}}
                      >
                        {!isUploading && !isAnonymous && (
                            <motion.div
                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                                initial={{ x: '-100%' }}
                                whileHover={{ x: '100%' }}
                                transition={{ duration: 0.6 }}
                            />
                        )}
                        <span className="relative z-10 flex items-center">
                            {isUploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                        </span>
                        <span className="relative z-10">{isUploading ? "Uploading..." : "Upload from Device"}</span>
                      </motion.button>
                       {isAnonymous && <p className="text-xs text-amber-500 dark:text-amber-400 mt-2">Please link your account to enable image uploads.</p>}
                 </div>
                 <motion.button
                    onClick={handleSave}
                    disabled={isUploading}
                    whileHover={!isUploading ? { scale: 1.02, y: -2 } : {}}
                    whileTap={!isUploading ? { scale: 0.98 } : {}}
                    className="relative text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-200 focus:outline-none focus:ring-2 
                             disabled:bg-slate-400 dark:disabled:bg-slate-700 disabled:cursor-not-allowed shadow-lg overflow-hidden"
                    style={{ 
                        backgroundColor: 'var(--color-primary-hex)', 
                        '--tw-ring-color': 'var(--color-primary-hex)',
                        boxShadow: !isUploading ? '0 10px 25px -5px rgba(var(--color-primary-rgb), 0.3)' : 'none'
                    }}
                >
                    {!isUploading && (
                        <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                            animate={{ x: ['-100%', '100%'] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        />
                    )}
                    <span className="relative z-10 flex items-center justify-center">
                        {isUploading && <Loader2 size={18} className="mr-2 animate-spin" />}
                        {isUploading ? "Saving..." : "Save Profile"}
                    </span>
                </motion.button>
            </SettingsSection>
        </div>
    );
};
const SettingsAppearance = () => {
    const {
        localSettings, handleSaveSettings,
        themeMode, setThemeMode,
        themeColor, setThemeColor,
        themeFont, setThemeFont,
        fontSize, setFontSize,
        toast
    } = useAppState();
    const handleSave = () => {
        handleSaveSettings({
            settings: {
                ...localSettings,
                themeMode: themeMode,
                themeColor: themeColor,
                fontFamily: themeFont,
                fontSize: fontSize
            },
            pin: null
        });
        toast.success("Appearance saved!");
    };
    const handleModeChange = (mode) => {
        setThemeMode(mode);
    };
    const handleColorChange = (color) => {
        setThemeColor(color);
    };
    const handleFontChange = (font) => {
        setThemeFont(font);
    };
    const handleFontSizeChange = (size) => {
        setFontSize(size);
    };
    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <SettingsSection title="Appearance">
                <div>
                    <label className="block text-sm font-medium text-slate-600 dark:text-gray-300 mb-2">Theme</label>
                    <div className="flex items-center space-x-2 rounded-xl bg-slate-100 dark:bg-slate-700 p-1.5">
                        {THEME_MODES.map((mode, index) => (
                            <motion.button
                                key={mode.value}
                                onClick={() => handleModeChange(mode.value)}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.05 }}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className={`relative flex-1 flex justify-center items-center space-x-2 py-2.5 px-3 rounded-lg text-sm transition-all duration-200 overflow-hidden ${
                                    themeMode === mode.value
                                        ? 'bg-white dark:bg-slate-900 shadow-lg text-primary font-semibold'
                                        : 'text-slate-600 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                                }`}
                                style={{ color: themeMode === mode.value ? 'var(--color-primary-hex)' : '' }}
                            >
                                {themeMode === mode.value && (
                                    <motion.div
                                        layoutId="themeMode"
                                        className="absolute inset-0 bg-white dark:bg-slate-900 shadow-lg rounded-lg"
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                )}
                                <motion.div
                                    animate={themeMode === mode.value ? { rotate: [0, 360] } : {}}
                                    transition={{ duration: 0.5 }}
                                    className="relative z-10"
                                >
                                    <mode.icon size={16} />
                                </motion.div>
                                <span className="relative z-10">{mode.name}</span>
                            </motion.button>
                        ))}
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-600 dark:text-gray-300 mb-3">Theme Color</label>
                    <div className="flex flex-wrap gap-3">
                        {THEME_COLORS.map((color, index) => (
                            <motion.button
                                key={color.hex}
                                title={color.name}
                                onClick={() => handleColorChange(color.hex)}
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.03 }}
                                whileHover={{ scale: 1.15, rotate: 360 }}
                                whileTap={{ scale: 0.95 }}
                                className={`relative w-10 h-10 rounded-full cursor-pointer focus:outline-none transition-all duration-200 ${
                                    themeColor === color.hex ? 'ring-4 ring-offset-2 scale-110 shadow-lg' : 'hover:shadow-lg'
                                }`}
                                style={{
                                    backgroundColor: color.hex,
                                    '--tw-ring-color': color.hex,
                                    ringColor: color.hex,
                                    ringOffsetColor: 'var(--color-bg-base)'
                                }}
                            >
                                {themeColor === color.hex && (
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="absolute inset-0 flex items-center justify-center"
                                    >
                                        <CheckCircle size={18} className="text-white drop-shadow-lg" />
                                    </motion.div>
                                )}
                            </motion.button>
                        ))}
                    </div>
                </div>
                {FONT_CATEGORIES.map(category => (
                    <div key={category.name}>
                        <label className="block text-sm font-medium text-slate-600 dark:text-gray-300 mb-2">{category.name}</label>
                        <div className="flex flex-wrap gap-2">
                            {category.fonts.map(font => (
                                <button
                                    key={font.value}
                                    onClick={() => handleFontChange(font.value)}
                                    className={`py-1 px-3 rounded-md text-sm transition-colors ${themeFont === font.value ? 'text-white font-semibold' : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-slate-600'}`}
                                    style={{
                                        fontFamily: font.value,
                                        backgroundColor: themeFont === font.value ? 'var(--color-primary-hex)' : undefined
                                    }}
                                >
                                    {font.name}
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
                <div>
                    <label className="block text-sm font-medium text-slate-600 dark:text-gray-300 mb-2">Font Size</label>
                    <div className="flex items-center space-x-2 rounded-lg bg-slate-100 dark:bg-slate-700 p-1">
                        {FONT_SIZES.map(size => (
                            <button
                                key={size.value}
                                onClick={() => handleFontSizeChange(size.value)}
                                className={`flex-1 flex justify-center items-center space-x-2 py-2 px-3 rounded-md text-sm transition-colors ${
                                    fontSize === size.value
                                        ? 'bg-white dark:bg-slate-900 shadow-sm text-primary font-semibold'
                                        : 'text-slate-600 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                                }`}
                                style={{ color: fontSize === size.value ? 'var(--color-primary-hex)' : '' }}
                            >
                                <span style={{ fontSize: size.value }}>{size.name}</span>
                            </button>
                        ))}
                    </div>
                </div>
                <motion.button
                    onClick={handleSave}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className="relative text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-200 focus:outline-none focus:ring-2 shadow-lg overflow-hidden"
                    style={{ 
                        backgroundColor: 'var(--color-primary-hex)', 
                        '--tw-ring-color': 'var(--color-primary-hex)',
                        boxShadow: '0 10px 25px -5px rgba(var(--color-primary-rgb), 0.3)'
                    }}
                >
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                        animate={{ x: ['-100%', '100%'] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    />
                    <span className="relative z-10">Save Appearance</span>
                </motion.button>
            </SettingsSection>
        </div>
    );
};
const SettingsSecurity = () => {
    const { appPin, handleSaveSettings, handleLockApp, handleRegisterBiometric, handleDisableBiometric, biometricCredentialId, unlockedKey, toast } = useAppState();
    const [enableLock, setEnableLock] = useState(!!appPin);
    const [pin, setPin] = useState('');
    const handleSave = () => {
        let pinToSave = null;
        if (enableLock) {
            if (pin) {
                if (pin.length !== LIMITS.PIN_LENGTH) {
                    toast.error(`PIN must be ${LIMITS.PIN_LENGTH} digits.`);
                    return;
                }
                pinToSave = pin;
            } else if (appPin) {
                pinToSave = null;
            } else {
                toast.error(`Please enter a ${LIMITS.PIN_LENGTH}-digit PIN to enable the lock.`);
                return;
            }
        } else {
            pinToSave = '';
            if (biometricCredentialId) {
                handleDisableBiometric();
            }
        }
        handleSaveSettings({ settings: {}, pin: pinToSave });
        setPin('');
    };
    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <SettingsSection title="Security">
                <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-6">
                    {/* Hidden username field for accessibility - password managers expect username fields in forms with passwords */}
                    <input 
                        type="text" 
                        name="username" 
                        autoComplete="username" 
                        style={{ position: 'absolute', left: '-9999px', width: '1px', height: '1px', overflow: 'hidden' }} 
                        tabIndex="-1" 
                        aria-hidden="true" 
                    />
                    
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-700 dark:text-gray-300">Enable App Lock (PIN)</span>
                        <button type="button" onClick={() => setEnableLock(!enableLock)} className={`${enableLock ? 'bg-primary' : 'bg-slate-400 dark:bg-slate-600'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2`} style={{backgroundColor: enableLock ? 'var(--color-primary-hex)' : '', '--tw-ring-color': 'var(--color-primary-hex)'}}>
                            <span className={`${enableLock ? 'translate-x-5' : 'translate-x-0'} inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`} />
                        </button>
                    </div>
                    {enableLock && (
                        <div>
                            <label htmlFor="pin-security" className="block text-sm font-medium text-slate-600 dark:text-gray-300 mb-1">
                                {appPin ? 'Change 4-Digit PIN' : 'Set 4-Digit PIN'}
                            </label>
                            <input type="password" id="pin-security" value={pin}
                                onChange={(e) => { const val = e.target.value.replace(/\D/g, ''); if (val.length <= LIMITS.PIN_LENGTH) setPin(val); }}
                                maxLength={LIMITS.PIN_LENGTH}
                                className="themed-input w-full rounded-md tracking-widest"
                                style={{ backgroundColor: 'var(--color-bg-secondary)', color: 'var(--color-text-primary)' }}
                                placeholder={appPin ? 'Enter new PIN' : '••••'}
                                autoComplete="new-password" />
                        </div>
                    )}
                    {appPin && (
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-slate-700 dark:text-gray-300">Lock App Now</span>
                            <button
                                type="button"
                                onClick={handleLockApp}
                                className="text-sm font-semibold py-1 px-3 rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-800 transition-colors duration-200 flex items-center space-x-1 bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500"
                            >
                                <Lock size={14}/>
                                <span>Lock</span>
                            </button>
                        </div>
                    )}
                    {appPin && !biometricCredentialId && (
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-slate-700 dark:text-gray-300">Enable Biometric Unlock</span>
                            <button
                                type="button"
                                onClick={handleRegisterBiometric}
                                className="text-sm font-semibold py-1 px-3 rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-800 transition-colors duration-200 flex items-center space-x-1 bg-green-600 hover:bg-green-700 text-white focus:ring-green-500"
                            >
                                <Fingerprint size={14}/>
                                <span>Enable</span>
                            </button>
                        </div>
                    )}
                    {biometricCredentialId && (
                         <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-slate-700 dark:text-gray-300">Biometric Unlock</span>
                            <button
                                type="button"
                                onClick={handleDisableBiometric}
                                className="text-sm font-semibold py-1 px-3 rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-800 transition-colors duration-200 flex items-center space-x-1 bg-red-600 hover:bg-red-700 text-white focus:ring-red-500"
                            >
                                <Fingerprint size={14}/>
                                <span>Disable</span>
                            </button>
                        </div>
                    )}
                    <button
                        type="submit"
                        className="text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2"
                        style={{ backgroundColor: 'var(--color-primary-hex)', '--tw-ring-color': 'var(--color-primary-hex)' }}
                    >
                        Save Security Settings
                    </button>
                </form>
            </SettingsSection>
        </div>
    );
};
const SettingsApplication = () => {
    const {
        handleRequestNotificationPermission,
        handleInstallApp, installPromptEvent, isAppInstalled
    } = useAppState();
    const { notificationsEnabled, toggleNotifications, isLoading: notificationsLoading } = useNotifications();
    const [notificationStatus, setNotificationStatus] = useState('default');
    
    useEffect(() => {
        if ('Notification' in window) {
            setNotificationStatus(Notification.permission);
        }
    }, []);
    
    const handleNotificationToggle = async () => {
        if (notificationStatus === 'denied') {
            return; // Can't toggle if permission is denied
        }
        
        if (notificationStatus === 'default' || notificationStatus === 'prompt') {
            // Need to request permission first
            try {
                const newStatus = await handleRequestNotificationPermission();
                if (newStatus) setNotificationStatus(newStatus);
            } catch (err) {
                console.error("Error requesting notification permission:", err);
            }
        } else if (notificationStatus === 'granted') {
            // Toggle the notification state
            await toggleNotifications(!notificationsEnabled);
        }
    };
    
    let notificationButton;
    if (notificationStatus === 'granted') {
        if (notificationsEnabled) {
            notificationButton = (
                <button 
                    onClick={handleNotificationToggle}
                    disabled={notificationsLoading}
                    className={`text-sm font-semibold py-1 px-3 rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-800 transition-colors duration-200 flex items-center space-x-1 bg-green-600 hover:bg-green-700 text-white focus:ring-green-500 ${notificationsLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    {notificationsLoading ? <Loader2 size={14} className="animate-spin" /> : <BellRing size={14}/>}
                    <span>Enabled</span>
                </button>
            );
        } else {
            notificationButton = (
                <button 
                    onClick={handleNotificationToggle}
                    disabled={notificationsLoading}
                    className={`text-sm font-semibold py-1 px-3 rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-800 transition-colors duration-200 flex items-center space-x-1 bg-slate-500 hover:bg-slate-600 text-white focus:ring-slate-500 ${notificationsLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    {notificationsLoading ? <Loader2 size={14} className="animate-spin" /> : <BellRing size={14}/>}
                    <span>Disabled</span>
                </button>
            );
        }
    } else if (notificationStatus === 'denied') {
        notificationButton = (
            <button 
                disabled 
                className={`text-sm font-semibold py-1 px-3 rounded flex items-center space-x-1 bg-red-700 text-gray-300 cursor-not-allowed`}
            >
                <BellRing size={14}/>
                <span>Blocked</span>
            </button>
        );
    } else {
        notificationButton = (
            <button 
                onClick={handleNotificationToggle}
                disabled={notificationsLoading}
                className={`text-sm font-semibold py-1 px-3 rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-800 transition-colors duration-200 flex items-center space-x-1 bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500 ${notificationsLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                {notificationsLoading ? <Loader2 size={14} className="animate-spin" /> : <BellRing size={14}/>}
                <span>Enable</span>
            </button>
        );
    }
     let installButton;
     if (isAppInstalled) {
         installButton = ( <button disabled className="text-sm font-semibold py-1 px-3 rounded flex items-center space-x-1 bg-green-600 text-white cursor-default"> <CheckCircle size={14}/> <span>Installed</span> </button> );
     } else if (installPromptEvent) {
          installButton = ( <button onClick={handleInstallApp} className="text-sm font-semibold py-1 px-3 rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-800 transition-colors duration-200 flex items-center space-x-1 bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500"> <Download size={14}/> <span>Install App</span> </button> );
     } else {
         installButton = null;
     }
    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <SettingsSection title="Application">
                {installButton && (
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-700 dark:text-gray-300">Install App</span>
                        {installButton}
                    </div>
                )}
                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700 dark:text-gray-300">Reminder Notifications</span>
                    {notificationButton}
                </div>
                {notificationStatus === 'granted' && notificationsEnabled && (
                    <p className="text-xs text-slate-600 dark:text-slate-400">You'll receive notifications for upcoming reminders even when the app is closed.</p>
                )}
                {notificationStatus === 'granted' && !notificationsEnabled && (
                    <p className="text-xs text-amber-600 dark:text-amber-400">Notifications are disabled. Enable them to receive reminder alerts.</p>
                )}
                {notificationStatus === 'denied' && (
                    <p className="text-xs text-red-500 dark:text-red-400">You have blocked notifications. Please enable them in your browser settings.</p>
                )}
            </SettingsSection>
        </div>
    );
};
const SettingsData = () => {
    const { handleExportData, toast, userId } = useAppState();
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showExportModal, setShowExportModal] = useState(false);
    const handleConfirmDelete = async () => {
        setIsDeleting(true);
        setShowDeleteModal(false);
        let localDataCleared = false;
        let cloudDataCleared = false;
        try {
            try {
                await db.entries.clear();
                await db.reminders.clear();
                await db.goals.clear();
                await db.tasks.clear();
                await db.vaultItems.clear();
                await db.settings.clear();
                localStorage.removeItem(PIN_STORAGE_KEY);
                localStorage.removeItem(WEBAUTHN_CREDENTIAL_ID_KEY);
                localDataCleared = true;
            } catch (localError) {
                console.error("Error clearing local data:", localError);
                throw new Error("Failed to clear local data");
            }
            if (userId && firestoreDb) {
                try {
                    const collectionsToDelete = ['entries', 'reminders', 'goals', 'tasks', 'vaultItems'];
                    for (const collectionName of collectionsToDelete) {
                        const collectionRef = collection(firestoreDb, `users/${userId}/${collectionName}`);
                        const snapshot = await getDocs(query(collectionRef));
                        if (!snapshot.empty) {
                            const batch = writeBatch(firestoreDb);
                            snapshot.docs.forEach(doc => {
                                batch.delete(doc.ref);
                            });
                            await batch.commit();
                            console.log(`Deleted ${snapshot.docs.length} documents from ${collectionName}`);
                        }
                    }
                    const settingsDocRef = doc(firestoreDb, `artifacts/${appId}/users/${userId}/settings/main`);
                    await deleteDoc(settingsDocRef);
                    console.log("Deleted settings document");
                    if (auth.currentUser && !auth.currentUser.isAnonymous) {
                        try {
                            await deleteUser(auth.currentUser);
                            console.log("Deleted Firebase Auth account");
                        } catch (authError) {
                            console.warn("Could not delete auth account (may require re-authentication):", authError.message);
                        }
                    }
                    cloudDataCleared = true;
                    console.log("Cloud data deleted successfully");
                } catch (cloudError) {
                    console.warn("Could not delete cloud data (permissions issue):", cloudError.message);
                }
            }
            if (localDataCleared && cloudDataCleared) {
                toast.success("All your data and account have been permanently deleted.");
            } else if (localDataCleared && !cloudDataCleared) {
                toast.success("Local data deleted. Cloud data may require manual deletion from Firebase Console.");
            } else if (localDataCleared) {
                toast.success("Local data has been permanently deleted.");
            }
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        } catch (error) {
            console.error("Error deleting data:", error);
            toast.error(`Failed to delete data: ${error.message}`);
            setIsDeleting(false);
        }
    };
    return (
        <>
            <div className="max-w-2xl mx-auto space-y-8">
                <SettingsSection title="Data Management">
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="font-semibold text-slate-800 dark:text-gray-200">Export All Data</h4>
                            <p className="text-xs text-slate-600 dark:text-gray-400">Download a backup of all your data.</p>
                        </div>
                        <button
                            onClick={() => setShowExportModal(true)}
                            className="text-sm bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                        >
                            <FileOutput size={16} className="inline mr-1"/>
                            Export...
                        </button>
                    </div>
                </SettingsSection>
                <SettingsSection title="Danger Zone">
                    <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/30 border border-red-500/30 rounded-lg">
                        <div>
                            <h4 className="font-semibold text-red-700 dark:text-red-300">Delete All Data</h4>
                            <p className="text-xs text-red-600 dark:text-red-400">Permanently delete all data from this device and the cloud.</p>
                        </div>
                        <button
                            onClick={() => setShowDeleteModal(true)}
                            disabled={isDeleting}
                            className="text-sm bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-3 rounded focus:outline-none focus:ring-2 focus:ring-red-400 disabled:bg-slate-500"
                        >
                            {isDeleting ? "Deleting..." : "Delete..."}
                        </button>
                    </div>
                </SettingsSection>
            </div>
            <ExportModal
                show={showExportModal}
                onClose={() => setShowExportModal(false)}
                onExport={handleExportData}
            />
            {showDeleteModal && (
                <DeleteDataModal
                    onClose={() => setShowDeleteModal(false)}
                    onConfirmDelete={handleConfirmDelete}
                />
            )}
        </>
    );
};
const SettingsNotifications = () => {
    const {
        notificationPermission,
        notificationsEnabled,
        isLoading,
        toggleNotifications,
        sendTestNotification
    } = useNotifications();
    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <SettingsSection title="Push Notifications">
                <div className="space-y-6">
                    {}
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="font-semibold text-slate-800 dark:text-gray-200">Enable Notifications</h4>
                            <p className="text-xs text-slate-600 dark:text-gray-400">
                                Receive notifications even when the app is closed.
                            </p>
                            <p className="text-xs text-slate-500 dark:text-gray-500 mt-1">
                                Status: {notificationPermission === 'granted' ? '✅ Granted' :
                                        notificationPermission === 'denied' ? '❌ Denied' : '⏳ Not requested'}
                            </p>
                        </div>
                        <button
                            onClick={() => toggleNotifications(!notificationsEnabled)}
                            disabled={isLoading}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                                notificationsEnabled
                                    ? 'bg-primary'
                                    : 'bg-slate-200 dark:bg-slate-700'
                            } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                    notificationsEnabled ? 'translate-x-6' : 'translate-x-1'
                                }`}
                            />
                        </button>
                    </div>
                    {}
                    {notificationsEnabled && notificationPermission === 'granted' && (
                        <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
                            <div>
                                <h4 className="font-semibold text-slate-800 dark:text-gray-200">Test Notification</h4>
                                <p className="text-xs text-slate-600 dark:text-gray-400">
                                    Send a test notification to verify everything is working.
                                </p>
                            </div>
                            <button
                                onClick={sendTestNotification}
                                className="text-sm bg-primary hover:bg-primary/90 text-white font-semibold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-primary/50"
                            >
                                <BellRing size={16} className="inline mr-2" />
                                Test
                            </button>
                        </div>
                    )}
                    {}
                    {notificationPermission === 'denied' && (
                        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                            <div className="flex">
                                <AlertTriangle className="h-5 w-5 text-yellow-400" />
                                <div className="ml-3">
                                    <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                                        Notification Permission Denied
                                    </h4>
                                    <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                                        <p>To enable notifications, you need to grant permission in your browser settings.</p>
                                        <p className="mt-1">Look for the notification icon in your browser's address bar and click "Allow".</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    {}
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                        <div className="flex">
                            <BellRing className="h-5 w-5 text-blue-400" />
                            <div className="ml-3">
                                <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                                    How Push Notifications Work
                                </h4>
                                <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                                    <ul className="list-disc list-inside space-y-1">
                                        <li>Notifications work even when the app is closed or not in focus</li>
                                        <li>Requires browser permission and internet connection</li>
                                        <li>Future updates will include reminder notifications and goal progress alerts</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </SettingsSection>
        </div>
    );
};
const MobileSettingsSection = ({ title, icon, isActive, onClick, children }) => {
    const Icon = icon;
    return (
        <div className="bg-white dark:bg-slate-900">
            <button
                onClick={onClick}
                className={`w-full flex items-center justify-between p-4 border-b transition-colors ${
                    isActive
                        ? 'bg-primary/5 border-primary/20'
                        : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
                style={{
                    borderBottomColor: isActive ? 'var(--color-primary-hex)' : ''
                }}
            >
                <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${isActive ? 'bg-primary/10' : 'bg-slate-100 dark:bg-slate-800'}`}>
                        <Icon
                            size={20}
                            style={{ color: isActive ? 'var(--color-primary-hex)' : 'var(--color-text-muted)' }}
                        />
                    </div>
                    <h3 className="text-lg font-semibold" style={{
                        fontFamily: 'var(--font-serif)',
                        color: isActive ? 'var(--color-primary-hex)' : 'var(--color-text-primary)'
                    }}>
                        {title}
                    </h3>
                </div>
                <motion.div
                    animate={{ rotate: isActive ? 90 : 0 }}
                    transition={{ duration: 0.2 }}
                >
                    <ArrowLeft
                        size={20}
                        className="rotate-180"
                        style={{ color: isActive ? 'var(--color-primary-hex)' : 'var(--color-text-muted)' }}
                    />
                </motion.div>
            </button>
            <AnimatePresence>
                {isActive && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="overflow-hidden"
                    >
                        <div className="p-4 bg-slate-50 dark:bg-slate-800/50">
                            {children}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
export default SettingsPage;