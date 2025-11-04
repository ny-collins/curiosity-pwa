import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Trash2, X, AlertTriangle, ChevronDown, Check, Loader2, Expand, Minimize } from 'lucide-react';
import SimpleMDE from 'react-simplemde-editor';
import "easymde/dist/easymde.min.css";
import TagsInput from '/src/components/TagsInput.jsx';
import { formatTimestamp } from '/src/utils.js';
import { ENTRY_TYPES, getEntryType } from '/src/constants.js';
import { useAppContext } from '../context/AppContext';
import { useDebounce } from '../hooks.js';

const SaveStatusIndicator = ({ status }) => {
    let content = null;
    if (status === 'saving') {
        content = (
            <div className="flex items-center space-x-1">
                <Loader2 size={16} className="animate-spin" />
                <span>Saving...</span>
            </div>
        );
    } else if (status === 'saved') {
        content = (
            <div className="flex items-center space-x-1">
                <Check size={16} />
                <span>Saved</span>
            </div>
        );
    }

    return (
        <div className="text-sm text-slate-500 dark:text-gray-400 w-20">
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
        settings,
        isEditorDirty, setIsEditorDirty,
        forceEditorSave,
        handleEditorSaveComplete,
        newEntryType,
        setAppFocusMode
    } = useAppContext();

    const username = settings?.username || 'User';
    const entry = activeEntry;

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [tags, setTags] = useState([]);
    const [entryType, setEntryType] = useState(isCreating ? newEntryType : 'note');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [saveStatus, setSaveStatus] = useState('saved');
    const [isFocusMode, setIsFocusMode] = useState(false);

    const simpleMdeRef = useRef(null);
    const selectedType = getEntryType(entryType);
    
    const debouncedTitle = useDebounce(title, 1500);
    const debouncedContent = useDebounce(content, 1500);
    const debouncedTags = useDebounce(tags, 1500);
    const debouncedEntryType = useDebounce(entryType, 1500);

    const mdeOptions = useMemo(() => {
        return {
            autofocus: true,
            spellChecker: false,
            placeholder: "Start writing...",
            toolbar: isFocusMode ? false : [
                "bold", "italic", "heading", "|", 
                "quote", "code", "link", "|",
                "unordered-list", "ordered-list", "strikethrough", "|",
                "preview", "side-by-side", "guide"
            ],
            status: !isFocusMode,
            renderingConfig: {
                codeSyntaxHighlighting: true,
            },
        };
    }, [isFocusMode]);

    useEffect(() => {
        if (isCreating) {
            const newType = newEntryType || 'note';
            const template = getEntryType(newType)?.template || '';
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

    const entryTimestamp = entry?.updatedAt || entry?.createdAt;
    const formattedTimestamp = entryTimestamp ? formatTimestamp(entryTimestamp) : '';

    return (
        <>
            <div className={`flex flex-col h-full bg-white dark:bg-slate-900 text-slate-900 dark:text-white overflow-hidden ${isFocusMode ? 'editor-focus-mode' : ''}`}>
                <AnimatePresence>
                    {!isFocusMode && (
                        <motion.div 
                            className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center space-x-2 flex-shrink-0 z-10"
                            initial={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                        >
                            <div className="flex items-center space-x-1">
                                <button 
                                    onClick={handleCloseEditor} 
                                    className="p-2 -ml-2 rounded-full text-slate-500 dark:text-gray-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus:ring-2" 
                                    style={{'--tw-ring-color': 'var(--color-primary-hex)'}} 
                                    aria-label="Back" 
                                    title="Back"
                                >
                                    <ArrowLeft size={22} />
                                </button>
                                <div className="flex flex-col">
                                    <span className="text-xs text-slate-500 dark:text-gray-400">
                                        {isCreating ? `New ${getEntryType(entryType).label}` : `Last edited: ${formattedTimestamp}`}
                                    </span>
                                    <SaveStatusIndicator status={saveStatus} />
                                </div>
                            </div>
                            <div className="flex items-center space-x-1">
                                <button
                                    onClick={toggleFocusMode}
                                    className="p-2 rounded-full text-slate-500 dark:text-gray-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus:ring-2"
                                    style={{'--tw-ring-color': 'var(--color-primary-hex)'}} 
                                    aria-label="Focus Mode"
                                    title="Focus Mode"
                                >
                                    <Expand size={20} />
                                </button>
                                {!isCreating && (
                                    <button 
                                        onClick={handleDeleteClick} 
                                        className="p-2 rounded-full text-red-500 hover:text-red-700 dark:hover:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 focus:outline-none focus:ring-2" 
                                        style={{'--tw-ring-color': 'var(--color-primary-hex)'}} 
                                        aria-label="Delete entry" 
                                        title="Delete entry"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                    <AnimatePresence>
                        {!isFocusMode && (
                            <motion.div 
                                className="p-4 md:p-6 border-b border-slate-200 dark:border-slate-700"
                                initial={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                            >
                                <input
                                    type="text"
                                    value={title}
                                    onChange={handleTitleChange}
                                    placeholder={`${getEntryType(entryType).label} Title`}
                                    className="form-input w-full bg-transparent text-slate-900 dark:text-white text-2xl md:text-3xl font-bold border-none p-0 focus:ring-0 placeholder-slate-400 dark:placeholder-slate-500"
                                    style={{fontFamily: 'var(--font-serif)'}}
                                />
                                
                                <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mt-4">
                                    <div className="relative">
                                        <label htmlFor="entryType" className="absolute -top-2 left-2 inline-block bg-white dark:bg-slate-900 px-1 text-xs font-medium text-slate-500 dark:text-gray-400">
                                            Type
                                        </label>
                                        <div className="relative">
                                            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                                                <selectedType.icon size={16} className="text-slate-500 dark:text-gray-400" />
                                            </span>
                                            <select
                                                id="entryType"
                                                value={entryType}
                                                onChange={handleTypeChange}
                                                className="form-select block w-full appearance-none rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white py-2 pl-9 pr-8 shadow-sm focus:border-primary focus:ring-1 focus:ring-primary"
                                                style={{'--tw-ring-color': 'var(--color-primary-hex)', '--tw-border-color': 'var(--color-primary-hex)'}}
                                            >
                                                {ENTRY_TYPES.map(type => (
                                                    <option key={type.value} value={type.value}>
                                                        {type.label}
                                                    </option>
                                                ))}
                                            </select>
                                            <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                                                <ChevronDown size={16} className="text-slate-500 dark:text-gray-400" />
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <div className="flex-1 min-w-[200px] w-full">
                                        <div className="relative">
                                             <label className="absolute -top-2 left-2 inline-block bg-white dark:bg-slate-900 px-1 text-xs font-medium text-slate-500 dark:text-gray-400">
                                                Tags
                                            </label>
                                            <TagsInput
                                                tags={tags}
                                                onChange={handleTagsChange}
                                            />
                                        </div>
                                    </div>
                                </div>

                            </motion.div>
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
                        style={{'--tw-ring-color': 'var(--color-primary-hex)'}}
                        aria-label="Exit Focus Mode"
                        title="Exit Focus Mode"
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
                    <div className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-sm w-full">
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="p-2 bg-red-100 dark:bg-red-900/50 rounded-full">
                                <AlertTriangle size={24} className="text-red-600 dark:text-red-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Delete Entry?</h3>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-gray-300 mb-6">
                            Are you sure you want to permanently delete this entry? This action cannot be undone.
                        </p>
                        <div className="flex justify-end space-x-2">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="py-2 px-4 rounded-md text-sm font-medium text-slate-700 dark:text-gray-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 focus:outline-none focus:ring-2"
                                style={{'--tw-ring-color': 'var(--color-primary-hex)'}}
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