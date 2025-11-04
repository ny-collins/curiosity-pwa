import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    X, ArrowLeft, AlertTriangle, Upload, Download, CheckCircle, BellRing, 
    LogIn, User, FileOutput, Sun, Moon, Laptop, CaseLower, CaseUpper, 
    Loader2, UserCircle, Palette, Lock, SlidersHorizontal, Database
} from 'lucide-react';
import { getFunctions, httpsCallable } from "firebase/functions";
import { functions, storage, appId } from '../firebaseConfig'; 
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"; 
import { useAppContext } from '../context/AppContext';
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
    const { handleViewChange } = useAppContext();
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
        <div className="flex flex-col h-full bg-white dark:bg-slate-900 overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center space-x-2 flex-shrink-0 bg-white dark:bg-slate-900 z-10">
                <button 
                    onClick={() => handleViewChange('dashboard')} 
                    className="p-2 -ml-2 rounded-full text-slate-500 dark:text-gray-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 md:hidden focus:outline-none focus:ring-2" 
                    style={{'--tw-ring-color': 'var(--color-primary-hex)'}} 
                    aria-label="Back to dashboard" 
                    title="Back to dashboard"
                >
                    <ArrowLeft size={22} />
                </button>
                <h2 className="text-2xl font-semibold text-slate-900 dark:text-white" style={{fontFamily: 'var(--font-serif)'}}>
                    Settings
                </h2>
                <div className="w-8"></div>
            </div>
            
            <div className="flex-1 flex overflow-hidden">
                <nav className="hidden md:flex flex-col w-64 border-r border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-4 space-y-1">
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
    const { settings, currentUser, isAnonymous, handleLinkAccount, handleSaveSettings, toast } = useAppContext();
    const [username, setUsername] = useState('');
    const [profilePicUrl, setProfilePicUrl] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (settings) {
            setUsername(settings.username || (currentUser && !isAnonymous ? currentUser.displayName : ''));
            setProfilePicUrl(settings.profilePicUrl || (currentUser && !isAnonymous ? currentUser.photoURL : ''));
        }
    }, [settings, currentUser, isAnonymous]);
    
    const handleSave = () => {
        handleSaveSettings({
            settings: { ...settings, username, profilePicUrl },
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
                settings: { ...settings, username, profilePicUrl: downloadURL },
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
        settings, handleSaveSettings, toast,
        themeMode: contextThemeMode, setThemeMode,
        themeColor: contextThemeColor, setThemeColor,
        themeFont: contextThemeFont, setThemeFont,
        fontSize: contextFontSize, setFontSize
    } = useAppContext();

    const [activeThemeMode, setActiveThemeMode] = useState(contextThemeMode);
    const [activeThemeColor, setActiveThemeColor] = useState(contextThemeColor);
    const [activeFont, setActiveFont] = useState(contextThemeFont);
    const [activeFontSize, setActiveFontSize] = useState(contextFontSize);

    useEffect(() => {
        setActiveThemeMode(contextThemeMode);
        setActiveThemeColor(contextThemeColor);
        setActiveFont(contextThemeFont);
        setActiveFontSize(contextFontSize);
    }, [contextThemeMode, contextThemeColor, contextThemeFont, contextFontSize]);

    const handleSave = () => {
        handleSaveSettings({
            settings: { 
                ...settings,
                themeMode: activeThemeMode,
                themeColor: activeThemeColor,
                fontFamily: activeFont,
                fontSize: activeFontSize
            },
            pin: null
        });
        toast.success("Appearance saved!");
    };
    
    const handleModeChange = (mode) => {
        setActiveThemeMode(mode);
        setThemeMode(mode);
    };
    
    const handleColorChange = (color) => {
        setActiveThemeColor(color);
        setThemeColor(color);
    };
    
    const handleFontChange = (font) => {
        setActiveFont(font);
        setThemeFont(font);
    };
    
    const handleFontSizeChange = (size) => {
        setActiveFontSize(size);
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
                                    activeThemeMode === mode.value
                                        ? 'bg-white dark:bg-slate-900 shadow-sm text-primary font-semibold'
                                        : 'text-slate-600 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                                }`}
                                style={{ color: activeThemeMode === mode.value ? 'var(--color-primary-hex)' : '' }}
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
                                className={`w-8 h-8 rounded-full cursor-pointer focus:outline-none transition-transform duration-100 ${activeThemeColor === color.hex ? 'ring-2 ring-offset-2 scale-110' : 'hover:scale-110'}`}
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
                                    className={`py-1 px-3 rounded-md text-sm transition-colors ${activeFont === font.value ? 'text-white font-semibold' : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-slate-600'}`}
                                    style={{ 
                                        fontFamily: font.value,
                                        backgroundColor: activeFont === font.value ? 'var(--color-primary-hex)' : undefined 
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
                                    activeFontSize === size.value
                                        ? 'bg-white dark:bg-slate-900 shadow-sm text-primary font-semibold'
                                        : 'text-slate-600 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                                }`}
                                style={{ color: activeFontSize === size.value ? 'var(--color-primary-hex)' : '' }}
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
    const { appPin, handleSaveSettings, toast, handleLockApp } = useAppContext();
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
    } = useAppContext();
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
    const { handleExportData, toast } = useAppContext();
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false); 
    const [showExportModal, setShowExportModal] = useState(false);

    const handleConfirmDelete = async () => {
        setIsDeleting(true);
        console.log("Calling 'deleteAllUserData' cloud function...");
        try {
            const deleteAllUserData = httpsCallable(functions, 'deleteAllUserData');
            const result = await deleteAllUserData({ appId: appId });
            console.log("Cloud function result:", result.data);
            toast.success("All your data has been permanently deleted.");
            window.location.reload(); 
        } catch (error) {
            console.error("Error calling deleteAllUserData:", error);
            toast.error(`An error occurred: ${error.message}`);
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