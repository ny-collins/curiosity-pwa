import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useTheme } from '../hooks.js';
import { db, auth, app, functions, storage, appId, GoogleAuthProvider } from '../firebaseConfig.js';
import { PIN_STORAGE_KEY } from '../constants.js'; // Import from constants
import { signInAnonymously, onAuthStateChanged, linkWithPopup, signInWithPopup } from "firebase/auth";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import {
    doc, addDoc, setDoc, updateDoc, deleteDoc, onSnapshot,
    collection, query, serverTimestamp, getDocs, where, writeBatch
} from "firebase/firestore";
import { dateToKey, hashPin } from './utils.js'; // Import hashPin
import JSZip from 'jszip';
import { jsPDF } from 'jspdf';

const AppContext = createContext();

export function AppProvider({ children }) {
    // --- State ---
    const { 
        themeMode, setThemeMode, 
        themeColor, setThemeColor,
        themeFont, setThemeFont,
        fontSize, setFontSize 
    } = useTheme();
    
    const [isLoading, setIsLoading] = useState(true);
    const [checkingPin, setCheckingPin] = useState(true);
    const [isLocked, setIsLocked] = useState(false);
    const [appPin, setAppPin] = useState(null); // This will now store the HASH
    const [entries, setEntries] = useState([]);
    const [reminders, setReminders] = useState([]);
    const [activeEntryId, setActiveEntryId] = useState(null);
    const [settings, setSettings] = useState(null);
    const [currentView, setCurrentView] = useState('list');
    const [userId, setUserId] = useState(null);
    const [isAnonymous, setIsAnonymous] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);
    const [settingsDocRef, setSettingsDocRef] = useState(null);
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterYear, setFilterYear] = useState('All');
    const [filterMonth, setFilterMonth] = useState('All');
    const [filterTag, setFilterTag] = useState('All');
    const [filterType, setFilterType] = useState('All');
    const [installPromptEvent, setInstallPromptEvent] = useState(null);
    const [isAppInstalled, setIsAppInstalled] = useState(() => window.matchMedia('(display-mode: standalone)').matches);
    
    const [isEditorDirty, setIsEditorDirty] = useState(false);
    const [showUnsavedModal, setShowUnsavedModal] = useState(false);
    const [pendingView, setPendingView] = useState(null);
    const [forceEditorSave, setForceEditorSave] = useState(false);
    
    const [showOnboarding, setShowOnboarding] = useState(false);
    const [newEntryType, setNewEntryType] = useState('note');
    
    const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

    // --- Effects ---

    useEffect(() => {
        if (settings) {
            const color = settings.themeColor || '#14b8a6';
            let rgb = [20, 184, 172];
            if (/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.test(color)) {
                 const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(color);
                 rgb = result ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)] : rgb;
            }
            document.documentElement.style.setProperty('--color-primary-rgb', `${rgb[0]},${rgb[1]},${rgb[2]}`);
        }
    }, [settings?.themeColor]);

    useEffect(() => {
        if (VAPID_PUBLIC_KEY === 'YOUR_VAPID_PUBLIC_KEY_HERE') {
             console.warn("VAPID public key is not set in App.jsx. Notifications will fail.");
        }
        try {
            // Read the stored HASH (or old plaintext pin)
            const storedPin = localStorage.getItem(PIN_STORAGE_KEY);
            if (storedPin) { 
                setAppPin(storedPin); // Store the hash
                setIsLocked(true);
            }
            else { 
                setIsLocked(false); 
            }
            setCheckingPin(false);

            const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
                if (user) {
                    setUserId(user.uid);
                    setIsAnonymous(user.isAnonymous);
                    setCurrentUser(user);
                    const docRef = doc(db, `artifacts/${appId}/users/${user.uid}/settings/main`);
                    setSettingsDocRef(docRef);
                } else {
                    setUserId(null);
                    setIsAnonymous(true);
                    setCurrentUser(null);
                    setSettingsDocRef(null);
                    setEntries([]);
                    setReminders([]);
                    signInAnonymously(auth).catch((error) => { console.error("Auth error:", error); setIsLoading(false); });
                }
            });
            
             const handler = (e) => {
                e.preventDefault();
                setInstallPromptEvent(e);
              };
              window.addEventListener('beforeinstallprompt', handler);
            
            const mediaQueryList = window.matchMedia('(display-mode: standalone)');
            const updateInstallStatus = (e) => setIsAppInstalled(e.matches);
            mediaQueryList.addEventListener('change', updateInstallStatus);

            return () => {
                unsubscribeAuth();
                window.removeEventListener('beforeinstallprompt', handler);
                mediaQueryList.removeEventListener('change', updateInstallStatus);
            };
        } catch (error) { console.error("Initial setup error:", error); setIsLoading(false); setCheckingPin(false); }
    }, []);

    useEffect(() => {
        if (!app) return;
        let unsubscribeOnMessage;
        try {
            const messaging = getMessaging(app);
            unsubscribeOnMessage = onMessage(messaging, (payload) => {
                console.log("Message received in foreground: ", payload);
                const notification = payload.notification;
                alert(`Reminder: ${notification.body}`);
            });
        } catch (error) {
            console.error("Error setting up foreground message handler:", error);
        }
        return () => {
            if (unsubscribeOnMessage) unsubscribeOnMessage();
        };
    }, [app]);

    useEffect(() => {
        if (!settingsDocRef) return;
        const unsubscribe = onSnapshot(settingsDocRef, (doc) => {
            if (doc.exists()) {
                const data = doc.data();
                setSettings(data);
                setThemeColor(data.themeColor || '#14b8a6');
                setThemeFont(data.fontFamily || "var(--font-sans)");
                setThemeMode(data.themeMode || 'system');
                setFontSize(data.fontSize || '16px');
                setShowOnboarding(false);
            } else {
                const defaultPic = currentUser?.photoURL || '';
                const defaultSettings = {
                    username: 'Curious User',
                    profilePicUrl: defaultPic,
                    themeColor: '#14b8a6',
                    fontFamily: "var(--font-sans)",
                    themeMode: 'system',
                    fontSize: '16px'
                };
                setSettings(defaultSettings);
                setShowOnboarding(true);
            }
        }, (error) => console.error("Settings load error:", error));
        return () => unsubscribe();
    }, [settingsDocRef, currentUser, isAnonymous]);

    const [entriesLoaded, setEntriesLoaded] = useState(false);
    const [remindersLoaded, setRemindersLoaded] = useState(false);

    useEffect(() => {
        if (!userId || !db) {
            setEntries([]);
            setEntriesLoaded(true);
            return;
        }
        const collectionPath = `artifacts/${appId}/users/${userId}/entries`;
        const entriesQuery = query(collection(db, collectionPath));
        const unsubscribe = onSnapshot(entriesQuery, (snapshot) => {
            const entriesData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAtDate: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate() : null
            }));
            setEntries(entriesData);
            setEntriesLoaded(true);
        }, (error) => { console.error("Entry Snapshot error:", error); setEntriesLoaded(true); });
        return () => unsubscribe();
    }, [userId]);

    useEffect(() => {
        if (!userId || !db) {
            setReminders([]);
            setRemindersLoaded(true);
            setIsLoading(checkingPin);
            return;
        }
        const collectionPath = `artifacts/${appId}/users/${userId}/reminders`;
        const remindersQuery = query(collection(db, collectionPath));
        const unsubscribe = onSnapshot(remindersQuery, (snapshot) => {
            const remindersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
             remindersData.sort((a, b) => (a.date || "").localeCompare(b.date || ""));
            setReminders(remindersData);
            setRemindersLoaded(true);
        }, (error) => { console.error("Reminder Snapshot error:", error); setRemindersLoaded(true); });
        return () => unsubscribe();
    }, [userId, checkingPin]);

    useEffect(() => {
        if (!checkingPin && entriesLoaded && remindersLoaded && settings) {
            setIsLoading(false);
        }
    }, [checkingPin, entriesLoaded, remindersLoaded, settings]);

    // --- Memos ---
    
    const availableYears = useMemo(() => {
        const years = new Set(entries
            .map(entry => entry.createdAtDate?.getFullYear())
            .filter(year => year)
        );
        return Array.from(years).sort((a, b) => b - a);
     }, [entries]);
     
    const availableTags = useMemo(() => {
        const tags = new Set(entries.flatMap(entry => entry.tags || []));
        return Array.from(tags).sort();
    }, [entries]);

    const filteredEntries = useMemo(() => {
        const lowerSearchTerm = searchTerm.toLowerCase();
        
        return entries
            .filter(entry => {
                const typeMatch = filterType === 'All' || (entry.type || 'note') === filterType;
                if (!typeMatch) return false;

                const searchMatch = (
                    (entry.title?.toLowerCase() || '').includes(lowerSearchTerm) ||
                    (entry.content?.toLowerCase() || '').includes(lowerSearchTerm)
                );
                if (!searchMatch) return false;

                if (filterYear === 'All') {
                    return (filterTag === 'All' || (entry.tags && entry.tags.includes(filterTag)));
                }
                
                const entryYear = entry.createdAtDate?.getFullYear();
                if (entryYear !== parseInt(filterYear, 10)) return false;

                if (filterMonth === 'All') {
                    return (filterTag === 'All' || (entry.tags && entry.tags.includes(filterTag)));
                }

                const entryMonth = entry.createdAtDate?.getMonth() + 1;
                if(entryMonth !== parseInt(filterMonth, 10)) return false;
                
                return (filterTag === 'All' || (entry.tags && entry.tags.includes(filterTag)));
            })
            .sort((a, b) => {
                let timeA = a.updatedAt?.toMillis() || 0;
                let timeB = b.updatedAt?.toMillis() || 0;
                return timeB - timeA;
            });
    }, [entries, searchTerm, filterYear, filterMonth, filterTag, filterType]);
    
    const activeEntry = useMemo(() => {
        return entries.find(entry => entry.id === activeEntryId);
    }, [entries, activeEntryId]);

    // --- Handlers (wrapped in useCallback) ---

    const getEntriesCollection = useCallback(() => collection(db, `artifacts/${appId}/users/${userId}/entries`), [userId]);
    const getEntryDoc = useCallback((id) => doc(db, `artifacts/${appId}/users/${userId}/entries`, id), [userId]);
    const getRemindersCollection = useCallback(() => collection(db, `artifacts/${appId}/users/${userId}/reminders`), [userId]);
    const getReminderDoc = useCallback((id) => doc(db, `artifacts/${appId}/users/${userId}/reminders`, id), [userId]);
    const getSubscriptionsCollection = useCallback(() => collection(db, `artifacts/${appId}/users/${userId}/subscriptions`), [userId]);

    const handleCloseEditor = useCallback(() => {
        if (isCreating && isEditorDirty) {
             setPendingView('list');
             setShowUnsavedModal(true);
        } else {
            setActiveEntryId(null);
            setIsCreating(false);
            if (currentView === 'editor') {
                setCurrentView('list');
            }
        }
    }, [isCreating, isEditorDirty, currentView]);

    const handleCreateEntry = useCallback((type = 'note') => {
        if (!userId) return;
        setActiveEntryId(null);
        setNewEntryType(type);
        setIsCreating(true);
        setCurrentView('editor');
    }, [userId]);
    
    const handleViewChange = useCallback((newView) => {
        if (isCreating && isEditorDirty) {
            setPendingView(newView);
            setShowUnsavedModal(true);
        } else {
            setCurrentView(newView);
            if (isCreating) {
                setIsCreating(false);
            }
        }
    }, [isCreating, isEditorDirty]);
    
    const handleSelectEntry = useCallback((id) => {
         if (isCreating && isEditorDirty) {
            setPendingView(id); 
            setShowUnsavedModal(true);
        } else {
            setActiveEntryId(id);
            setIsCreating(false);
            setCurrentView('editor');
        }
    }, [isCreating, isEditorDirty]);

    const handleModalSave = useCallback(() => {
        setForceEditorSave(true);
    }, []);
    
    const handleModalDiscard = useCallback(() => {
        setShowUnsavedModal(false);
        setIsEditorDirty(false);
        setIsCreating(false);
        setForceEditorSave(false);
        if (pendingView && typeof pendingView === 'string') {
            setCurrentView(pendingView);
        } else if (pendingView) {
            setActiveEntryId(pendingView);
            setCurrentView('editor');
        }
        setPendingView(null);
    }, [pendingView]);
    
    const handleModalCancel = useCallback(() => {
        setShowUnsavedModal(false);
        setPendingView(null);
    }, []);

    const handleEditorSaveComplete = useCallback(() => {
        setForceEditorSave(false);
        handleModalDiscard();
    }, [handleModalDiscard]);

    const handleSaveNewEntry = useCallback(async (data) => {
        if (!userId) { console.error("Cannot save new entry, no user."); return; }
        try {
            const newEntryData = { 
                ...data, 
                type: data.type || 'note',
                createdAt: serverTimestamp(), 
                updatedAt: serverTimestamp() 
            };
            await addDoc(getEntriesCollection(), newEntryData);
            handleCloseEditor();
            if (!pendingView) {
                setCurrentView('list');
            }
        } catch (error) { console.error("Error saving new entry:", error); }
    }, [userId, getEntriesCollection, handleCloseEditor, pendingView]);
    
    const handleUpdateEntry = useCallback(async (id, updates) => {
        if (!userId) return;
        try {
            await updateDoc(getEntryDoc(id), { 
                ...updates, 
                type: updates.type || 'note',
                updatedAt: serverTimestamp() 
            });
        }
        catch (error) { console.error("Update error:", error); }
    }, [userId, getEntryDoc]);
    
     const handleDeleteEntry = useCallback(async (id) => {
        if (!userId) return;
        try {
            if (activeEntryId === id) { setActiveEntryId(null); }
            await deleteDoc(getEntryDoc(id));
        } catch (error) { console.error("Delete error:", error); }
    }, [userId, activeEntryId, getEntryDoc]);
    
    const handleAddReminder = useCallback(async (text, date) => {
        if (!userId || !text || !date) return;
        try {
            const dateString = dateToKey(date);
            if (!dateString) throw new Error("Invalid date selected");
            const newReminder = { text: text, date: dateString, createdAt: serverTimestamp() };
            await addDoc(getRemindersCollection(), newReminder);
        } catch (error) { console.error("Error adding reminder:", error); }
    }, [userId, getRemindersCollection]);
    
    const handleDeleteReminder = useCallback(async (id) => {
         if (!userId) return;
        try { await deleteDoc(getReminderDoc(id)); }
        catch (error) { console.error("Error deleting reminder:", error); }
    }, [userId, getReminderDoc]);
    
    const handleSaveSettings = useCallback(async ({ settings: newSettings, pin: newPin }) => {
         try {
             if(settingsDocRef) {
                 const fullSettings = { 
                     ...newSettings, 
                     themeMode, 
                     themeColor, 
                     fontFamily: themeFont,
                     fontSize
                 };
                 await setDoc(settingsDocRef, fullSettings, { merge: true });
                 setSettings(prevSettings => ({...prevSettings, ...fullSettings}));
             }
         }
        catch (error) { console.error("Save settings error:", error); }
        
        // --- PIN HASHING LOGIC ---
        if (newPin && newPin.length > 0) {
            try {
                const hashedPin = await hashPin(newPin);
                localStorage.setItem(PIN_STORAGE_KEY, hashedPin);
                setAppPin(hashedPin);
            } catch (error) {
                console.error("Error hashing pin:", error);
                alert("Error setting new PIN. Please try again.");
            }
        } else if (newPin === '') { // Explicitly clearing the pin
            localStorage.removeItem(PIN_STORAGE_KEY);
            setAppPin(null);
            setIsLocked(false);
        }
    }, [settingsDocRef, themeMode, themeColor, themeFont, fontSize]);

    const handleOnboardingComplete = useCallback(async (username, themeColor) => {
        if (!settingsDocRef) return;
        const newSettings = {
            username: username,
            profilePicUrl: currentUser?.photoURL || '',
            themeColor: themeColor,
            fontFamily: "var(--font-sans)",
            themeMode: 'system',
            fontSize: '16px'
        };
        try {
            await setDoc(settingsDocRef, newSettings, { merge: true });
            setSettings(newSettings);
            setThemeColor(newSettings.themeColor);
            setThemeFont(newSettings.fontFamily);
            setThemeMode(newSettings.themeMode);
            setFontSize(newSettings.fontSize);
            setShowOnboarding(false);
        } catch (error) {
            console.error("Error saving onboarding settings:", error);
            alert("Could not save settings. Please try again.");
        }
    }, [settingsDocRef, currentUser, setThemeColor, setThemeFont, setThemeMode, setFontSize]);
    
    const handleToggleSidebar = useCallback(() => setIsSidebarExpanded(!isSidebarExpanded), []);
    
    const handleFilterYearChange = useCallback((year) => {
        setFilterYear(year);
        if (year === 'All') {
            setFilterMonth('All');
        }
    }, []);
    
    const handleClearFilters = useCallback(() => {
        setSearchTerm('');
        setFilterYear('All');
        setFilterMonth('All');
        setFilterTag('All');
        setFilterType('All');
    }, []);
    
    const downloadFile = useCallback((data, filename, mimeType) => {
        const blob = new Blob([data], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, []);
    
    const handleExportData = useCallback(async (format) => {
        console.log(`Exporting data as ${format}...`);
        const exportDate = new Date().toISOString().split('T')[0];
        const filename = `curiosity_backup_${exportDate}`;
        const dataToExport = {
            settings: { ...settings },
            entries: entries.map(({ createdAtDate, ...rest }) => rest),
            reminders,
        };

        try {
            if (format === 'json') {
                const dataStr = JSON.stringify(dataToExport, (key, value) => {
                    if (value && typeof value === 'object' && value.hasOwnProperty('seconds')) {
                        return new Date(value.seconds * 1000).toISOString();
                    }
                    return value;
                }, 2);
                downloadFile(dataStr, `${filename}.json`, 'application/json');
            }
            else if (format === 'markdown') {
                const zip = new JSZip();
                zip.file('settings.json', JSON.stringify(dataToExport.settings, null, 2));
                zip.file('reminders.json', JSON.stringify(dataToExport.reminders, null, 2));
                const entriesFolder = zip.folder('entries');
                dataToExport.entries.forEach(entry => {
                    const entryDate = entry.createdAtDate ? entry.createdAtDate.toISOString().split('T')[0] : 'no-date';
                    const safeTitle = (entry.title || 'untitled').replace(/[^a-z0-9]/gi, '_').toLowerCase();
                    const entryFilename = `${entryDate}_${safeTitle}.md`;
                    let mdContent = `---
id: ${entry.id}
type: ${entry.type || 'note'}
createdAt: ${entry.createdAt?.toDate ? entry.createdAt.toDate().toISOString() : 'unknown'}
updatedAt: ${entry.updatedAt?.toDate ? entry.updatedAt.toDate().toISOString() : 'unknown'}
tags: [${(entry.tags || []).join(', ')}]
---

# ${entry.title || 'Untitled'}

${entry.content || ''}
`;
                    entriesFolder.file(entryFilename, mdContent);
                });
                const zipContent = await zip.generateAsync({ type: 'blob' });
                downloadFile(zipContent, `${filename}.zip`, 'application/zip');
            }
            else if (format === 'pdf') {
                const doc = new jsPDF();
                const sortedEntries = [...dataToExport.entries].sort((a, b) => {
                    const timeA = a.createdAt?.seconds || 0;
                    const timeB = b.createdAt?.seconds || 0;
                    return timeA - timeB;
                });
                doc.setFontSize(22);
                doc.text('Curiosity Export', 10, 20);
                doc.setFontSize(12);
                doc.text(`Exported on: ${exportDate}`, 10, 30);
                doc.text(`Total Entries: ${sortedEntries.length}`, 10, 36);
                doc.text(`Total Reminders: ${dataToExport.reminders.length}`, 10, 42);
                sortedEntries.forEach((entry) => {
                    doc.addPage();
                    doc.setFontSize(18);
                    doc.text(entry.title || 'Untitled Entry', 10, 20);
                    doc.setFontSize(10);
                    doc.setTextColor(100);
                    const entryDate = entry.createdAt?.toDate ? entry.createdAt.toDate().toLocaleString() : 'unknown date';
                    doc.text(`Created: ${entryDate}`, 10, 28);
                    doc.text(`Type: ${entry.type || 'note'}`, 10, 34);
                    if(entry.tags && entry.tags.length > 0) {
                        doc.text(`Tags: ${entry.tags.join(', ')}`, 10, 40);
                    }
                    doc.setDrawColor(200);
                    doc.line(10, 45, 200, 45);
                    doc.setFontSize(12);
                    doc.setTextColor(0);
                    const splitContent = doc.splitTextToSize(entry.content || '', 190);
                    doc.text(splitContent, 10, 55);
                });
                doc.save(`${filename}.pdf`);
            }
        } catch (error) {
            console.error(`Error exporting data as ${format}:`, error);
            alert(`An error occurred while exporting your data as ${format}.`);
        }
    }, [settings, entries, reminders, downloadFile]);
    
    const handleInstallApp = useCallback(async () => {
        if (!installPromptEvent) {
             alert("Installation is not available on this browser or has already been prompted.");
             return;
        }
        try {
            installPromptEvent.prompt();
            const { outcome } = await installPromptEvent.userChoice;
            if (outcome === 'accepted') {
                setInstallPromptEvent(null);
                setIsAppInstalled(true);
            }
        } catch (error) { console.error("Error showing install prompt:", error); }
    }, [installPromptEvent]);

    const saveTokenToFirestore = useCallback(async (token) => {
        if (!userId || !db || !token) { console.error("Cannot save token, invalid inputs"); return; }
        try {
            const subscriptionsRef = getSubscriptionsCollection();
            const q = query(subscriptionsRef, where("fcmToken", "==", token));
            const querySnapshot = await getDocs(q);
            if (querySnapshot.empty) {
                await addDoc(subscriptionsRef, { fcmToken: token, createdAt: serverTimestamp() });
                console.log("FCM token saved to Firestore.");
            }
        } catch (error) { console.error("Error saving FCM token to Firestore:", error); }
    }, [userId, getSubscriptionsCollection]);

    const handleRequestNotificationPermission = useCallback(async () => {
         if (!('Notification' in window) || !('serviceWorker' in navigator) || !('PushManager' in window)) {
            alert('Sorry, push notifications are not supported by your browser.');
            return null;
        }
         if (!app) { console.error("Firebase app not initialized."); return null; }
        try {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                const messaging = getMessaging(app);
                const fcmToken = await getToken(messaging, { vapidKey: VAPID_PUBLIC_KEY });
                if (fcmToken) {
                    await saveTokenToFirestore(fcmToken);
                }
            } else {
                 alert('Notification permission was denied. You can enable it in your browser settings.');
            }
            return permission;
        } catch (error) {
             console.error('Error getting FCM token:', error);
             alert('An error occurred while enabling notifications. Check browser settings.');
            return Notification?.permission || 'default';
        }
    }, [app, VAPID_PUBLIC_KEY, saveTokenToFirestore]);
    
    const handleDisableNotifications = useCallback(async () => {
         if (!('serviceWorker' in navigator) || !('PushManager' in window)) return null;
         if (!app || !userId || !db) return Notification?.permission || 'default';
        try {
            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.getSubscription();
            let unsubscribed = true;
            if (subscription) {
                unsubscribed = await subscription.unsubscribe();
            }
            if (unsubscribed) {
                const subscriptionsRef = getSubscriptionsCollection();
                const q = query(subscriptionsRef);
                const querySnapshot = await getDocs(q);
                if (!querySnapshot.empty) {
                    const batch = writeBatch(db);
                    querySnapshot.forEach(doc => batch.delete(doc.ref));
                    await batch.commit();
                }
                 alert("Notifications disabled for this device.");
                 return 'default';
            } else {
                 alert("Could not disable notifications. Please try again.");
            }
        } catch (error) {
             console.error("Error disabling notifications:", error);
             alert("An error occurred while disabling notifications.");
        }
         return Notification?.permission || 'default';
    }, [app, userId, getSubscriptionsCollection]);

    const handleLinkAccount = useCallback(async () => {
        if (!auth.currentUser || !auth.currentUser.isAnonymous) return;
        const provider = new GoogleAuthProvider();
        try {
            const result = await linkWithPopup(auth.currentUser, provider);
            const user = result.user;
            alert(`Account successfully linked to ${user.email}!`);
            if (settingsDocRef) {
                const updates = {};
                if ((!settings.username || settings.username === 'Collins') && user.displayName) {
                    updates.username = user.displayName;
                }
                 if (!settings.profilePicUrl && user.photoURL) {
                     updates.profilePicUrl = user.photoURL;
                }
                if (Object.keys(updates).length > 0) {
                     await setDoc(settingsDocRef, updates, { merge: true });
                }
            }
        } catch (error) {
            console.error("Error linking account:", error);
            if (error.code === 'auth/credential-already-in-use') {
                 alert("Error: This Google account is already linked to another user. Please sign in directly.");
            } else { alert("An error occurred while linking the account."); }
        }
    }, [settings, settingsDocRef]);
    
    const handleForgotPin = useCallback(async () => {
         if (!app) return;
         const provider = new GoogleAuthProvider();
         try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            if (user && !user.isAnonymous) {
                 alert("Identity verified. Removing local PIN.");
                localStorage.removeItem(PIN_STORAGE_KEY);
                setAppPin(null);
                setIsLocked(false);
            } else {
                 alert("Could not verify a permanent account. Please link your account in Settings first.");
            }
         } catch (error) {
              console.error("Error during PIN reset sign-in:", error);
              if (error.code === 'auth/account-exists-with-different-credential') {
                   alert("Error: An account exists, but re-authentication failed. Try again.");
              } else {
                   alert("Could not verify your identity. Please ensure you have linked your account via Settings.");
              }
         }
    }, [app]);
    
    // --- Value to Provide ---
    
    const value = {
        isLoading, checkingPin, isLocked, appPin, entries, reminders, activeEntryId, settings,
        currentView, userId, isAnonymous, currentUser, isSidebarExpanded, isCreating,
        searchTerm, filterYear, filterMonth, filterTag, filterType, installPromptEvent,
        isAppInstalled, isEditorDirty, showUnsavedModal, pendingView, forceEditorSave,
        showOnboarding, newEntryType,
        
        themeMode, themeColor, themeFont, fontSize,
        
        availableYears, availableTags, filteredEntries, activeEntry,

        setIsLocked, setAppPin, setActiveEntryId, setCurrentView, setIsSidebarExpanded,
        setIsCreating, setSearchTerm, setFilterYear, setFilterMonth, setFilterTag,
        setFilterType, setIsEditorDirty, setShowUnsavedModal, setForceEditorSave,
        
        setThemeMode, setThemeColor, setThemeFont, setFontSize,

        handleCreateEntry, handleViewChange, handleSelectEntry, handleModalSave,
        handleModalDiscard, handleModalCancel, handleEditorSaveComplete, handleSaveNewEntry,
        handleUpdateEntry, handleDeleteEntry, handleAddReminder, handleDeleteReminder,
        handleSaveSettings, handleOnboardingComplete, handleCloseEditor, handleToggleSidebar,
        handleFilterYearChange, handleClearFilters, handleExportData, handleInstallApp,
        handleRequestNotificationPermission, handleDisableNotifications, handleLinkAccount,
        handleForgotPin
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
}

export function useAppContext() {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
}
