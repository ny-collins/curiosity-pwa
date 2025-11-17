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
const markdownToHtml = (markdown) => {
    if (!markdown) return '';
    let html = markdown
        .replace(/^### (.*$)/gm, '<h3>$1</h3>')
        .replace(/^## (.*$)/gm, '<h2>$1</h2>')
        .replace(/^# (.*$)/gm, '<h1>$1</h1>')
        .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/~~(.+?)~~/g, '<del>$1</del>')
        .replace(/<u>(.+?)<\/u>/g, '<u>$1</u>')
        .replace(/==(.*?)==/g, '<mark>$1</mark>')
        .replace(/\^(.+?)\^/g, '<sup>$1</sup>')
        .replace(/~(.+?)~/g, '<sub>$1</sub>')
        .replace(/`(.+?)`/g, '<code>$1</code>')
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
        .replace(/!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)/g, '<img src="$2" alt="$1" title="$3" />')
        .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
        .replace(/^\s*-\s*\[x\]\s+(.+)$/gm, '<li class="task-item task-completed"><input type="checkbox" checked disabled><span>$1</span></li>')
        .replace(/^\s*-\s*\[\s\]\s+(.+)$/gm, '<li class="task-item task-pending"><input type="checkbox" disabled><span>$1</span></li>')
        .replace(/^\s*-\s+(.+)$/gm, '<li>$1</li>')
        .replace(/^\s*\*\s+(.+)$/gm, '<li>$1</li>')
        .replace(/^\s*\d+\.\s+(.+)$/gm, '<li>$1</li>')
        .replace(/```(\w+)?\n?([\s\S]*?)```/g, (match, lang, code) => {
            const language = lang ? ` class="language-${lang}"` : '';
            return `<pre><code${language}>${code.trim()}</code></pre>`;
        })
        .replace(/^---+$/gm, '<hr>')
        .replace(/^\*\*\*+$/gm, '<hr>');
    html = html.replace(/(\|.*\|\n?)+/g, (tableBlock) => {
        const lines = tableBlock.trim().split('\n').filter(line => line.trim());
        if (lines.length < 2) return tableBlock;
        const headerLine = lines[0];
        const separatorLine = lines[1];
        if (!headerLine.includes('|') || !separatorLine.includes('---')) {
            return tableBlock;
        }
        const headers = headerLine.split('|').map(cell => cell.trim()).filter(cell => cell);
        const alignments = separatorLine.split('|').map(cell => {
            const trimmed = cell.trim();
            if (trimmed.startsWith(':') && trimmed.endsWith(':')) return 'center';
            if (trimmed.endsWith(':')) return 'right';
            return 'left';
        }).filter((_, i) => i > 0 && i < headers.length + 1);
        let tableHtml = '<table class="border-collapse border border-slate-300 dark:border-slate-600" style="width: 100%;">';
        tableHtml += '<thead><tr>';
        headers.forEach((header, i) => {
            const alignClass = alignments[i] === 'center' ? 'text-center' :
                              alignments[i] === 'right' ? 'text-right' : 'text-left';
            tableHtml += `<th class="border border-slate-300 dark:border-slate-600 p-2 bg-slate-100 dark:bg-slate-700 ${alignClass}">${header}</th>`;
        });
        tableHtml += '</tr></thead>';
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
    html = html.replace(/(<li( class="[^"]*")?>(?:.*?)<\/li>\s*)+/g, (match) => {
        if (match.includes('task-item')) {
            return '<ul class="task-list">' + match.replace(/<\/li>\s*<li/g, '</li><li') + '</ul>';
        }
        const firstItem = match.match(/<li[^>]*>(.*?)<\/li>/)?.[1] || '';
        if (/^\d+\./.test(firstItem)) {
            return '<ol>' + match.replace(/<\/li>\s*<li/g, '</li><li') + '</ol>';
        }
        return '<ul>' + match.replace(/<\/li>\s*<li/g, '</li><li') + '</ul>';
    });
    if (!html.includes('<p>') && html.trim()) {
        html = '<p>' + html + '</p>';
    }
    html = html.replace(/\n\n/g, '</p><p>');
    html = html.replace(/\n/g, '<br>');
    return html;
};
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
                        markdown += '***' + node.textContent + '***';
                    } else {
                        markdown += '**' + node.textContent + '**';
                    }
                    break;
                case 'em':
                case 'i':
                    if (node.parentElement && ['strong', 'b'].includes(node.parentElement.tagName.toLowerCase())) {
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
                        markdown += node.textContent;
                    } else {
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
                        const listText = node.textContent;
                        markdown += '- ' + listText + '\n';
                    }
                    break;
                case 'ul':
                    if (node.classList.contains('task-list')) {
                        Array.from(node.childNodes).forEach(traverse);
                    } else {
                        Array.from(node.childNodes).forEach(traverse);
                    }
                    markdown += '\n';
                    break;
                case 'ol':
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
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [htmlContent, setHtmlContent] = useState('');
    const [tags, setTags] = useState([]);
    const [entryType, setEntryType] = useState('note');
    const [isEditorDirty, setIsEditorDirty] = useState(false);
    const [saveStatus, setSaveStatus] = useState('saved');
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
    useEffect(() => {
        if (editorRef.current && htmlContent && !editorRef.current.innerHTML.trim()) {
            editorRef.current.innerHTML = htmlContent;
        }
    }, [htmlContent]);
    useEffect(() => {
        if (isEditorDirty && (title.trim() || content.trim())) {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }
            saveTimeoutRef.current = setTimeout(() => {
                handleSave();
            }, 8000);
        }
        return () => {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }
        };
    }, [title, content, tags, entryType, isEditorDirty]);
    useEffect(() => {
        if (forceEditorSave) {
            handleSave(true);
        }
    }, [forceEditorSave]);
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
    const handleContentChange = () => {
        if (!editorRef.current) return;
        const html = editorRef.current.innerHTML;
        const markdown = htmlToMarkdown(html);
        setContent(markdown);
        setIsEditorDirty(true);
        updateFormatStates();
        const text = markdown.replace(/[#*`~\[\]()]/g, '').trim();
        const words = text ? text.split(/\s+/).length : 0;
        setWordCount(words);
        setReadingTime(Math.ceil(words / 200));
    };
    const handleSelectionChange = useCallback(() => {
        updateFormatStates();
    }, [updateFormatStates]);
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
            if (savedSelection && editorRef.current) {
                setTimeout(() => {
                    const selection = window.getSelection();
                    selection.removeAllRanges();
                    selection.addRange(savedSelection.range);
                    editorRef.current?.focus();
                }, 0);
            }
            setTimeout(() => {
                setSaveStatus('idle');
            }, 2000);
        } catch (error) {
            console.error('Save error:', error);
            setSaveStatus('error');
            setSaveError(error.message || 'Failed to save entry. Please try again.');
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
    const applyFormat = useCallback((command, value = null) => {
        const selection = window.getSelection();
        if (!selection.rangeCount) return;
        editorRef.current?.focus();
        switch (command) {
            case 'strikethrough':
                document.execCommand('strikeThrough', false, null);
                break;
            case 'highlight':
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
        const table = document.createElement('table');
        table.className = 'border-collapse border border-slate-300 dark:border-slate-600';
        table.style.width = '100%';
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
        if (results.length > 0) {
            highlightSearchResult(0);
        }
    }, [searchText]);
    const highlightSearchResult = useCallback((index) => {
        if (!editorRef.current || index < 0 || index >= searchResults.length) return;
        const selection = window.getSelection();
        const range = document.createRange();
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
        const newTextContent = textContent.replaceAll(searchText, replaceText);
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
            const figure = document.createElement('figure');
            figure.className = 'image-container my-4';
            figure.style.textAlign = 'center';
            const img = document.createElement('img');
            img.src = downloadURL;
            img.alt = file.name.replace(/\.[^/.]+$/, '');
            img.style.maxWidth = '100%';
            img.style.height = 'auto';
            img.style.borderRadius = '8px';
            img.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
            img.className = 'cursor-pointer hover:opacity-90 transition-opacity';
            img.onclick = () => {
                const alignments = ['left', 'center', 'right'];
                const currentAlign = figure.style.textAlign || 'center';
                const currentIndex = alignments.indexOf(currentAlign);
                const nextAlign = alignments[(currentIndex + 1) % alignments.length];
                figure.style.textAlign = nextAlign;
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
            alert(`Failed to upload image: ${error.message || 'Unknown error'}`);
        } finally {
            setIsUploadingImage(false);
        }
    };
    const currentEntryType = useMemo(() => getEntryType(entryType), [entryType]);
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                if (showKeyboardHelp) {
                    setShowKeyboardHelp(false);
                } else if (isFocusMode) {
                    setIsFocusMode(false);
                    setAppFocusMode(false);
                }
                e.preventDefault();
            }
            if ((e.metaKey || e.ctrlKey) && e.key === '/') {
                e.preventDefault();
                setShowKeyboardHelp(!showKeyboardHelp);
            }
            if ((e.metaKey || e.ctrlKey) && e.key === 's') {
                e.preventDefault();
                handleSave();
            }
            if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
                e.preventDefault();
                applyFormat('bold');
            }
            if ((e.metaKey || e.ctrlKey) && e.key === 'i') {
                e.preventDefault();
                applyFormat('italic');
            }
            if ((e.metaKey || e.ctrlKey) && e.key === 'u') {
                e.preventDefault();
                applyFormat('underline');
            }
            if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'X') {
                e.preventDefault();
                applyFormat('strikethrough');
            }
            if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'H') {
                e.preventDefault();
                applyFormat('highlight');
            }
            if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === '=') {
                e.preventDefault();
                applyFormat('superscript');
            }
            if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === '-') {
                e.preventDefault();
                applyFormat('subscript');
            }
            if ((e.metaKey || e.ctrlKey) && e.key === 'f') {
                e.preventDefault();
                openSearchReplace();
            }
            if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
                e.preventDefault();
                document.execCommand('undo');
            }
            if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'Z') {
                e.preventDefault();
                document.execCommand('redo');
            }
            if ((e.metaKey || e.ctrlKey) && e.key === 'y') {
                e.preventDefault();
                document.execCommand('redo');
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isFocusMode, handleSave, applyFormat]);
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
                    className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/20"
                >
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                        <Loader size={14} className="text-blue-600 dark:text-blue-400" />
                    </motion.div>
                    <span className="text-sm font-medium text-blue-600 dark:text-blue-400">Saving...</span>
                </motion.div>
            )}
            {saveStatus === 'saved' && (
                <motion.div
                    key="saved"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ 
                        opacity: 1, 
                        scale: 1,
                        transition: {
                            type: "spring",
                            stiffness: 400,
                            damping: 15
                        }
                    }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20"
                >
                    <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{
                            type: "spring",
                            stiffness: 500,
                            damping: 20
                        }}
                    >
                        <Check size={14} className="text-green-600 dark:text-green-400" />
                    </motion.div>
                    <span className="text-sm font-medium text-green-600 dark:text-green-400">Saved</span>
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
                    <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-red-50 dark:bg-red-900/20">
                        <motion.div
                            animate={{ 
                                rotate: [0, -10, 10, -10, 10, 0],
                                transition: { duration: 0.5 }
                            }}
                        >
                            <AlertCircle size={14} className="text-red-600 dark:text-red-400" />
                        </motion.div>
                        <span className="text-sm font-medium text-red-600 dark:text-red-400 max-w-xs truncate">{saveError}</span>
                    </div>
                    <motion.button
                        onClick={() => handleSave(false)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-3 py-1.5 text-xs font-medium rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/40 transition-colors shadow-sm"
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
            whileHover={{ scale: 1.1, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className={`relative p-2 rounded-lg transition-all duration-200 ${
                isActive
                    ? 'bg-primary text-white shadow-lg'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400'
            }`}
            style={isActive ? { 
                backgroundColor: 'var(--color-primary-hex)',
                boxShadow: `0 4px 12px -2px var(--color-primary-hex)40`
            } : {}}
            title={label}
        >
            <Icon size={18} />
            {isActive && (
                <motion.div
                    layoutId="activeToolbar"
                    className="absolute inset-0 rounded-lg"
                    style={{
                        backgroundColor: 'var(--color-primary-hex)',
                        zIndex: -1
                    }}
                    transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 30
                    }}
                />
            )}
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
            {}
            {!isFocusMode && (
                <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    className="flex-shrink-0 border-b px-3 sm:px-6 py-3 sm:py-4 relative overflow-hidden"
                    style={{ borderColor: 'var(--color-border)' }}
                >
                    {/* Subtle gradient background */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-50/50 to-transparent dark:via-slate-800/50 pointer-events-none" />
                    
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4 gap-2">
                            <div className="flex items-center space-x-2 sm:space-x-4 min-w-0 flex-1">
                                <motion.button
                                    onClick={handleClose}
                                    whileHover={{ scale: 1.05, x: -3 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 flex-shrink-0 transition-colors"
                                    title="Back to Dashboard"
                                >
                                    <ArrowLeft size={20} />
                                </motion.button>
                                <SaveStatusIndicator />
                                <motion.span 
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1 }}
                                    className="hidden sm:inline text-xs text-slate-500 dark:text-slate-400 truncate"
                                >
                                    {entry ? `Updated ${format(entry.updatedAt, 'MMM d, h:mm a')}` : 'New Entry'}
                                </motion.span>
                                {wordCount > 0 && (
                                    <motion.span 
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ type: "spring", delay: 0.2 }}
                                        className="hidden md:inline text-xs px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 text-blue-600 dark:text-blue-400 font-medium"
                                    >
                                        {wordCount} words • {readingTime} min read
                                    </motion.span>
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
                                        whileHover={{ scale: 1.05, y: -2 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="hidden sm:block px-4 py-2 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 font-medium transition-colors"
                                    >
                                        Delete
                                    </motion.button>
                                )}
                            </div>
                        </div>
                    {}
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
                            {}
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
                            {}
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
                        {}
                        <div className="mt-4">
                            <TagsInput tags={tags} onChange={handleTagsChange} />
                        </div>
                        {}
                        <div className="flex items-center space-x-1 mt-4 flex-wrap gap-1">
                            {}
                            <div className="flex items-center space-x-1">
                                <ToolbarButton icon={Bold} label="Bold (Cmd+B)" onClick={() => applyFormat('bold')} isActive={activeFormats.bold} />
                                <ToolbarButton icon={Italic} label="Italic (Cmd+I)" onClick={() => applyFormat('italic')} isActive={activeFormats.italic} />
                                <ToolbarButton icon={UnderlineIcon} label="Underline (Cmd+U)" onClick={() => applyFormat('underline')} isActive={activeFormats.underline} />
                            </div>
                            {}
                            <div className="hidden xs:flex items-center space-x-1">
                                <div className="w-px h-6 bg-slate-300 dark:bg-slate-600" />
                                <ToolbarButton icon={Heading1} label="Heading 1" onClick={() => insertHeading(1)} isActive={activeFormats.h1} />
                                <ToolbarButton icon={Heading2} label="Heading 2" onClick={() => insertHeading(2)} isActive={activeFormats.h2} />
                                <ToolbarButton icon={Heading3} label="Heading 3" onClick={() => insertHeading(3)} isActive={activeFormats.h3} />
                            </div>
                            {}
                            <div className="flex items-center space-x-1">
                                <div className="w-px h-6 bg-slate-300 dark:bg-slate-600 hidden xs:block" />
                                <ToolbarButton icon={List} label="Bullet List" onClick={() => insertList(false)} />
                                <ToolbarButton icon={ListOrdered} label="Numbered List" onClick={() => insertList(true)} />
                            </div>
                            {}
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
                            {}
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
                    {}
                    <motion.button
                        onClick={() => setIsHeaderCollapsed(!isHeaderCollapsed)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="mt-2 px-3 py-1 text-xs rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 font-medium"
                        style={{ color: 'var(--color-text-secondary)' }}
                    >
                        {isHeaderCollapsed ? '▼ Show Editor Options' : '▲ Hide Editor Options'}
                    </motion.button>
                    </div>
                </motion.div>
            )}
            {}
            <motion.div 
                className="flex-1 flex overflow-hidden relative"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                {}
                <motion.div 
                    className={`${showPreview ? 'flex-1 md:w-1/2' : 'w-full'} overflow-y-auto custom-scrollbar relative`}
                    layout
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                    {/* Subtle paper texture effect */}
                    {isFocusMode && (
                        <div 
                            className="absolute inset-0 pointer-events-none opacity-5"
                            style={{
                                backgroundImage: `repeating-linear-gradient(
                                    0deg,
                                    transparent,
                                    transparent 1px,
                                    var(--color-border) 1px,
                                    var(--color-border) 2px
                                )`,
                                backgroundSize: '100% 30px'
                            }}
                        />
                    )}
                    
                    <motion.div
                        ref={editorRef}
                        contentEditable
                        onInput={handleContentChange}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="w-full h-full p-4 sm:p-6 md:p-8 lg:p-12 focus:outline-none transition-all rich-text-editor"
                        style={{
                            backgroundColor: 'var(--color-bg-content)',
                            color: 'var(--color-text-primary)',
                            fontFamily: 'var(--font-body)',
                            fontSize: isFocusMode ? '1.15rem' : '1.05rem',
                            lineHeight: '1.8',
                            caretColor: 'var(--color-primary-hex)',
                            minHeight: '400px',
                            transition: 'font-size 0.3s ease'
                        }}
                        data-placeholder="Start writing..."
                    />
                </motion.div>
                {}
                <AnimatePresence>
                {showPreview && (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="w-full md:w-1/2 border-t md:border-t-0 md:border-l overflow-y-auto custom-scrollbar p-4 sm:p-6 md:p-8 lg:p-12 relative"
                        style={{ borderColor: 'var(--color-border)' }}
                    >
                        {/* Preview badge */}
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="sticky top-0 mb-4 flex items-center justify-center z-10"
                        >
                            <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 text-purple-600 dark:text-purple-400 text-sm font-medium shadow-sm">
                                <Eye size={14} />
                                <span>Preview Mode</span>
                            </div>
                        </motion.div>
                        
                        <div className="prose dark:prose-invert max-w-none">
                            <ReactMarkdown>{content || '*Preview will appear here...*'}</ReactMarkdown>
                        </div>
                    </motion.div>
                )}
                </AnimatePresence>
            </motion.div>
            {}
            {isFocusMode && (
                <motion.button
                    onClick={() => setIsFocusMode(false)}
                    initial={{ opacity: 0, y: 20, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.8 }}
                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                    className="fixed bottom-6 right-6 p-4 rounded-full shadow-2xl group overflow-hidden"
                    style={{
                        backgroundColor: 'var(--color-primary-hex)',
                        color: 'white'
                    }}
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    title="Exit Focus Mode"
                >
                    {/* Ripple effect on hover */}
                    <motion.div
                        className="absolute inset-0 rounded-full"
                        initial={{ scale: 0, opacity: 0.5 }}
                        whileHover={{ scale: 2, opacity: 0 }}
                        transition={{ duration: 0.6 }}
                        style={{ backgroundColor: 'white' }}
                    />
                    <Minimize size={20} className="relative z-10" />
                </motion.button>
            )}
            {}
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
                            initial={{ scale: 0.9, y: 20, opacity: 0 }}
                            animate={{ 
                                scale: 1, 
                                y: 0, 
                                opacity: 1,
                                transition: {
                                    type: "spring",
                                    stiffness: 400,
                                    damping: 25
                                }
                            }}
                            exit={{ scale: 0.9, y: 20, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl relative overflow-hidden"
                        >
                            {/* Gradient accent */}
                            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-orange-500 to-red-500" />
                            
                            {/* Animated warning icon */}
                            <motion.div
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{
                                    type: "spring",
                                    stiffness: 500,
                                    damping: 20,
                                    delay: 0.1
                                }}
                                className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 flex items-center justify-center"
                            >
                                <AlertCircle size={32} className="text-amber-600 dark:text-amber-400" />
                            </motion.div>
                            
                            <motion.h3 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.15 }}
                                className="text-xl font-bold mb-2 text-center" 
                                style={{ color: 'var(--color-text-primary)' }}
                            >
                                Unsaved Changes
                            </motion.h3>
                            <motion.p 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="text-sm mb-6 text-center" 
                                style={{ color: 'var(--color-text-secondary)' }}
                            >
                                You have unsaved changes. What would you like to do?
                            </motion.p>
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.25 }}
                                className="flex flex-col sm:flex-row gap-3"
                            >
                                <motion.button
                                    onClick={() => setShowUnsavedModal(false)}
                                    whileHover={{ scale: 1.02, y: -2 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="flex-1 px-4 py-3 rounded-xl text-sm font-medium transition-colors"
                                    style={{
                                        backgroundColor: 'var(--color-bg-secondary)',
                                        color: 'var(--color-text-primary)'
                                    }}
                                >
                                    Cancel
                                </motion.button>
                                <motion.button
                                    onClick={() => {
                                        setShowUnsavedModal(false);
                                        handleEditorSaveComplete();
                                    }}
                                    whileHover={{ scale: 1.02, y: -2 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="flex-1 px-4 py-3 rounded-xl text-sm font-medium bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 shadow-md transition-all"
                                >
                                    Discard
                                </motion.button>
                                <motion.button
                                    onClick={() => {
                                        setShowUnsavedModal(false);
                                        handleSave(true);
                                    }}
                                    whileHover={{ scale: 1.02, y: -2 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="flex-1 px-4 py-3 rounded-xl text-sm font-medium text-white shadow-md relative overflow-hidden group"
                                    style={{ backgroundColor: 'var(--color-primary-hex)' }}
                                >
                                    {/* Shimmer effect */}
                                    <motion.div
                                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                                        initial={{ x: '-100%' }}
                                        whileHover={{ x: '100%' }}
                                        transition={{ duration: 0.6 }}
                                    />
                                    <span className="relative z-10">Save</span>
                                </motion.button>
                            </motion.div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
            {}
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
            {}
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
