import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { ArrowLeft, Check, Trash2, X, AlertTriangle, ChevronDown } from 'lucide-react';
import SimpleMDE from 'react-simplemde-editor';
import "easymde/dist/easymde.min.css";
import TagsInput from '/src/components/TagsInput.jsx';
import { formatTimestamp } from '/src/utils.js';
import { ENTRY_TYPES, getEntryType } from '/src/constants.js';
import { useAppContext } from '../context/AppContext';

function Editor() {
    const {
        activeEntry,
        handleUpdateEntry,
        handleSaveNewEntry,
        handleDeleteEntry,
        handleCloseEditor,
        isCreating,
        settings,
        setIsEditorDirty,
        forceEditorSave,
        handleEditorSaveComplete,
        newEntryType
    } = useAppContext();

    const username = settings?.username || 'User';
    const entry = activeEntry; // Rename for consistency

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [tags, setTags] = useState([]);
    const [entryType, setEntryType] = useState(isCreating ? newEntryType : 'note');
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const simpleMdeRef = useRef(null);
    const selectedType = getEntryType(entryType);

    const mdeOptions = useMemo(() => {
        return {
            autofocus: true,
            spellChecker: false,
            placeholder: "Start writing...",
            toolbar: [
                "bold", "italic", "heading", "|", 
                "quote", "code", "link", "|",
                "unordered-list", "ordered-list", "strikethrough", "|",
                "preview", "side-by-side", "guide"
            ],
            status: ["lines", "words"],
            renderingConfig: {
                codeSyntaxHighlighting: true,
            },
            previewRender: (plainText) => {
                if (simpleMdeRef.current) {
                    return simpleMdeRef.current.markdown(plainText);
                }
                return "";
            },
        };
    }, []);

    useEffect(() => {
        if (isCreating) {
            const newType = newEntryType || 'note';
            const template = getEntryType(newType)?.template || '';
            setTitle('');
            setContent(template);
            setTags([]);
            setEntryType(newType);
            setIsEditorDirty(template.length > 0);
        } else if (entry) {
            setTitle(entry.title || '');
            setContent(entry.content || '');
            setTags(entry.tags || []);
            setEntryType(entry.type || 'note');
            setIsEditorDirty(false);
        } else {
            setTitle('');
            setContent('');
            setTags([]);
            setEntryType('note');
            setIsEditorDirty(false);
        }
    }, [entry, isCreating, newEntryType, setIsEditorDirty]);

    const handleContentChange = (value) => {
        setContent(value);
        setIsEditorDirty(true);
    };

    const handleTitleChange = (e) => {
        setTitle(e.target.value);
        setIsEditorDirty(true);
    };

    const handleTagsChange = (newTags) => {
        setTags(newTags);
        setIsEditorDirty(true);
    };
    
    const handleTypeChange = (e) => {
        setEntryType(e.target.value);
        setIsEditorDirty(true);
    };

    const handleSave = useCallback(async (fromModal = false) => {
        const entryData = { title, content, tags, type: entryType };
        if (isCreating) {
            await handleSaveNewEntry(entryData);
        } else if (entry) {
            await handleUpdateEntry(entry.id, entryData);
        }
        setIsEditorDirty(false);
        if (fromModal) {
            handleEditorSaveComplete();
        }
    }, [title, content, tags, entryType, isCreating, entry, handleSaveNewEntry, handleUpdateEntry, setIsEditorDirty, handleEditorSaveComplete]);

    // --- FIX for Issue #19 ---
    useEffect(() => {
        if (forceEditorSave) {
            handleSave(true);
        }
    }, [forceEditorSave, handleSave]); // Correct dependencies

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

    const entryTimestamp = entry?.updatedAt || entry?.createdAt;
    const formattedTimestamp = entryTimestamp ? formatTimestamp(entryTimestamp) : '';

    return (
        <>
            <div className="flex flex-col h-full bg-white dark:bg-slate-900 text-slate-900 dark:text-white overflow-hidden">
                <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center space-x-2 flex-shrink-0 z-10">
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
                                {isCreating ? `New ${getEntryType(entryType).label} by ${username}` : `Last edited: ${formattedTimestamp}`}
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center space-x-1">
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
                        <button
                            onClick={() => handleSave(false)}
                            disabled={!isEditorDirty}
                            className="flex items-center space-x-1 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed"
                            style={{ backgroundColor: 'var(--color-primary-hex)', '--tw-ring-color': 'var(--color-primary-hex)' }}
                        >
                            <Check size={20} />
                            <span>{isCreating ? 'Save' : (isEditorDirty ? 'Save' : 'Saved')}</span>
                        </button>
                    </div>
                </div>

                <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                    <div className="p-4 md:p-6 border-b border-slate-200 dark:border-slate-700">
                        <input
                            type="text"
                            value={title}
                            onChange={handleTitleChange}
                            placeholder={`${getEntryType(entryType).label} Title`}
                            className="form-input w-full bg-transparent text-slate-900 dark:text-white text-2xl md:text-3xl font-bold border-none p-0 focus:ring-0 placeholder-slate-400 dark:placeholder-slate-500"
                        />
                        
                        <div className="flex flex-wrap items-center gap-4 mt-4">
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
                            
                            <div className="flex-1 min-w-[200px]">
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

                    </div>
                    
                    <div className="flex-1 min-h-0">
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
