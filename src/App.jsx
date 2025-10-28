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

import { db, auth, app, functions, storage, appId, PIN_STORAGE_KEY, GoogleAuthProvider } from './firebaseConfig'; 
import { 
    signInAnonymously, onAuthStateChanged, 
    linkWithPopup, signInWithPopup 
} from "firebase/auth"; 
import { getMessaging, getToken, deleteToken } from "firebase/messaging"; 
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

import { formatTimestamp, dateToKey, keyToDate } from './utils';

const VAPID_PUBLIC_KEY = 'BEM0ZQKHiRBOqjMy-_AN_AgV4C5VBsKAIpH6wTOhIJvoYJ7kQJgjkZBGyCaio6tnLYgbvZznB5ou2Oh8nU6NbAU'; 

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) { outputArray[i] = rawData.charCodeAt(i); }
  return outputArray;
}

export default function App() {
    const [isLoading, setIsLoading] = useState(true);
    const [checkingPin, setCheckingPin] = useState(true);
    const [isLocked, setIsLocked] = useState(false);
    const [appPin, setAppPin] = useState(null);
    const [entries, setEntries] = useState([]); 
    const [reminders, setReminders] = useState([]); 
    const [activeEntryId, setActiveEntryId] = useState(null);
    const [settings, setSettings] = useState({ username: 'Collins', profilePicUrl: '', themeColor: '#14b8a6', fontFamily: "'Inter', sans-serif" }); 
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
    const [installPromptEvent, setInstallPromptEvent] = useState(null);
    const [isAppInstalled, setIsAppInstalled] = useState(() => window.matchMedia('(display-mode: standalone)').matches);
    
    useEffect(() => {
        document.documentElement.style.setProperty('--color-primary-hex', settings.themeColor || '#14b8a6');
        document.documentElement.style.setProperty('--font-body', settings.fontFamily || "'Inter', sans-serif");
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
                setSettings(data); 
            } else {
                const defaultUsername = currentUser?.displayName || 'Collins';
                const defaultPic = currentUser?.photoURL || ''; 
                const defaultSettings = { 
                    username: defaultUsername, 
                    profilePicUrl: defaultPic, 
                    themeColor: '#14b8a6', 
                    fontFamily: "'Inter', sans-serif" 
                };
                setSettings(defaultSettings);
                if (currentUser && !isAnonymous) { 
                     setDoc(settingsDocRef, defaultSettings, { merge: true });
                }
            }
        }, (error) => console.error("Settings load error:", error));
        return () => unsubscribe();
    }, [settingsDocRef, currentUser, isAnonymous]); 

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
        setCurrentView('list');
        if (isSidebarExpanded) {
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
        if (year === 'All') { setFilterMonth('All'); }
    };
    const handleClearFilters = () => {
        setSearchTerm(''); setFilterYear('All'); setFilterMonth('All');
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

    if (checkingPin || isLoading) { return <LoadingSpinner />; }
    if (isLocked) { 
        return <PinLockScreen 
                  correctPin={appPin} 
                  onUnlock={() => setIsLocked(false)}
                  onForgotPin={handleForgotPin} 
               />; 
    }

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
    } else if (currentView === 'settings') { 
         mainContent = (
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
    } else { 
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
        <> 
            <div className="h-full relative flex md:flex-row overflow-hidden bg-slate-900 text-gray-200" style={{ fontFamily: settings.fontFamily || 'var(--font-body)' }}>
                 <div className="hidden md:block fixed top-0 left-0 h-full z-30">
                    <Sidebar
                        onCreate={handleCreateEntry} 
                        onShowSettings={() => setCurrentView('settings')} 
                        className="h-full" 
                        settings={settings} currentView={currentView} onViewChange={setCurrentView}
                        isExpanded={isSidebarExpanded} onToggleExpand={handleToggleSidebar} 
                        entries={entries} activeEntryId={activeEntryId} onSelect={setActiveEntryId} onDelete={handleDeleteEntry}
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


