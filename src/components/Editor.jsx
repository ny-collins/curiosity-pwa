
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
    let content = null;
    if (status === 'saving') {
        content = (
            <div className="flex items-center space-x-1">
                <Loader2 size={14} className="animate-spin" />
                <span className="text-xs">Saving...</span>
            </div>
        );
    } else if (status === 'saved') {
        content = (
            <div className="flex items-center space-x-1">
                <Check size={14} />
                <span className="text-xs">Saved</span>
            </div>
        );
    }

    return (
        <div className="text-xs w-16" style={{ color: 'var(--color-text-muted)' }}>
            <AnimatePresence mode="wait">
                {content && (
                    <motion.div
                        key={status}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        transition={{ duration: 0.2 }}
                    >
                        {content}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
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
            autofocus: false, // Disable autofocus to prevent cursor jumping
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
            <div className={`flex flex-col h-full overflow-hidden ${isFocusMode ? 'editor-focus-mode' : ''}`}
                 style={{ backgroundColor: 'var(--color-bg-base)', color: 'var(--color-text-primary)' }}>
                <AnimatePresence>
                    {!isFocusMode && (
                        <motion.div 
                            className="px-4 py-3 flex justify-between items-center flex-shrink-0 z-10 border-b"
                            style={{ borderBottomColor: 'var(--color-border)' }}
                            initial={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                        >
                            {/* Left side - Navigation and status */}
                            <div className="flex items-center space-x-3">
                                <button 
                                    onClick={handleCloseEditor} 
                                    className="p-2 -ml-2 rounded-full hover:bg-secondary focus:outline-none focus:ring-2 transition-colors" 
                                    style={{
                                        '--tw-ring-color': 'var(--color-primary-hex)',
                                        color: 'var(--color-text-secondary)',
                                        '--tw-hover-bg': 'var(--color-bg-secondary)'
                                    }}
                                    aria-label="Back" 
                                    title="Back (Esc)"
                                >
                                    <ArrowLeft size={20} />
                                </button>
                                
                                <div className="flex flex-col">
                                    <div className="flex items-center space-x-2">
                                        <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                                            {isCreating ? `New ${getEntryType(entryType).label}` : `Last edited: ${formattedTimestamp}`}
                                        </span>
                                        {layoutMode !== 'minimal' && showWordCount && (
                                            <span className="text-xs px-2 py-1 rounded-full" 
                                                  style={{ 
                                                      backgroundColor: 'var(--color-bg-secondary)',
                                                      color: 'var(--color-text-muted)' 
                                                  }}>
                                                {wordCount} words • {readingTime} min read
                                            </span>
                                        )}
                                    </div>
                                    <SaveStatusIndicator status={saveStatus} />
                                </div>
                            </div>

                            {/* Right side - Controls */}
                            <div className="flex items-center space-x-1">
                                {/* Layout mode toggle */}
                                <button
                                    onClick={cycleLayoutMode}
                                    className="p-2 rounded-full hover:bg-secondary focus:outline-none focus:ring-2 transition-colors"
                                    style={{
                                        '--tw-ring-color': 'var(--color-primary-hex)',
                                        color: 'var(--color-text-secondary)',
                                        '--tw-hover-bg': 'var(--color-bg-secondary)'
                                    }}
                                    title={`Layout: ${layoutMode} (click to cycle)`}
                                >
                                    <Settings size={18} />
                                </button>

                                {/* Metadata toggle */}
                                {layoutMode !== 'minimal' && (
                                    <button
                                        onClick={toggleMetadata}
                                        className="p-2 rounded-full hover:bg-secondary focus:outline-none focus:ring-2 transition-colors"
                                        style={{
                                            '--tw-ring-color': 'var(--color-primary-hex)',
                                            color: showMetadata ? 'var(--color-primary-hex)' : 'var(--color-text-secondary)',
                                            '--tw-hover-bg': 'var(--color-bg-secondary)'
                                        }}
                                        title={`${showMetadata ? 'Hide' : 'Show'} metadata (Ctrl+Shift+M)`}
                                    >
                                        {showMetadata ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                )}

                                {/* Word count toggle */}
                                {layoutMode === 'full' && (
                                    <button
                                        onClick={() => setShowWordCount(!showWordCount)}
                                        className={`p-2 rounded-full hover:bg-secondary focus:outline-none focus:ring-2 transition-colors ${showWordCount ? 'text-primary' : ''}`}
                                        style={{
                                            '--tw-ring-color': 'var(--color-primary-hex)',
                                            color: showWordCount ? 'var(--color-primary-hex)' : 'var(--color-text-secondary)',
                                            '--tw-hover-bg': 'var(--color-bg-secondary)'
                                        }}
                                        title={`${showWordCount ? 'Hide' : 'Show'} word count`}
                                    >
                                        <span className="text-xs font-mono">{wordCount}</span>
                                    </button>
                                )}

                                {/* Focus mode toggle */}
                                <button
                                    onClick={toggleFocusMode}
                                    className="p-2 rounded-full hover:bg-secondary focus:outline-none focus:ring-2 transition-colors"
                                    style={{
                                        '--tw-ring-color': 'var(--color-primary-hex)',
                                        color: 'var(--color-text-secondary)',
                                        '--tw-hover-bg': 'var(--color-bg-secondary)'
                                    }}
                                    aria-label="Focus Mode"
                                    title="Focus Mode (Ctrl+Shift+F)"
                                >
                                    <Expand size={18} />
                                </button>

                                {/* Delete button */}
                                {!isCreating && (
                                    <button 
                                        onClick={handleDeleteClick} 
                                        className="p-2 rounded-full text-red-500 hover:text-red-700 dark:hover:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 focus:outline-none focus:ring-2 transition-colors" 
                                        style={{'--tw-ring-color': 'var(--color-primary-hex)'}} 
                                        aria-label="Delete entry" 
                                        title="Delete entry"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                    <AnimatePresence>
                        {!isFocusMode && showMetadata && (
                            <motion.div 
                                className="px-4 py-3 border-b"
                                style={{ borderBottomColor: 'var(--color-border)' }}
                                initial={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                {/* Title input - always visible */}
                                <input
                                    type="text"
                                    value={title}
                                    onChange={handleTitleChange}
                                    placeholder={`${getEntryType(entryType).label} Title`}
                                    className="form-input w-full bg-transparent border-none p-0 focus:ring-0 text-xl md:text-2xl font-bold mb-3"
                                    style={{
                                        fontFamily: 'var(--font-serif)',
                                        color: 'var(--color-text-primary)',
                                        '::placeholder': { color: 'var(--color-text-muted)' }
                                    }}
                                />
                                
                                {/* Metadata controls - responsive layout */}
                                <div className={`flex flex-col gap-3 ${layoutMode === 'full' ? 'md:flex-row md:items-end' : 'flex-col'}`}>
                                    {/* Entry type selector */}
                                    <div className="flex-1 min-w-0">
                                        <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                                            Type
                                        </label>
                                        <div className="relative">
                                            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                                                <selectedType.icon size={16} style={{ color: 'var(--color-text-muted)' }} />
                                            </span>
                                            <select
                                                value={entryType}
                                                onChange={handleTypeChange}
                                                className="form-select block w-full appearance-none rounded-md py-2 pl-9 pr-8 text-sm focus:ring-1"
                                                style={{
                                                    backgroundColor: 'var(--color-bg-content)',
                                                    borderColor: 'var(--color-border)',
                                                    color: 'var(--color-text-primary)',
                                                    '--tw-ring-color': 'var(--color-primary-hex)',
                                                    '--tw-border-color': 'var(--color-primary-hex)'
                                                }}
                                            >
                                                {ENTRY_TYPES.map(type => (
                                                    <option key={type.value} value={type.value} style={{ backgroundColor: 'var(--color-bg-content)', color: 'var(--color-text-primary)' }}>
                                                        {type.label}
                                                    </option>
                                                ))}
                                            </select>
                                            <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                                                <ChevronDown size={14} style={{ color: 'var(--color-text-muted)' }} />
                                            </span>
                                        </div>
                                    </div>
                                    
                                    {/* Tags input - only show in standard/full modes */}
                                    {layoutMode !== 'minimal' && (
                                        <div className="flex-1 min-w-0">
                                            <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                                                Tags
                                            </label>
                                            <TagsInput
                                                tags={tags}
                                                onChange={handleTagsChange}
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* Metadata toggle button */}
                                <button
                                    onClick={toggleMetadata}
                                    className="flex items-center justify-center w-full mt-3 py-2 text-xs hover:bg-secondary rounded-md transition-colors"
                                    style={{
                                        color: 'var(--color-text-muted)',
                                        '--tw-hover-bg': 'var(--color-bg-secondary)'
                                    }}
                                >
                                    <ChevronUp size={14} className="mr-1" />
                                    Hide details
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Collapsed metadata indicator */}
                    <AnimatePresence>
                        {!isFocusMode && !showMetadata && layoutMode !== 'minimal' && (
                            <motion.button
                                onClick={toggleMetadata}
                                className="px-4 py-2 border-b text-left hover:bg-secondary transition-colors"
                                style={{
                                    borderBottomColor: 'var(--color-border)',
                                    color: 'var(--color-text-muted)',
                                    '--tw-hover-bg': 'var(--color-bg-secondary)'
                                }}
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <selectedType.icon size={14} style={{ color: 'var(--color-text-muted)' }} />
                                        <span className="text-sm truncate">
                                            {title || `${getEntryType(entryType).label} Title`}
                                        </span>
                                        {tags.length > 0 && (
                                            <span className="text-xs px-2 py-1 rounded-full" 
                                                  style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
                                                {tags.length} tag{tags.length !== 1 ? 's' : ''}
                                            </span>
                                        )}
                                    </div>
                                    <ChevronRight size={14} />
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
            </div>

            <AnimatePresence>
                {isFocusMode && (
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
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                    >
                        <Minimize size={20} />
                    </motion.button>
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
