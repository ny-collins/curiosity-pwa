import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    X, ArrowLeft, AlertTriangle, Upload, Download, CheckCircle, BellRing, 
    LogIn, User, FileOutput, Sun, Moon, Laptop, CaseLower, CaseUpper, 
    Loader2, UserCircle, Palette, Lock, SlidersHorizontal, Database, Fingerprint
} from 'lucide-react';
import { getFunctions, httpsCallable } from "firebase/functions";
import { functions, storage, appId, firestoreDb } from '../firebaseConfig';
import { collection, query, getDocs, writeBatch } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"; 
import { useAppState } from '../contexts/StateProvider';
import { db } from '../db';
import DeleteDataModal from './DeleteDataModal';
import ThemedAvatar from './ThemedAvatar';
import ExportModal from './ExportModal';
import { THEME_COLORS, FONT_CATEGORIES, THEME_MODES, FONT_SIZES, LIMITS } from '../constants.js';

const settingsTabs = [
    { id: 'profile', name: 'Profile', icon: UserCircle },
    { id: 'appearance', name: 'Appearance', icon: Palette },
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
        <div className="flex flex-col h-full overflow-hidden bg-white dark:bg-slate-900" style={{ backgroundColor: 'var(--color-bg-base)' }}>
            {/* Mobile Header - Simplified */}
            <div className="md:hidden p-4 flex justify-between items-center space-x-2 flex-shrink-0 border-b"
                 style={{
                     borderBottomColor: 'var(--color-border)',
                     backgroundColor: 'var(--color-bg-content)'
                 }}>
                <button
                    onClick={() => handleViewChange('dashboard')}
                    className="p-2 -ml-2 rounded-full text-slate-500 dark:text-gray-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus:ring-2"
                    style={{'--tw-ring-color': 'var(--color-primary-hex)'}}
                    aria-label="Back to dashboard"
                    title="Back to dashboard"
                >
                    <ArrowLeft size={22} />
                </button>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white" style={{fontFamily: 'var(--font-serif)'}}>
                    Settings
                </h2>
                <div className="w-8"></div>
            </div>

            {/* Mobile Tab Navigation */}
            <div className="md:hidden border-b flex-shrink-0 overflow-x-auto"
                 style={{
                     borderBottomColor: 'var(--color-border)',
                     backgroundColor: 'var(--color-bg-content)'
                 }}>
                <div className="flex min-w-max">
                    {settingsTabs.map(tab => (
                        <MobileSettingsTabButton
                            key={tab.id}
                            icon={tab.icon}
                            label={tab.name}
                            isActive={activeTab === tab.id}
                            onClick={() => setActiveTab(tab.id)}
                        />
                    ))}
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Mobile Content Area */}
                <div className="md:hidden flex-1 overflow-y-auto custom-scrollbar p-4 bg-slate-50 dark:bg-slate-800">
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

                {/* Desktop Layout */}
                <div className="hidden md:flex flex-1 overflow-hidden">
                    {/* Desktop Sidebar Navigation */}
                    <nav className="flex flex-col w-64 border-r border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-4 space-y-1 flex-shrink-0">
                        {settingsTabs.map(tab => (
                            <SettingsTabButton
                                key={tab.id}
                                icon={tab.icon}
                                label={tab.name}
                                isActive={activeTab === tab.id}
                                onClick={() => setActiveTab(tab.id)}
                            />
                        ))}
                    </nav>

                    {/* Desktop Content Area */}
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
        <button
            onClick={onClick}
            className={`flex items-center space-x-3 w-full h-10 px-3 rounded-lg transition-colors duration-150 ${activeClass}`}
            style={{ 
                color: isActive ? 'var(--color-primary-hex)' : '',
                backgroundColor: isActive ? 'rgba(var(--color-primary-rgb), 0.1)' : ''
            }}
        >
            <Icon size={20} className="flex-shrink-0" />
            <span className="text-sm font-medium truncate">{label}</span>
        </button>
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
    <section className="space-y-6">
        <h3 className="text-xl font-semibold text-slate-900 dark:text-white" style={{fontFamily: 'var(--font-serif)'}}>
            {title}
        </h3>
        <div className="space-y-6">
            {children}
        </div>
    </section>
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
            <div className="text-center p-4 bg-slate-100 dark:bg-slate-700 rounded-md">
                <p className="text-sm text-slate-700 dark:text-gray-300 mb-3">Sync & backup your data by linking your account. This also enables PIN recovery.</p>
                <button onClick={handleLinkAccount} className="w-full flex items-center justify-center space-x-2 bg-white dark:bg-slate-800 text-slate-800 dark:text-white font-semibold py-2 px-4 rounded-lg border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors duration-200 focus:outline-none focus:ring-2" style={{'--tw-ring-color': 'var(--color-primary-hex)'}}>
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google icon" className="w-5 h-5"/>
                    <span>Sign in with Google</span>
                </button>
            </div>
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
                    <label htmlFor="username" className="block text-sm font-medium text-slate-600 dark:text-gray-300 mb-1">Username</label>
                    <input type="text" id="username" value={username} onChange={(e) => setUsername(e.target.value)} className="form-input w-full bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white rounded-md border-slate-300 dark:border-slate-600" placeholder="Your Name" />
                </div>
                <div>
                    <label htmlFor="profilePicUrl" className="block text-sm font-medium text-slate-600 dark:text-gray-300 mb-1">Profile Picture URL</label>
                    <input type="text" id="profilePicUrl" value={profilePicUrl} onChange={(e) => setProfilePicUrl(e.target.value)} className="form-input w-full bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white rounded-md border-slate-300 dark:border-slate-600" placeholder="https://your-image-url.com/pic.png" />
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
                      <button
                        onClick={() => fileInputRef.current.click()} 
                        disabled={isUploading || isAnonymous} 
                        className="w-full flex items-center justify-center space-x-2 bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-white font-semibold py-2 px-4 rounded-lg border border-slate-300 dark:border-slate-600 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors duration-200 focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{'--tw-ring-color': 'var(--color-primary-hex)'}}
                      >
                        {isUploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                        <span>{isUploading ? "Uploading..." : "Upload from Device"}</span>
                      </button>
                       {isAnonymous && <p className="text-xs text-amber-500 dark:text-amber-400 mt-2">Please link your account to enable image uploads.</p>}
                 </div>
                 <button
                    onClick={handleSave}
                    disabled={isUploading}
                    className="text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 disabled:bg-slate-400 dark:disabled:bg-slate-700 disabled:cursor-not-allowed"
                    style={{ backgroundColor: 'var(--color-primary-hex)', '--tw-ring-color': 'var(--color-primary-hex)' }}
                >
                    {isUploading ? "Saving..." : "Save Profile"}
                </button>
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
                    <div className="flex items-center space-x-2 rounded-lg bg-slate-100 dark:bg-slate-700 p-1">
                        {THEME_MODES.map(mode => (
                            <button
                                key={mode.value}
                                onClick={() => handleModeChange(mode.value)}
                                className={`flex-1 flex justify-center items-center space-x-2 py-2 px-3 rounded-md text-sm transition-colors ${
                                    themeMode === mode.value
                                        ? 'bg-white dark:bg-slate-900 shadow-sm text-primary font-semibold'
                                        : 'text-slate-600 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                                }`}
                                style={{ color: themeMode === mode.value ? 'var(--color-primary-hex)' : '' }}
                            >
                                <mode.icon size={16} />
                                <span>{mode.name}</span>
                            </button>
                        ))}
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-600 dark:text-gray-300 mb-2">Theme Color</label>
                    <div className="flex flex-wrap gap-3">
                        {THEME_COLORS.map(color => (
                            <button
                                key={color.hex}
                                title={color.name}
                                onClick={() => handleColorChange(color.hex)}
                                className={`w-8 h-8 rounded-full cursor-pointer focus:outline-none transition-transform duration-100 ${themeColor === color.hex ? 'ring-2 ring-offset-2 scale-110' : 'hover:scale-110'}`}
                                style={{ 
                                    backgroundColor: color.hex, 
                                    '--tw-ring-color': 'var(--color-primary-hex)',
                                    ringColor: 'var(--color-primary-hex)',
                                    ringOffsetColor: 'var(--color-bg-base)'
                                }}
                            />
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
                
                <button
                    onClick={handleSave}
                    className="text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2"
                    style={{ backgroundColor: 'var(--color-primary-hex)', '--tw-ring-color': 'var(--color-primary-hex)' }}
                >
                    Save Appearance
                </button>
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
                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700 dark:text-gray-300">Enable App Lock (PIN)</span>
                    <button onClick={() => setEnableLock(!enableLock)} className={`${enableLock ? 'bg-primary' : 'bg-slate-400 dark:bg-slate-600'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2`} style={{backgroundColor: enableLock ? 'var(--color-primary-hex)' : '', '--tw-ring-color': 'var(--color-primary-hex)'}}>
                        <span className={`${enableLock ? 'translate-x-5' : 'translate-x-0'} inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`} />
                    </button>
                </div>
                {enableLock && (
                    <div>
                        <label htmlFor="pin" className="block text-sm font-medium text-slate-600 dark:text-gray-300 mb-1">
                            {appPin ? 'Change 4-Digit PIN' : 'Set 4-Digit PIN'}
                        </label>
                        <input type="password" id="pin" value={pin} 
                            onChange={(e) => { const val = e.target.value.replace(/\D/g, ''); if (val.length <= LIMITS.PIN_LENGTH) setPin(val); }} 
                            maxLength={LIMITS.PIN_LENGTH}
                            className="form-input w-full bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white rounded-md border-slate-300 dark:border-slate-600 tracking-widest"
                            placeholder={appPin ? 'Enter new PIN' : '••••'} />
                    </div>
                )}
                {appPin && (
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-700 dark:text-gray-300">Lock App Now</span>
                        <button
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
                            onClick={handleDisableBiometric}
                            className="text-sm font-semibold py-1 px-3 rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-800 transition-colors duration-200 flex items-center space-x-1 bg-red-600 hover:bg-red-700 text-white focus:ring-red-500"
                        >
                            <Fingerprint size={14}/>
                            <span>Disable</span>
                        </button>
                    </div>
                )}
                
                <button
                    onClick={handleSave}
                    className="text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2"
                    style={{ backgroundColor: 'var(--color-primary-hex)', '--tw-ring-color': 'var(--color-primary-hex)' }}
                >
                    Save Security Settings
                </button>
            </SettingsSection>
        </div>
    );
};

const SettingsApplication = () => {
    const { 
        handleRequestNotificationPermission, handleDisableNotifications,
        handleInstallApp, installPromptEvent, isAppInstalled
    } = useAppState();
    const [notificationStatus, setNotificationStatus] = useState('default');

    useEffect(() => {
        if ('Notification' in window) {
            setNotificationStatus(Notification.permission);
        }
    }, []);
    
    const handleNotificationClick = async () => {
        let newStatus = null;
        if (notificationStatus === 'granted') {
            try { newStatus = await handleDisableNotifications(); } 
            catch (err) { console.error("Error disabling notifications:", err); }
        } else if (notificationStatus === 'default' || notificationStatus === 'prompt') {
            try { newStatus = await handleRequestNotificationPermission(); } 
            catch (err) { console.error("Error requesting notification permission:", err); }
        }
        if (newStatus) setNotificationStatus(newStatus);
    };
    
    let notificationButton;
    if (notificationStatus === 'granted') {
        notificationButton = ( <button onClick={handleNotificationClick} className={`text-sm font-semibold py-1 px-3 rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-800 transition-colors duration-200 flex items-center space-x-1 bg-red-600 hover:bg-red-700 text-white focus:ring-red-500`} title="Click to disable notifications"> <BellRing size={14}/> <span>Disable</span> </button> );
    } else if (notificationStatus === 'denied') {
         notificationButton = ( <button disabled className={`text-sm font-semibold py-1 px-3 rounded flex items-center space-x-1 bg-red-700 text-gray-300 cursor-not-allowed`}> <BellRing size={14}/> <span>Blocked</span> </button> );
    } else { 
         notificationButton = ( <button onClick={handleNotificationClick} className={`text-sm font-semibold py-1 px-3 rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-800 transition-colors duration-200 flex items-center space-x-1 bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500`}> <BellRing size={14}/> <span>Enable</span> </button> );
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
        console.log("Deleting all user data...");
        
        let localDataCleared = false;
        let cloudDataCleared = false;
        
        try {
            console.log("Clearing local IndexedDB data...");
            try {
                await db.entries.clear();
                await db.reminders.clear();
                await db.goals.clear();
                await db.tasks.clear();
                await db.vaultItems.clear();
                await db.settings.clear();
                const { PIN_STORAGE_KEY, WEBAUTHN_CREDENTIAL_ID_KEY } = await import('../constants');
                localStorage.removeItem(PIN_STORAGE_KEY);
                localStorage.removeItem(WEBAUTHN_CREDENTIAL_ID_KEY);
                console.log("PIN and security credentials cleared");
                
                localDataCleared = true;
                console.log("Local data cleared successfully");
            } catch (localError) {
                console.error("Error clearing local data:", localError);
                throw new Error("Failed to clear local data");
            }
            if (userId && firestoreDb) {
                console.log("Attempting to delete cloud data for user:", userId);
                
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
                    
                    cloudDataCleared = true;
                    console.log("Cloud data deleted successfully");
                } catch (cloudError) {
                    console.warn("Could not delete cloud data (permissions issue):", cloudError.message);
                    // Don't throw - local data is more important
                }
            }

            // Show appropriate success message
            if (localDataCleared && cloudDataCleared) {
                toast.success("All your data has been permanently deleted.");
            } else if (localDataCleared && !cloudDataCleared) {
                toast.success("Local data deleted. Cloud data may require manual deletion from Firebase Console.");
            } else if (localDataCleared) {
                toast.success("Local data has been permanently deleted.");
            }
            
            // Reload the page after a short delay
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

export default SettingsPage;