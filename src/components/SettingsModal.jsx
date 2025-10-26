import React, { useState, useEffect } from 'react';
// Added BellRing, Download icons
import { X, BellRing, Download, CheckCircle } from 'lucide-react'; 

// Added new props for install and disable
function SettingsModal({ 
    onClose, onSave, initialSettings, initialPin, 
    onRequestNotificationPermission, onDisableNotifications, 
    onInstallApp, installPromptEvent, isAppInstalled 
}) {
    const [username, setUsername] = useState(initialSettings.username || 'Collins');
    const [profilePicUrl, setProfilePicUrl] = useState(initialSettings.profilePicUrl || '');
    const [enableLock, setEnableLock] = useState(!!initialPin);
    const [pin, setPin] = useState(initialPin || '');
    const [notificationStatus, setNotificationStatus] = useState('default'); 

    // Check current notification permission status on mount
    useEffect(() => {
        if ('Notification' in window) {
            setNotificationStatus(Notification.permission);
        }
    }, []);


    const handleSave = () => {
        onSave({
            settings: { username, profilePicUrl },
            pin: enableLock ? pin : null
        });
        onClose();
    };

    // Handle clicking the notification button (Enable or Disable)
    const handleNotificationClick = async () => {
        if (notificationStatus === 'granted') {
            // If already granted, the action is to disable
            try {
                const newStatus = await onDisableNotifications();
                if(newStatus) setNotificationStatus(newStatus);
            } catch (err) {
                 console.error("Error disabling notifications:", err);
            }
        } else if (notificationStatus === 'default' || notificationStatus === 'prompt') {
            // If default or prompt, the action is to request permission
            try {
                const newStatus = await onRequestNotificationPermission();
                if(newStatus) setNotificationStatus(newStatus); 
            } catch (err) {
                 console.error("Error requesting notification permission:", err);
            }
        }
        // If 'denied', button is disabled, do nothing
    };
    
    // Determine notification button text/style
    let notificationButton;
    if (notificationStatus === 'granted') {
        notificationButton = (
            <button
                onClick={handleNotificationClick}
                className={`text-sm font-semibold py-1 px-3 rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 transition-colors duration-200 flex items-center space-x-1 bg-red-600 hover:bg-red-700 text-white focus:ring-red-500`}
                title="Click to disable notifications"
            >
                <BellRing size={14}/>
                <span>Disable</span>
            </button>
        );
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
    } else { // default or prompt
         notificationButton = (
             <button
                onClick={handleNotificationClick}
                className={`text-sm font-semibold py-1 px-3 rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 transition-colors duration-200 flex items-center space-x-1 bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500`}
             >
                <BellRing size={14}/>
                <span>Enable</span>
             </button>
         );
    }
    
    // Determine install button state
     let installButton;
     if (isAppInstalled) {
         installButton = (
             <button
                disabled
                className="text-sm font-semibold py-1 px-3 rounded flex items-center space-x-1 bg-green-600 text-white cursor-default"
             >
                <CheckCircle size={14}/>
                <span>Installed</span>
             </button>
         );
     } else if (installPromptEvent) {
          installButton = (
             <button
                onClick={onInstallApp}
                className="text-sm font-semibold py-1 px-3 rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 transition-colors duration-200 flex items-center space-x-1 bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500"
             >
                <Download size={14}/>
                <span>Install App</span>
             </button>
         );
     } else {
         // Don't show the button if it's not installable or already installed and detected differently
         installButton = null; 
     }


    return (
        <div
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 transition-opacity duration-300"
            onClick={onClose}
        >
            <div
                className="bg-slate-800 rounded-lg shadow-xl p-6 w-full max-w-md"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-semibold text-white">Settings</h2>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-full text-gray-500 hover:text-white hover:bg-slate-700 focus:ring-2 focus:ring-teal-500"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Settings Sections */}
                <div className="space-y-6">
                    {/* Profile Section */}
                    <div>
                        {/* ... (Username and Profile Pic URL inputs remain the same) ... */}
                        <h3 className="text-lg font-medium text-white mb-2">Profile</h3>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-1">Username</label>
                                <input
                                    type="text" id="username" value={username} onChange={(e) => setUsername(e.target.value)}
                                    className="w-full bg-slate-700 text-white rounded-md border-slate-600 focus:border-teal-500 focus:ring-teal-500 p-2"
                                    placeholder="Your Name" />
                            </div>
                            <div>
                                <label htmlFor="profilePicUrl" className="block text-sm font-medium text-gray-300 mb-1">Profile Picture URL</label>
                                <input
                                    type="text" id="profilePicUrl" value={profilePicUrl} onChange={(e) => setProfilePicUrl(e.target.value)}
                                    className="w-full bg-slate-700 text-white rounded-md border-slate-600 focus:border-teal-500 focus:ring-teal-500 p-2"
                                    placeholder="https://your-image-url.com/pic.png" />
                            </div>
                        </div>
                    </div>

                    {/* Security Section */}
                    <div className="border-t border-slate-700 pt-6">
                        {/* ... (PIN Lock inputs remain the same) ... */}
                         <h3 className="text-lg font-medium text-white mb-2">Security</h3>
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-300">Enable App Lock (PIN)</span>
                            <button onClick={() => setEnableLock(!enableLock)} className={`${enableLock ? 'bg-teal-600' : 'bg-slate-600'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-teal-500`}>
                                <span className={`${enableLock ? 'translate-x-5' : 'translate-x-0'} inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`} />
                            </button>
                        </div>
                        {enableLock && (
                            <div className="mt-4">
                                <label htmlFor="pin" className="block text-sm font-medium text-gray-300 mb-1">4-Digit PIN</label>
                                <input type="password" id="pin" value={pin} onChange={(e) => { const val = e.target.value.replace(/\D/g, ''); if (val.length <= 4) setPin(val); }} maxLength={4}
                                    className="w-full bg-slate-700 text-white rounded-md border-slate-600 focus:border-teal-500 focus:ring-teal-500 p-2 tracking-widest"
                                    placeholder="••••" />
                            </div>
                        )}
                    </div>

                    {/* Application Section (Install & Notifications) */}
                    <div className="border-t border-slate-700 pt-6 space-y-4">
                         <h3 className="text-lg font-medium text-white mb-2">Application</h3>
                         {/* Install Button Row */}
                         {installButton && ( // Only show row if installButton is not null
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-300">Install App</span>
                                {installButton}
                            </div>
                         )}
                         {/* Notifications Row */}
                         <div className="flex items-center justify-between">
                             <span className="text-sm font-medium text-gray-300">Reminder Notifications</span>
                             {notificationButton}
                         </div>
                         {notificationStatus === 'denied' && (
                             <p className="text-xs text-red-400">You have blocked notifications. Please enable them in your browser settings if you wish to receive reminders.</p>
                         )}
                    </div>
                </div>

                {/* Save Button */}
                <div className="mt-8 flex justify-end">
                    <button
                        onClick={handleSave}
                        disabled={enableLock && pin.length !== 4}
                        className="bg-teal-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-teal-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-teal-400 disabled:bg-slate-500 disabled:cursor-not-allowed"
                    >
                        Save Settings
                    </button>
                </div>
            </div>
        </div>
    );
}

export default SettingsModal;
