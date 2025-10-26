import React, { useState, useEffect, useRef } from 'react';
// Icons needed for the consistent header
import { BookOpen, Trash2, Check, ArrowLeft } from 'lucide-react'; 
import { formatTimestamp } from '../utils'; 
// useDebounce hook is removed

// Added isCreating and onSaveNew props
function Editor({ entry, onUpdate, onSaveNew, onDelete, onBack, onCreate, className, username, isCreating }) {
    const [localTitle, setLocalTitle] = useState('');
    const [localContent, setLocalContent] = useState('');
    // Ref to track the current entry ID associated with local state
    const localEntryIdRef = useRef(null);

    // Effect to update local state when entry prop changes OR when entering create mode
    useEffect(() => {
        console.log('Editor useEffect - isCreating:', isCreating, 'entry:', entry);
        if (isCreating) {
            // If entering create mode, reset fields
            setLocalTitle('');
            setLocalContent('');
            localEntryIdRef.current = null; // No ID for new entry yet
            console.log("Editor reset for new entry");
        } else if (entry) {
            // If editing an existing entry, load its data if ID changed
            if (entry.id !== localEntryIdRef.current) {
                 setLocalTitle(entry.title || '');
                 setLocalContent(entry.content || '');
                 localEntryIdRef.current = entry.id; // Store current entry ID
                 console.log("Editor loaded data for entry:", entry.id);
             } else {
                 console.log("Editor received update for the same entry, local state preserved.");
             }
        } else {
            // No entry selected and not creating, clear fields (e.g., after delete)
            setLocalTitle('');
            setLocalContent('');
            localEntryIdRef.current = null;
        }
    // Rerun when isCreating flag changes or entry object reference changes
    }, [entry, isCreating]); 

    // REMOVED: Auto-saving useEffect is gone

    // Function to handle explicit save (now decides between create/update)
    const handleSave = () => {
        const titleToSave = localTitle.trim() === '' ? 'Untitled' : localTitle;
        const dataToSave = {
            title: titleToSave,
            content: localContent
        };

        if (isCreating) {
            console.log("Editor handleSave calling onSaveNew");
            onSaveNew(dataToSave); // Call App's function to create
        } else if (entry) {
            console.log("Editor handleSave calling onUpdate for entry:", entry.id);
            onUpdate(entry.id, dataToSave); // Call App's function to update
            // After update, we still need to navigate back
            onBack(); 
        } else {
            console.error("Save clicked but no entry or create mode active.");
        }
        // onBack() is now called within onSaveNew or after onUpdate
    };

    // Function to handle discard (simply navigate back)
    const handleDiscard = () => {
         console.log("Editor handleDiscard triggered");
         onBack(); // Navigate back without saving local state
    };


    // --- Render Logic ---

    // Placeholder view when no entry selected AND not creating
    // This condition might not be reachable if App component handles it, but good fallback
    if (!entry && !isCreating) {
        return (
            <div className={`flex-1 h-full flex items-center justify-center bg-slate-800 p-8 ${className}`}>
                 {/* ... Placeholder content ... */}
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
                        className="mt-8 w-full bg-teal-600 text-white font-bold py-3 px-5 rounded-lg hover:bg-teal-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-teal-400"
                    >
                        Start a New Entry
                    </button>
                </div>
            </div>
        );
    }

    // Editor view (either for new or existing entry)
    return (
        <div className={`flex-1 h-full flex flex-col bg-slate-800 overflow-hidden ${className}`}>
            {/* Header - Consistent layout */}
            <div className="p-4 border-b border-slate-700 flex justify-between items-center space-x-2 flex-shrink-0">
                {/* Back/Discard Button */}
                 <button
                    onClick={handleDiscard} 
                    className="p-2 -ml-2 rounded-full text-gray-400 hover:text-white hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500" 
                    aria-label="Discard Changes & Back" 
                    title="Discard Changes & Back"
                >
                    <ArrowLeft size={22} /> 
                </button>
                
                {/* Title Input */}
                <input
                    type="text"
                    value={localTitle}
                    onChange={(e) => setLocalTitle(e.target.value)}
                    placeholder="Entry Title" 
                    className="flex-grow text-2xl font-semibold bg-transparent text-white border-none focus:outline-none p-2 focus:ring-0 mx-1 min-w-0" 
                />

                {/* Action Buttons Container */}
                <div className="flex items-center space-x-1 flex-shrink-0">
                    {/* Save Button */}
                    <button
                        onClick={handleSave} 
                        className="p-2 rounded-full text-teal-400 hover:text-teal-300 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500" 
                        aria-label="Save & Close" 
                        title="Save & Close"
                    >
                        <Check size={22} /> 
                    </button>

                    {/* Delete Button (Hidden when creating new) */}
                    {!isCreating && entry && ( // Only show if editing an existing entry
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
            {/* Content Textarea */}
            <textarea
                value={localContent}
                onChange={(e) => setLocalContent(e.target.value)}
                placeholder="Start writing your thoughts..."
                className="flex-1 w-full p-6 bg-transparent text-gray-300 resize-none focus:outline-none custom-scrollbar text-lg leading-relaxed focus:ring-0" 
            />
            {/* Footer (Hidden when creating new, visible when editing) */}
            {!isCreating && entry && ( // Only show footer when editing
                <div className="p-4 border-t border-slate-700 text-sm text-gray-500 flex-shrink-0 hidden md:block">
                    Last updated: {formatTimestamp(entry.updatedAt)}
                </div>
            )}
        </div>
    );
}

export default Editor;
