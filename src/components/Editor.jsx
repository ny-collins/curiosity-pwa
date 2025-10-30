import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { BookOpen, ArrowLeft, Trash2, Check, Eye, EyeOff } from 'lucide-react'; 
import { formatTimestamp } from '../utils'; 
import SimpleMdeReact from "react-simplemde-editor";
import ReactMarkdown from 'react-markdown'; 
import TagsInput from './TagsInput';

function Editor({ entry, onUpdate, onSaveNew, onDelete, onBack, onCreate, className, username, isCreating }) {
    const [localTitle, setLocalTitle] = useState('');
    const [localContent, setLocalContent] = useState('');
    const [localTags, setLocalTags] = useState([]);
    const [viewMode, setViewMode] = useState('edit'); 
    const localEntryIdRef = useRef(null);

    useEffect(() => {
        if (isCreating) {
            setLocalTitle('');
            setLocalContent('');
            setLocalTags([]);
            localEntryIdRef.current = null; 
            setViewMode('edit');
        } else if (entry) {
            if (entry.id !== localEntryIdRef.current) {
                 setLocalTitle(entry.title || ''); 
                 setLocalContent(entry.content || ''); 
                 setLocalTags(entry.tags || []);
                 localEntryIdRef.current = entry.id; 
                 setViewMode('edit'); 
             }
        } else {
            setLocalTitle('');
            setLocalContent('');
            setLocalTags([]);
             localEntryIdRef.current = null; 
        }
    }, [entry, isCreating]); 

    const handleSave = () => {
        const titleToSave = localTitle.trim() === '' ? 'Untitled' : localTitle;
        const dataToSave = { 
            title: titleToSave, 
            content: localContent,
            tags: localTags 
        };
        
        if (isCreating) {
            onSaveNew(dataToSave); 
        } else if (entry) {
            onUpdate(entry.id, dataToSave); 
            onBack(); 
        }
    };

    const handleDiscard = () => {
         onBack(); 
    };
    
    const editorOptions = useMemo(() => {
        return {
            autofocus: false, 
            spellChecker: false,
            placeholder: "Start writing your thoughts... (Markdown is supported!)",
            minHeight: "100%",
            toolbar: [
                "bold", "italic", "heading", "|", 
                "quote", "unordered-list", "ordered-list", "|",
                "link", 
                "|", 
                {
                    name: "togglePreview",
                    action: () => setViewMode(prev => (prev === 'edit' ? 'preview' : 'edit')),
                    className: `fa fa-eye${viewMode === 'preview' ? '-slash' : ''}`,
                    title: `Toggle Preview (Ctrl+P)`,
                },
                "guide"
            ],
            status: ["words", "cursor"], 
        };
    }, [viewMode]); 
    
    const onContentChange = useCallback((value) => {
        setLocalContent(value);
    }, []);

    if (!entry && !isCreating) {
        return (
            <div className={`flex-1 h-full flex items-center justify-center bg-slate-800 p-8 ${className}`}>
                <div className="text-center max-w-sm">
                    <BookOpen size={64} className="mx-auto text-slate-600" />
                    <h2 className="mt-6 text-3xl font-bold text-white">
                        {`What's on your mind, ${username || 'Collins'}?`}
                    </h2>
                    <p className="mt-4 text-gray-400">
                        Select an entry from the list or start a new one to capture your thoughts.
                    </p>
                    <button
                        onClick={onCreate}
                        className="mt-8 w-full text-white font-bold py-3 px-5 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2"
                        style={{ backgroundColor: 'var(--color-primary-hex)', '--tw-ring-color': 'var(--color-primary-hex)' }}
                    >
                        Start a New Entry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={`flex-1 h-full flex flex-col bg-slate-800 overflow-hidden ${className}`}>
            <div className="p-4 border-b border-slate-700 flex justify-between items-center space-x-2 flex-shrink-0">
                 <button
                    onClick={handleDiscard} 
                    className="p-2 -ml-2 rounded-full text-gray-400 hover:text-white hover:bg-slate-700 focus:outline-none focus:ring-2" 
                    style={{'--tw-ring-color': 'var(--color-primary-hex)'}}
                    aria-label="Discard Changes & Back" 
                    title="Discard Changes & Back"
                >
                    <ArrowLeft size={22} /> 
                </button>
                
                <input
                    type="text"
                    value={localTitle}
                    onChange={(e) => setLocalTitle(e.target.value)}
                    placeholder="Entry Title" 
                    className="flex-grow text-2xl font-semibold bg-transparent text-white border-none focus:outline-none p-2 focus:ring-0 mx-1 min-w-0" 
                />

                <div className="flex items-center space-x-1 flex-shrink-0">
                    <button
                        onClick={() => setViewMode(prev => (prev === 'edit' ? 'preview' : 'edit'))}
                        className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-slate-700 focus:outline-none focus:ring-2"
                        style={{'--tw-ring-color': 'var(--color-primary-hex)'}}
                        aria-label={viewMode === 'edit' ? 'Show Preview' : 'Show Editor'}
                        title={viewMode === 'edit' ? 'Show Preview' : 'Show Editor'}
                    >
                        {viewMode === 'edit' ? <Eye size={20} /> : <EyeOff size={20} />}
                    </button>
                    
                    <button
                        onClick={handleSave} 
                        className="p-2 rounded-full hover:bg-slate-700 focus:outline-none focus:ring-2" 
                        style={{ color: 'var(--color-primary-hex)', '--tw-ring-color': 'var(--color-primary-hex)'}}
                        aria-label="Save & Close" 
                        title="Save & Close"
                    >
                        <Check size={22} /> 
                    </button>

                    {!isCreating && entry && ( 
                        <button
                            onClick={() => onDelete(entry.id)}
                            className="p-2 rounded-full text-gray-500 hover:text-red-400 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                            aria-label="Delete entry"
                            title="Delete Entry"
                        >
                            <Trash2 size={20} />
                        </button>
                    )}
                </div>
            </div>
            
            <div className="p-2 border-b border-slate-700 flex-shrink-0">
                <TagsInput
                    tags={localTags}
                    onChange={setLocalTags}
                />
            </div>
            
            <div className="flex-1 w-full overflow-hidden">
                {viewMode === 'edit' ? (
                    <SimpleMdeReact
                        className="h-full"
                        value={localContent}
                        onChange={onContentChange}
                        options={editorOptions}
                    />
                ) : (
                     <div className="markdown-preview">
                        <ReactMarkdown>
                            {localContent}
                        </ReactMarkdown>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Editor;
