import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Save, ArrowLeft, Maximize, Minimize, Eye, EyeOff, Type, Calendar as CalendarIcon,
    Bold, Italic, Underline as UnderlineIcon, Heading1, Heading2, Heading3, List, ListOrdered, Quote, Code,
    Link as LinkIcon, Image as ImageIcon, Check, Loader, AlertCircle, Sparkles, X, HelpCircle
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useAppState } from '../contexts/StateProvider';
import { format } from 'date-fns';
import TagsInput from './TagsInput';
import { getEntryType, REGULAR_ENTRY_TYPES } from '../constants';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Helper to convert markdown to HTML for display
const markdownToHtml = (markdown) => {
    if (!markdown) return '';
    
    let html = markdown
        // Headers
        .replace(/^### (.*$)/gm, '<h3>$1</h3>')
        .replace(/^## (.*$)/gm, '<h2>$1</h2>')
        .replace(/^# (.*$)/gm, '<h1>$1</h1>')
        // Bold
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        // Italic
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        // Underline (HTML tags preserved)
        .replace(/<u>(.+?)<\/u>/g, '<u>$1</u>')
        // Inline code
        .replace(/`(.+?)`/g, '<code>$1</code>')
        // Links
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>')
        // Images
        .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" />')
        // Blockquotes
        .replace(/^&gt; (.*$)/gm, '<blockquote>$1</blockquote>')
        .replace(/^> (.*$)/gm, '<blockquote>$1</blockquote>')
        // Unordered lists
        .replace(/^\* (.*$)/gm, '<li>$1</li>')
        .replace(/^- (.*$)/gm, '<li>$1</li>')
        // Ordered lists
        .replace(/^\d+\. (.*$)/gm, '<li>$1</li>')
        // Line breaks
        .replace(/\n/g, '<br />');
    
    // Wrap consecutive <li> in <ul> or <ol>
    html = html.replace(/(<li>.*?<\/li>(\s*<br \/>)*)+/g, (match) => {
        return '<ul>' + match.replace(/<br \/>/g, '') + '</ul>';
    });
    
    return html;
};

// Helper to convert HTML back to markdown for storage
const htmlToMarkdown = (html) => {
    if (!html) return '';
    
    const temp = document.createElement('div');
    temp.innerHTML = html;
    
    let markdown = '';
    const traverse = (node) => {
        if (node.nodeType === Node.TEXT_NODE) {
            markdown += node.textContent;
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            const tag = node.tagName.toLowerCase();
            
            switch (tag) {
                case 'h1':
                    markdown += '# ' + node.textContent + '\n';
                    break;
                case 'h2':
                    markdown += '## ' + node.textContent + '\n';
                    break;
                case 'h3':
                    markdown += '### ' + node.textContent + '\n';
                    break;
                case 'strong':
                case 'b':
                    markdown += '**' + node.textContent + '**';
                    break;
                case 'em':
                case 'i':
                    markdown += '*' + node.textContent + '*';
                    break;
                case 'u':
                    markdown += '<u>' + node.textContent + '</u>';
                    break;
                case 'code':
                    markdown += '`' + node.textContent + '`';
                    break;
                case 'a':
                    markdown += '[' + node.textContent + '](' + node.href + ')';
                    break;
                case 'img':
                    markdown += '![' + (node.alt || '') + '](' + node.src + ')';
                    break;
                case 'blockquote':
                    markdown += '> ' + node.textContent + '\n';
                    break;
                case 'li':
                    markdown += '- ' + node.textContent + '\n';
                    break;
                case 'br':
                    markdown += '\n';
                    break;
                case 'p':
                case 'div':
                    Array.from(node.childNodes).forEach(traverse);
                    markdown += '\n';
                    break;
                default:
                    Array.from(node.childNodes).forEach(traverse);
            }
        }
    };
    
    Array.from(temp.childNodes).forEach(traverse);
    return markdown.trim();
};

const ModernEditor = ({ entry, isCreating, newEntryType, handleEditorSaveComplete, forceEditorSave }) => {
    const { 
        handleSaveNewEntry, 
        handleUpdateEntry, 
        handleDeleteEntry,
        setAppFocusMode,
        handleViewChange,
        userId
    } = useAppState();

    // Editor state
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [htmlContent, setHtmlContent] = useState('');
    const [tags, setTags] = useState([]);
    const [entryType, setEntryType] = useState('note');
    const [isEditorDirty, setIsEditorDirty] = useState(false);
    const [saveStatus, setSaveStatus] = useState('saved'); // 'saved' | 'unsaved' | 'saving'
    
    // UI state
    const [isFocusMode, setIsFocusMode] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [showUnsavedModal, setShowUnsavedModal] = useState(false);
    const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(false);
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [wordCount, setWordCount] = useState(0);
    const [readingTime, setReadingTime] = useState(0);
    const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);
    const [saveError, setSaveError] = useState(null);
    
    // Formatting state tracking
    const [activeFormats, setActiveFormats] = useState({
        bold: false,
        italic: false,
        underline: false,
        h1: false,
        h2: false,
        h3: false
    });

    const editorRef = useRef(null);
    const saveTimeoutRef = useRef(null);
    const initializedEntryIdRef = useRef(null);

    // Initialize editor with entry data (only on first load or when entry changes)
    useEffect(() => {
        if (isCreating) {
            const newType = newEntryType || 'note';
            const selectedType = getEntryType(newType);
            const template = selectedType.template || '';
            setTitle('');
            setContent(template);
            setHtmlContent(markdownToHtml(template));
            setTags([]);
            setEntryType(newType);
            setIsEditorDirty(false);
            setSaveStatus('saved');
            initializedEntryIdRef.current = null;
        } else if (entry && entry.id !== initializedEntryIdRef.current) {
            // Only reinitialize if it's a different entry
            setTitle(entry.title || '');
            const entryContent = entry.content || '';
            setContent(entryContent);
            setHtmlContent(markdownToHtml(entryContent));
            setTags(entry.tags || []);
            setEntryType(entry.type || 'note');
            setIsEditorDirty(false);
            setSaveStatus('saved');
            initializedEntryIdRef.current = entry.id;
        }
    }, [entry?.id, isCreating, newEntryType]);

    // Update editor HTML when content changes (only for initial load)
    useEffect(() => {
        if (editorRef.current && htmlContent && !editorRef.current.innerHTML.trim()) {
            // Only set HTML content if editor is empty (initial load)
            editorRef.current.innerHTML = htmlContent;
        }
    }, [htmlContent]);

    // Auto-save logic with longer delay
    useEffect(() => {
        if (isEditorDirty && (title.trim() || content.trim())) {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }
            
            saveTimeoutRef.current = setTimeout(() => {
                handleSave();
            }, 8000); // Auto-save after 8 seconds of inactivity (increased from 2 to reduce flickering)
        }

        return () => {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }
        };
    }, [title, content, tags, entryType, isEditorDirty]);

    // Force save handler
    useEffect(() => {
        if (forceEditorSave) {
            handleSave(true);
        }
    }, [forceEditorSave]);

    // Update active format states based on cursor position
    const updateFormatStates = useCallback(() => {
        if (!editorRef.current) return;
        
        const selection = window.getSelection();
        if (!selection.rangeCount) return;
        
        let node = selection.anchorNode;
        if (node && node.nodeType === Node.TEXT_NODE) {
            node = node.parentElement;
        }
        
        const formats = {
            bold: false,
            italic: false,
            underline: false,
            h1: false,
            h2: false,
            h3: false
        };
        
        // Check current node and its parents
        while (node && node !== editorRef.current) {
            const tagName = node.tagName?.toLowerCase();
            if (tagName === 'strong' || tagName === 'b') formats.bold = true;
            if (tagName === 'em' || tagName === 'i') formats.italic = true;
            if (tagName === 'u') formats.underline = true;
            if (tagName === 'h1') formats.h1 = true;
            if (tagName === 'h2') formats.h2 = true;
            if (tagName === 'h3') formats.h3 = true;
            node = node.parentElement;
        }
        
        setActiveFormats(formats);
    }, []);

    // Handlers
    const handleContentChange = () => {
        if (!editorRef.current) return;

        const html = editorRef.current.innerHTML;
        // Don't update htmlContent state during typing to avoid cursor jumping
        // Only update markdown content for saving
        const markdown = htmlToMarkdown(html);
        setContent(markdown);
        setIsEditorDirty(true);
        updateFormatStates();

        // Calculate word count and reading time
        const text = markdown.replace(/[#*`~\[\]()]/g, '').trim();
        const words = text ? text.split(/\s+/).length : 0;
        setWordCount(words);
        setReadingTime(Math.ceil(words / 200)); // Average reading speed
    };    // Track cursor/selection changes to update format states
    const handleSelectionChange = useCallback(() => {
        updateFormatStates();
    }, [updateFormatStates]);
    
    // Listen for selection changes to update format states
    useEffect(() => {
        document.addEventListener('selectionchange', handleSelectionChange);
        return () => {
            document.removeEventListener('selectionchange', handleSelectionChange);
        };
    }, [handleSelectionChange]);

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

    const handleSave = useCallback(async (isModalSave = false) => {
        if (!isEditorDirty) {
            if (isModalSave) handleEditorSaveComplete();
            return;
        }

        // Save cursor position before save
        let savedSelection = null;
        if (editorRef.current && document.activeElement === editorRef.current) {
            const selection = window.getSelection();
            if (selection.rangeCount > 0) {
                savedSelection = {
                    range: selection.getRangeAt(0).cloneRange(),
                    collapsed: selection.isCollapsed
                };
            }
        }

        setSaveStatus('saving');
        const entryData = { title, content, tags, type: entryType };
        
        try {
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
            
            setIsEditorDirty(false);
            setSaveStatus('saved');
            
            // Restore cursor position after save
            if (savedSelection && editorRef.current) {
                setTimeout(() => {
                    const selection = window.getSelection();
                    selection.removeAllRanges();
                    selection.addRange(savedSelection.range);
                    editorRef.current?.focus();
                }, 0);
            }
            
            // Hide "saved" indicator after 2 seconds
            setTimeout(() => {
                setSaveStatus('idle');
            }, 2000);
        } catch (error) {
            console.error('Save error:', error);
            setSaveStatus('error');
            setSaveError(error.message || 'Failed to save entry. Please try again.');
            
            // Reset error status after 5 seconds
            setTimeout(() => {
                if (saveStatus === 'error') {
                    setSaveStatus('idle');
                    setSaveError(null);
                }
            }, 5000);
        }
    }, [title, content, tags, entryType, isCreating, entry, isEditorDirty]);

    const handleClose = () => {
        if (isEditorDirty) {
            setShowUnsavedModal(true);
        } else {
            handleEditorSaveComplete();
        }
    };

    const handleDelete = async () => {
        if (entry && window.confirm('Are you sure you want to delete this entry?')) {
            await handleDeleteEntry(entry.id);
            handleEditorSaveComplete();
        }
    };

    // Rich text formatting functions
    const applyFormat = useCallback((command, value = null) => {
        document.execCommand(command, false, value);
        editorRef.current?.focus();
        handleContentChange();
    }, []);

    const insertHeading = useCallback((level) => {
        const selection = window.getSelection();
        if (!selection.rangeCount) return;
        
        editorRef.current?.focus();
        
        // Use formatBlock to convert current block to heading (works like Word)
        document.execCommand('formatBlock', false, `h${level}`);
        
        handleContentChange();
        updateFormatStates();
    }, []);

    const insertList = useCallback((ordered = false) => {
        const selection = window.getSelection();
        if (!selection.rangeCount) return;
        
        const range = selection.getRangeAt(0);
        const list = document.createElement(ordered ? 'ol' : 'ul');
        const li = document.createElement('li');
        
        if (selection.toString()) {
            li.textContent = selection.toString();
        } else {
            li.textContent = 'List item';
        }
        
        list.appendChild(li);
        range.deleteContents();
        range.insertNode(list);
        
        // Move cursor to list item
        const newRange = document.createRange();
        newRange.selectNodeContents(li);
        newRange.collapse(false);
        selection.removeAllRanges();
        selection.addRange(newRange);
        
        editorRef.current?.focus();
        handleContentChange();
    }, []);

    const insertBlockquote = useCallback(() => {
        const selection = window.getSelection();
        if (!selection.rangeCount) return;
        
        const range = selection.getRangeAt(0);
        const blockquote = document.createElement('blockquote');
        
        if (selection.toString()) {
            blockquote.textContent = selection.toString();
        } else {
            blockquote.textContent = 'Quote';
        }
        
        range.deleteContents();
        range.insertNode(blockquote);
        
        // Move cursor to end
        const newRange = document.createRange();
        newRange.selectNodeContents(blockquote);
        newRange.collapse(false);
        selection.removeAllRanges();
        selection.addRange(newRange);
        
        editorRef.current?.focus();
        handleContentChange();
    }, []);

    const insertCode = useCallback(() => {
        applyFormat('formatBlock', '<pre>');
    }, [applyFormat]);

    const insertLink = useCallback(() => {
        const url = prompt('Enter URL:');
        if (url) {
            applyFormat('createLink', url);
        }
    }, [applyFormat]);

    const handleImageUpload = async (file) => {
        if (!file) return;
        
        setIsUploadingImage(true);
        try {
            const storage = getStorage();
            const storageRef = ref(storage, `images/${userId}_${Date.now()}_${file.name}`);
            const snapshot = await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(snapshot.ref);
            
            // Insert image into editor
            const img = document.createElement('img');
            img.src = downloadURL;
            img.alt = file.name;
            img.style.maxWidth = '100%';
            img.style.height = 'auto';
            img.style.borderRadius = '8px';
            img.style.margin = '16px 0';
            
            const selection = window.getSelection();
            if (selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                range.insertNode(img);
                range.collapse(false);
            }
            
            editorRef.current?.focus();
            handleContentChange();
        } catch (error) {
            console.error('Image upload error:', error);
            // Show user-friendly error message
            alert(`Failed to upload image: ${error.message || 'Unknown error'}`);
        } finally {
            setIsUploadingImage(false);
        }
    };

    const currentEntryType = useMemo(() => getEntryType(entryType), [entryType]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            // ESC to exit focus mode or close help
            if (e.key === 'Escape') {
                if (showKeyboardHelp) {
                    setShowKeyboardHelp(false);
                } else if (isFocusMode) {
                    setIsFocusMode(false);
                    setAppFocusMode(false);
                }
                e.preventDefault();
            }
            
            // Cmd/Ctrl + / - Toggle keyboard shortcuts help
            if ((e.metaKey || e.ctrlKey) && e.key === '/') {
                e.preventDefault();
                setShowKeyboardHelp(!showKeyboardHelp);
            }
            
            // Cmd/Ctrl + S to save
            if ((e.metaKey || e.ctrlKey) && e.key === 's') {
                e.preventDefault();
                handleSave();
            }

            // Cmd/Ctrl + B for bold
            if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
                e.preventDefault();
                applyFormat('bold');
            }

            // Cmd/Ctrl + I for italic
            if ((e.metaKey || e.ctrlKey) && e.key === 'i') {
                e.preventDefault();
                applyFormat('italic');
            }
            
            // Cmd/Ctrl + Z - Undo
            if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
                e.preventDefault();
                document.execCommand('undo');
            }

            // Cmd/Ctrl + Shift + Z - Redo
            if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'Z') {
                e.preventDefault();
                document.execCommand('redo');
            }

            // Cmd/Ctrl + Y - Redo (alternative)
            if ((e.metaKey || e.ctrlKey) && e.key === 'y') {
                e.preventDefault();
                document.execCommand('redo');
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isFocusMode, handleSave, applyFormat]);

    // Sync focus mode with app state
    useEffect(() => {
        setAppFocusMode(isFocusMode);
        return () => setAppFocusMode(false);
    }, [isFocusMode, setAppFocusMode]);

    const SaveStatusIndicator = () => (
        <AnimatePresence mode="wait">
            {saveStatus === 'saving' && (
                <motion.div
                    key="saving"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400"
                >
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                        <Loader size={14} />
                    </motion.div>
                    <span>Saving...</span>
                </motion.div>
            )}
            {saveStatus === 'saved' && (
                <motion.div
                    key="saved"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="flex items-center space-x-2 text-sm text-green-600 dark:text-green-400"
                >
                    <Check size={14} />
                    <span>Saved</span>
                </motion.div>
            )}
            {saveStatus === 'error' && saveError && (
                <motion.div
                    key="error"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="flex items-center space-x-2"
                >
                    <div className="flex items-center space-x-2 text-sm text-red-600 dark:text-red-400">
                        <AlertCircle size={14} />
                        <span className="max-w-xs truncate">{saveError}</span>
                    </div>
                    <motion.button
                        onClick={() => handleSave(false)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-2 py-1 text-xs rounded bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/30 transition-colors"
                    >
                        Retry
                    </motion.button>
                </motion.div>
            )}
        </AnimatePresence>
    );

    const ToolbarButton = ({ icon: Icon, label, onClick, isActive }) => (
        <motion.button
            onClick={onClick}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className={`p-2 rounded-lg transition-colors ${
                isActive 
                    ? 'bg-primary text-white' 
                    : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400'
            }`}
            style={isActive ? { backgroundColor: 'var(--color-primary-hex)' } : {}}
            title={label}
        >
            <Icon size={18} />
        </motion.button>
    );

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`fixed inset-0 z-50 flex flex-col ${
                isFocusMode ? 'bg-slate-50 dark:bg-slate-900' : 'bg-white dark:bg-slate-800'
            }`}
            style={{
                backgroundColor: isFocusMode ? 'var(--color-bg-base)' : 'var(--color-bg-content)'
            }}
        >
            {/* Header */}
            {!isFocusMode && (
                <motion.div
                    className="flex-shrink-0 border-b px-3 sm:px-6 py-3 sm:py-4"
                    style={{ borderColor: 'var(--color-border)' }}
                >
                    <div className="flex items-center justify-between mb-4 gap-2">
                        <div className="flex items-center space-x-2 sm:space-x-4 min-w-0 flex-1">
                            <motion.button
                                onClick={handleClose}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 flex-shrink-0"
                                title="Back to Dashboard"
                            >
                                <ArrowLeft size={20} />
                            </motion.button>
                            <SaveStatusIndicator />
                            <span className="hidden sm:inline text-xs text-slate-500 dark:text-slate-400 truncate">
                                {entry ? `Updated ${format(entry.updatedAt, 'MMM d, h:mm a')}` : 'New Entry'}
                            </span>
                            {wordCount > 0 && (
                                <span className="hidden md:inline text-xs px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400">
                                    {wordCount} words • {readingTime} min read
                                </span>
                            )}
                        </div>
                        <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
                            <div className="hidden sm:flex items-center space-x-2">
                                <ToolbarButton
                                    icon={showPreview ? EyeOff : Eye}
                                    label={showPreview ? "Hide Preview" : "Show Preview"}
                                    onClick={() => setShowPreview(!showPreview)}
                                    isActive={showPreview}
                                />
                                <ToolbarButton
                                    icon={isFocusMode ? Minimize : Maximize}
                                    label="Focus Mode"
                                    onClick={() => setIsFocusMode(!isFocusMode)}
                                />
                            </div>
                            <ToolbarButton
                                icon={Save}
                                label="Save Now (⌘S)"
                                onClick={() => handleSave(false)}
                                isActive={saveStatus === 'saved' && !isEditorDirty}
                            />
                            <ToolbarButton
                                icon={HelpCircle}
                                label="Keyboard Shortcuts (⌘/)"
                                onClick={() => setShowKeyboardHelp(true)}
                            />
                            {entry && !isCreating && (
                                <motion.button
                                    onClick={handleDelete}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="hidden sm:block px-4 py-2 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                >
                                    Delete
                                </motion.button>
                            )}
                        </div>
                    </div>

                    {/* Metadata */}
                    <AnimatePresence>
                    {!isHeaderCollapsed && (
                    <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Title */}
                            <div className="md:col-span-2">
                                <input
                                    type="text"
                                    value={title}
                                    onChange={handleTitleChange}
                                    placeholder="Entry title..."
                                    className="w-full px-4 py-3 text-xl font-semibold rounded-lg border-2 transition-all focus:outline-none focus:ring-2"
                                    style={{
                                        backgroundColor: 'var(--color-bg-secondary)',
                                        borderColor: 'var(--color-border)',
                                        color: 'var(--color-text-primary)',
                                        '--tw-ring-color': 'var(--color-primary-hex)'
                                    }}
                                />
                            </div>

                            {/* Entry Type */}
                            <select
                                value={entryType}
                                onChange={handleTypeChange}
                                className="px-4 py-3 rounded-lg border-2 transition-all focus:outline-none focus:ring-2 font-medium"
                                style={{
                                    backgroundColor: 'var(--color-bg-secondary)',
                                    borderColor: 'var(--color-border)',
                                    color: 'var(--color-text-primary)',
                                    '--tw-ring-color': 'var(--color-primary-hex)'
                                }}
                            >
                                {REGULAR_ENTRY_TYPES.map(type => (
                                    <option key={type.value} value={type.value}>
                                        {type.emoji} {type.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Tags */}
                        <div className="mt-4">
                            <TagsInput tags={tags} setTags={handleTagsChange} />
                        </div>

                        {/* Toolbar - Mobile Optimized */}
                        <div className="flex items-center space-x-1 mt-4 flex-wrap gap-1">
                            {/* Primary formatting - Always visible */}
                            <div className="flex items-center space-x-1">
                                <ToolbarButton icon={Bold} label="Bold (Cmd+B)" onClick={() => applyFormat('bold')} isActive={activeFormats.bold} />
                                <ToolbarButton icon={Italic} label="Italic (Cmd+I)" onClick={() => applyFormat('italic')} isActive={activeFormats.italic} />
                                <ToolbarButton icon={UnderlineIcon} label="Underline (Cmd+U)" onClick={() => applyFormat('underline')} isActive={activeFormats.underline} />
                            </div>
                            
                            {/* Headings - Collapsed on mobile */}
                            <div className="hidden xs:flex items-center space-x-1">
                                <div className="w-px h-6 bg-slate-300 dark:bg-slate-600" />
                                <ToolbarButton icon={Heading1} label="Heading 1" onClick={() => insertHeading(1)} isActive={activeFormats.h1} />
                                <ToolbarButton icon={Heading2} label="Heading 2" onClick={() => insertHeading(2)} isActive={activeFormats.h2} />
                                <ToolbarButton icon={Heading3} label="Heading 3" onClick={() => insertHeading(3)} isActive={activeFormats.h3} />
                            </div>
                            
                            {/* Lists - Always visible */}
                            <div className="flex items-center space-x-1">
                                <div className="w-px h-6 bg-slate-300 dark:bg-slate-600 hidden xs:block" />
                                <ToolbarButton icon={List} label="Bullet List" onClick={() => insertList(false)} />
                                <ToolbarButton icon={ListOrdered} label="Numbered List" onClick={() => insertList(true)} />
                            </div>
                            
                            {/* Advanced formatting - Hidden on very small screens */}
                            <div className="hidden sm:flex items-center space-x-1">
                                <div className="w-px h-6 bg-slate-300 dark:bg-slate-600" />
                                <ToolbarButton icon={Quote} label="Quote" onClick={() => insertBlockquote()} />
                                <ToolbarButton icon={Code} label="Code" onClick={() => insertCode()} />
                            </div>
                            
                            {/* Media tools - Always visible */}
                            <div className="flex items-center space-x-1">
                                <div className="w-px h-6 bg-slate-300 dark:bg-slate-600 hidden sm:block" />
                                <ToolbarButton icon={LinkIcon} label="Link" onClick={insertLink} />
                                <ToolbarButton 
                                    icon={isUploadingImage ? Loader : ImageIcon} 
                                    label="Image" 
                                    onClick={() => {
                                        const input = document.createElement('input');
                                        input.type = 'file';
                                        input.accept = 'image/*';
                                        input.onchange = (e) => {
                                            const file = e.target.files[0];
                                            if (file) handleImageUpload(file);
                                        };
                                        input.click();
                                    }}
                                    isActive={isUploadingImage}
                                />
                            </div>
                        </div>
                    </motion.div>
                    )}
                    </AnimatePresence>
                    
                    {/* Collapse/Expand Button */}
                    <motion.button
                        onClick={() => setIsHeaderCollapsed(!isHeaderCollapsed)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="mt-2 px-3 py-1 text-xs rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
                        style={{ color: 'var(--color-text-secondary)' }}
                    >
                        {isHeaderCollapsed ? '▼ Show Editor Options' : '▲ Hide Editor Options'}
                    </motion.button>
                </motion.div>
            )}

            {/* Editor Content */}
            <div className="flex-1 flex overflow-hidden">
                {/* Rich Text Editor */}
                <div className={`${showPreview ? 'flex-1 md:w-1/2' : 'w-full'} overflow-y-auto custom-scrollbar`}>
                    <div
                        ref={editorRef}
                        contentEditable
                        onInput={handleContentChange}
                        className="w-full h-full p-4 sm:p-6 md:p-8 lg:p-12 focus:outline-none transition-all rich-text-editor"
                        style={{
                            backgroundColor: 'var(--color-bg-content)',
                            color: 'var(--color-text-primary)',
                            fontFamily: 'var(--font-body)',
                            fontSize: '1.05rem',
                            lineHeight: '1.8',
                            caretColor: 'var(--color-primary-hex)',
                            minHeight: '400px'
                        }}
                        data-placeholder="Start writing..."
                    />
                </div>

                {/* Preview - Mobile optimized */}
                {showPreview && (
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="w-full md:w-1/2 border-t md:border-t-0 md:border-l overflow-y-auto custom-scrollbar p-4 sm:p-6 md:p-8 lg:p-12" 
                        style={{ borderColor: 'var(--color-border)' }}
                    >
                        <div className="prose dark:prose-invert max-w-none">
                            <ReactMarkdown>{content || '*Preview will appear here...*'}</ReactMarkdown>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Focus Mode Exit Button */}
            {isFocusMode && (
                <motion.button
                    onClick={() => setIsFocusMode(false)}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="fixed bottom-6 right-6 p-4 rounded-full shadow-2xl"
                    style={{
                        backgroundColor: 'var(--color-primary-hex)',
                        color: 'white'
                    }}
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                >
                    <Minimize size={20} />
                </motion.button>
            )}

            {/* Unsaved Changes Modal */}
            <AnimatePresence>
                {showUnsavedModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4"
                        onClick={() => setShowUnsavedModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl"
                        >
                            <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
                                Unsaved Changes
                            </h3>
                            <p className="text-sm mb-6" style={{ color: 'var(--color-text-secondary)' }}>
                                You have unsaved changes. What would you like to do?
                            </p>
                            <div className="flex space-x-3">
                                <button
                                    onClick={() => setShowUnsavedModal(false)}
                                    className="flex-1 px-4 py-3 rounded-xl text-sm font-medium"
                                    style={{
                                        backgroundColor: 'var(--color-bg-secondary)',
                                        color: 'var(--color-text-primary)'
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        setShowUnsavedModal(false);
                                        handleEditorSaveComplete();
                                    }}
                                    className="flex-1 px-4 py-3 rounded-xl text-sm font-medium bg-red-600 text-white hover:bg-red-700"
                                >
                                    Discard
                                </button>
                                <button
                                    onClick={() => {
                                        setShowUnsavedModal(false);
                                        handleSave(true);
                                    }}
                                    className="flex-1 px-4 py-3 rounded-xl text-sm font-medium text-white"
                                    style={{ backgroundColor: 'var(--color-primary-hex)' }}
                                >
                                    Save
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Keyboard Shortcuts Help Overlay - Hidden on mobile */}
            <AnimatePresence>
                {showKeyboardHelp && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm items-center justify-center z-[60] p-4 hidden md:flex"
                        onClick={() => setShowKeyboardHelp(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-3xl w-full shadow-2xl max-h-[85vh] overflow-y-auto"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                                    Keyboard Shortcuts
                                </h3>
                                <button
                                    onClick={() => setShowKeyboardHelp(false)}
                                    className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <div>
                                        <h4 className="font-semibold mb-4 text-lg text-slate-800 dark:text-slate-200">Formatting</h4>
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center py-1">
                                                <span className="text-slate-700 dark:text-slate-300">Bold</span>
                                                <kbd className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 rounded-md text-sm font-mono shadow-sm">Ctrl+B</kbd>
                                            </div>
                                            <div className="flex justify-between items-center py-1">
                                                <span className="text-slate-700 dark:text-slate-300">Italic</span>
                                                <kbd className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 rounded-md text-sm font-mono shadow-sm">Ctrl+I</kbd>
                                            </div>
                                            <div className="flex justify-between items-center py-1">
                                                <span className="text-slate-700 dark:text-slate-300">Underline</span>
                                                <kbd className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 rounded-md text-sm font-mono shadow-sm">Ctrl+U</kbd>
                                            </div>
                                            <div className="flex justify-between items-center py-1">
                                                <span className="text-slate-700 dark:text-slate-300">Heading 1-3</span>
                                                <kbd className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 rounded-md text-sm font-mono shadow-sm">Ctrl+Shift+1-3</kbd>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="font-semibold mb-4 text-lg text-slate-800 dark:text-slate-200">Lists & Media</h4>
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center py-1">
                                                <span className="text-slate-700 dark:text-slate-300">Bullet List</span>
                                                <kbd className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 rounded-md text-sm font-mono shadow-sm">Ctrl+Shift+L</kbd>
                                            </div>
                                            <div className="flex justify-between items-center py-1">
                                                <span className="text-slate-700 dark:text-slate-300">Link</span>
                                                <kbd className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 rounded-md text-sm font-mono shadow-sm">Ctrl+K</kbd>
                                            </div>
                                            <div className="flex justify-between items-center py-1">
                                                <span className="text-slate-700 dark:text-slate-300">Code Block</span>
                                                <kbd className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 rounded-md text-sm font-mono shadow-sm">Ctrl+Shift+C</kbd>
                                            </div>
                                            <div className="flex justify-between items-center py-1">
                                                <span className="text-slate-700 dark:text-slate-300">Quote</span>
                                                <kbd className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 rounded-md text-sm font-mono shadow-sm">Ctrl+Shift+Q</kbd>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div>
                                        <h4 className="font-semibold mb-4 text-lg text-slate-800 dark:text-slate-200">Actions</h4>
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center py-1">
                                                <span className="text-slate-700 dark:text-slate-300">Save</span>
                                                <kbd className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 rounded-md text-sm font-mono shadow-sm">Ctrl+S</kbd>
                                            </div>
                                            <div className="flex justify-between items-center py-1">
                                                <span className="text-slate-700 dark:text-slate-300">Undo</span>
                                                <kbd className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 rounded-md text-sm font-mono shadow-sm">Ctrl+Z</kbd>
                                            </div>
                                            <div className="flex justify-between items-center py-1">
                                                <span className="text-slate-700 dark:text-slate-300">Redo</span>
                                                <kbd className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 rounded-md text-sm font-mono shadow-sm">Ctrl+Shift+Z</kbd>
                                            </div>
                                            <div className="flex justify-between items-center py-1">
                                                <span className="text-slate-700 dark:text-slate-300">Focus Mode</span>
                                                <kbd className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 rounded-md text-sm font-mono shadow-sm">F11</kbd>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="font-semibold mb-4 text-lg text-slate-800 dark:text-slate-200">Navigation</h4>
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center py-1">
                                                <span className="text-slate-700 dark:text-slate-300">Back to Dashboard</span>
                                                <kbd className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 rounded-md text-sm font-mono shadow-sm">Esc</kbd>
                                            </div>
                                            <div className="flex justify-between items-center py-1">
                                                <span className="text-slate-700 dark:text-slate-300">Show Shortcuts</span>
                                                <kbd className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 rounded-md text-sm font-mono shadow-sm">Ctrl+/</kbd>
                                            </div>
                                            <div className="flex justify-between items-center py-1">
                                                <span className="text-slate-700 dark:text-slate-300">Preview Mode</span>
                                                <kbd className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 rounded-md text-sm font-mono shadow-sm">Ctrl+Shift+P</kbd>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm text-slate-600 dark:text-slate-400">
                                        💡 <strong>Pro tip:</strong> Use <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-xs font-mono">Tab</kbd> to navigate between formatting buttons
                                    </p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                        Press <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-xs font-mono">Esc</kbd> or click outside to close
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default ModernEditor;