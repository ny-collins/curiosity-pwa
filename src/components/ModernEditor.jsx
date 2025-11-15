import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Save, ArrowLeft, Maximize, Minimize, Eye, EyeOff, Type, Calendar as CalendarIcon,
    Bold, Italic, Underline as UnderlineIcon, Heading1, Heading2, Heading3, List, ListOrdered, Quote, Code,
    Link as LinkIcon, Image as ImageIcon, Check, Loader, AlertCircle, Sparkles, X, HelpCircle,
    Strikethrough, Highlighter, Superscript, Subscript, Table, Search, Replace, Download
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
        // Bold and Italic (process bold first to avoid conflicts)
        .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        // Strikethrough
        .replace(/~~(.+?)~~/g, '<del>$1</del>')
        // Underline (HTML tags preserved)
        .replace(/<u>(.+?)<\/u>/g, '<u>$1</u>')
        // Highlight
        .replace(/==(.*?)==/g, '<mark>$1</mark>')
        // Superscript and Subscript
        .replace(/\^(.+?)\^/g, '<sup>$1</sup>')
        .replace(/~(.+?)~/g, '<sub>$1</sub>')
        // Inline code
        .replace(/`(.+?)`/g, '<code>$1</code>')
        // Links
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
        // Images with optional alt text and title
        .replace(/!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)/g, '<img src="$2" alt="$1" title="$3" />')
        // Blockquotes (handle nested quotes)
        .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
        // Task lists (checkboxes)
        .replace(/^\s*-\s*\[x\]\s+(.+)$/gm, '<li class="task-item task-completed"><input type="checkbox" checked disabled><span>$1</span></li>')
        .replace(/^\s*-\s*\[\s\]\s+(.+)$/gm, '<li class="task-item task-pending"><input type="checkbox" disabled><span>$1</span></li>')
        // Unordered lists
        .replace(/^\s*-\s+(.+)$/gm, '<li>$1</li>')
        .replace(/^\s*\*\s+(.+)$/gm, '<li>$1</li>')
        // Ordered lists
        .replace(/^\s*\d+\.\s+(.+)$/gm, '<li>$1</li>')
        // Code blocks with language support
        .replace(/```(\w+)?\n?([\s\S]*?)```/g, (match, lang, code) => {
            const language = lang ? ` class="language-${lang}"` : '';
            return `<pre><code${language}>${code.trim()}</code></pre>`;
        })
        // Horizontal rules
        .replace(/^---+$/gm, '<hr>')
        .replace(/^\*\*\*+$/gm, '<hr>');

    // Handle tables separately (more complex parsing needed)
    html = html.replace(/(\|.*\|\n?)+/g, (tableBlock) => {
        const lines = tableBlock.trim().split('\n').filter(line => line.trim());
        if (lines.length < 2) return tableBlock; // Need at least header and separator

        const headerLine = lines[0];
        const separatorLine = lines[1];

        // Check if it's a valid table (has | separators and --- in second line)
        if (!headerLine.includes('|') || !separatorLine.includes('---')) {
            return tableBlock;
        }

        const headers = headerLine.split('|').map(cell => cell.trim()).filter(cell => cell);
        const alignments = separatorLine.split('|').map(cell => {
            const trimmed = cell.trim();
            if (trimmed.startsWith(':') && trimmed.endsWith(':')) return 'center';
            if (trimmed.endsWith(':')) return 'right';
            return 'left';
        }).filter((_, i) => i > 0 && i < headers.length + 1); // Skip first empty cell

        let tableHtml = '<table class="border-collapse border border-slate-300 dark:border-slate-600" style="width: 100%;">';

        // Header row
        tableHtml += '<thead><tr>';
        headers.forEach((header, i) => {
            const alignClass = alignments[i] === 'center' ? 'text-center' :
                              alignments[i] === 'right' ? 'text-right' : 'text-left';
            tableHtml += `<th class="border border-slate-300 dark:border-slate-600 p-2 bg-slate-100 dark:bg-slate-700 ${alignClass}">${header}</th>`;
        });
        tableHtml += '</tr></thead>';

        // Data rows
        tableHtml += '<tbody>';
        for (let i = 2; i < lines.length; i++) {
            const cells = lines[i].split('|').map(cell => cell.trim()).filter((cell, idx) => idx > 0 && idx <= headers.length);
            if (cells.length > 0) {
                tableHtml += '<tr>';
                cells.forEach((cell, j) => {
                    const alignClass = alignments[j] === 'center' ? 'text-center' :
                                      alignments[j] === 'right' ? 'text-right' : 'text-left';
                    tableHtml += `<td class="border border-slate-300 dark:border-slate-600 p-2 ${alignClass}">${cell}</td>`;
                });
                tableHtml += '</tr>';
            }
        }
        tableHtml += '</tbody></table>';

        return tableHtml;
    });

    // Wrap consecutive <li> in <ul> or <ol>
    html = html.replace(/(<li( class="[^"]*")?>(?:.*?)<\/li>\s*)+/g, (match) => {
        // Check if it's a task list
        if (match.includes('task-item')) {
            return '<ul class="task-list">' + match.replace(/<\/li>\s*<li/g, '</li><li') + '</ul>';
        }
        // Check if it starts with numbers (ordered list)
        const firstItem = match.match(/<li[^>]*>(.*?)<\/li>/)?.[1] || '';
        if (/^\d+\./.test(firstItem)) {
            return '<ol>' + match.replace(/<\/li>\s*<li/g, '</li><li') + '</ol>';
        }
        return '<ul>' + match.replace(/<\/li>\s*<li/g, '</li><li') + '</ul>';
    });

    // Wrap content in paragraphs
    if (!html.includes('<p>') && html.trim()) {
        html = '<p>' + html + '</p>';
    }

    // Line breaks (but not in code blocks or headers)
    html = html.replace(/\n\n/g, '</p><p>');
    html = html.replace(/\n/g, '<br>');

    return html;
};// Helper to convert HTML back to markdown for storage
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
                    markdown += '# ' + node.textContent + '\n\n';
                    break;
                case 'h2':
                    markdown += '## ' + node.textContent + '\n\n';
                    break;
                case 'h3':
                    markdown += '### ' + node.textContent + '\n\n';
                    break;
                case 'strong':
                case 'b':
                    if (node.querySelector('em, i')) {
                        // Handle bold italic
                        markdown += '***' + node.textContent + '***';
                    } else {
                        markdown += '**' + node.textContent + '**';
                    }
                    break;
                case 'em':
                case 'i':
                    if (node.parentElement && ['strong', 'b'].includes(node.parentElement.tagName.toLowerCase())) {
                        // Already handled by parent strong element
                        Array.from(node.childNodes).forEach(traverse);
                    } else {
                        markdown += '*' + node.textContent + '*';
                    }
                    break;
                case 'del':
                    markdown += '~~' + node.textContent + '~~';
                    break;
                case 'u':
                    markdown += '<u>' + node.textContent + '</u>';
                    break;
                case 'mark':
                    markdown += '==' + node.textContent + '==';
                    break;
                case 'sup':
                    markdown += '^' + node.textContent + '^';
                    break;
                case 'sub':
                    markdown += '~' + node.textContent + '~';
                    break;
                case 'code':
                    if (node.closest('pre')) {
                        // Code block, handled by pre element
                        markdown += node.textContent;
                    } else {
                        // Inline code
                        markdown += '`' + node.textContent + '`';
                    }
                    break;
                case 'pre':
                    const codeElement = node.querySelector('code');
                    if (codeElement) {
                        const language = codeElement.className.match(/language-(\w+)/)?.[1] || '';
                        markdown += '```' + language + '\n' + codeElement.textContent + '\n```\n\n';
                    } else {
                        markdown += '```\n' + node.textContent + '\n```\n\n';
                    }
                    break;
                case 'a':
                    markdown += '[' + node.textContent + '](' + node.href + ')';
                    break;
                case 'img':
                    const alt = node.alt || '';
                    const src = node.src;
                    const title = node.title ? ' "' + node.title + '"' : '';
                    markdown += '![' + alt + '](' + src + title + ')';
                    break;
                case 'blockquote':
                    const quoteLines = node.textContent.trim().split('\n');
                    markdown += quoteLines.map(line => '> ' + line).join('\n') + '\n\n';
                    break;
                case 'li':
                    const isTaskItem = node.classList.contains('task-item');
                    if (isTaskItem) {
                        const checkbox = node.querySelector('input[type="checkbox"]');
                        const isCompleted = checkbox && checkbox.checked;
                        const taskText = node.querySelector('span')?.textContent || node.textContent.replace(/^\s*\[x?\]\s*/, '');
                        markdown += '- ' + (isCompleted ? '[x]' : '[ ]') + ' ' + taskText + '\n';
                    } else {
                        // Regular list item
                        const listText = node.textContent;
                        markdown += '- ' + listText + '\n';
                    }
                    break;
                case 'ul':
                    if (node.classList.contains('task-list')) {
                        // Task list, items already handled
                        Array.from(node.childNodes).forEach(traverse);
                    } else {
                        // Regular unordered list
                        Array.from(node.childNodes).forEach(traverse);
                    }
                    markdown += '\n';
                    break;
                case 'ol':
                    // Convert to ordered list in markdown
                    let counter = 1;
                    Array.from(node.children).forEach((li, index) => {
                        markdown += (index + 1) + '. ' + li.textContent + '\n';
                    });
                    markdown += '\n';
                    break;
                case 'table':
                    const rows = Array.from(node.querySelectorAll('tr'));
                    let tableMarkdown = '';
                    rows.forEach((row, rowIndex) => {
                        const cells = Array.from(row.querySelectorAll('th, td'));
                        const cellTexts = cells.map(cell => cell.textContent.trim());
                        tableMarkdown += '| ' + cellTexts.join(' | ') + ' |\n';

                        // Add separator after header row
                        if (rowIndex === 0 && node.querySelector('thead')) {
                            tableMarkdown += '| ' + cellTexts.map(() => '---').join(' | ') + ' |\n';
                        }
                    });
                    markdown += tableMarkdown + '\n';
                    break;
                case 'figure':
                    const imgElement = node.querySelector('img');
                    const figcaptionElement = node.querySelector('figcaption');
                    if (imgElement) {
                        const alt = imgElement.alt || '';
                        const src = imgElement.src;
                        const title = imgElement.title ? ` "${imgElement.title}"` : '';
                        let imageMarkdown = `![${alt}](${src}${title})`;

                        // Add caption if present
                        if (figcaptionElement && figcaptionElement.textContent.trim()) {
                            imageMarkdown += `\n*${figcaptionElement.textContent.trim()}*`;
                        }

                        markdown += imageMarkdown + '\n\n';
                    }
                    break;
                case 'br':
                    markdown += '\n';
                    break;
                case 'p':
                case 'div':
                    Array.from(node.childNodes).forEach(traverse);
                    if (tag === 'p' && node.nextSibling) {
                        markdown += '\n\n';
                    } else if (tag === 'div') {
                        markdown += '\n';
                    }
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
    const [showSearchReplace, setShowSearchReplace] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [replaceText, setReplaceText] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [currentSearchIndex, setCurrentSearchIndex] = useState(-1);
    const [saveError, setSaveError] = useState(null);
    
    // Formatting state tracking
    const [activeFormats, setActiveFormats] = useState({
        bold: false,
        italic: false,
        underline: false,
        strikethrough: false,
        highlight: false,
        superscript: false,
        subscript: false,
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
            strikethrough: false,
            highlight: false,
            superscript: false,
            subscript: false,
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
            if (tagName === 'del' || tagName === 'strike') formats.strikethrough = true;
            if (tagName === 'mark') formats.highlight = true;
            if (tagName === 'sup') formats.superscript = true;
            if (tagName === 'sub') formats.subscript = true;
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
        const selection = window.getSelection();
        if (!selection.rangeCount) return;

        editorRef.current?.focus();

        switch (command) {
            case 'strikethrough':
                document.execCommand('strikeThrough', false, null);
                break;
            case 'highlight':
                // Use CSS class for highlight since execCommand doesn't support it
                const range = selection.getRangeAt(0);
                const span = document.createElement('mark');
                if (selection.toString()) {
                    span.textContent = selection.toString();
                    range.deleteContents();
                    range.insertNode(span);
                } else {
                    span.textContent = 'highlighted text';
                    range.insertNode(span);
                }
                // Move cursor after the span
                const newRange = document.createRange();
                newRange.setStartAfter(span);
                newRange.setEndAfter(span);
                selection.removeAllRanges();
                selection.addRange(newRange);
                break;
            case 'superscript':
                document.execCommand('superscript', false, null);
                break;
            case 'subscript':
                document.execCommand('subscript', false, null);
                break;
            default:
                document.execCommand(command, false, value);
        }

        handleContentChange();
        updateFormatStates();
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
        const language = prompt('Enter programming language (optional):', '');
        const selection = window.getSelection();
        if (!selection.rangeCount) return;

        const range = selection.getRangeAt(0);
        const pre = document.createElement('pre');
        const code = document.createElement('code');

        if (language) {
            code.className = `language-${language}`;
        }

        if (selection.toString()) {
            code.textContent = selection.toString();
        } else {
            code.textContent = 'code block';
        }

        pre.appendChild(code);
        range.deleteContents();
        range.insertNode(pre);

        // Move cursor to end of code block
        const newRange = document.createRange();
        newRange.selectNodeContents(code);
        newRange.collapse(false);
        selection.removeAllRanges();
        selection.addRange(newRange);

        editorRef.current?.focus();
        handleContentChange();
    }, []);

    const insertTable = useCallback(() => {
        const selection = window.getSelection();
        if (!selection.rangeCount) return;

        const range = selection.getRangeAt(0);

        // Create a simple 2x2 table
        const table = document.createElement('table');
        table.className = 'border-collapse border border-slate-300 dark:border-slate-600';
        table.style.width = '100%';

        // Create table header row
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');

        const th1 = document.createElement('th');
        th1.className = 'border border-slate-300 dark:border-slate-600 p-2 bg-slate-100 dark:bg-slate-700 text-left';
        th1.textContent = 'Header 1';

        const th2 = document.createElement('th');
        th2.className = 'border border-slate-300 dark:border-slate-600 p-2 bg-slate-100 dark:bg-slate-700 text-left';
        th2.textContent = 'Header 2';

        headerRow.appendChild(th1);
        headerRow.appendChild(th2);
        thead.appendChild(headerRow);

        // Create table body with one data row
        const tbody = document.createElement('tbody');
        const dataRow = document.createElement('tr');

        const td1 = document.createElement('td');
        td1.className = 'border border-slate-300 dark:border-slate-600 p-2';
        td1.textContent = 'Cell 1';

        const td2 = document.createElement('td');
        td2.className = 'border border-slate-300 dark:border-slate-600 p-2';
        td2.textContent = 'Cell 2';

        dataRow.appendChild(td1);
        dataRow.appendChild(td2);
        tbody.appendChild(dataRow);

        table.appendChild(thead);
        table.appendChild(tbody);

        range.deleteContents();
        range.insertNode(table);

        // Move cursor to first cell
        const newRange = document.createRange();
        newRange.selectNodeContents(td1);
        newRange.collapse(true);
        selection.removeAllRanges();
        selection.addRange(newRange);

        editorRef.current?.focus();
        handleContentChange();
    }, []);

    const insertLink = useCallback(() => {
        const url = prompt('Enter URL:');
        if (url) {
            applyFormat('createLink', url);
        }
    }, [applyFormat]);

    const openSearchReplace = useCallback(() => {
        setShowSearchReplace(true);
        setSearchText('');
        setReplaceText('');
        setSearchResults([]);
        setCurrentSearchIndex(-1);
    }, []);

    const performSearch = useCallback(() => {
        if (!searchText || !editorRef.current) return;

        const content = editorRef.current.innerHTML;
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = content;

        const textContent = tempDiv.textContent || tempDiv.innerText || '';
        const results = [];
        let index = textContent.indexOf(searchText);

        while (index !== -1) {
            results.push(index);
            index = textContent.indexOf(searchText, index + 1);
        }

        setSearchResults(results);
        setCurrentSearchIndex(results.length > 0 ? 0 : -1);

        // Highlight first result
        if (results.length > 0) {
            highlightSearchResult(0);
        }
    }, [searchText]);

    const highlightSearchResult = useCallback((index) => {
        if (!editorRef.current || index < 0 || index >= searchResults.length) return;

        const selection = window.getSelection();
        const range = document.createRange();

        // Find the text node containing the search result
        const walker = document.createTreeWalker(
            editorRef.current,
            NodeFilter.SHOW_TEXT,
            null,
            false
        );

        let currentPos = 0;
        let foundNode = null;
        let foundOffset = 0;

        while (walker.nextNode()) {
            const node = walker.currentNode;
            const nodeLength = node.textContent.length;

            if (currentPos + nodeLength > searchResults[index]) {
                foundNode = node;
                foundOffset = searchResults[index] - currentPos;
                break;
            }

            currentPos += nodeLength;
        }

        if (foundNode) {
            range.setStart(foundNode, foundOffset);
            range.setEnd(foundNode, foundOffset + searchText.length);
            selection.removeAllRanges();
            selection.addRange(range);
        }
    }, [searchResults, searchText]);

    const performReplace = useCallback(() => {
        if (!editorRef.current || currentSearchIndex < 0) return;

        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            range.deleteContents();
            range.insertNode(document.createTextNode(replaceText));

            // Update search results after replacement
            const newContent = editorRef.current.innerHTML;
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = newContent;
            const textContent = tempDiv.textContent || tempDiv.innerText || '';

            const results = [];
            let index = textContent.indexOf(searchText);

            while (index !== -1) {
                results.push(index);
                index = textContent.indexOf(searchText, index + 1);
            }

            setSearchResults(results);

            if (results.length > 0) {
                const newIndex = Math.min(currentSearchIndex, results.length - 1);
                setCurrentSearchIndex(newIndex);
                highlightSearchResult(newIndex);
            } else {
                setCurrentSearchIndex(-1);
            }
        }

        handleContentChange();
    }, [currentSearchIndex, replaceText, searchText, highlightSearchResult]);

    const replaceAll = useCallback(() => {
        if (!editorRef.current || !searchText) return;

        let content = editorRef.current.innerHTML;
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = content;
        const textContent = tempDiv.textContent || tempDiv.innerText || '';

        // Replace all occurrences in text content
        const newTextContent = textContent.replaceAll(searchText, replaceText);

        // Convert back to HTML structure (simplified approach)
        const newContent = content.replace(new RegExp(searchText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), replaceText);

        editorRef.current.innerHTML = newContent;
        setSearchResults([]);
        setCurrentSearchIndex(-1);

        handleContentChange();
    }, [searchText, replaceText]);

    const exportContent = useCallback(() => {
        const format = prompt('Export format (markdown/html):', 'markdown');
        if (!format || !['markdown', 'html'].includes(format.toLowerCase())) return;

        const title = title || 'Untitled Entry';
        let content = '';
        let filename = '';
        let mimeType = '';

        if (format.toLowerCase() === 'markdown') {
            content = htmlToMarkdown(editorRef.current?.innerHTML || '');
            filename = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`;
            mimeType = 'text/markdown';
        } else {
            content = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${title}</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 20px; }
        h1, h2, h3 { color: #1f2937; margin-top: 2em; margin-bottom: 0.5em; }
        p { margin-bottom: 1em; }
        code { background: #f3f4f6; padding: 2px 4px; border-radius: 4px; font-family: 'Monaco', 'Menlo', monospace; }
        pre { background: #f3f4f6; padding: 1em; border-radius: 8px; overflow-x: auto; }
        blockquote { border-left: 4px solid #e5e7eb; padding-left: 1em; margin: 1em 0; color: #6b7280; }
        table { border-collapse: collapse; width: 100%; margin: 1em 0; }
        th, td { border: 1px solid #e5e7eb; padding: 8px 12px; text-align: left; }
        th { background: #f9fafb; font-weight: 600; }
        img { max-width: 100%; height: auto; border-radius: 8px; }
        .image-container { text-align: center; margin: 2em 0; }
        figcaption { font-size: 0.875em; color: #6b7280; font-style: italic; margin-top: 0.5em; }
    </style>
</head>
<body>
    <h1>${title}</h1>
    ${editorRef.current?.innerHTML || ''}
</body>
</html>`;
            filename = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.html`;
            mimeType = 'text/html';
        }

        // Create and download the file
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, [title, htmlToMarkdown]);

    const handleImageUpload = async (file) => {
        if (!file) return;

        setIsUploadingImage(true);
        try {
            const storage = getStorage();
            const storageRef = ref(storage, `images/${userId}_${Date.now()}_${file.name}`);
            const snapshot = await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(snapshot.ref);

            // Create figure element for better image handling
            const figure = document.createElement('figure');
            figure.className = 'image-container my-4';
            figure.style.textAlign = 'center'; // Default center alignment

            const img = document.createElement('img');
            img.src = downloadURL;
            img.alt = file.name.replace(/\.[^/.]+$/, ''); // Remove extension for alt text
            img.style.maxWidth = '100%';
            img.style.height = 'auto';
            img.style.borderRadius = '8px';
            img.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
            img.className = 'cursor-pointer hover:opacity-90 transition-opacity';

            // Add click handler for alignment options
            img.onclick = () => {
                const alignments = ['left', 'center', 'right'];
                const currentAlign = figure.style.textAlign || 'center';
                const currentIndex = alignments.indexOf(currentAlign);
                const nextAlign = alignments[(currentIndex + 1) % alignments.length];
                figure.style.textAlign = nextAlign;

                // Update image width based on alignment
                if (nextAlign === 'left' || nextAlign === 'right') {
                    img.style.maxWidth = '50%';
                    img.style.float = nextAlign;
                    img.style.margin = nextAlign === 'left' ? '0 16px 16px 0' : '0 0 16px 16px';
                } else {
                    img.style.maxWidth = '100%';
                    img.style.float = 'none';
                    img.style.margin = '16px 0';
                }

                handleContentChange();
            };

            figure.appendChild(img);

            // Optional caption
            const caption = prompt('Add a caption (optional):');
            if (caption && caption.trim()) {
                const figcaption = document.createElement('figcaption');
                figcaption.textContent = caption.trim();
                figcaption.className = 'text-sm text-slate-600 dark:text-slate-400 mt-2 italic text-center';
                figure.appendChild(figcaption);
            }

            const selection = window.getSelection();
            if (selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                range.insertNode(figure);

                // Move cursor after the figure
                const newRange = document.createRange();
                newRange.setStartAfter(figure);
                newRange.setEndAfter(figure);
                selection.removeAllRanges();
                selection.addRange(newRange);
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

            // Cmd/Ctrl + U for underline
            if ((e.metaKey || e.ctrlKey) && e.key === 'u') {
                e.preventDefault();
                applyFormat('underline');
            }

            // Cmd/Ctrl + Shift + X for strikethrough
            if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'X') {
                e.preventDefault();
                applyFormat('strikethrough');
            }

            // Cmd/Ctrl + Shift + H for highlight
            if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'H') {
                e.preventDefault();
                applyFormat('highlight');
            }

            // Cmd/Ctrl + Shift + = for superscript
            if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === '=') {
                e.preventDefault();
                applyFormat('superscript');
            }

            // Cmd/Ctrl + Shift + - for subscript
            if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === '-') {
                e.preventDefault();
                applyFormat('subscript');
            }

            // Cmd/Ctrl + F for find/replace
            if ((e.metaKey || e.ctrlKey) && e.key === 'f') {
                e.preventDefault();
                openSearchReplace();
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
                                    className="themed-input w-full px-4 py-3 text-xl font-semibold rounded-lg border-2 transition-all focus:outline-none focus:ring-2"
                                    style={{
                                        backgroundColor: 'var(--color-bg-secondary)',
                                        borderColor: 'var(--color-primary-hex)',
                                        color: 'var(--color-text-primary)',
                                        '--tw-ring-color': 'var(--color-primary-hex)'
                                    }}
                                />
                            </div>

                            {/* Entry Type */}
                            <select
                                value={entryType}
                                onChange={handleTypeChange}
                                className="themed-input px-4 py-3 rounded-lg transition-all focus:outline-none focus:ring-2 font-medium"
                                style={{
                                    backgroundColor: 'var(--color-bg-secondary)',
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
                            <TagsInput tags={tags} onChange={handleTagsChange} />
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
                                <ToolbarButton icon={Strikethrough} label="Strikethrough" onClick={() => applyFormat('strikethrough')} isActive={activeFormats.strikethrough} />
                                <ToolbarButton icon={Highlighter} label="Highlight" onClick={() => applyFormat('highlight')} isActive={activeFormats.highlight} />
                                <ToolbarButton icon={Superscript} label="Superscript" onClick={() => applyFormat('superscript')} isActive={activeFormats.superscript} />
                                <ToolbarButton icon={Subscript} label="Subscript" onClick={() => applyFormat('subscript')} isActive={activeFormats.subscript} />
                                <ToolbarButton icon={Table} label="Insert Table" onClick={() => insertTable()} />
                                <ToolbarButton icon={Search} label="Find & Replace" onClick={() => openSearchReplace()} />
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
                                <ToolbarButton icon={Download} label="Export" onClick={exportContent} />
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
                                                <span className="text-slate-700 dark:text-slate-300">Strikethrough</span>
                                                <kbd className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 rounded-md text-sm font-mono shadow-sm">Ctrl+Shift+X</kbd>
                                            </div>
                                            <div className="flex justify-between items-center py-1">
                                                <span className="text-slate-700 dark:text-slate-300">Highlight</span>
                                                <kbd className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 rounded-md text-sm font-mono shadow-sm">Ctrl+Shift+H</kbd>
                                            </div>
                                            <div className="flex justify-between items-center py-1">
                                                <span className="text-slate-700 dark:text-slate-300">Superscript</span>
                                                <kbd className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 rounded-md text-sm font-mono shadow-sm">Ctrl+Shift+=</kbd>
                                            </div>
                                            <div className="flex justify-between items-center py-1">
                                                <span className="text-slate-700 dark:text-slate-300">Subscript</span>
                                                <kbd className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 rounded-md text-sm font-mono shadow-sm">Ctrl+Shift+-</kbd>
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
                                                <span className="text-slate-700 dark:text-slate-300">Find & Replace</span>
                                                <kbd className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 rounded-md text-sm font-mono shadow-sm">Ctrl+F</kbd>
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

            {/* Search & Replace Modal */}
            <AnimatePresence>
                {showSearchReplace && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm items-center justify-center z-[60] p-4 flex"
                        onClick={() => setShowSearchReplace(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                                    Find & Replace
                                </h3>
                                <button
                                    onClick={() => setShowSearchReplace(false)}
                                    className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                                        Find
                                    </label>
                                    <input
                                        type="text"
                                        value={searchText}
                                        onChange={(e) => setSearchText(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') performSearch();
                                        }}
                                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                        placeholder="Enter text to find..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                                        Replace with
                                    </label>
                                    <input
                                        type="text"
                                        value={replaceText}
                                        onChange={(e) => setReplaceText(e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                        placeholder="Enter replacement text..."
                                    />
                                </div>

                                {searchResults.length > 0 && (
                                    <div className="text-sm text-slate-600 dark:text-slate-400">
                                        Found {searchResults.length} occurrence{searchResults.length !== 1 ? 's' : ''}
                                        {currentSearchIndex >= 0 && ` (${currentSearchIndex + 1} of ${searchResults.length})`}
                                    </div>
                                )}

                                <div className="flex space-x-2 pt-2">
                                    <button
                                        onClick={performSearch}
                                        disabled={!searchText}
                                        className="flex-1 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        Find
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (currentSearchIndex < searchResults.length - 1) {
                                                const newIndex = currentSearchIndex + 1;
                                                setCurrentSearchIndex(newIndex);
                                                highlightSearchResult(newIndex);
                                            }
                                        }}
                                        disabled={searchResults.length === 0 || currentSearchIndex >= searchResults.length - 1}
                                        className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        Next
                                    </button>
                                </div>

                                <div className="flex space-x-2">
                                    <button
                                        onClick={performReplace}
                                        disabled={currentSearchIndex < 0}
                                        className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        Replace
                                    </button>
                                    <button
                                        onClick={replaceAll}
                                        disabled={!searchText}
                                        className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        Replace All
                                    </button>
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