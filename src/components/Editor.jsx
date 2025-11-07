
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Trash2, X, AlertTriangle, ChevronDown, Check, Loader2, Expand, Minimize, Settings, ChevronUp, ChevronRight, Eye, EyeOff } from 'lucide-react';
import SimpleMDE from 'react-simplemde-editor';
import "easymde/dist/easymde.min.css";
import TagsInput from '/src/components/TagsInput.jsx';
import { formatTimestamp } from '/src/utils.js';
import { ENTRY_TYPES, getEntryType } from '/src/constants.js';
import { useAppState } from '../contexts/StateProvider';
import { useDebounce } from '../hooks.js';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const SaveStatusIndicator = ({ status }) => {
    return (
        <AnimatePresence mode="wait">
            {status === 'saving' && (
                <motion.div 
                    key="saving"
                    className="flex items-center space-x-2 px-3 py-1.5 rounded-full backdrop-blur-sm"
                    style={{ backgroundColor: 'rgba(var(--color-primary-rgb), 0.1)' }}
                    initial={{ opacity: 0, scale: 0.8, x: 20 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.8, x: -20 }}
                    transition={{ duration: 0.2 }}
                >
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    >
                        <Loader2 size={14} style={{ color: 'var(--color-primary-hex)' }} />
                    </motion.div>
                    <span className="text-xs font-medium" style={{ color: 'var(--color-primary-hex)' }}>Saving...</span>
                </motion.div>
            )}
            {status === 'saved' && (
                <motion.div 
                    key="saved"
                    className="flex items-center space-x-2 px-3 py-1.5 rounded-full"
                    style={{ backgroundColor: '#22c55e15' }}
                    initial={{ opacity: 0, scale: 0.8, x: 20 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.3 }}
                >
                    <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                    >
                        <Check size={14} className="text-green-600 dark:text-green-400" />
                    </motion.div>
                    <span className="text-xs font-medium text-green-600 dark:text-green-400">Saved</span>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

function Editor() {
    const {
        activeEntry, activeEntryId,
        handleUpdateEntry,
        handleSaveNewEntry,
        handleDeleteEntry,
        handleCloseEditor,
        isCreating,
        localSettings,
        isEditorDirty, setIsEditorDirty,
        forceEditorSave,
        handleEditorSaveComplete,
        newEntryType,
        setAppFocusMode
    } = useAppState();

    const username = localSettings?.username || 'User';
    const entry = activeEntry;

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [tags, setTags] = useState([]);
    const [entryType, setEntryType] = useState(isCreating ? newEntryType : 'note');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [saveStatus, setSaveStatus] = useState('saved');
    const [isFocusMode, setIsFocusMode] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    
    // New layout preferences
    const [showMetadata, setShowMetadata] = useState(true);
    const [layoutMode, setLayoutMode] = useState('standard'); // 'minimal', 'standard', 'full'
    const [showWordCount, setShowWordCount] = useState(false);

    const simpleMdeRef = useRef(null);
    const selectedType = getEntryType(entryType);
    
    const debouncedTitle = useDebounce(title, 1500);
    const debouncedContent = useDebounce(content, 1500);
    const debouncedTags = useDebounce(tags, 1500);
    const debouncedEntryType = useDebounce(entryType, 1500);

    // Calculate word count and reading time
    const wordCount = useMemo(() => {
        const text = content.replace(/[#*`~\[\]()]/g, '').trim();
        return text ? text.split(/\s+/).length : 0;
    }, [content]);
    
    const readingTime = useMemo(() => {
        return Math.ceil(wordCount / 200); // Average reading speed
    }, [wordCount]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Cmd/Ctrl + Shift + F - Toggle focus mode
            if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'F') {
                e.preventDefault();
                toggleFocusMode();
            }
            // Cmd/Ctrl + Shift + M - Toggle metadata
            if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'M') {
                e.preventDefault();
                setShowMetadata(!showMetadata);
            }
            // Cmd/Ctrl + S - Manual save
            if ((e.metaKey || e.ctrlKey) && e.key === 's') {
                e.preventDefault();
                handleSave(false);
            }
            // Escape - Close editor or exit focus mode
            if (e.key === 'Escape') {
                if (isFocusMode) {
                    toggleFocusMode();
                } else {
                    handleCloseEditor();
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isFocusMode, showMetadata]);

    const handleImageUpload = async (file, editor) => {
        if (!file) return;

        setIsUploading(true);
        const storage = getStorage();
        const storageRef = ref(storage, `images/${file.name}`);

        try {
            const snapshot = await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(snapshot.ref);
            const markdownImage = `![${file.name}](${downloadURL})`;
            const cm = editor.codemirror;
            const doc = cm.getDoc();
            const cursor = doc.getCursor();
            doc.replaceRange(markdownImage, cursor);
        } catch (error) {
            console.error("Error uploading image:", error);
        } finally {
            setIsUploading(false);
        }
    };

    const mdeOptions = useMemo(() => {
        const baseToolbar = [
            "bold", "italic", "heading", "|", 
            "quote", "code", "link", "|",
            "unordered-list", "ordered-list", "strikethrough"
        ];

        const extendedToolbar = [
            ...baseToolbar, "|",
            {
                name: "image",
                action: (editor) => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = 'image/*';
                    input.onchange = async () => {
                        const file = input.files[0];
                        if (file) {
                            handleImageUpload(file, editor);
                        }
                    };
                    input.click();
                },
                className: "fa fa-picture-o",
                title: "Insert Image",
            },
            "|",
            "preview", "side-by-side", "guide"
        ];

        return {
            autofocus: false,
            spellChecker: false,
            placeholder: "Start writing...",
            toolbar: isFocusMode ? false : (layoutMode === 'minimal' ? baseToolbar : extendedToolbar),
            status: !isFocusMode && layoutMode !== 'minimal',
            renderingConfig: {
                codeSyntaxHighlighting: true,
            },
        };
    }, [isFocusMode, layoutMode]);

    useEffect(() => {
        if (isCreating) {
            const newType = newEntryType || 'note';
            const selectedType = getEntryType(newType);
            const template = selectedType.template || '';
            setTitle('');
            setContent(template);
            setTags([]);
            setEntryType(newType);
            setIsEditorDirty(false);
            setSaveStatus('saved');
        } else if (entry) {
            setTitle(entry.title || '');
            setContent(entry.content || '');
            setTags(entry.tags || []);
            setEntryType(entry.type || 'note');
            setIsEditorDirty(false);
            setSaveStatus('saved');
        }
    }, [entry, isCreating, newEntryType]);

    const handleContentChange = (value) => {
        setContent(value);
        setIsEditorDirty(true);
        setSaveStatus('unsaved');
    };

    const handleTitleChange = (e) => {
        setTitle(e.target.value);
        setIsEditorDirty(true);
        setSaveStatus('unsaved');
    };

    const handleTagsChange = (newTags) => {
        setTags(newTags);
        setIsEditorDirty(true);
        setSaveStatus('unsaved');
    };
    
    const handleTypeChange = (e) => {
        setEntryType(e.target.value);
        setIsEditorDirty(true);
        setSaveStatus('unsaved');
    };

    const handleSave = useCallback(async (isModalSave = false) => {
        if (!isEditorDirty) {
            if (isModalSave) handleEditorSaveComplete();
            return;
        }

        setSaveStatus('saving');
        const entryData = { title, content, tags, type: entryType };
        
        if (isCreating) {
            const newId = await handleSaveNewEntry(entryData);
            if (newId && isModalSave) {
                handleEditorSaveComplete();
            }
        } else if (entry) {
            await handleUpdateEntry(entry.id, entryData);
            if (isModalSave) {
                handleEditorSaveComplete();
            }
        }
        
        setSaveStatus('saved');
        
    }, [title, content, tags, entryType, isCreating, entry, isEditorDirty, handleSaveNewEntry, handleUpdateEntry, handleEditorSaveComplete]);

    useEffect(() => {
        if (forceEditorSave) {
            handleSave(true);
        }
    }, [forceEditorSave, handleSave]);
    
    useEffect(() => {
        if (isEditorDirty && saveStatus === 'unsaved' && !isCreating) {
            handleSave(false);
        }
    }, [debouncedTitle, debouncedContent, debouncedTags, debouncedEntryType, isEditorDirty, isCreating, handleSave, saveStatus]);
    
    useEffect(() => {
        if (isEditorDirty && saveStatus === 'unsaved' && isCreating && (title.trim() || content.trim())) {
            handleSave(false);
        }
    }, [debouncedTitle, debouncedContent, debouncedTags, debouncedEntryType, isEditorDirty, isCreating, handleSave, saveStatus, title, content]);


    const handleDeleteClick = () => {
        if (!isCreating && entry) {
            setShowDeleteModal(true);
        }
    };

    const confirmDelete = () => {
        if (!isCreating && entry) {
            handleDeleteEntry(entry.id);
        }
        setShowDeleteModal(false);
        handleCloseEditor();
    };
    
    const toggleFocusMode = () => {
        setIsFocusMode(!isFocusMode);
        setAppFocusMode(!isFocusMode);
    };

    const toggleMetadata = () => {
        setShowMetadata(!showMetadata);
    };

    const cycleLayoutMode = () => {
        const modes = ['minimal', 'standard', 'full'];
        const currentIndex = modes.indexOf(layoutMode);
        const nextIndex = (currentIndex + 1) % modes.length;
        setLayoutMode(modes[nextIndex]);
    };

    const entryTimestamp = entry?.updatedAt || entry?.createdAt;
    const formattedTimestamp = entryTimestamp ? formatTimestamp(entryTimestamp) : '';

    return (
        <>
            <motion.div 
                className={`flex flex-col h-full overflow-hidden ${isFocusMode ? 'editor-focus-mode' : ''}`}
                style={{ backgroundColor: 'var(--color-bg-base)', color: 'var(--color-text-primary)' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
            >
                <AnimatePresence>
                    {!isFocusMode && (
                        <motion.div 
                            className="px-4 md:px-6 py-3 md:py-4 flex justify-between items-center flex-shrink-0 z-10 border-b backdrop-blur-sm"
                            style={{ borderBottomColor: 'var(--color-border)' }}
                            initial={{ y: -20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -20, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            {/* Left side - Navigation and status */}
                            <div className="flex items-center space-x-3 md:space-x-4">
                                <motion.button 
                                    onClick={handleCloseEditor} 
                                    className="p-2 rounded-full hover:bg-secondary focus:outline-none focus:ring-2 transition-all group" 
                                    style={{
                                        '--tw-ring-color': 'var(--color-primary-hex)',
                                        color: 'var(--color-text-secondary)',
                                        '--tw-hover-bg': 'var(--color-bg-secondary)'
                                    }}
                                    whileHover={{ x: -3, scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    aria-label="Back" 
                                    title="Back (Esc)"
                                >
                                    <ArrowLeft size={20} className="group-hover:-translate-x-0.5 transition-transform" />
                                </motion.button>
                                
                                <div className="hidden md:flex flex-col">
                                    <motion.div 
                                        className="flex items-center space-x-2"
                                        initial={{ x: -10, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        transition={{ delay: 0.1 }}
                                    >
                                        <div className="flex items-center space-x-2 px-3 py-1 rounded-full" style={{ backgroundColor: `${selectedType.color}15` }}>
                                            <selectedType.icon size={14} style={{ color: selectedType.color }} />
                                            <span className="text-xs font-semibold" style={{ color: selectedType.color }}>
                                                {selectedType.emoji} {isCreating ? `New ${selectedType.label}` : selectedType.label}
                                            </span>
                                        </div>
                                        {!isCreating && formattedTimestamp && (
                                            <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                                                • {formattedTimestamp}
                                            </span>
                                        )}
                                        {layoutMode !== 'minimal' && showWordCount && wordCount > 0 && (
                                            <motion.span 
                                                className="text-xs px-2.5 py-1 rounded-full" 
                                                style={{ 
                                                    backgroundColor: 'var(--color-bg-secondary)',
                                                    color: 'var(--color-text-muted)' 
                                                }}
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                transition={{ type: 'spring', stiffness: 500 }}
                                            >
                                                {wordCount} words • {readingTime} min
                                            </motion.span>
                                        )}
                                    </motion.div>
                                    <motion.div
                                        initial={{ x: -10, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        transition={{ delay: 0.2 }}
                                    >
                                        <SaveStatusIndicator status={saveStatus} />
                                    </motion.div>
                                </div>
                            </div>

                            {/* Right side - Controls */}
                            <motion.div 
                                className="flex items-center space-x-1"
                                initial={{ x: 20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.1 }}
                            >
                                {/* Layout mode toggle */}
                                <motion.button
                                    onClick={cycleLayoutMode}
                                    className="p-2 rounded-full hover:bg-secondary focus:outline-none focus:ring-2 transition-colors"
                                    style={{
                                        '--tw-ring-color': 'var(--color-primary-hex)',
                                        color: 'var(--color-text-secondary)',
                                        '--tw-hover-bg': 'var(--color-bg-secondary)'
                                    }}
                                    whileHover={{ rotate: 90, scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    title={`Layout: ${layoutMode} (click to cycle)`}
                                >
                                    <Settings size={18} />
                                </motion.button>

                                {/* Metadata toggle */}
                                {layoutMode !== 'minimal' && (
                                    <motion.button
                                        onClick={toggleMetadata}
                                        className="p-2 rounded-full hover:bg-secondary focus:outline-none focus:ring-2 transition-colors"
                                        style={{
                                            '--tw-ring-color': 'var(--color-primary-hex)',
                                            color: showMetadata ? 'var(--color-primary-hex)' : 'var(--color-text-secondary)',
                                            '--tw-hover-bg': 'var(--color-bg-secondary)'
                                        }}
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        animate={{ rotate: showMetadata ? 0 : 180 }}
                                        title={`${showMetadata ? 'Hide' : 'Show'} metadata (Ctrl+Shift+M)`}
                                    >
                                        {showMetadata ? <Eye size={18} /> : <EyeOff size={18} />}
                                    </motion.button>
                                )}

                                {/* Word count toggle */}
                                {layoutMode === 'full' && (
                                    <motion.button
                                        onClick={() => setShowWordCount(!showWordCount)}
                                        className="px-2.5 py-1 rounded-full hover:bg-secondary focus:outline-none focus:ring-2 transition-colors font-mono text-xs"
                                        style={{
                                            '--tw-ring-color': 'var(--color-primary-hex)',
                                            color: showWordCount ? 'var(--color-primary-hex)' : 'var(--color-text-secondary)',
                                            '--tw-hover-bg': 'var(--color-bg-secondary)'
                                        }}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        title={`${showWordCount ? 'Hide' : 'Show'} word count`}
                                    >
                                        {wordCount}
                                    </motion.button>
                                )}

                                {/* Focus mode toggle */}
                                <motion.button
                                    onClick={toggleFocusMode}
                                    className="p-2 rounded-full hover:bg-secondary focus:outline-none focus:ring-2 transition-colors"
                                    style={{
                                        '--tw-ring-color': 'var(--color-primary-hex)',
                                        color: 'var(--color-text-secondary)',
                                        '--tw-hover-bg': 'var(--color-bg-secondary)'
                                    }}
                                    whileHover={{ scale: 1.15 }}
                                    whileTap={{ scale: 0.9 }}
                                    aria-label="Focus Mode"
                                    title="Focus Mode (Ctrl+Shift+F)"
                                >
                                    <Expand size={18} />
                                </motion.button>

                                {/* Delete button */}
                                {!isCreating && (
                                    <motion.button 
                                        onClick={handleDeleteClick} 
                                        className="p-2 rounded-full text-red-500 hover:text-red-700 dark:hover:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 focus:outline-none focus:ring-2 transition-colors" 
                                        style={{'--tw-ring-color': '#ef4444'}} 
                                        whileHover={{ scale: 1.1, rotate: [0, -10, 10, 0] }}
                                        whileTap={{ scale: 0.9 }}
                                        transition={{ type: 'spring', stiffness: 400 }}
                                        aria-label="Delete entry" 
                                        title="Delete entry"
                                    >
                                        <Trash2 size={18} />
                                    </motion.button>
                                )}
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                    <AnimatePresence>
                        {!isFocusMode && showMetadata && (
                            <motion.div 
                                className="px-4 md:px-6 py-4 border-b"
                                style={{ borderBottomColor: 'var(--color-border)' }}
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
                            >
                                {/* Title input with animated underline */}
                                <div className="relative mb-4">
                                    <motion.input
                                        type="text"
                                        value={title}
                                        onChange={handleTitleChange}
                                        placeholder={`${selectedType.emoji} ${getEntryType(entryType).label} title...`}
                                        className="form-input w-full bg-transparent border-none p-0 focus:ring-0 text-2xl md:text-3xl font-bold transition-all"
                                        style={{
                                            fontFamily: 'var(--font-serif)',
                                            color: 'var(--color-text-primary)',
                                        }}
                                        initial={{ x: -20, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        transition={{ delay: 0.1 }}
                                    />
                                    <motion.div 
                                        className="h-0.5 rounded-full mt-2"
                                        initial={{ scaleX: 0 }}
                                        animate={{ scaleX: title.length > 0 ? 1 : 0 }}
                                        transition={{ duration: 0.3 }}
                                        style={{ transformOrigin: 'left', backgroundColor: selectedType.color }}
                                    />
                                </div>
                                
                                {/* Metadata controls - responsive layout with stagger */}
                                <div className={`grid gap-4 ${layoutMode === 'full' ? 'md:grid-cols-2' : 'grid-cols-1'}`}>
                                    {/* Entry type selector with icon animation */}
                                    <motion.div 
                                        className="relative"
                                        initial={{ y: 10, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ delay: 0.2 }}
                                    >
                                        <label className="flex items-center text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>
                                            <selectedType.icon size={14} className="mr-1.5" style={{ color: selectedType.color }} />
                                            Entry Type
                                        </label>
                                        <div className="relative">
                                            <motion.div
                                                className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"
                                                whileHover={{ scale: 1.2, rotate: 360 }}
                                                transition={{ duration: 0.5 }}
                                            >
                                                <selectedType.icon size={18} style={{ color: selectedType.color }} />
                                            </motion.div>
                                            <select
                                                value={entryType}
                                                onChange={handleTypeChange}
                                                className="form-select block w-full appearance-none rounded-xl py-2.5 pl-11 pr-10 text-sm font-medium focus:ring-2 transition-all"
                                                style={{
                                                    backgroundColor: `${selectedType.color}08`,
                                                    borderColor: `${selectedType.color}30`,
                                                    color: 'var(--color-text-primary)',
                                                    '--tw-ring-color': selectedType.color,
                                                }}
                                            >
                                                {ENTRY_TYPES.filter(t => !t.secure).map(type => (
                                                    <option key={type.value} value={type.value} style={{ backgroundColor: 'var(--color-bg-content)', color: 'var(--color-text-primary)' }}>
                                                        {type.emoji} {type.label}
                                                    </option>
                                                ))}
                                            </select>
                                            <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                                <ChevronDown size={16} style={{ color: selectedType.color }} />
                                            </span>
                                        </div>
                                    </motion.div>
                                    
                                    {/* Tags input with animation */}
                                    {layoutMode !== 'minimal' && (
                                        <motion.div
                                            initial={{ y: 10, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                            transition={{ delay: 0.3 }}
                                        >
                                            <label className="block text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>
                                                🏷️ Tags
                                            </label>
                                            <TagsInput
                                                tags={tags}
                                                onChange={handleTagsChange}
                                            />
                                        </motion.div>
                                    )}
                                </div>

                                {/* Collapse button with animation */}
                                <motion.button
                                    onClick={toggleMetadata}
                                    className="flex items-center justify-center w-full mt-4 py-2 text-xs font-medium hover:bg-secondary rounded-xl transition-colors group"
                                    style={{
                                        color: 'var(--color-text-muted)',
                                        '--tw-hover-bg': 'var(--color-bg-secondary)'
                                    }}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    initial={{ y: 10, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.4 }}
                                >
                                    <motion.div
                                        animate={{ y: [0, -2, 0] }}
                                        transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
                                    >
                                        <ChevronUp size={14} className="mr-1.5 group-hover:-translate-y-0.5 transition-transform" />
                                    </motion.div>
                                    Hide details
                                </motion.button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Collapsed metadata indicator - Beautiful compact view */}
                    <AnimatePresence>
                        {!isFocusMode && !showMetadata && layoutMode !== 'minimal' && (
                            <motion.button
                                onClick={toggleMetadata}
                                className="px-4 md:px-6 py-3 border-b hover:bg-secondary transition-all group"
                                style={{
                                    borderBottomColor: 'var(--color-border)',
                                    backgroundColor: `${selectedType.color}03`,
                                    '--tw-hover-bg': `${selectedType.color}08`
                                }}
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                whileHover={{ scale: 1.005 }}
                                transition={{ duration: 0.2 }}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                                        <motion.div
                                            className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
                                            style={{ backgroundColor: `${selectedType.color}15` }}
                                            whileHover={{ rotate: 360, scale: 1.1 }}
                                            transition={{ duration: 0.5 }}
                                        >
                                            <selectedType.icon size={16} style={{ color: selectedType.color }} />
                                        </motion.div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-semibold truncate" style={{ color: 'var(--color-text-primary)' }}>
                                                {title || `Untitled ${selectedType.label}`}
                                            </div>
                                            {tags.length > 0 && (
                                                <div className="flex items-center space-x-1 mt-0.5">
                                                    {tags.slice(0, 3).map((tag, i) => (
                                                        <span 
                                                            key={i} 
                                                            className="text-xs px-2 py-0.5 rounded-full"
                                                            style={{ 
                                                                backgroundColor: `${selectedType.color}10`,
                                                                color: selectedType.color
                                                            }}
                                                        >
                                                            #{tag}
                                                        </span>
                                                    ))}
                                                    {tags.length > 3 && (
                                                        <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                                                            +{tags.length - 3}
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <motion.div
                                        animate={{ y: [0, 2, 0] }}
                                        transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
                                    >
                                        <ChevronDown size={16} className="text-slate-400 group-hover:translate-y-0.5 transition-transform" style={{ color: selectedType.color }} />
                                    </motion.div>
                                </div>
                            </motion.button>
                        )}
                    </AnimatePresence>
                    
                    <div className="flex-1 min-h-0 simplemde-container">
                        <SimpleMDE
                            ref={simpleMdeRef}
                            value={content}
                            onChange={handleContentChange}
                            options={mdeOptions}
                            className="h-full"
                        />
                    </div>
                </div>
            </motion.div>

            <AnimatePresence>
                {isFocusMode && (
                    <motion.div
                        className="fixed bottom-6 right-6 z-[10000] flex flex-col items-end gap-2"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        transition={{ delay: 0.5 }}
                    >
                        {/* Keyboard hint */}
                        <motion.div
                            className="px-3 py-1.5 rounded-full text-xs font-medium"
                            style={{
                                backgroundColor: 'var(--color-bg-secondary)',
                                color: 'var(--color-text-muted)',
                                border: '1px solid var(--color-border)'
                            }}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 1 }}
                        >
                            Press <kbd className="px-1.5 py-0.5 rounded text-[10px] font-bold" style={{
                                backgroundColor: 'var(--color-bg-base)',
                                border: '1px solid var(--color-border)'
                            }}>ESC</kbd> to exit
                        </motion.div>
                        
                        {/* Exit button */}
                        <motion.button
                            onClick={toggleFocusMode}
                            className="exit-focus-mode-btn"
                            style={{
                                '--tw-ring-color': 'var(--color-primary-hex)',
                                backgroundColor: 'var(--color-bg-content)',
                                color: 'var(--color-text-primary)',
                                borderColor: 'var(--color-border)'
                            }}
                            aria-label="Exit Focus Mode"
                            title="Exit Focus Mode (Esc)"
                            whileHover={{ scale: 1.05, rotate: 90 }}
                            whileTap={{ scale: 0.95 }}
                            transition={{ type: "spring", stiffness: 400, damping: 17 }}
                        >
                            <Minimize size={20} />
                        </motion.button>
                    </motion.div>
                )}
            </AnimatePresence>

            {showDeleteModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="rounded-lg p-6 max-w-sm w-full"
                         style={{ backgroundColor: 'var(--color-bg-content)', borderColor: 'var(--color-border)' }}>
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="p-2 bg-red-100 dark:bg-red-900/50 rounded-full">
                                <AlertTriangle size={24} className="text-red-600 dark:text-red-400" />
                            </div>
                            <h3 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>Delete Entry?</h3>
                        </div>
                        <p className="text-sm mb-6" style={{ color: 'var(--color-text-secondary)' }}>
                            Are you sure you want to permanently delete this entry? This action cannot be undone.
                        </p>
                        <div className="flex justify-end space-x-2">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="py-2 px-4 rounded-md text-sm font-medium hover:bg-secondary focus:outline-none focus:ring-2 transition-colors"
                                style={{
                                    color: 'var(--color-text-secondary)',
                                    backgroundColor: 'var(--color-bg-secondary)',
                                    '--tw-ring-color': 'var(--color-primary-hex)',
                                    '--tw-hover-bg': 'var(--color-bg-base)'
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="py-2 px-4 rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default Editor;
