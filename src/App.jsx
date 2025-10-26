import React, { useState, useEffect, useMemo } from 'react';
import { BookOpen } from 'lucide-react';

// Import Components
import LoadingSpinner from './components/LoadingSpinner';
import PinLockScreen from './components/PinLockScreen';
import SettingsModal from './components/SettingsModal';
import Sidebar from './components/Sidebar';
import Editor from './components/Editor';
import BottomNavBar from './components/BottomNavBar';
import EntryList from './components/EntryList';
import CalendarView from './components/CalendarView';
import ReloadPrompt from './components/ReloadPrompt'; // Import the new ReloadPrompt

// Import Firebase config and core functions
import { db, auth, app, appId, PIN_STORAGE_KEY } from './firebaseConfig'; 
import { signInAnonymously, onAuthStateChanged } from "firebase/auth";
import { getMessaging, getToken, deleteToken } from "firebase/messaging"; // Import deleteToken
import {
    doc,
    addDoc,
    setDoc,
    updateDoc,
    deleteDoc,
    onSnapshot,
    collection,
    query,
    serverTimestamp,
    Timestamp,
    getDocs,
    where,
    writeBatch
} from "firebase/firestore";

// Import helper functions from utils
import { formatTimestamp, dateToKey, keyToDate } from './utils';

const VAPID_PUBLIC_KEY = 'BEM0ZQKHiRBOqjMy-_AN_AgV4C5VBsKAIpH6wTOhIJvoYJ7kQJgjkZBGyCaio6tnLYgbvZznB5ou2Oh8nU6NbAU'; 

// Main Application Component
export default function App() {
    // --- State Variables ---
    // ... (keep existing states) ...
    const [isLoading, setIsLoading] = useState(true);
    const [checkingPin, setCheckingPin] = useState(true);
    const [isLocked, setIsLocked] = useState(false);
    const [appPin, setAppPin] = useState(null);
    const [entries, setEntries] = useState([]);
    const [reminders, setReminders] = useState([]);
    const [activeEntryId, setActiveEntryId] = useState(null);
    const [showSettings, setShowSettings] = useState(false);
    const [settings, setSettings] = useState({ username: 'Collins', profilePicUrl: '' });
    const [currentView, setCurrentView] = useState('list');
    const [userId, setUserId] = useState(null);
    const [settingsDocRef, setSettingsDocRef] = useState(null);
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterYear, setFilterYear] = useState('All');
    const [filterMonth, setFilterMonth] = useState('All');
    // New states for PWA Install
    const [installPromptEvent, setInstallPromptEvent] = useState(null);
    const [isAppInstalled, setIsAppInstalled] = useState(
        window.matchMedia('(display-mode: standalone)').matches // Check initial install state
    );


    // --- Effects ---
     // Initialize Firebase Auth, Check PIN, Listen for Install Prompt
    useEffect(() => {
        if (VAPID_PUBLIC_KEY === 'YOUR_VAPID_PUBLIC_KEY_HERE') {
             console.warn("VAPID public key is not set in App.jsx. Notifications will fail.");
        }
        try {
            // ... (PIN check remains the same) ...
            const storedPin = localStorage.getItem(PIN_STORAGE_KEY);
            if (storedPin) { setAppPin(storedPin); setIsLocked(true); }
            else { setIsLocked(false); }
            setCheckingPin(false);


            // Auth listener
            const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
                if (user) {
                    console.log("User is signed in:", user.uid);
                    setUserId(user.uid);
                    const docRef = doc(db, `artifacts/${appId}/users/${user.uid}/settings/main`);
                    setSettingsDocRef(docRef);
                } else {
                    console.log("No user. Authenticating...");
                    setUserId(null); setSettingsDocRef(null); setEntries([]); setReminders([]);
                    signInAnonymously(auth).catch((error) => { console.error("Auth error:", error); setIsLoading(false); });
                }
            });
            
            // PWA Install Prompt listener
             const handler = (e) => {
                e.preventDefault(); // Prevent the mini-infobar
                console.log('beforeinstallprompt event fired');
                setInstallPromptEvent(e); // Store the event
              };
              window.addEventListener('beforeinstallprompt', handler);
            
            // Check for install state changes
            window.matchMedia('(display-mode: standalone)').addEventListener('change', (e) => {
                setIsAppInstalled(e.matches);
            });


            return () => {
                unsubscribeAuth();
                window.removeEventListener('beforeinstallprompt', handler);
                // Remove matchMedia listener? Maybe not necessary
            };
        } catch (error) { console.error("Initial setup error:", error); setIsLoading(false); setCheckingPin(false); }
    }, []);

    // ... (keep existing useEffects for Settings, Entries, Reminders) ...
    // Listen for Settings changes
    useEffect(() => {
        if (!settingsDocRef) return;
        const unsubscribe = onSnapshot(settingsDocRef, (doc) => {
            if (doc.exists()) { setSettings(doc.data()); }
            else { setSettings({ username: 'Collins', profilePicUrl: '' }); }
        }, (error) => console.error("Settings load error:", error));
        return () => unsubscribe();
    }, [settingsDocRef]);

    // Listen for Entry changes
    useEffect(() => {
        if (!userId || !db) { setEntries([]); return; }
        setIsLoading(true);
        const collectionPath = `artifacts/${appId}/users/${userId}/entries`;
        const entriesQuery = query(collection(db, collectionPath));
        const unsubscribe = onSnapshot(entriesQuery, (snapshot) => {
            const entriesData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAtDate: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate() : null
            }));
            setEntries(entriesData);
        }, (error) => { console.error("Entry Snapshot error:", error); setIsLoading(false); });
        return () => unsubscribe();
    }, [userId, db]);

    // Listen for Reminder changes
    useEffect(() => {
        if (!userId || !db) { setReminders([]); setIsLoading(checkingPin); return; }
        const collectionPath = `artifacts/${appId}/users/${userId}/reminders`;
        const remindersQuery = query(collection(db, collectionPath));
        const unsubscribe = onSnapshot(remindersQuery, (snapshot) => {
            const remindersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
             remindersData.sort((a, b) => (a.date || "").localeCompare(b.date || ""));
            setReminders(remindersData);
            setIsLoading(false);
        }, (error) => { console.error("Reminder Snapshot error:", error); setIsLoading(false); });
        return () => unsubscribe();
    }, [userId, db, checkingPin]);


    // --- Filtering & Derived State ---
    // ... (keep existing availableYears, filteredEntries) ...
    const availableYears = useMemo(() => {
        const years = new Set(entries
            .map(entry => entry.createdAtDate?.getFullYear())
            .filter(year => year)
        );
        return Array.from(years).sort((a, b) => b - a);
     }, [entries]);

    const filteredEntries = useMemo(() => {
        const lowerSearchTerm = searchTerm.toLowerCase();
        return entries
            .filter(entry => {
                const searchMatch = (
                    (entry.title?.toLowerCase() || '').includes(lowerSearchTerm) ||
                    (entry.content?.toLowerCase() || '').includes(lowerSearchTerm)
                );
                if (!searchMatch) return false;
                if (filterYear === 'All') return true;
                const entryYear = entry.createdAtDate?.getFullYear();
                if (entryYear !== parseInt(filterYear, 10)) return false;
                if (filterMonth === 'All') return true;
                const entryMonth = entry.createdAtDate?.getMonth() + 1;
                return entryMonth === parseInt(filterMonth, 10);
            })
            .sort((a, b) => {
                let timeA = a.updatedAt?.toMillis() || 0;
                let timeB = b.updatedAt?.toMillis() || 0;
                return timeB - timeA;
            });
    }, [entries, searchTerm, filterYear, filterMonth]);


    // --- Helper Functions ---
    // ... (keep existing helpers) ...
     const getEntriesCollection = () => collection(db, `artifacts/${appId}/users/${userId}/entries`);
    const getEntryDoc = (id) => doc(db, `artifacts/${appId}/users/${userId}/entries`, id);
    const getRemindersCollection = () => collection(db, `artifacts/${appId}/users/${userId}/reminders`);
    const getReminderDoc = (id) => doc(db, `artifacts/${appId}/users/${userId}/reminders`, id);
    const getSubscriptionsCollection = () => collection(db, `artifacts/${appId}/users/${userId}/subscriptions`);
    const getSettingsDoc = () => settingsDocRef;


    // --- Event Handlers ---
    // ... (keep existing handlers: create/save/update/delete entry, add/delete reminder, save settings) ...
     const handleCreateEntry = () => {
        if (!userId) return;
        setActiveEntryId(null);
        setIsCreating(true);
        setCurrentView('list');
        if (isSidebarExpanded) {
            // setIsSidebarExpanded(false); 
        }
    };
     const handleSaveNewEntry = async (data) => {
        if (!userId) { console.error("Cannot save new entry, no user."); return; }
        try {
            const newEntryData = { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() };
            await addDoc(getEntriesCollection(), newEntryData);
            handleCloseEditor();
        } catch (error) { console.error("Error saving new entry:", error); }
    };
    const handleUpdateEntry = async (id, updates) => {
        if (!userId) return;
        try {
            await updateDoc(getEntryDoc(id), { ...updates, updatedAt: serverTimestamp() });
        }
        catch (error) { console.error("Update error:", error); }
    };
     const handleDeleteEntry = async (id) => {
        if (!userId) return;
        try {
            if (activeEntryId === id) { setActiveEntryId(null); }
            await deleteDoc(getEntryDoc(id));
        } catch (error) { console.error("Delete error:", error); }
    };
    const handleAddReminder = async (text, date) => {
        if (!userId || !text || !date) return;
        try {
            const dateString = dateToKey(date);
            if (!dateString) throw new Error("Invalid date selected");
            const newReminder = { text: text, date: dateString, createdAt: serverTimestamp() };
            await addDoc(getRemindersCollection(), newReminder);
        } catch (error) { console.error("Error adding reminder:", error); }
    };
    const handleDeleteReminder = async (id) => {
         if (!userId) return;
        try { await deleteDoc(getReminderDoc(id)); }
        catch (error) { console.error("Error deleting reminder:", error); }
    };
    const handleSaveSettings = async ({ settings: newSettings, pin: newPin }) => {
         try { if(settingsDocRef) await setDoc(settingsDocRef, newSettings, { merge: true }); }
        catch (error) { console.error("Save settings error:", error); }
        if (newPin) { localStorage.setItem(PIN_STORAGE_KEY, newPin); setAppPin(newPin); }
        else { localStorage.removeItem(PIN_STORAGE_KEY); setAppPin(null); setIsLocked(false); }
    };
    const handleCloseEditor = () => {
        setActiveEntryId(null);
        setIsCreating(false);
    };
    const handleToggleSidebar = () => setIsSidebarExpanded(!isSidebarExpanded);
    const handleFilterYearChange = (year) => {
        setFilterYear(year);
        if (year === 'All') { setFilterMonth('All'); }
    };
    const handleClearFilters = () => {
        setSearchTerm(''); setFilterYear('All'); setFilterMonth('All');
    };

    // --- PWA & Notification Handlers ---
    
    // Handler for "Install App" button
    const handleInstallApp = async () => {
        if (!installPromptEvent) {
             alert("Installation is not available on this browser or has already been prompted.");
             return;
        }
        try {
            installPromptEvent.prompt(); // Show the browser's install prompt
            const { outcome } = await installPromptEvent.userChoice;
            if (outcome === 'accepted') {
                console.log('User accepted the install prompt');
                setInstallPromptEvent(null); // Clear the event
                setIsAppInstalled(true);
            } else {
                console.log('User dismissed the install prompt');
            }
        } catch (error) {
             console.error("Error showing install prompt:", error);
        }
    };

    // Request Notification Permission & Get FCM Token
    const handleRequestNotificationPermission = async () => {
        // ... (function remains the same as previous step) ...
         if (!('Notification' in window) || !('serviceWorker' in navigator) || !('PushManager' in window)) {
            console.warn('Push notifications not supported by this browser.');
            alert('Sorry, push notifications are not supported by your browser.');
            return null;
        }
         if (!app) { console.error("Firebase app not initialized."); return null; }

        try {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                console.log('Notification permission granted.');
                const messaging = getMessaging(app);
                const fcmToken = await getToken(messaging, { vapidKey: VAPID_PUBLIC_KEY });
                if (fcmToken) {
                    console.log('FCM Token retrieved:', fcmToken);
                    await saveTokenToFirestore(fcmToken); 
                } else { console.warn('No FCM token received.'); }
            } else {
                console.warn('Notification permission denied.');
                 alert('Notification permission was denied. You can enable it in browser settings.');
            }
            return permission; 
        } catch (error) {
            console.error('Error getting FCM token:', error);
             alert('An error occurred while enabling notifications. Check browser settings.');
            return Notification?.permission || 'default'; 
        }
    };

     // Save the FCM Token to Firestore
    const saveTokenToFirestore = async (token) => { /* ... (function remains the same) ... */
        if (!userId || !db || !token) { console.error("Cannot save token, invalid inputs"); return; }
        try {
            const subscriptionsRef = getSubscriptionsCollection();
            const q = query(subscriptionsRef, where("fcmToken", "==", token));
            const querySnapshot = await getDocs(q);
            if (querySnapshot.empty) {
                await addDoc(subscriptionsRef, { fcmToken: token, createdAt: serverTimestamp() });
                console.log("FCM token saved to Firestore.");
            } else { console.log("FCM token already exists in Firestore."); }
        } catch (error) { console.error("Error saving FCM token to Firestore:", error); }
    };
    
    // NEW: Handle Disabling Notifications
    const handleDisableNotifications = async () => {
         if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
             console.warn('Push notifications not supported by this browser.');
             return null;
         }
         if (!app || !userId || !db) {
             console.error("Cannot disable notifications: app/user/db not ready.");
             return Notification?.permission || 'default';
         }

        try {
             // 1. Get current registration and subscription
            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.getSubscription();

            if (subscription) {
                 // 2. Unsubscribe from push manager
                const unsubscribed = await subscription.unsubscribe();
                if (unsubscribed) {
                    console.log('Successfully unsubscribed from Push Manager.');
                     // 3. Delete *all* FCM tokens from Firestore for this user
                     // We delete all just in case other devices were registered
                     // A safer approach might be to delete only the *current* token
                     // but finding the *current* token requires getting it first.
                     // Let's delete all for this user for simplicity.
                    const subscriptionsRef = getSubscriptionsCollection();
                    const q = query(subscriptionsRef); // Get all subscriptions for user
                    const querySnapshot = await getDocs(q);
                    
                    if (!querySnapshot.empty) {
                        const batch = writeBatch(db);
                        querySnapshot.forEach(doc => {
                            batch.delete(doc.ref);
                            console.log("Deleting subscription doc:", doc.id);
                        });
                        await batch.commit();
                        console.log("Removed all FCM tokens from Firestore.");
                    }
                     alert("Notifications disabled for this device.");
                     return 'default'; // Return the new (likely 'default' or 'prompt') status
                } else {
                     console.warn("Failed to unsubscribe from Push Manager.");
                     alert("Could not disable notifications. Please try again.");
                }
            } else {
                console.log("No active subscription found to disable.");
                // Ensure Firestore is clean anyway?
                // (Could be redundant, but safe)
                const subscriptionsRef = getSubscriptionsCollection();
                const querySnapshot = await getDocs(query(subscriptionsRef));
                if (!querySnapshot.empty) {
                     const batch = writeBatch(db);
                     querySnapshot.forEach(doc => batch.delete(doc.ref));
                     await batch.commit();
                     console.log("Cleaned up orphaned FCM tokens from Firestore.");
                }
                return 'default';
            }
        } catch (error) {
             console.error("Error disabling notifications:", error);
             alert("An error occurred while disabling notifications.");
        }
         return Notification?.permission || 'default'; // Return current status on error
    };


    // --- Render Logic ---
    // ... (render logic remains the same) ...
    if (checkingPin || isLoading) { return <LoadingSpinner />; }
    if (isLocked) { return <PinLockScreen correctPin={appPin} onUnlock={() => setIsLocked(false)} />; }

    const activeEntry = entries.find(entry => entry.id === activeEntryId);

    let mainContent;
    if (isCreating || activeEntryId) { 
        mainContent = (
            <Editor
                entry={isCreating ? null : activeEntry} 
                onUpdate={handleUpdateEntry} onSaveNew={handleSaveNewEntry} 
                onDelete={handleDeleteEntry} onBack={handleCloseEditor} 
                onCreate={handleCreateEntry} isCreating={isCreating} 
                className={`flex w-full h-full flex-col pb-16 md:pb-0`} 
                username={settings.username}
            />
        );
    } else if (currentView === 'list') {
        mainContent = (
             <div className="flex flex-col flex-grow h-full overflow-y-auto pb-16 md:pb-0 custom-scrollbar"> 
                <EntryList
                    entries={filteredEntries} 
                    searchTerm={searchTerm}    
                    onSearchChange={setSearchTerm} 
                    filterYear={filterYear} 
                    onFilterYearChange={handleFilterYearChange} 
                    filterMonth={filterMonth} 
                    onFilterMonthChange={setFilterMonth} 
                    availableYears={availableYears} 
                    onSelect={setActiveEntryId} 
                    onDelete={handleDeleteEntry} 
                    activeEntryId={null} 
                    onClearFilters={handleClearFilters} 
                />
             </div>
        );
    } else { // currentView === 'calendar'
        mainContent = (
             <div className="flex flex-col flex-grow h-full overflow-y-auto pb-16 md:pb-0 custom-scrollbar"> 
                 <CalendarView 
                     reminders={reminders} 
                     onAddReminder={handleAddReminder} 
                     onDeleteReminder={handleDeleteReminder} 
                     entries={entries} 
                     onSelect={setActiveEntryId} 
                 />
             </div>
        );
    }


    return (
        <> {/* Use Fragment to hold App and ReloadPrompt */}
            <div className="h-full relative flex md:flex-row overflow-hidden bg-slate-900 text-gray-200">
                 {/* Desktop Sidebar */}
                 <div className="hidden md:block fixed top-0 left-0 h-full z-30">
                    <Sidebar
                        onCreate={handleCreateEntry} onShowSettings={() => setShowSettings(true)}
                        className="h-full" 
                        settings={settings} currentView={currentView} onViewChange={setCurrentView}
                        isExpanded={isSidebarExpanded} onToggleExpand={handleToggleSidebar} 
                        entries={entries} activeEntryId={activeEntryId} onSelect={setActiveEntryId} onDelete={handleDeleteEntry}
                    />
                </div>

                {/* Main Content Area */}
                <main className={`flex-1 h-full overflow-hidden transition-all duration-300 ease-in-out ${isSidebarExpanded ? 'md:pl-64' : 'md:pl-16'}`}>
                     {mainContent}
                     {isSidebarExpanded && ( <div className="fixed inset-0 bg-black/30 z-20 hidden md:block lg:hidden" onClick={handleToggleSidebar}></div> )}
                </main>

                {/* Bottom Navigation for Mobile */}
                 <BottomNavBar
                    onCreate={handleCreateEntry} currentView={currentView} onViewChange={setCurrentView}
                    onShowSettings={() => setShowSettings(true)} settings={settings}
                />

                {/* Settings Modal */}
                {showSettings && (
                    <SettingsModal
                        onClose={() => setShowSettings(false)} 
                        onSave={handleSaveSettings}
                        initialSettings={settings} 
                        initialPin={appPin}
                        onRequestNotificationPermission={handleRequestNotificationPermission} 
                        onDisableNotifications={handleDisableNotifications} // Pass disable handler
                        onInstallApp={handleInstallApp} // Pass install handler
                        installPromptEvent={installPromptEvent} // Pass the event
                        isAppInstalled={isAppInstalled} // Pass install status
                    />
                )}
            </div>
            
             {/* PWA Reload Prompt Toast */}
             <ReloadPrompt /> 
        </>
    );
}
