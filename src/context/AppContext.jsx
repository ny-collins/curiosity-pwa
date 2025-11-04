import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useTheme } from '../hooks.js';
import { db, saveSettings as dbSaveSettings, getSettings as dbGetSettings } from '../db.js';
import { useLiveQuery } from 'dexie-react-hooks';
import { nanoid } from 'nanoid';
import { auth, app, functions, storage, appId, GoogleAuthProvider, firestoreDb, messaging } from '../firebaseConfig.js';
import { PIN_STORAGE_KEY } from '../constants.js';
import { signInAnonymously, onAuthStateChanged, linkWithPopup, signInWithPopup } from "firebase/auth";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import {
    doc, addDoc, setDoc, updateDoc, deleteDoc, onSnapshot,
    collection, query, serverTimestamp, getDocs, where, writeBatch,
    Timestamp, runTransaction
} from "firebase/firestore";
import { dateToKey, hashPin, comparePin, encryptData, decryptData } from '../utils.js';
import JSZip from 'jszip';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { saveAs } from 'file-saver';
import { useToaster } from '../components/NotificationProvider.jsx';
import { parseISO } from 'date-fns';

const AppContext = createContext();

export function AppProvider({ children }) {
    const toast = useToaster();

    const {
        themeMode, setThemeMode,
        themeColor, setThemeColor,
        themeFont, setThemeFont,
        fontSize, setFontSize
    } = useTheme();

    const [isLoading, setIsLoading] = useState(true);
    const [checkingPin, setCheckingPin] = useState(true);
    const [isLocked, setIsLocked] = useState(false);
    const [appPin, setAppPin] = useState(null);
    const [unlockedPin, setUnlockedPin] = useState(null);
    const [activeEntryId, setActiveEntryId] = useState(null);
    const [currentView, setCurrentView] = useState('dashboard');
    const [userId, setUserId] = useState(null);
    const [isAnonymous, setIsAnonymous] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);
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
    const [isAppFocusMode, setAppFocusMode] = useState(false);

    const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

    const allEntries = useLiveQuery(() => db.entries.toArray(), [], []);
    const remindersData = useLiveQuery(() => db.reminders.toArray(), [], []);
    const goals = useLiveQuery(() => db.goals.toArray(), [], []);
    const tasks = useLiveQuery(() => db.tasks.toArray(), [], []);
    const vaultItems = useLiveQuery(() => db.vaultItems.toArray(), [], []);
    const localSettings = useLiveQuery(() => dbGetSettings(), [], null);

    const settings = useMemo(() => {
        if (!localSettings) return null;
        return {
            ...localSettings,
            themeMode: themeMode,
            themeColor: themeColor,
            fontFamily: themeFont,
            fontSize: fontSize
        };
    }, [localSettings, themeMode, themeColor, themeFont, fontSize]);
    
    const reminders = useMemo(() => {
        if (!remindersData) return [];
        return remindersData.sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime());
    }, [remindersData]);

    useDataSync(userId, toast);

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
        if (localSettings) {
             setThemeColor(localSettings.themeColor || '#14b8a6');
             setThemeFont(localSettings.fontFamily || "var(--font-sans)");
             setThemeMode(localSettings.themeMode || 'system');
             setFontSize(localSettings.fontSize || '16px');
        }
    }, [localSettings, setThemeColor, setThemeFont, setThemeMode, setFontSize]);

    useEffect(() => {
        if (VAPID_PUBLIC_KEY === 'YOUR_VAPID_PUBLIC_KEY_HERE') {
            console.warn("VAPID public key is not set in App.jsx. Notifications will fail.");
        }
        try {
            const storedPin = localStorage.getItem(PIN_STORAGE_KEY);
            if (storedPin) {
                setAppPin(storedPin);
                setIsLocked(true);
            } else {
                setIsLocked(false);
            }
            setCheckingPin(false);

            const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
                if (user) {
                    setUserId(user.uid);
                    setIsAnonymous(user.isAnonymous);
                    setCurrentUser(user);
                } else {
                    setUserId(null);
                    setIsAnonymous(true);
                    setCurrentUser(null);
                    db.entries.clear();
                    db.reminders.clear();
                    db.goals.clear();
                    db.tasks.clear();
                    db.vaultItems.clear();
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
        if (!app || !messaging) return;
        let unsubscribeOnMessage;
        try {
            unsubscribeOnMessage = onMessage(messaging, (payload) => {
                console.log("Message received in foreground: ", payload);
                const notification = payload.notification;
                toast.success(`Reminder: ${notification.body}`);
            });
        } catch (error) {
            console.error("Error setting up foreground message handler:", error);
        }
        return () => {
            if (unsubscribeOnMessage) unsubscribeOnMessage();
        };
    }, [app, messaging, toast]);
    
    useEffect(() => {
        if (checkingPin) {
            return;
        }

        if (localSettings === null) {
            console.log("No local settings found, creating defaults.");
            const defaultSettings = {
                id: 1,
                username: 'Curious User',
                profilePicUrl: '',
                themeColor: '#14b8a6',
                fontFamily: "var(--font-sans)",
                themeMode: 'system',
                fontSize: '16px',
                updatedAt: new Date()
            };
            dbSaveSettings(defaultSettings).catch(err => {
                console.error("Failed to save default settings:", err);
            });
            return;
        }
        
        if (localSettings && allEntries && reminders && goals && tasks && vaultItems) {
            setIsLoading(false);
        }
    }, [checkingPin, localSettings, allEntries, reminders, goals, tasks, vaultItems]);
    
    useEffect(() => {
         if (!isAnonymous && !isLoading && localSettings && !localSettings.username) {
             setShowOnboarding(true);
         } else {
             setShowOnboarding(false);
         }
    }, [isAnonymous, isLoading, localSettings]);

    const availableYears = useMemo(() => {
        if (!allEntries) return [];
        const years = new Set(allEntries
            .map(entry => entry.createdAt?.getFullYear())
            .filter(year => year)
        );
        return Array.from(years).sort((a, b) => b - a);
    }, [allEntries]);

    const availableTags = useMemo(() => {
        if (!allEntries) return [];
        const tags = new Set(allEntries.flatMap(entry => entry.tags || []));
        return Array.from(tags).sort();
    }, [allEntries]);

    const filteredEntries = useMemo(() => {
        if (!allEntries) return [];
        const lowerSearchTerm = searchTerm.toLowerCase();
        return allEntries
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
                const entryYear = entry.createdAt?.getFullYear();
                if (entryYear !== parseInt(filterYear, 10)) return false;
                if (filterMonth === 'All') {
                    return (filterTag === 'All' || (entry.tags && entry.tags.includes(filterTag)));
                }
                const entryMonth = entry.createdAt?.getMonth() + 1;
                if (entryMonth !== parseInt(filterMonth, 10)) return false;
                return (filterTag === 'All' || (entry.tags && entry.tags.includes(filterTag)));
            })
            .sort((a, b) => {
                let timeA = a.updatedAt?.getTime() || 0;
                let timeB = b.updatedAt?.getTime() || 0;
                return timeB - timeA;
            });
    }, [allEntries, searchTerm, filterYear, filterMonth, filterTag, filterType]);
    
    const onThisDayEntries = useMemo(() => {
        if (!allEntries) return [];
        const todayMonth = new Date().getMonth();
        const todayDate = new Date().getDate();
        return allEntries.filter(entry => {
            if (!entry.createdAt) return false;
            const entryDate = new Date(entry.createdAt);
            return entryDate.getMonth() === todayMonth && entryDate.getDate() === todayDate;
        });
    }, [allEntries]);
    
    const activeGoals = useMemo(() => {
        if (!goals || !tasks) return [];
        
        return goals
            .filter(goal => goal.status !== 'completed')
            .map(goal => {
                const goalTasks = tasks.filter(task => task.goalId === goal.id);
                const completedTasks = goalTasks.filter(task => task.completed).length;
                const progress = goalTasks.length > 0 ? (completedTasks / goalTasks.length) * 100 : 0;
                return {
                    ...goal,
                    taskCount: goalTasks.length,
                    completedTaskCount: completedTasks,
                    progress: progress,
                };
            })
            .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
    }, [goals, tasks]);

    const activeEntry = useMemo(() => {
        if (!activeEntryId || !allEntries) return null;
        return allEntries.find(entry => entry.id === activeEntryId);
    }, [allEntries, activeEntryId]);

    const handleCloseEditor = useCallback(() => {
        if (isCreating && isEditorDirty) {
            setPendingView('dashboard');
            setShowUnsavedModal(true);
        } else {
            setActiveEntryId(null);
            setIsCreating(false);
            if (currentView === 'editor') {
                setCurrentView('dashboard');
            }
        }
        setAppFocusMode(false);
    }, [isCreating, isEditorDirty, currentView]);

    const handleCreateEntry = useCallback((type = 'note') => {
        if (!userId) return;
        setActiveEntryId(null);
        setNewEntryType(type);
        setIsCreating(true);
        setCurrentView('editor');
    }, [userId]);

    const handleViewChange = useCallback((newView) => {
        if ((isCreating || activeEntryId) && isEditorDirty) {
            setPendingView(newView);
            setShowUnsavedModal(true);
        } else {
            setCurrentView(newView);
            if (isCreating) setIsCreating(false);
            if (activeEntryId) setActiveEntryId(null);
        }
    }, [isCreating, activeEntryId, isEditorDirty]);

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
        if (pendingView && typeof pendingView === 'string' && pendingView !== 'editor') {
            setCurrentView(pendingView);
            setActiveEntryId(null);
        } else if (pendingView) {
            setActiveEntryId(pendingView);
            setCurrentView('editor');
        } else {
            setActiveEntryId(null);
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
        if (!userId) {
            toast.error("You must be logged in to save.");
            return;
        }
        try {
            const newEntry = {
                id: nanoid(),
                ...data,
                type: data.type || 'note',
                createdAt: new Date(),
                updatedAt: new Date(),
                isSynced: false
            };
            await db.entries.add(newEntry);
            setIsEditorDirty(false);
            if (isCreating) {
                setActiveEntryId(newEntry.id);
                setIsCreating(false);
            }
            if (!pendingView) {
            } else {
                handleEditorSaveComplete();
            }
            return newEntry.id;
        } catch (error) {
            console.error("Error saving new entry locally:", error);
            toast.error("Failed to save entry.");
            return null;
        }
    }, [userId, isCreating, pendingView, toast, handleEditorSaveComplete, setIsEditorDirty, setIsCreating, setActiveEntryId]);

    const handleUpdateEntry = useCallback(async (id, updates) => {
        if (!userId) {
            toast.error("You must be logged in to update.");
            return;
        }
        try {
            const entryUpdates = {
                ...updates,
                type: updates.type || 'note',
                updatedAt: new Date(),
                isSynced: false
            };
            await db.entries.update(id, entryUpdates);
            setIsEditorDirty(false);
            if (pendingView) {
                handleEditorSaveComplete();
            }
        }
        catch (error) {
            console.error("Local update error:", error);
            toast.error("Failed to update entry.");
        }
    }, [userId, toast, pendingView, handleEditorSaveComplete, setIsEditorDirty]);

    const handleDeleteEntry = useCallback(async (id) => {
        if (!userId) {
            toast.error("You must be logged in to delete.");
            return;
        }
        try {
            if (activeEntryId === id) { setActiveEntryId(null); }
            await db.entries.delete(id);
            await db.entries.put({ id: id, isDeleted: true, isSynced: false, updatedAt: new Date() });
            toast.success("Entry deleted.");
        } catch (error) {
            console.error("Local delete error:", error);
            toast.error("Failed to delete entry.");
        }
    }, [userId, activeEntryId, toast]);

    const handleAddReminder = useCallback(async (text, date) => {
        if (!userId || !text || !date) return;
        try {
            const dateString = date.toISOString();
            const newReminder = {
                id: nanoid(),
                text: text,
                date: dateString,
                createdAt: new Date(),
                isSynced: false
            };
            await db.reminders.add(newReminder);
            toast.success("Reminder set!");
        } catch (error) { 
            console.error("Error adding reminder locally:", error); 
            toast.error("Failed to set reminder.");
        }
    }, [userId, toast]);

    const handleDeleteReminder = useCallback(async (id) => {
         if (!userId) return;
        try { 
            await db.reminders.delete(id); 
            await db.reminders.put({ id: id, isDeleted: true, isSynced: false, updatedAt: new Date() });
            toast.success("Reminder deleted.");
        }
        catch (error) { 
            console.error("Error deleting reminder locally:", error); 
            toast.error("Failed to delete reminder.");
        }
    }, [userId, toast]);
    
    const handleAddGoal = useCallback(async (title, description) => {
        if (!userId) return;
        try {
            const newGoal = {
                id: nanoid(),
                title,
                description,
                status: 'pending',
                createdAt: new Date(),
                updatedAt: new Date(),
                isSynced: false
            };
            await db.goals.add(newGoal);
            toast.success("Goal added!");
        } catch (error) {
            console.error("Error adding goal:", error);
            toast.error("Failed to add goal.");
        }
    }, [userId, toast]);
    
    const handleDeleteGoal = useCallback(async (goalId) => {
        if (!userId) return;
        try {
            await db.tasks.where('goalId').equals(goalId).delete();
            await db.goals.delete(goalId);
            await db.goals.put({ id: goalId, isDeleted: true, isSynced: false, updatedAt: new Date() });
            toast.success("Goal deleted.");
        } catch (error) {
            console.error("Error deleting goal:", error);
            toast.error("Failed to delete goal.");
        }
    }, [userId, toast]);
    
    const handleUpdateGoalStatus = useCallback(async (goalId, status) => {
        if (!userId) return;
        try {
            await db.goals.update(goalId, { status, updatedAt: new Date(), isSynced: false });
            toast.success("Goal status updated.");
        } catch (error) {
            console.error("Error updating goal status:", error);
            toast.error("Failed to update status.");
        }
    }, [userId, toast]);

    const handleAddTask = useCallback(async (goalId, text) => {
        if (!userId) return;
        try {
            const newTask = {
                id: nanoid(),
                goalId,
                text,
                completed: false,
                createdAt: new Date(),
                isSynced: false
            };
            await db.tasks.add(newTask);
            await db.goals.update(goalId, { updatedAt: new Date(), isSynced: false });
        } catch (error) {
            console.error("Error adding task:", error);
            toast.error("Failed to add task.");
        }
    }, [userId, toast]);
    
    const handleDeleteTask = useCallback(async (taskId) => {
         if (!userId) return;
        try { 
            await db.tasks.delete(taskId); 
            await db.tasks.put({ id: taskId, isDeleted: true, isSynced: false, updatedAt: new Date() });
        }
        catch (error) { 
            console.error("Error deleting task:", error); 
            toast.error("Failed to delete task.");
        }
    }, [userId, toast]);
    
    const handleToggleTask = useCallback(async (taskId, completed) => {
         if (!userId) return;
        try { 
            await db.tasks.update(taskId, { completed, isSynced: false }); 
        }
        catch (error) { 
            console.error("Error toggling task:", error); 
            toast.error("Failed to update task.");
        }
    }, [userId, toast]);
    
    const handleAddVaultItem = useCallback(async (title, type, data) => {
        if (!userId) return toast.error("You must be logged in.");
        if (!unlockedPin) return toast.error("Vault is locked.");
        
        const encryptedData = encryptData(data, unlockedPin);
        if (!encryptedData) return toast.error("Encryption failed.");
        
        try {
            const newItem = {
                id: nanoid(),
                title,
                type,
                encryptedData,
                createdAt: new Date(),
                updatedAt: new Date(),
                isSynced: false
            };
            await db.vaultItems.add(newItem);
            toast.success("Vault item saved!");
        } catch (error) {
            console.error("Error saving vault item:", error);
            toast.error("Failed to save item.");
        }
    }, [userId, unlockedPin, toast]);

    const handleDeleteVaultItem = useCallback(async (id) => {
        if (!userId) return;
        try {
            await db.vaultItems.delete(id);
            await db.vaultItems.put({ id: id, isDeleted: true, isSynced: false, updatedAt: new Date() });
            toast.success("Vault item deleted.");
        } catch (error) {
            console.error("Error deleting vault item:", error);
            toast.error("Failed to delete item.");
        }
    }, [userId, toast]);

    const handleSaveSettings = useCallback(async ({ settings: newSettings, pin: newPin }) => {
         try {
             const fullSettings = { 
                 ...localSettings, 
                 ...newSettings, 
                 themeMode, 
                 themeColor, 
                 fontFamily: themeFont,
                 fontSize
             };
             await dbSaveSettings(fullSettings);
             toast.success("Settings saved!");
         }
        catch (error) { 
            console.error("Save local settings error:", error); 
            toast.error("Failed to save settings.");
        }
        
        if (newPin && newPin.length > 0) {
            try {
                const hashedPin = await hashPin(newPin);
                localStorage.setItem(PIN_STORAGE_KEY, hashedPin);
                setAppPin(hashedPin);
                setUnlockedPin(newPin);
                toast.success("PIN updated!");
            } catch (error) {
                console.error("Error hashing pin:", error);
                toast.error("Error setting new PIN.");
            }
        } else if (newPin === '') { 
            localStorage.removeItem(PIN_STORAGE_KEY);
            setAppPin(null);
            setUnlockedPin(null);
            setIsLocked(false);
            toast.success("PIN removed.");
        }
    }, [localSettings, themeMode, themeColor, themeFont, fontSize, toast, setIsLocked]);

    const handleOnboardingComplete = useCallback(async (username, themeColor) => {
        const newSettings = {
            username: username,
            profilePicUrl: currentUser?.photoURL || '',
            themeColor: themeColor,
            fontFamily: "var(--font-sans)",
            themeMode: 'system',
            fontSize: '16px',
            id: 1,
            updatedAt: new Date()
        };
        try {
            await dbSaveSettings(newSettings);
            setShowOnboarding(false);
            toast.success(`Welcome, ${username}!`);
        } catch (error) {
            console.error("Error saving onboarding settings:", error);
            toast.error("Could not save settings.");
        }
    }, [currentUser, toast]);

    const handleToggleSidebar = useCallback(() => setIsSidebarExpanded(!isSidebarExpanded), [isSidebarExpanded]);
    
    const handleLockApp = useCallback(() => {
        setUnlockedPin(null);
        if (appPin) {
            setIsLocked(true);
        }
    }, [appPin]);
    
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
        toast.success(`Exporting as ${format.toUpperCase()}...`);
        const exportDate = new Date().toISOString().split('T')[0];
        const filename = `curiosity_backup_${exportDate}`;
        const dataToExport = {
            settings: { ...localSettings },
            entries: allEntries,
            reminders: reminders,
            goals: goals,
            tasks: tasks,
        };

        try {
            if (format === 'json') {
                const dataStr = JSON.stringify(dataToExport, null, 2);
                downloadFile(dataStr, `${filename}.json`, 'application/json');
            }
            else if (format === 'markdown') {
                const zip = new JSZip();
                zip.file('settings.json', JSON.stringify(dataToExport.settings, null, 2));
                zip.file('reminders.json', JSON.stringify(dataToExport.reminders, null, 2));
                
                const entriesFolder = zip.folder('entries');
                if (dataToExport.entries) {
                    dataToExport.entries.forEach(entry => {
                        const entryDate = entry.createdAt ? new Date(entry.createdAt).toISOString().split('T')[0] : 'no-date';
                        const safeTitle = (entry.title || 'untitled').replace(/[^a-z0-9]/gi, '_').toLowerCase();
                        const entryFilename = `${entryDate}_${safeTitle}.md`;
                        let mdContent = `---
id: ${entry.id}
type: ${entry.type || 'note'}
createdAt: ${entry.createdAt ? new Date(entry.createdAt).toISOString() : 'unknown'}
updatedAt: ${entry.updatedAt ? new Date(entry.updatedAt).toISOString() : 'unknown'}
tags: [${(entry.tags || []).join(', ')}]
---

# ${entry.title || 'Untitled'}

${entry.content || ''}
`;
                        entriesFolder.file(entryFilename, mdContent);
                    });
                }
                
                const goalsFolder = zip.folder('goals');
                if (dataToExport.goals) {
                    dataToExport.goals.forEach(goal => {
                        const goalTasks = dataToExport.tasks ? dataToExport.tasks.filter(t => t.goalId === goal.id) : [];
                        let mdContent = `---
id: ${goal.id}
status: ${goal.status}
createdAt: ${goal.createdAt ? new Date(goal.createdAt).toISOString() : 'unknown'}
updatedAt: ${goal.updatedAt ? new Date(goal.updatedAt).toISOString() : 'unknown'}
---

# ${goal.title}

${goal.description || ''}

## Tasks
${goalTasks.map(t => `- [${t.completed ? 'x' : ' '}] ${t.text}`).join('\n')}
`;
                        goalsFolder.file(`${goal.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`, mdContent);
                    });
                }
                
                const zipContent = await zip.generateAsync({ type: 'blob' });
                downloadFile(zipContent, `${filename}.zip`, 'application/zip');
            }
            else if (format === 'pdf') {
                const doc = new jsPDF();
                const sortedEntries = [...(dataToExport.entries || [])].sort((a, b) => {
                    const timeA = a.createdAt?.getTime() || 0;
                    const timeB = b.createdAt?.getTime() || 0;
                    return timeA - timeB;
                });
                doc.setFontSize(22);
                doc.text('Curiosity Export', 10, 20);
                doc.setFontSize(12);
                doc.text(`Exported on: ${exportDate}`, 10, 30);
                doc.text(`Total Entries: ${sortedEntries.length}`, 10, 36);
                doc.text(`Total Reminders: ${(dataToExport.reminders || []).length}`, 10, 42);
                doc.text(`Total Goals: ${(dataToExport.goals || []).length}`, 10, 48);
                
                sortedEntries.forEach((entry, index) => {
                    if (index > 0) doc.addPage();
                    doc.setFontSize(18);
                    doc.text(entry.title || 'Untitled Entry', 10, 20);
                    doc.setFontSize(10);
                    doc.setTextColor(100);
                    const entryDate = entry.createdAt ? new Date(entry.createdAt).toLocaleString() : 'unknown date';
                    doc.text(`Created: ${entryDate}`, 10, 28);
                    doc.text(`Type: ${entry.type || 'note'}`, 10, 34);
                    if (entry.tags && entry.tags.length > 0) {
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
            toast.error(`Failed to export as ${format.toUpperCase()}.`);
        }
    }, [localSettings, allEntries, reminders, goals, tasks, downloadFile, toast]);

    const handleInstallApp = useCallback(async () => {
        if (!installPromptEvent) {
            toast.error("App cannot be installed right now.");
            return;
        }
        try {
            installPromptEvent.prompt();
            const { outcome } = await installPromptEvent.userChoice;
            if (outcome === 'accepted') {
                setInstallPromptEvent(null);
                setIsAppInstalled(true);
            }
        } catch (error) { 
            console.error("Error showing install prompt:", error); 
            toast.error("App installation failed.");
        }
    }, [installPromptEvent, toast]);

    const getSubscriptionsCollection = useCallback((uid) => collection(firestoreDb, `artifacts/${appId}/users/${uid}/subscriptions`), []);

    const saveTokenToFirestore = useCallback(async (token) => {
        if (!userId || !firestoreDb || !token) { console.error("Cannot save token, invalid inputs"); return; }
        try {
            const subscriptionsRef = getSubscriptionsCollection(userId);
            const q = query(subscriptionsRef, where("fcmToken", "==", token));
            const querySnapshot = await getDocs(q);
            if (querySnapshot.empty) {
                await addDoc(subscriptionsRef, { fcmToken: token, createdAt: serverTimestamp() });
                console.log("FCM token saved to Firestore.");
            }
        } catch (error) { 
            console.error("Error saving FCM token to Firestore:", error); 
            toast.error("Could not save notification token.");
        }
    }, [userId, getSubscriptionsCollection, toast]);

    const handleRequestNotificationPermission = useCallback(async () => {
         if (!('Notification' in window) || !('serviceWorker' in navigator) || !('PushManager' in window)) {
            toast.error('Push notifications are not supported by this browser.');
            return null;
        }
         if (!app || !messaging) { console.error("Firebase app not initialized."); return null; }
        try {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                const fcmToken = await getToken(messaging, { vapidKey: VAPID_PUBLIC_KEY });
                if (fcmToken) {
                    await saveTokenToFirestore(fcmToken);
                    toast.success("Notifications enabled!");
                }
            } else {
                 toast.error('Notification permission was denied.');
            }
            return permission;
        } catch (error) {
             console.error('Error getting FCM token:', error);
             toast.error('Error enabling notifications.');
            return Notification?.permission || 'default';
        }
    }, [app, messaging, VAPID_PUBLIC_KEY, saveTokenToFirestore, toast]);
    
    const handleDisableNotifications = useCallback(async () => {
         if (!('serviceWorker' in navigator) || !('PushManager' in window)) return null;
         if (!app || !userId || !firestoreDb) return Notification?.permission || 'default';
        try {
            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.getSubscription();
            let unsubscribed = true;
            if (subscription) {
                unsubscribed = await subscription.unsubscribe();
            }
            if (unsubscribed) {
                const subscriptionsRef = getSubscriptionsCollection(userId);
                const q = query(subscriptionsRef);
                const querySnapshot = await getDocs(q);
                if (!querySnapshot.empty) {
                    const batch = writeBatch(firestoreDb);
                    querySnapshot.forEach(doc => batch.delete(doc.ref));
                    await batch.commit();
                }
                 toast.success("Notifications disabled.");
                 return 'default';
            } else {
                 toast.error("Could not disable notifications.");
            }
        } catch (error) {
             console.error("Error disabling notifications:", error);
             toast.error("Error disabling notifications.");
        }
         return Notification?.permission || 'default';
    }, [app, userId, getSubscriptionsCollection, toast]);

    const handleLinkAccount = useCallback(async () => {
        if (!auth.currentUser || !auth.currentUser.isAnonymous) return;
        const provider = new GoogleAuthProvider();
        try {
            const result = await linkWithPopup(auth.currentUser, provider);
            const user = result.user;
            toast.success(`Account linked to ${user.email}!`);
            if (localSettings) {
                const updates = {};
                if ((!localSettings.username || localSettings.username === 'Curious User') && user.displayName) {
                    updates.username = user.displayName;
                }
                 if (!localSettings.profilePicUrl && user.photoURL) {
                     updates.profilePicUrl = user.photoURL;
                }
                if (Object.keys(updates).length > 0) {
                     await dbSaveSettings({ ...localSettings, ...updates });
                }
            }
        } catch (error) {
            console.error("Error linking account:", error);
            if (error.code === 'auth/credential-already-in-use') {
                 toast.error("This Google account is already in use.");
            } else { toast.error("Error linking account."); }
        }
    }, [localSettings, toast]);
    
    const handleForgotPin = useCallback(async () => {
         if (!app) return;
         const provider = new GoogleAuthProvider();
         try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            if (user && !user.isAnonymous) {
                 toast.success("Identity verified. PIN removed.");
                localStorage.removeItem(PIN_STORAGE_KEY);
                setAppPin(null);
                setUnlockedPin(null);
                setIsLocked(false);
            } else {
                 toast.error("Please link your account in Settings first.");
            }
         } catch (error) {
              console.error("Error during PIN reset sign-in:", error);
              toast.error("Could not verify your identity.");
         }
    }, [app, toast, setIsLocked]);
    
    const checkPin = useCallback(async (pin) => {
        if (!appPin) return false;
        const isValid = await comparePin(pin, appPin);
        if (isValid) {
            setUnlockedPin(pin);
        }
        return isValid;
    }, [appPin]);


    const value = {
        isLoading, checkingPin, isLocked, appPin, allEntries, reminders, goals, tasks, vaultItems, activeEntryId, settings,
        currentView, userId, isAnonymous, currentUser, isSidebarExpanded, isCreating,
        searchTerm, filterYear, filterMonth, filterTag, filterType, installPromptEvent,
        isAppInstalled, isEditorDirty, showUnsavedModal, pendingView, forceEditorSave,
        showOnboarding, newEntryType,
        
        isAppFocusMode, setAppFocusMode,
        
        onThisDayEntries,
        activeGoals,
        
        unlockedPin, setUnlockedPin,

        themeMode, themeColor, themeFont, fontSize,

        availableYears, availableTags, filteredEntries, activeEntry,

        setIsLocked, setAppPin, setActiveEntryId, setCurrentView, setIsSidebarExpanded,
        setIsCreating, setSearchTerm, setFilterYear, setFilterMonth, setFilterTag,
        setFilterType, setIsEditorDirty, setShowUnsavedModal, setForceEditorSave,

        setThemeMode, setThemeColor, setThemeFont, setFontSize,
        
        checkPin,

        handleCreateEntry, handleViewChange, handleSelectEntry, handleModalSave,
        handleModalDiscard, handleModalCancel, handleEditorSaveComplete, handleSaveNewEntry,
        handleUpdateEntry, handleDeleteEntry, handleAddReminder, handleDeleteReminder,
        
        handleAddGoal, handleDeleteGoal, handleUpdateGoalStatus, handleAddTask, 
        handleDeleteTask, handleToggleTask,
        
        handleAddVaultItem, handleDeleteVaultItem,
        
        handleSaveSettings, handleOnboardingComplete, handleCloseEditor, handleToggleSidebar,
        handleLockApp,
        handleFilterYearChange, handleClearFilters, handleExportData, handleInstallApp,
        handleRequestNotificationPermission, handleDisableNotifications, handleLinkAccount,
        handleForgotPin,

        toast
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

function useDataSync(userId, toast) {
    useEffect(() => {
        if (!userId || !firestoreDb) return;

        let unsubscribers = [];
        let isSyncing = false;
        
        const syncCollection = async (localStore, collectionRefName) => {
            let localItems = [];
            try {
                await db.open();
                localItems = await localStore.toCollection().filter(item => item.isSynced === false).toArray();
            } catch (e) {
                console.error(`Dexie query failed for ${collectionRefName}:`, e);
                return;
            }

            if (localItems.length === 0) return;
            
            const collectionRef = collection(firestoreDb, `artifacts/${appId}/users/${userId}/${collectionRefName}`);

            for (const item of localItems) {
                try {
                    const { isSynced, ...dataToSync } = item;
                    const docRef = doc(collectionRef, item.id);
                    
                    if (dataToSync.isDeleted) {
                        await deleteDoc(docRef);
                    } else {
                        const { createdAt, updatedAt, ...rest } = dataToSync;
                        const fsData = {
                            ...rest,
                            createdAt: createdAt ? Timestamp.fromDate(createdAt) : serverTimestamp(),
                            updatedAt: serverTimestamp()
                        };
                        await setDoc(docRef, fsData, { merge: true });
                    }
                    await localStore.update(item.id, { isSynced: true });
                } catch (e) { console.error(`Error syncing item ${item.id} to ${collectionRefName}:`, e); }
            }
        };

        const syncLocalToCloud = async () => {
            if (isSyncing) return;
            isSyncing = true;
            
            try {
                const settingsToSync = await db.settings.get(1);
                if (settingsToSync) {
                    const settingsRef = doc(firestoreDb, `artifacts/${appId}/users/${userId}/settings/main`);
                    await setDoc(settingsRef, {
                        ...settingsToSync,
                        updatedAt: serverTimestamp()
                    }, { merge: true });
                }
            } catch (e) { console.error("Error syncing settings:", e); }

            try {
                await Promise.all([
                    syncCollection(db.entries, 'entries'),
                    syncCollection(db.reminders, 'reminders'),
                    syncCollection(db.goals, 'goals'),
                    syncCollection(db.tasks, 'tasks'),
                    syncCollection(db.vaultItems, 'vaultItems')
                ]);
            } catch (err) {
                 console.error("Error during sync collections:", err);
            }
            
            isSyncing = false;
        };

        const syncInterval = setInterval(syncLocalToCloud, 10000);
        syncLocalToCloud();

        const syncCloudToLocal = (collectionRefName, localStore) => {
            const collectionRef = collection(firestoreDb, `artifacts/${appId}/users/${userId}/${collectionRefName}`);
            const q = query(collectionRef);
            
            const unsubscribe = onSnapshot(q, async (snapshot) => {
                try {
                    await db.transaction('rw', localStore, async () => {
                        const changes = snapshot.docChanges();
                        for (const change of changes) {
                            const docData = change.doc.data();
                            const docId = change.doc.id;
                            
                            const localData = {
                                ...docData,
                                id: docId,
                                createdAt: docData.createdAt?.toDate ? docData.createdAt.toDate() : new Date(),
                                updatedAt: docData.updatedAt?.toDate ? docData.updatedAt.toDate() : new Date(),
                                isSynced: true
                            };
                            
                            if (change.type === 'added' || change.type === 'modified') {
                                const localEntry = await localStore.get(localData.id);
                                if (!localEntry || (localEntry.updatedAt.getTime() < localData.updatedAt.getTime())) {
                                    await localStore.put(localData);
                                }
                            } else if (change.type === 'removed') {
                                await localStore.delete(docId);
                            }
                        }
                    });
                } catch (error) {
                    console.error(`Error syncing ${collectionRefName} to local:`, error);
                }
            }, (error) => {
                console.error(`Error on snapshot for ${collectionRefName}:`, error);
                toast.error("Error syncing data from cloud.");
            });
            return unsubscribe;
        };

        const syncSettingsToLocal = () => {
             const settingsRef = doc(firestoreDb, `artifacts/${appId}/users/${userId}/settings/main`);
             const unsubscribe = onSnapshot(settingsRef, async (doc) => {
                if (doc.exists()) {
                    try {
                        const docData = doc.data();
                        const localData = {
                            ...docData,
                            id: 1,
                            updatedAt: docData.updatedAt?.toDate ? docData.updatedAt.toDate() : new Date()
                        };
                        const localEntry = await db.settings.get(1);
                         if (!localEntry || (localEntry.updatedAt.getTime() < localData.updatedAt.getTime())) {
                             await db.settings.put(localData);
                         }
                    } catch (error) {
                        console.error("Error syncing settings to local:", error);
                    }
                }
             }, (error) => {
                console.error("Error on settings snapshot:", error);
                toast.error("Error syncing settings from cloud.");
            });
            return unsubscribe;
        };
        
        unsubscribers.push(syncCloudToLocal('entries', db.entries));
        unsubscribers.push(syncCloudToLocal('reminders', db.reminders));
        unsubscribers.push(syncCloudToLocal('goals', db.goals));
        unsubscribers.push(syncCloudToLocal('tasks', db.tasks));
        unsubscribers.push(syncCloudToLocal('vaultItems', db.vaultItems));
        unsubscribers.push(syncSettingsToLocal());

        return () => {
            clearInterval(syncInterval);
            unsubscribers.forEach(unsub => unsub());
        };
    }, [userId, toast]);
}