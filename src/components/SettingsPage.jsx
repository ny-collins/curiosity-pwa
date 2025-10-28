import React, { useState, useEffect, useRef } from 'react';
import { X, ArrowLeft, AlertTriangle, Upload, Download, CheckCircle, BellRing, LogIn, User } from 'lucide-react';
import { getFunctions, httpsCallable } from "firebase/functions";
import { functions, storage, appId } from '../firebaseConfig'; 
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"; 
import DeleteDataModal from './DeleteDataModal';
import ThemedAvatar from './ThemedAvatar'; // Import ThemedAvatar
import LoadingSpinner from './LoadingSpinner'; // Import LoadingSpinner

// --- Theme Data ---
const themeColors = [
    { name: 'Teal', hex: '#14b8a6' },
    { name: 'Rose', hex: '#f43f5e' },
    { name: 'Pink', hex: '#ec4899' },
    { name: 'Fuchsia', hex: '#d946ef' },
    { name: 'Purple', hex: '#8b5cf6' },
    { name: 'Violet', hex: '#6366f1' },
    { name: 'Blue', hex: '#3b82f6' },
    { name: 'Sky', hex: '#0ea5e9' },
    { name: 'Cyan', hex: '#06b6d4' },
    { name: 'Emerald', hex: '#10b981' },
    { name: 'Amber', hex: '#f59e0b' },
    { name: 'Slate', hex: '#64748b' },
];
const fontOptions = [
    { name: 'Sans Serif', value: "'Inter', sans-serif" },
    { name: 'Serif', value: "'Merriweather', serif" },
    { name: 'Slab', value: "'Roboto Slab', serif" },
    { name: 'Stylistic', value: "'Dancing Script', cursive" },
];
// --------------------


function SettingsPage({
    onBack, onSave, initialSettings, initialPin,
    onRequestNotificationPermission, onDisableNotifications,
    onInstallApp, installPromptEvent, isAppInstalled,
    currentUser, isAnonymous, onLinkAccount
}) {
    // --- State ---
    const [username, setUsername] = useState('');
    const [profilePicUrl, setProfilePicUrl] = useState('');
    const [enableLock, setEnableLock] = useState(!!initialPin);
    const [pin, setPin] = useState(initialPin || '');
    const [notificationStatus, setNotificationStatus] = useState('default');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false); 
    const [isUploading, setIsUploading] = useState(false);
    const [activeThemeColor, setActiveThemeColor] = useState(initialSettings.themeColor || '#14b8a6');
    const [activeFont, setActiveFont] = useState(initialSettings.fontFamily || "'Inter', sans-serif");
    
    const fileInputRef = useRef(null); 

    // --- Effects ---
    // Load initial settings into local state
    useEffect(() => {
        if(initialSettings) {
            setUsername(initialSettings.username || (currentUser && !isAnonymous ? currentUser.displayName : 'Collins'));
            setProfilePicUrl(initialSettings.profilePicUrl || (currentUser && !isAnonymous ? currentUser.photoURL : ''));
            setActiveThemeColor(initialSettings.themeColor || '#14b8a6');
            setActiveFont(initialSettings.fontFamily || "'Inter', sans-serif");
        }
    }, [initialSettings, currentUser, isAnonymous]);


    // Check current notification permission status on mount
    useEffect(() => {
        if ('Notification' in window) {
            setNotificationStatus(Notification.permission);
        }
    }, []);

    // --- Live Theme Preview ---
    // Apply theme color changes instantly
    useEffect(() => {
        document.documentElement.style.setProperty('--color-primary-hex', activeThemeColor);
    }, [activeThemeColor]);

    // Apply font changes instantly
    useEffect(() => {
        document.documentElement.style.setProperty('--font-body', activeFont);
    }, [activeFont]);


    // --- Handlers ---
    const handleSave = () => {
        onSave({
            settings: { 
                username, 
                profilePicUrl,
                themeColor: activeThemeColor, // Save theme color
                fontFamily: activeFont,     // Save font family
            },
            pin: enableLock ? pin : null
        });
        alert("Settings Saved!");
    };
    
    const handleNotificationClick = async () => { /* ... (same as before) ... */ };
    const handleConfirmDelete = async () => { /* ... (same as before) ... */ };
    
    // Handle Profile Picture Upload
    const handleImageUpload = async (event) => {
        const file = event.target.files[0];
        if (!file || !currentUser || isAnonymous) {
             if(isAnonymous) alert("Please link your account to enable image uploads.");
             return;
        }
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
             alert("File is too large. Please select an image under 5MB.");
             return;
        }

        setIsUploading(true);
        console.log("Uploading profile picture...");
        
        const storageRef = ref(storage, `artifacts/${appId}/users/${currentUser.uid}/profile.jpg`);
        
        try {
            const snapshot = await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(snapshot.ref);
            
            console.log("File uploaded, URL:", downloadURL);
            setProfilePicUrl(downloadURL); // Update local state
            
            // Immediately save this new URL to settings
            onSave({
                settings: { 
                    ...initialSettings, // pass existing
                    username, // pass current local
                    profilePicUrl: downloadURL, // save new URL
                    themeColor: activeThemeColor, 
                    fontFamily: activeFont 
                },
                pin: enableLock ? pin : null
            });
        } catch (error) {
            console.error("Error uploading profile picture:", error);
            alert("Failed to upload image. Please try again.");
        } finally {
            setIsUploading(false);
        }
    };


    // --- Button Logic (calculating state) ---
    // ... (notificationButton, installButton, accountSection logic remains the same) ...
    let notificationButton;
    if (notificationStatus === 'granted') {
        notificationButton = ( <button onClick={handleNotificationClick} className={`text-sm font-semibold py-1 px-3 rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 transition-colors duration-200 flex items-center space-x-1 bg-red-600 hover:bg-red-700 text-white focus:ring-red-500`} title="Click to disable notifications"> <BellRing size={14}/> <span>Disable</span> </button> );
    } else if (notificationStatus === 'denied') {
         notificationButton = ( <button disabled className={`text-sm font-semibold py-1 px-3 rounded flex items-center space-x-1 bg-red-700 text-gray-300 cursor-not-allowed`}> <BellRing size={14}/> <span>Blocked</span> </button> );
    } else { 
         notificationButton = ( <button onClick={handleNotificationClick} className={`text-sm font-semibold py-1 px-3 rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 transition-colors duration-200 flex items-center space-x-1 bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500`}> <BellRing size={14}/> <span>Enable</span> </button> );
    }
     let installButton;
     if (isAppInstalled) {
         installButton = ( <button disabled className="text-sm font-semibold py-1 px-3 rounded flex items-center space-x-1 bg-green-600 text-white cursor-default"> <CheckCircle size={14}/> <span>Installed</span> </button> );
     } else if (installPromptEvent) {
          installButton = ( <button onClick={onInstallApp} className="text-sm font-semibold py-1 px-3 rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 transition-colors duration-200 flex items-center space-x-1 bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500"> <Download size={14}/> <span>Install App</span> </button> );
     } else {
         installButton = null; 
     }
    let accountSection;
    if (isAnonymous) {
        accountSection = (
            <div className="text-center p-4 bg-slate-700 rounded-md">
                <p className="text-sm text-gray-300 mb-3">Sync & backup your data by linking your account. This also enables PIN recovery.</p>
                <button onClick={onLinkAccount} className="w-full flex items-center justify-center space-x-2 bg-white text-gray-800 font-semibold py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-teal-400">
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google icon" className="w-5 h-5"/>
                    <span>Sign in with Google</span>
                </button>
            </div>
        );
    } else if (currentUser) {
         accountSection = (
            <div className="text-left p-4 bg-slate-700 rounded-md">
                <p className="text-sm text-gray-300 mb-3">You are signed in and your data is synced.</p>
                <div className="flex items-center space-x-3">
                    {/* Use ThemedAvatar for consistency */}
                    <ThemedAvatar 
                        profilePicUrl={currentUser.photoURL}
                        username={currentUser.displayName}
                        className="w-10 h-10"
                    />
                    <div className="flex flex-col">
                        <span className="text-white font-semibold">{currentUser.displayName || "User"}</span>
                        <span className="text-xs text-gray-400">{currentUser.email}</span>
                    </div>
                </div>
            </div>
         );
    }

    // --- Render ---
    return (
        <>
            <div className="flex flex-col h-full bg-slate-800 overflow-hidden">
                {/* Header */}
                <div className="p-4 border-b border-slate-700 flex justify-between items-center space-x-2 flex-shrink-0">
                    <button onClick={onBack} className="p-2 -ml-2 rounded-full text-gray-400 hover:text-white hover:bg-slate-700 md:hidden focus:outline-none focus:ring-2" aria-label="Back to list" title="Back to list">
                        <ArrowLeft size={22} />
                    </button>
                    <h2 className="text-2xl font-semibold text-white">Settings</h2>
                    <div className="flex items-center space-x-1 flex-shrink-0">
                        <button
                            onClick={handleSave}
                            disabled={isDeleting || isUploading || (enableLock && pin.length !== 4)}
                            className="text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 disabled:bg-slate-500 disabled:cursor-not-allowed"
                            style={{ backgroundColor: 'var(--color-primary-hex)' }} // Use theme color
                        >
                            {isDeleting ? "Deleting..." : isUploading ? "Saving..." : "Save"}
                        </button>
                    </div>
                </div>

                {/* Settings Sections - Scrollable area */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6 lg:p-8">
                    {/* Constrain width and center the content */}
                    <div className="max-w-xl mx-auto space-y-6"> 
                        
                        {/* Account Section */}
                        <div className="space-y-2">
                            <h3 className="text-lg font-medium text-white">Account & Sync</h3>
                            {accountSection}
                        </div>
                        
                        {/* Appearance Section (Rebuilt) */}
                         <div className="border-t border-slate-700 pt-6 space-y-4">
                            <h3 className="text-lg font-medium text-white">Appearance</h3>
                            {/* Theme Color */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Theme Color</label>
                                <div className="flex flex-wrap gap-3">
                                    {themeColors.map(color => (
                                        <button
                                            key={color.hex}
                                            title={color.name}
                                            onClick={() => setActiveThemeColor(color.hex)}
                                            className={`w-8 h-8 rounded-full cursor-pointer focus:outline-none transition-transform duration-100 ${activeThemeColor === color.hex ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900 scale-110' : 'hover:scale-110'}`}
                                            style={{ backgroundColor: color.hex }}
                                        />
                                    ))}
                                </div>
                            </div>
                             {/* Font Family */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Typography</label>
                                <div className="flex flex-wrap gap-2">
                                    {fontOptions.map(font => (
                                        <button
                                            key={font.value}
                                            onClick={() => setActiveFont(font.value)}
                                            className={`py-1 px-3 rounded-md text-sm ${activeFont === font.value ? 'text-white font-semibold' : 'bg-slate-700 text-gray-300 hover:bg-slate-600'}`}
                                            style={{ 
                                                fontFamily: font.value,
                                                // Apply theme color to active button
                                                backgroundColor: activeFont === font.value ? 'var(--color-primary-hex)' : undefined 
                                            }}
                                        >
                                            {font.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Profile Section (Rebuilt) */}
                        <div className="border-t border-slate-700 pt-6 space-y-4">
                            <h3 className="text-lg font-medium text-white">Profile</h3>
                            <div>
                                <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-1">Username</label>
                                <input type="text" id="username" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full bg-slate-700 text-white rounded-md border-slate-600 focus:border-teal-500 focus:ring-teal-500 p-2" placeholder="Your Name" />
                            </div>
                            <div>
                                <label htmlFor="profilePicUrl" className="block text-sm font-medium text-gray-300 mb-1">Profile Picture URL</label>
                                <input type="text" id="profilePicUrl" value={profilePicUrl} onChange={(e) => setProfilePicUrl(e.target.value)} className="w-full bg-slate-700 text-white rounded-md border-slate-600 focus:border-teal-500 focus:ring-teal-500 p-2" placeholder="https://your-image-url.com/pic.png" />
                            </div>
                             <div>
                                  <label className="block text-sm font-medium text-gray-300 mb-1">Upload Picture</label>
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
                                    className="w-full flex items-center justify-center space-x-2 bg-slate-700 text-white font-semibold py-2 px-4 rounded-lg hover:bg-slate-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-teal-400 disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    <Upload size={16} />
                                    <span>{isUploading ? "Uploading..." : "Upload from Device"}</span>
                                  </button>
                                   {isAnonymous && <p className="text-xs text-amber-400 mt-2">Please link your account to enable image uploads.</p>}
                             </div>
                        </div>

                        {/* Security Section (Rebuilt) */}
                        <div className="border-t border-slate-700 pt-6 space-y-4">
                            <h3 className="text-lg font-medium text-white">Security</h3>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-300">Enable App Lock (PIN)</span>
                                <button onClick={() => setEnableLock(!enableLock)} className={`${enableLock ? 'bg-primary' : 'bg-slate-600'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2`} style={{backgroundColor: enableLock ? 'var(--color-primary-hex)' : ''}}>
                                    <span className={`${enableLock ? 'translate-x-5' : 'translate-x-0'} inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`} />
                                </button>
                            </div>
                            {enableLock && (
                                <div>
                                    <label htmlFor="pin" className="block text-sm font-medium text-gray-300 mb-1">4-Digit PIN</label>
                                    <input type="password" id="pin" value={pin} onChange={(e) => { const val = e.target.value.replace(/\D/g, ''); if (val.length <= 4) setPin(val); }} maxLength={4}
                                        className="w-full bg-slate-700 text-white rounded-md border-slate-600 focus:border-teal-500 focus:ring-teal-500 p-2 tracking-widest"
                                        placeholder="••••" />
                                </div>
                            )}
                        </div>

                        {/* Application Section (Rebuilt) */}
                        <div className="border-t border-slate-700 pt-6 space-y-4">
                           <h3 className="text-lg font-medium text-white">Application</h3>
                            {installButton && ( 
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-300">Install App</span>
                                    {installButton}
                                </div>
                            )}
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-300">Reminder Notifications</span>
                                {notificationButton}
                            </div>
                            {notificationStatus === 'denied' && (
                                <p className="text-xs text-red-400">You have blocked notifications. Please enable them in your browser settings.</p>
                            )}
                        </div>

                        {/* Danger Zone Section (Rebuilt) */}
                        <div className="border-t border-red-500/30 pt-6 space-y-4">
                            <h3 className="text-lg font-medium text-red-500">Danger Zone</h3>
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="font-semibold text-gray-200">Delete All Data</h4>
                                    <p className="text-xs text-gray-400">Permanently delete all your entries and reminders.</p>
                                </div>
                                <button
                                    onClick={() => setShowDeleteModal(true)}
                                    disabled={isDeleting}
                                    className="text-sm bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-3 rounded focus:outline-none focus:ring-2 focus:ring-red-400 disabled:bg-slate-500"
                                >
                                    {isDeleting ? "Deleting..." : "Delete..."}
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {/* Modals */}
            {showDeleteModal && (
                <DeleteDataModal
                    onClose={() => setShowDeleteModal(false)}
                    onConfirmDelete={handleConfirmDelete}
                />
            )}
            {isUploading && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-800 rounded-lg p-6 flex flex-col items-center space-y-4">
                        <LoadingSpinner />
                        <p className="text-white">Uploading image...</p>
                    </div>
                </div>
            )}
        </>
    );
}

export default SettingsPage;
