import React, { useState, useEffect, useMemo } from 'react';
import { BookOpen } from 'lucide-react'; 
import LoadingSpinner from './components/LoadingSpinner';
import PinLockScreen from './components/PinLockScreen';
import SettingsPage from './components/SettingsPage'; 
import Sidebar from './components/Sidebar'; 
import Editor from './components/Editor';
import BottomNavBar from './components/BottomNavBar';
import EntryList from './components/EntryList'; 
import CalendarView from './components/CalendarView'; 
import ReloadPrompt from './components/ReloadPrompt';
import SplashScreen from './components/SplashScreen';
import { db, auth, app, functions, storage, appId, PIN_STORAGE_KEY, GoogleAuthProvider } from './firebaseConfig'; 
import { signInAnonymously, onAuthStateChanged, linkWithPopup, signInWithPopup } from "firebase/auth"; 
import { getMessaging, getToken, deleteToken } from "firebase/messaging"; 
import {
    doc, addDoc, setDoc, updateDoc, deleteDoc, onSnapshot, 
    collection, query, serverTimestamp, getDocs, where, writeBatch
} from "firebase/firestore";
import { formatTimestamp, dateToKey, keyToDate, stripMarkdown } from './utils';

const VAPID_PUBLIC_KEY = 'BPk_f_2-4qQ1uPOwHYmdjVnOq8sdFj82eZ-gREl1dUSb-SgNPqWWtKBRDBA-uGsRlhRViDbWeZimXWYYYxY-S_M'; 

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) { outputArray[i] = rawData.charCodeAt(i); }
  return outputArray;
}

const LogoPath = () => (
  <path 
    d="M60.385 151.154c-4.76-1.483-7.38-4.875-7.733-10.01l-.188-2.733-1.439-.242c-2.004-.338-4.753-1.844-5.866-3.215-1.284-1.581-1.495-3.744-.546-5.599 1.016-1.984 2.985-3.115 7.61-4.37.258-.07.4-.726.4-1.84v-1.73l-1.677-.394c-5.745-1.347-8.547-5.52-6.112-9.097.462-.68 1.074-1.424 1.359-1.655.98-.796 3.712-1.964 5.07-2.167l1.36-.203v-3.694l-1.244-.21c-.685-.115-2.088-.607-3.12-1.093-6.783-3.198-5.179-10.047 2.783-11.879l1.581-.364v-3.641l-1.36-.203c-1.723-.258-4.292-1.467-5.428-2.555-1.416-1.356-1.93-2.638-1.762-4.388.267-2.773 2.931-5.099 6.838-5.97l1.743-.389-.095-1.77-.095-1.77-1.725-.44c-4.121-1.048-6.448-3.125-6.66-5.946-.259-3.44 2.4-5.883 7.665-7.043.846-.186.88-.27.88-2.2 0-4.446 2.02-7.794 5.896-9.768l2.188-1.115 37.185-.085 37.185-.085v15.968l-2.109-.094-2.108-.094.044-5.117c.025-2.814-.048-5.358-.162-5.654-.193-.5-2.26-.539-28.937-.539H73.077v99.398l28.843-.081 28.844-.081.06-5.257c.033-2.89.069-5.436.08-5.655.013-.275.659-.398 2.097-.398h2.077v15.929l-36.673-.021c-29.391-.018-36.94-.105-38.02-.441zm8.218-53.695V47.76h-3.567c-3.239 0-3.695.075-4.945.805-.851.497-1.718 1.381-2.266 2.31l-.887 1.505v13.061l.799-.105c.972-.128 2.94-1.228 3.292-1.84.177-.308.887-.444 2.317-.444 1.861 0 2.061.063 2.061.65 0 1.191-1.258 3.128-2.654 4.085-1.265.868-3.598 1.78-5.176 2.024-.61.094-.643.377-.726 6.386-.085 6.158-.073 6.288.57 6.288.97 0 2.628-.773 3.322-1.55.5-.56.968-.68 2.636-.68 1.904 0 2.028.045 2.028.734 0 .403-.416 1.388-.925 2.188-1.052 1.654-3.837 3.262-6.283 3.628l-1.42.212v6.335c0 5.824.044 6.335.558 6.329.807-.01 3.04-1.076 3.555-1.695.325-.391.968-.528 2.477-.528 1.927 0 2.038.04 2.038.749 0 2.025-3.037 4.646-6.378 5.504l-2.25.578v12.652l1.038-.223c1.409-.302 2.791-1.036 3.007-1.596.265-.689 4.583-.663 4.583.027 0 2.393-3.21 5.096-7.02 5.91l-1.609.344v12.702l.879-.21c1.275-.305 3.276-1.356 3.276-1.72 0-.174 1.003-.312 2.277-.312h2.277l-.207 1.034c-.459 2.286-3.642 4.719-6.904 5.277l-1.438.247.023 2.092c.029 2.627 1.093 4.63 3.097 5.827 1.235.737 1.671.809 4.95.812l3.595.003zm-16.045 34.326c-.107-2.622-.19-2.667-2.731-1.463-2.293 1.086-1.673 2.508 1.516 3.475.44.133.915.255 1.055.27s.211-1.012.16-2.282m.065-17.165v-2.272l-1.121.181c-1.434.232-3.033 1.362-3.033 2.143 0 .616.684 1.129 2.397 1.797 1.7.663 1.757.603 1.757-1.85m0-17.161c0-2.586-.2-2.704-2.568-1.514-1.117.561-1.426.89-1.426 1.514 0 .623.31.952 1.426 1.513 2.368 1.19 2.568 1.073 2.568-1.513m0-17.238v-2.264l-.878.212c-3.248.786-4.044 2.34-1.838 3.585.703.396 1.602.724 1.997.726.68.005.72-.121.72-2.259m0-17.187c0-2.557-.064-2.593-2.494-1.386-2.187 1.086-2.282 2.014-.302 2.937 1.708.795 2.255.966 2.557.795.132-.074.24-1.13.24-2.346m61.842 75.926c-1.055-.465-1.969-.881-2.03-.924-.063-.043.616-4.997 1.508-11.01l1.62-10.931 3.324-7.646c15.109-34.761 18.306-42.123 21.516-49.538 2.01-4.643 4.091-9.344 4.625-10.447 2.72-5.62 9.736-6.863 14.111-2.501 1.775 1.768 2.31 3.2 2.279 6.1-.027 2.52-.064 2.632-3.463 10.353a5938 5938 0 0 0-9.04 20.707 86310 86310 0 0 0-15.65 36.04l-1.745 4.023-6.716 7.445c-3.693 4.095-7.1 7.835-7.569 8.31l-.853.866zm8.914-13.256c1.388-1.526 2.444-2.853 2.347-2.95-.387-.385-6.078-2.694-6.241-2.531-.21.209-1.644 9.544-1.642 10.686.002.883-.003.888 5.536-5.205m7.615-12.237c15.949-36.702 20.703-47.698 20.703-47.887 0-.277-7.676-3.583-7.87-3.39-.077.076-4.951 11.233-10.832 24.792-5.88 13.56-11.054 25.409-11.495 26.333-.442.923-.801 1.855-.8 2.07.004.295 6.745 3.554 7.672 3.709.09.015 1.27-2.517 2.622-5.627m24.454-56.308c.894-2.102 1.713-4.089 1.817-4.414.342-1.061-.418-2.974-1.589-3.999-.918-.803-1.402-.984-2.632-.983-1.708 0-3.218.767-3.819 1.937-1.332 2.598-3.56 8.103-3.36 8.3.474.466 7.594 3.383 7.773 3.185.1-.112.915-1.923 1.81-4.026" />
);

const LogoSvg = () => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="40 40 130 130" 
        className="w-8 h-8"
        style={{ color: 'var(--color-primary-hex)'}}
        fill="currentColor"
        stroke="none"
    >
        <LogoPath />
    </svg>
);

const MobileHeader = () => (
    <div className="p-4 border-b border-slate-700 flex items-center space-x-2 md:hidden flex-shrink-0">
        <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="40 40 130 130" 
            className="w-8 h-8"
            style={{ color: 'var(--color-primary-hex)'}}
            fill="currentColor"
            stroke="none"
        >
            <LogoPath />
        </svg>
        <span style={{ fontFamily: 'var(--font-logo)' }} className="text-2xl text-white">Curiosity</span>
    </div>
);

export default function App() {
    const [isLoading, setIsLoading] = useState(true);
    const [checkingPin, setCheckingPin] = useState(true);
    const [isLocked, setIsLocked] = useState(false);
    const [appPin, setAppPin] = useState(null);
    const [entries, setEntries] = useState([]); 
    const [reminders, setReminders] = useState([]); 
    const [activeEntryId, setActiveEntryId] = useState(null);
    const [settings, setSettings] = useState({ 
        username: 'Collins', 
        profilePicUrl: '', 
        themeColor: '#14b8a6', 
        fontFamily: "var(--font-sans)" 
    }); 
    const [currentView, setCurrentView] = useState('list'); 
    const [userId, setUserId] = useState(null);
    const [isAnonymous, setIsAnonymous] = useState(true); 
    const [currentUser, setCurrentUser] = useState(null); 
    const [settingsDocRef, setSettingsDocRef] = useState(null);
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [searchTerm, setSearchTerm] = useState(''); 
    const [filterYear, setFilterYear] = useState('All'); 
    const [filterMonth, setFilterMonth] = useState('All'); 
    const [filterTag, setFilterTag] = useState('All');
    const [installPromptEvent, setInstallPromptEvent] = useState(null);
    const [isAppInstalled, setIsAppInstalled] = useState(() => window.matchMedia('(display-mode: standalone)').matches);
    
    useEffect(() => {
        document.documentElement.style.setProperty('--color-primary-hex', settings.themeColor || '#14b8a6');
        
        const color = settings.themeColor || '#14b8a6';
        let rgb = [20, 184, 172]; 
        if (/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.test(color)) {
             const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(color);
             rgb = result ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)] : rgb;
        }
        document.documentElement.style.setProperty('--color-primary-rgb', `${rgb[0]},${rgb[1]},${rgb[2]}`);
        
        document.documentElement.style.setProperty('--font-body', settings.fontFamily || "var(--font-sans)");
    }, [settings.themeColor, settings.fontFamily]); 

    useEffect(() => {
        if (VAPID_PUBLIC_KEY === 'YOUR_VAPID_PUBLIC_KEY_HERE') {
             console.warn("VAPID public key is not set in App.jsx. Notifications will fail.");
        }
        try {
            const storedPin = localStorage.getItem(PIN_STORAGE_KEY);
            if (storedPin) { setAppPin(storedPin); setIsLocked(true); }
            else { setIsLocked(false); }
            setCheckingPin(false);

            const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
                if (user) {
                    console.log("User is signed in:", user.uid, "Anonymous:", user.isAnonymous);
                    setUserId(user.uid);
                    setIsAnonymous(user.isAnonymous); 
                    setCurrentUser(user); 
                    const docRef = doc(db, `artifacts/${appId}/users/${user.uid}/settings/main`);
                    setSettingsDocRef(docRef);
                } else {
                    console.log("No user. Authenticating...");
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
                console.log('beforeinstallprompt event fired');
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
        if (!settingsDocRef) return; 
        const unsubscribe = onSnapshot(settingsDocRef, (doc) => {
            if (doc.exists()) {
                const data = doc.data();
                setSettings(prev => ({...prev, ...data})); 
            } else {
                const defaultUsername = currentUser?.displayName || 'Collins';
                const defaultPic = currentUser?.photoURL || ''; 
                const defaultSettings = { 
                    username: defaultUsername, 
                    profilePicUrl: defaultPic, 
                    themeColor: '#14b8a6', 
                    fontFamily: "var(--font-sans)" 
                };
                setSettings(defaultSettings);
                if (currentUser && !isAnonymous) { 
                     setDoc(settingsDocRef, defaultSettings, { merge: true });
                }
            }
        }, (error) => console.error("Settings load error:", error));
        return () => unsubscribe();
    }, [settingsDocRef, currentUser, isAnonymous]); 

    const [entriesLoaded, setEntriesLoaded] = useState(false);
    const [remindersLoaded, setRemindersLoaded] = useState(false);

    useEffect(() => {
        if (!userId || !db) { 
            setEntries([]); 
            setEntriesLoaded(true); // Mark as "loaded" (with zero entries)
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
        }, (error) => { 
            console.error("Entry Snapshot error:", error); 
            setEntriesLoaded(true); // Mark as loaded even on error
        });
        return () => unsubscribe();
    }, [userId, db]);

    useEffect(() => {
        if (!userId || !db) { 
            setReminders([]); 
            setRemindersLoaded(true); // Mark as "loaded" (with zero reminders)
            setIsLoading(checkingPin); // Depend only on pin check
            return; 
        }
        const collectionPath = `artifacts/${appId}/users/${userId}/reminders`;
        const remindersQuery = query(collection(db, collectionPath));
        const unsubscribe = onSnapshot(remindersQuery, (snapshot) => {
            const remindersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
             remindersData.sort((a, b) => (a.date || "").localeCompare(b.date || ""));
            setReminders(remindersData);
            setRemindersLoaded(true);
        }, (error) => { 
            console.error("Reminder Snapshot error:", error); 
            setRemindersLoaded(true); // Mark as loaded even on error
        });
        return () => unsubscribe();
    }, [userId, db, checkingPin]);

    useEffect(() => {
        if (!checkingPin && entriesLoaded && remindersLoaded) {
            setIsLoading(false);
        }
    }, [checkingPin, entriesLoaded, remindersLoaded]);


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
    }, [entries, searchTerm, filterYear, filterMonth, filterTag]);

     const getEntriesCollection = () => collection(db, `artifacts/${appId}/users/${userId}/entries`);
    const getEntryDoc = (id) => doc(db, `artifacts/${appId}/users/${userId}/entries`, id);
    const getRemindersCollection = () => collection(db, `artifacts/${appId}/users/${userId}/reminders`);
    const getReminderDoc = (id) => doc(db, `artifacts/${appId}/users/${userId}/reminders`, id);
    const getSubscriptionsCollection = () => collection(db, `artifacts/${appId}/users/${userId}/subscriptions`);
    const getSettingsDoc = () => settingsDocRef;

     const handleCreateEntry = () => {
        if (!userId) return;
        setActiveEntryId(null);
        setIsCreating(true);
        if (isSidebarExpanded) {
        }
    };
     const handleSaveNewEntry = async (data) => {
        if (!userId) { console.error("Cannot save new entry, no user."); return; }
        try {
            const newEntryData = { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() };
            await addDoc(getEntriesCollection(), newEntryData);
            handleCloseEditor();
            setCurrentView('list');
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
         try { 
             if(settingsDocRef) {
                 await setDoc(settingsDocRef, newSettings, { merge: true }); 
                 setSettings(prevSettings => ({...prevSettings, ...newSettings}));
             }
         }
        catch (error) { console.error("Save settings error:", error); }
        if (newPin) { localStorage.setItem(PIN_STORAGE_KEY, newPin); setAppPin(newPin); }
        else { localStorage.removeItem(PIN_STORAGE_KEY); setAppPin(null); setIsLocked(false); }
    };
    const handleCloseEditor = () => {
        setActiveEntryId(null);
        setIsCreating(false);
        if (currentView === 'settings') {
            setCurrentView('list'); 
        }
    };
    const handleToggleSidebar = () => setIsSidebarExpanded(!isSidebarExpanded);
    const handleFilterYearChange = (year) => {
        setFilterYear(year);
        if (year === 'All') {
            setFilterMonth('All'); 
        }
    };
    const handleClearFilters = () => {
        setSearchTerm(''); 
        setFilterYear('All'); 
        setFilterMonth('All');
        setFilterTag('All');
    };
    
    const handleExportData = () => {
        try {
            console.log("Exporting data...");
            const cleanEntries = entries.map(({ createdAtDate, ...rest }) => rest);
            const cleanSettings = { ...settings }; 
            
            const dataToExport = {
                settings: cleanSettings,
                entries: cleanEntries,
                reminders,
            };
            const dataStr = JSON.stringify(dataToExport, (key, value) => {
                if (value && typeof value === 'object' && value.hasOwnProperty('seconds') && value.hasOwnProperty('nanoseconds')) {
                    return new Date(value.seconds * 1000).toISOString();
                }
                return value;
            }, 2);
            
            const blob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `curiosity_backup_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            console.log("Export successful.");
        } catch (error) {
            console.error("Error exporting data:", error);
            alert("An error occurred while exporting your data.");
        }
    };

    const handleInstallApp = async () => {
        if (!installPromptEvent) {
             alert("Installation is not available on this browser or has already been prompted.");
             return;
        }
        try {
            installPromptEvent.prompt(); 
            const { outcome } = await installPromptEvent.userChoice;
            if (outcome === 'accepted') {
                console.log('User accepted the install prompt');
                setInstallPromptEvent(null); 
                setIsAppInstalled(true);
            } else {
                console.log('User dismissed the install prompt');
            }
        } catch (error) {
             console.error("Error showing install prompt:", error);
        }
    };

    const handleRequestNotificationPermission = async () => {
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
                
                const fcmToken = await getToken(messaging, {
                    vapidKey: VAPID_PUBLIC_KEY 
                });

                if (fcmToken) {
                    console.log('FCM Token retrieved:', fcmToken);
                    await saveTokenToFirestore(fcmToken); 
                } else {
                    console.warn('No FCM token received. User might need to retry.');
                }
                
            } else {
                console.warn('Notification permission denied.');
                 alert('Notification permission was denied. You can enable it in your browser settings.');
            }
            return permission; 
        } catch (error) {
            console.error('Error getting FCM token:', error);
             alert('An error occurred while enabling notifications. Check browser settings.');
            return Notification?.permission || 'default'; 
        }
    };

    const saveTokenToFirestore = async (token) => { 
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
            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.getSubscription();
            
            let unsubscribed = true;
            if (subscription) {
                unsubscribed = await subscription.unsubscribe();
            }

            if (unsubscribed) {
                console.log('Successfully unsubscribed from Push Manager (or was already unsubscribed).');
                
                const subscriptionsRef = getSubscriptionsCollection();
                const q = query(subscriptionsRef); 
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
                 return 'default'; 
            } else {
                 console.warn("Failed to unsubscribe from Push Manager.");
                 alert("Could not disable notifications. Please try again.");
            }
        } catch (error) {
             console.error("Error disabling notifications:", error);
             alert("An error occurred while disabling notifications.");
        }
         return Notification?.permission || 'default'; 
    };

    const handleLinkAccount = async () => {
        if (!auth.currentUser || !auth.currentUser.isAnonymous) {
            console.warn("User is not anonymous, cannot link.");
            return;
        }
        const provider = new GoogleAuthProvider();
        try {
            const result = await linkWithPopup(auth.currentUser, provider);
            const user = result.user;
            console.log("Anonymous account successfully linked to:", user.email);
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
            } else {
                 alert("An error occurred while linking the account.");
            }
        }
    };
    
    const handleForgotPin = async () => {
         if (!app) { console.error("Firebase app not initialized."); return; }
         console.log("Forgot PIN clicked. Initiating sign-in...");
         const provider = new GoogleAuthProvider();
         
         try {
            const result = await signInWithPopup(auth, provider);
            
            const user = result.user;
            if (user && !user.isAnonymous) {
                 console.log("Successfully re-authenticated as:", user.email);
                 alert("Identity verified. Removing local PIN.");
                localStorage.removeItem(PIN_STORAGE_KEY);
                setAppPin(null);
                setIsLocked(false); 
            } else {
                 console.warn("Forgot PIN sign-in resulted in an anonymous user?");
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
    };

    if (checkingPin || isLoading) { 
        return <SplashScreen />; 
    }
    if (isLocked) { 
        return <PinLockScreen 
                  correctPin={appPin} 
                  onUnlock={() => setIsLocked(false)}
                  onForgotPin={handleForgotPin} 
               />; 
    }

    const activeEntry = entries.find(entry => entry.id === activeEntryId);
    
    const MobileHeader = () => (
        <div className="p-4 border-b border-slate-700 flex items-center space-x-2 md:hidden flex-shrink-0">
            <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="40 40 130 130" 
                className="w-8 h-8"
                style={{ color: 'var(--color-primary-hex)'}}
                fill="currentColor"
                stroke="none"
            >
                <LogoPath />
            </svg>
            <span style={{ fontFamily: 'var(--font-logo)' }} className="text-2xl text-white">Curiosity</span>
        </div>
    );

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
    } else if (currentView === 'settings') { 
         mainContent = (
            <div className="flex flex-col flex-grow h-full overflow-hidden pb-16 md:pb-0">
                <MobileHeader />
                <SettingsPage
                    onBack={() => setCurrentView('list')} 
                    onSave={handleSaveSettings}
                    initialSettings={settings} 
                    initialPin={appPin}
                    onRequestNotificationPermission={handleRequestNotificationPermission} 
                    onDisableNotifications={handleDisableNotifications} 
                    onInstallApp={handleInstallApp} 
                    installPromptEvent={installPromptEvent} 
                    isAppInstalled={isAppInstalled}
                    currentUser={currentUser}
                    isAnonymous={isAnonymous}
                    onLinkAccount={handleLinkAccount}
                    onExportData={handleExportData}
                />
            </div>
         );
    } else if (currentView === 'list') { 
        mainContent = (
             <div className="flex flex-col flex-grow h-full overflow-hidden pb-16 md:pb-0">
                <MobileHeader />
                <EntryList
                    entries={filteredEntries} 
                    searchTerm={searchTerm}    
                    onSearchChange={setSearchTerm} 
                    filterYear={filterYear} 
                    onFilterYearChange={handleFilterYearChange} 
                    filterMonth={filterMonth} 
                    onFilterMonthChange={setFilterMonth} 
                    availableYears={availableYears} 
                    filterTag={filterTag}
                    onFilterTagChange={setFilterTag}
                    availableTags={availableTags}
                    onSelect={setActiveEntryId} 
                    onDelete={handleDeleteEntry} 
                    activeEntryId={null} 
                    onClearFilters={handleClearFilters} 
                />
             </div>
        );
    } else { 
        mainContent = (
             <div className="flex flex-col flex-grow h-full overflow-hidden pb-16 md:pb-0"> 
                 <MobileHeader />
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
        <> 
            <div className="h-full relative flex md:flex-row overflow-hidden bg-slate-900 text-gray-200" style={{ fontFamily: settings.fontFamily || 'var(--font-body)' }}>
                 <div className="hidden md:block fixed top-0 left-0 h-full z-30">
                    <Sidebar
                        onCreate={handleCreateEntry} 
                        onShowSettings={() => setCurrentView('settings')} 
                        className="h-full" 
                        settings={settings} currentView={currentView} onViewChange={setCurrentView}
                        isExpanded={isSidebarExpanded} onToggleExpand={handleToggleSidebar} 
                    />
                </div>

                <main className={`flex-1 h-full overflow-hidden transition-all duration-300 ease-in-out ${isSidebarExpanded ? 'md:pl-64' : 'md:pl-16'}`}>
                     {mainContent}
                     {isSidebarExpanded && ( <div className="fixed inset-0 bg-black/30 z-20 hidden md:block lg:hidden" onClick={handleToggleSidebar}></div> )}
                </main>

                 <BottomNavBar
                    onCreate={handleCreateEntry} currentView={currentView} onViewChange={setCurrentView}
                    onShowSettings={() => setCurrentView('settings')} 
                    settings={settings}
                />
            </div>
            
             <ReloadPrompt /> 
        </>
    );
}
