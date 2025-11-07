import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Plus, Trash2, Eye, EyeOff, Key, FileText, User, AlertTriangle, Copy, Check, Lock, Unlock, Search, Filter, Mail, Phone, StickyNote, CreditCard, ChevronUp } from 'lucide-react';
import { useAppState } from '../contexts/StateProvider';
import { decryptData, formatTimestamp } from '../utils.js';
import { LIMITS } from '../constants.js';
import { useToaster } from './NotificationProvider.jsx';

const VaultPinScreen = ({ onUnlock }) => {
    const { checkPin } = useAppState();
    const toast = useToaster();
    const [pin, setPin] = useState('');
    const [error, setError] = useState(false);
    const [isUnlocking, setIsUnlocking] = useState(false);

    useEffect(() => {
        if (pin.length === LIMITS.PIN_LENGTH) {
            handleSubmit();
        }
        if (error && pin.length < LIMITS.PIN_LENGTH) {
            setError(false);
        }
    }, [pin]);

    const handleSubmit = async () => {
        setIsUnlocking(true);
        const isValid = await checkPin(pin);
        if (isValid) {
            // Smooth unlock animation
            setTimeout(() => {
                onUnlock();
                toast.success("Vault unlocked! 🔓");
            }, 300);
        } else {
            setError(true);
            setIsUnlocking(false);
            toast.error("Incorrect PIN");
            setTimeout(() => setPin(''), 500);
        }
    };

    const handleKeyClick = (value) => {
        if (pin.length < LIMITS.PIN_LENGTH && !isUnlocking) {
            setPin(pin + value);
        }
    };
    
    return (
        <div className="flex flex-col items-center justify-center h-full p-4">
            {/* Animated Lock Icon */}
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ 
                    scale: isUnlocking ? 1.2 : 1, 
                    opacity: 1,
                    rotate: isUnlocking ? 360 : 0
                }}
                transition={{ 
                    scale: { type: "spring", stiffness: 300, damping: 20 },
                    rotate: { duration: 0.5 }
                }}
                className="relative mb-6"
            >
                <div className="absolute inset-0 bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 dark:from-violet-500/30 dark:to-fuchsia-500/30 rounded-full blur-2xl" />
                <div className="relative bg-white dark:bg-slate-800 p-6 rounded-full shadow-xl border-2 border-violet-200 dark:border-violet-500/30">
                    {isUnlocking ? (
                        <Unlock size={48} className="text-violet-600 dark:text-violet-400" />
                    ) : (
                        <Lock size={48} className="text-violet-600 dark:text-violet-400" />
                    )}
                </div>
            </motion.div>

            <motion.h2 
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-2xl font-semibold text-slate-900 dark:text-white mb-2"
            >
                {isUnlocking ? 'Unlocking...' : 'Vault Locked'}
            </motion.h2>
            <motion.p 
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-slate-600 dark:text-gray-400 mb-8 text-center max-w-xs"
            >
                {isUnlocking ? 'Decrypting your secure items...' : 'Enter your PIN to decrypt and view items'}
            </motion.p>
            
            {/* PIN Dots */}
            <motion.div
                animate={{ x: error ? [-5, 5, -5, 5, 0] : 0 }}
                transition={{ duration: 0.3 }}
                className="flex space-x-4 my-8"
            >
                {Array.from({ length: LIMITS.PIN_LENGTH }).map((_, i) => (
                    <motion.div
                        key={i}
                        initial={{ scale: 0 }}
                        animate={{ 
                            scale: i < pin.length ? 1 : 0.8,
                            backgroundColor: error 
                                ? '#ef4444' 
                                : i < pin.length 
                                    ? 'rgb(124, 58, 237)' 
                                    : 'rgb(148, 163, 184)'
                        }}
                        transition={{ type: "spring", stiffness: 500, damping: 20 }}
                        className="w-4 h-4 rounded-full shadow-lg"
                    />
                ))}
            </motion.div>

            {/* Numpad */}
            <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="grid grid-cols-3 gap-4"
            >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, -1, 0, 'del'].map((val, idx) => (
                    <motion.button
                        key={val}
                        onClick={() => val === 'del' ? setPin(p => p.slice(0, -1)) : (val === -1 ? null : handleKeyClick(val.toString()))}
                        disabled={val === -1 || isUnlocking}
                        whileHover={val !== -1 && !isUnlocking ? { scale: 1.05, backgroundColor: 'rgb(241, 245, 249)' } : {}}
                        whileTap={val !== -1 && !isUnlocking ? { scale: 0.95 } : {}}
                        className="w-16 h-16 rounded-2xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-2xl font-semibold 
                                   flex items-center justify-center shadow-md border border-slate-200 dark:border-slate-700
                                   focus:outline-none focus:ring-2 focus:ring-violet-500 disabled:opacity-0
                                   transition-colors duration-200"
                    >
                        {val === 'del' ? <Trash2 size={24} className="text-slate-600 dark:text-slate-400" /> : (val === -1 ? '' : val)}
                    </motion.button>
                ))}
            </motion.div>
        </div>
    );
};

const VaultItem = ({ item, decryptedData, onDelete, index }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [copiedKey, setCopiedKey] = useState(null);
    const toast = useToaster();

    const copyToClipboard = (text, key) => {
        navigator.clipboard.writeText(text);
        setCopiedKey(key);
        toast.success(`${key} copied! 📋`);
        setTimeout(() => setCopiedKey(null), 2000);
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'password': return <Key className="text-violet-600 dark:text-violet-400" size={20} />;
            case 'contact': return <User className="text-blue-600 dark:text-blue-400" size={20} />;
            case 'note': return <StickyNote className="text-amber-600 dark:text-amber-400" size={20} />;
            default: return <Shield className="text-slate-600 dark:text-slate-400" size={20} />;
        }
    };

    const getTypeColor = (type) => {
        switch (type) {
            case 'password': return 'from-violet-500/10 to-fuchsia-500/10 dark:from-violet-500/20 dark:to-fuchsia-500/20';
            case 'contact': return 'from-blue-500/10 to-cyan-500/10 dark:from-blue-500/20 dark:to-cyan-500/20';
            case 'note': return 'from-amber-500/10 to-orange-500/10 dark:from-amber-500/20 dark:to-orange-500/20';
            default: return 'from-slate-500/10 to-slate-500/10 dark:from-slate-500/20 dark:to-slate-500/20';
        }
    };

    const renderData = () => {
        if (!decryptedData) {
            return (
                <div className="flex items-center space-x-2 text-red-500 text-sm">
                    <AlertTriangle size={14} />
                    <span>Decryption failed. PIN may have changed.</span>
                </div>
            );
        }
        
        const fields = Object.entries(decryptedData);
        
        return (
            <motion.div 
                className="space-y-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
            >
                {fields.map(([key, value], idx) => (
                    <motion.div 
                        key={key} 
                        initial={{ x: -10, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.1 * idx }}
                        className="flex justify-between items-center group bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    >
                        <div className="flex-1 min-w-0">
                            <span className="block text-xs font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                                {key}
                            </span>
                            <motion.span 
                                animate={{ 
                                    filter: !isVisible && item.type === 'password' ? 'blur(6px)' : 'blur(0px)' 
                                }}
                                transition={{ duration: 0.2 }}
                                className="block text-sm font-medium text-slate-900 dark:text-white truncate"
                            >
                                {value}
                            </motion.span>
                        </div>
                        <motion.button 
                            onClick={() => copyToClipboard(value, key)} 
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="ml-3 flex-shrink-0 p-2 rounded-lg text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 
                                     hover:bg-violet-50 dark:hover:bg-violet-500/10 transition-all opacity-0 group-hover:opacity-100"
                        >
                            <AnimatePresence mode="wait">
                                {copiedKey === key ? (
                                    <motion.div
                                        key="check"
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1, rotate: 360 }}
                                        exit={{ scale: 0 }}
                                    >
                                        <Check size={16} className="text-green-500" />
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="copy"
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        exit={{ scale: 0 }}
                                    >
                                        <Copy size={16} />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.button>
                    </motion.div>
                ))}
            </motion.div>
        );
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ delay: index * 0.05 }}
            className="group relative"
        >
            {/* Gradient Background */}
            <div className={`absolute inset-0 bg-gradient-to-br ${getTypeColor(item.type)} rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
            
            {/* Card */}
            <div className="relative bg-white dark:bg-slate-800 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 
                          hover:shadow-xl hover:border-violet-300 dark:hover:border-violet-500/50 transition-all duration-300 overflow-hidden">
                
                {/* Header */}
                <div className="flex justify-between items-start p-5 pb-4 border-b border-slate-100 dark:border-slate-700/50">
                    <div className="flex items-start space-x-3 flex-1 min-w-0">
                        <motion.div 
                            whileHover={{ rotate: 360 }}
                            transition={{ duration: 0.5 }}
                            className="flex-shrink-0 p-2 rounded-lg bg-slate-50 dark:bg-slate-700/50"
                        >
                            {getTypeIcon(item.type)}
                        </motion.div>
                        <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white truncate">{item.title}</h3>
                            <div className="flex items-center space-x-2 mt-1">
                                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 capitalize">
                                    {item.type}
                                </span>
                                <span className="text-xs text-slate-500 dark:text-gray-400">
                                    {formatTimestamp(item.createdAt, true)}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center space-x-1 ml-2">
                        {item.type === 'password' && (
                            <motion.button 
                                onClick={() => setIsVisible(!isVisible)} 
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className="p-2 rounded-lg text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 
                                         hover:bg-violet-50 dark:hover:bg-violet-500/10 transition-all"
                            >
                                <AnimatePresence mode="wait">
                                    {isVisible ? (
                                        <motion.div
                                            key="visible"
                                            initial={{ rotate: -90, opacity: 0 }}
                                            animate={{ rotate: 0, opacity: 1 }}
                                            exit={{ rotate: 90, opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <EyeOff size={16} />
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="hidden"
                                            initial={{ rotate: -90, opacity: 0 }}
                                            animate={{ rotate: 0, opacity: 1 }}
                                            exit={{ rotate: 90, opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <Eye size={16} />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.button>
                        )}
                        <motion.button 
                            onClick={onDelete}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-2 rounded-lg text-slate-400 hover:text-red-600 dark:hover:text-red-400 
                                     hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
                        >
                            <Trash2 size={16} />
                        </motion.button>
                    </div>
                </div>
                
                {/* Content */}
                <div className="p-5 pt-4">
                    {renderData()}
                </div>
            </div>
        </motion.div>
    );
};

const AddVaultItemModal = ({ onClose, onSave }) => {
    const [title, setTitle] = useState('');
    const [type, setType] = useState('password');
    const [fields, setFields] = useState([{ key: 'username', value: '' }, { key: 'password', value: '' }]);

    const handleTypeChange = (e) => {
        const newType = e.target.value;
        setType(newType);
        if (newType === 'password') {
            setFields([{ key: 'username', value: '' }, { key: 'password', value: '' }]);
        } else if (newType === 'contact') {
            setFields([{ key: 'name', value: '' }, { key: 'email', value: '' }, { key: 'phone', value: '' }]);
        } else {
            setFields([{ key: 'note', value: '' }]);
        }
    };

    const handleFieldChange = (index, keyOrValue, value) => {
        const newFields = [...fields];
        newFields[index][keyOrValue] = value;
        setFields(newFields);
    };
    
    const handleAddField = () => {
        setFields([...fields, { key: '', value: '' }]);
    };

    const handleRemoveField = (index) => {
        if (fields.length > 1) {
            setFields(fields.filter((_, i) => i !== index));
        }
    };

    const handleSave = () => {
        if (!title.trim()) return;
        const dataToEncrypt = fields.reduce((acc, field) => {
            if (field.key.trim()) {
                acc[field.key.trim()] = field.value;
            }
            return acc;
        }, {});
        onSave(title, type, dataToEncrypt);
        onClose();
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'password': return <Key size={20} />;
            case 'contact': return <User size={20} />;
            case 'note': return <StickyNote size={20} />;
            default: return <Shield size={20} />;
        }
    };

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto custom-scrollbar"
            >
                {/* Header */}
                <motion.div 
                    initial={{ y: -10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="flex items-center space-x-3 mb-6 pb-4 border-b border-slate-200 dark:border-slate-700"
                >
                    <div className="p-2 rounded-lg bg-violet-100 dark:bg-violet-500/20 text-violet-600 dark:text-violet-400">
                        <Shield size={24} />
                    </div>
                    <div>
                        <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Add Vault Item</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Securely store sensitive information</p>
                    </div>
                </motion.div>
                
                <motion.div 
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-5"
                >
                    {/* Title Input */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Title
                        </label>
                        <input
                            type="text"
                            placeholder="e.g., Google Account, Work Email..."
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700/50 border-2 border-slate-200 dark:border-slate-600 
                                     rounded-xl text-slate-900 dark:text-white placeholder-slate-400
                                     focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent
                                     transition-all duration-200"
                        />
                    </div>

                    {/* Type Selector */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Type
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                            {[
                                { value: 'password', label: 'Password', icon: <Key size={18} /> },
                                { value: 'contact', label: 'Contact', icon: <User size={18} /> },
                                { value: 'note', label: 'Note', icon: <StickyNote size={18} /> }
                            ].map((option) => (
                                <motion.button
                                    key={option.value}
                                    type="button"
                                    onClick={() => handleTypeChange({ target: { value: option.value } })}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all duration-200
                                        ${type === option.value 
                                            ? 'border-violet-500 bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400' 
                                            : 'border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-600 dark:text-slate-400 hover:border-violet-300'
                                        }`}
                                >
                                    {option.icon}
                                    <span className="text-xs font-medium mt-1">{option.label}</span>
                                </motion.button>
                            ))}
                        </div>
                    </div>
                    
                    {/* Fields */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                Fields
                            </label>
                            <motion.button 
                                onClick={handleAddField}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="text-xs font-medium text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 flex items-center space-x-1"
                            >
                                <Plus size={14} />
                                <span>Add Field</span>
                            </motion.button>
                        </div>
                        <AnimatePresence>
                            {fields.map((field, index) => (
                                <motion.div 
                                    key={index}
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="flex space-x-2 mb-3"
                                >
                                    <input
                                        type="text"
                                        placeholder="Field name"
                                        value={field.key}
                                        onChange={(e) => handleFieldChange(index, 'key', e.target.value)}
                                        className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-700/50 border-2 border-slate-200 dark:border-slate-600 
                                                 rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-400
                                                 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                                    />
                                    <input
                                        type={field.key.toLowerCase().includes('password') ? 'password' : 'text'}
                                        placeholder="Value"
                                        value={field.value}
                                        onChange={(e) => handleFieldChange(index, 'value', e.target.value)}
                                        className="flex-[2] px-3 py-2 bg-slate-50 dark:bg-slate-700/50 border-2 border-slate-200 dark:border-slate-600 
                                                 rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-400
                                                 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                                    />
                                    {fields.length > 1 && (
                                        <motion.button
                                            onClick={() => handleRemoveField(index)}
                                            whileHover={{ scale: 1.1, rotate: 90 }}
                                            whileTap={{ scale: 0.9 }}
                                            className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
                                        >
                                            <Trash2 size={16} />
                                        </motion.button>
                                    )}
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </motion.div>
                
                {/* Actions */}
                <motion.div 
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="flex justify-end space-x-3 mt-6 pt-4 border-t border-slate-200 dark:border-slate-700"
                >
                    <motion.button
                        onClick={onClose}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-700 dark:text-gray-300 
                                 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600
                                 transition-colors duration-200"
                    >
                        Cancel
                    </motion.button>
                    <motion.button
                        onClick={handleSave}
                        disabled={!title.trim()}
                        whileHover={title.trim() ? { scale: 1.02 } : {}}
                        whileTap={title.trim() ? { scale: 0.98 } : {}}
                        className="px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-violet-600 hover:bg-violet-700
                                 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-violet-500/30"
                    >
                        Save Securely
                    </motion.button>
                </motion.div>
            </motion.div>
        </motion.div>
    );
};

export default function VaultView() {
    const { vaultItems, handleAddVaultItem, handleDeleteVaultItem, appPin, unlockedKey, setUnlockedKey, checkPin } = useAppState();
    const [showAddModal, setShowAddModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(true);

    const decryptedItems = useMemo(() => {
        if (!unlockedKey || !vaultItems) return [];
        return vaultItems
            .map(item => ({
                ...item,
                decryptedData: decryptData(item.encryptedData, unlockedKey)
            }))
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }, [vaultItems, unlockedKey]);

    // Filter and search items
    const filteredItems = useMemo(() => {
        let items = decryptedItems;
        
        // Filter by type
        if (filterType !== 'all') {
            items = items.filter(item => item.type === filterType);
        }
        
        // Search by title
        if (searchQuery.trim()) {
            items = items.filter(item => 
                item.title.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }
        
        return items;
    }, [decryptedItems, filterType, searchQuery]);

    // Statistics
    const stats = useMemo(() => {
        return {
            total: decryptedItems.length,
            passwords: decryptedItems.filter(i => i.type === 'password').length,
            contacts: decryptedItems.filter(i => i.type === 'contact').length,
            notes: decryptedItems.filter(i => i.type === 'note').length
        };
    }, [decryptedItems]);
    
    if (!appPin) {
         return (
             <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="max-w-md"
                >
                    <div className="p-4 rounded-full bg-amber-100 dark:bg-amber-500/20 inline-block mb-4">
                        <AlertTriangle size={48} className="text-amber-500" />
                    </div>
                    <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-2">PIN Not Set</h2>
                    <p className="text-slate-600 dark:text-gray-400">
                        Please set an App PIN in Settings to use the secure vault.
                    </p>
                </motion.div>
            </div>
         );
    }

    if (!unlockedKey) {
        return <VaultPinScreen onUnlock={() => setUnlockedKey(true)} />;
    }

    return (
        <div className="flex flex-col h-full bg-gradient-to-br from-slate-50 via-violet-50/30 to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900">
            {/* Header */}
            <motion.div 
                className="flex-shrink-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-700"
                animate={{ 
                    paddingTop: isHeaderCollapsed ? '12px' : '24px',
                    paddingBottom: isHeaderCollapsed ? '12px' : '24px'
                }}
                transition={{ duration: 0.3 }}
            >
                <div className="px-6">
                    {/* Title and Add Button */}
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            {/* Collapse Toggle Button */}
                            <motion.button
                                onClick={() => setIsHeaderCollapsed(!isHeaderCollapsed)}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-slate-600 dark:text-slate-400"
                                title={isHeaderCollapsed ? "Expand header" : "Collapse header"}
                            >
                                <motion.div
                                    animate={{ rotate: isHeaderCollapsed ? 0 : 180 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <ChevronUp size={20} />
                                </motion.div>
                            </motion.button>
                            
                            <motion.div
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                className="flex items-center space-x-3"
                            >
                                <div className="p-3 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 shadow-lg">
                                    <Shield size={24} className="text-white" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Secure Vault</h2>
                                    {!isHeaderCollapsed && (
                                        <motion.p 
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="text-sm text-slate-600 dark:text-slate-400"
                                        >
                                            Your encrypted safe space
                                        </motion.p>
                                    )}
                                </div>
                            </motion.div>
                        </div>
                        <motion.button
                            onClick={() => setShowAddModal(true)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex items-center space-x-2 px-5 py-3 rounded-xl text-white font-semibold
                                     bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700
                                     shadow-lg shadow-violet-500/30 transition-all duration-200"
                        >
                            <Plus size={20} />
                            <span>Add Item</span>
                        </motion.button>
                    </div>
                </div>

                {/* Collapsible Content */}
                <AnimatePresence>
                    {!isHeaderCollapsed && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                        >
                            <div className="px-6 pt-6">
                                {/* Statistics Cards */}
                                <motion.div 
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.1 }}
                                    className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6"
                                >
                        {[
                            { label: 'Total', value: stats.total, icon: Shield, color: 'violet', gradient: 'from-violet-500 to-fuchsia-500' },
                            { label: 'Passwords', value: stats.passwords, icon: Key, color: 'violet', gradient: 'from-violet-500 to-purple-500' },
                            { label: 'Contacts', value: stats.contacts, icon: User, color: 'blue', gradient: 'from-blue-500 to-cyan-500' },
                            { label: 'Notes', value: stats.notes, icon: StickyNote, color: 'amber', gradient: 'from-amber-500 to-orange-500' }
                        ].map((stat, index) => (
                            <motion.div
                                key={stat.label}
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.1 + index * 0.05 }}
                                whileHover={{ scale: 1.02, y: -2 }}
                                className="relative overflow-hidden bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm"
                            >
                                <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-5`} />
                                <div className="relative flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">{stat.label}</p>
                                        <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stat.value}</p>
                                    </div>
                                    <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.gradient} opacity-10`}>
                                        <stat.icon size={20} className={`text-${stat.color}-600`} />
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>

                    {/* Search and Filter */}
                    <motion.div 
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="flex flex-col md:flex-row gap-4"
                    >
                        {/* Search */}
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search vault items..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-700/50 border-2 border-slate-200 dark:border-slate-600
                                         rounded-xl text-slate-900 dark:text-white placeholder-slate-400
                                         focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent
                                         transition-all duration-200"
                            />
                        </div>

                        {/* Filter */}
                        <div className="flex space-x-2">
                            {[
                                { value: 'all', label: 'All', icon: Shield },
                                { value: 'password', label: 'Passwords', icon: Key },
                                { value: 'contact', label: 'Contacts', icon: User },
                                { value: 'note', label: 'Notes', icon: StickyNote }
                            ].map((filter) => (
                                <motion.button
                                    key={filter.value}
                                    onClick={() => setFilterType(filter.value)}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className={`flex items-center space-x-2 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200
                                        ${filterType === filter.value
                                            ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/30'
                                            : 'bg-slate-50 dark:bg-slate-700/50 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                                        }`}
                                >
                                    <filter.icon size={16} />
                                    <span className="hidden md:inline">{filter.label}</span>
                                </motion.button>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </motion.div>
        )}
    </AnimatePresence>
</motion.div>
            
            {/* Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                <AnimatePresence mode="popLayout">
                    {filteredItems.length > 0 ? (
                        <motion.div 
                            layout
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
                        >
                            {filteredItems.map((item, index) => (
                                <VaultItem 
                                    key={item.id} 
                                    item={item}
                                    index={index}
                                    decryptedData={item.decryptedData} 
                                    onDelete={() => handleDeleteVaultItem(item.id)}
                                />
                            ))}
                        </motion.div>
                    ) : (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="flex flex-col items-center justify-center h-full text-center py-20"
                        >
                            <motion.div
                                animate={{ 
                                    rotate: [0, 10, -10, 0],
                                    scale: [1, 1.05, 1]
                                }}
                                transition={{ 
                                    duration: 2,
                                    repeat: Infinity,
                                    repeatDelay: 3
                                }}
                                className="p-6 rounded-full bg-slate-100 dark:bg-slate-800 mb-6"
                            >
                                {searchQuery || filterType !== 'all' ? (
                                    <Search size={48} className="text-slate-400 dark:text-slate-500" />
                                ) : (
                                    <Shield size={48} className="text-slate-400 dark:text-slate-500" />
                                )}
                            </motion.div>
                            <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-2">
                                {searchQuery || filterType !== 'all' 
                                    ? 'No items found' 
                                    : 'Your vault is empty'
                                }
                            </h3>
                            <p className="text-sm text-slate-600 dark:text-gray-400 max-w-xs">
                                {searchQuery || filterType !== 'all'
                                    ? 'Try adjusting your search or filters'
                                    : 'Click "Add Item" to save your first secure item'
                                }
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            
            {/* Add Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <AddVaultItemModal 
                        onClose={() => setShowAddModal(false)}
                        onSave={handleAddVaultItem}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}