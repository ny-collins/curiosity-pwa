import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Plus, Trash2, Eye, EyeOff, Key, FileText, User, AlertTriangle, Copy, Check } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { decryptData, formatTimestamp } from '../utils.js';
import { LIMITS } from '../constants.js';

const VaultPinScreen = ({ onUnlock }) => {
    const { checkPin, toast } = useAppContext();
    const [pin, setPin] = useState('');
    const [error, setError] = useState(false);

    useEffect(() => {
        if (pin.length === LIMITS.PIN_LENGTH) {
            handleSubmit();
        }
        if (error && pin.length < LIMITS.PIN_LENGTH) {
            setError(false);
        }
    }, [pin]);

    const handleSubmit = async () => {
        const isValid = await checkPin(pin);
        if (isValid) {
            onUnlock();
        } else {
            setError(true);
            toast.error("Incorrect PIN");
            setTimeout(() => setPin(''), 500);
        }
    };

    const handleKeyClick = (value) => {
        if (pin.length < LIMITS.PIN_LENGTH) {
            setPin(pin + value);
        }
    };
    
    return (
        <div className="flex flex-col items-center justify-center h-full p-4">
            <Shield size={48} className="text-primary mb-4" style={{ color: 'var(--color-primary-hex)' }} />
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-2">Vault Locked</h2>
            <p className="text-slate-600 dark:text-gray-400 mb-6">Enter your PIN to decrypt and view items.</p>
            
             <motion.div
                animate={{ x: error ? [-5, 5, -5, 5, 0] : 0 }}
                transition={{ duration: 0.3 }}
                className="flex space-x-4 my-6"
            >
                {Array.from({ length: LIMITS.PIN_LENGTH }).map((_, i) => (
                    <div 
                        key={i} 
                        className={`w-4 h-4 rounded-full ${i < pin.length ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-600'}`}
                        style={{ backgroundColor: i < pin.length ? 'var(--color-primary-hex)' : '' }}
                    />
                ))}
            </motion.div>

            <div className="grid grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, -1, 0, 'del'].map((val) => (
                    <button
                        key={val}
                        onClick={() => val === 'del' ? setPin(p => p.slice(0, -1)) : (val === -1 ? null : handleKeyClick(val.toString()))}
                        disabled={val === -1}
                        className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white text-2xl font-semibold flex items-center justify-center
                                   focus:outline-none focus:ring-2 disabled:opacity-0"
                        style={{'--tw-ring-color': 'var(--color-primary-hex)'}}
                    >
                        {val === 'del' ? <Trash2 size={24} /> : (val === -1 ? '' : val)}
                    </button>
                ))}
            </div>
        </div>
    );
};

const VaultItem = ({ item, decryptedData, onDelete }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [copiedKey, setCopiedKey] = useState(null);

    const copyToClipboard = (text, key) => {
        navigator.clipboard.writeText(text);
        setCopiedKey(key);
        setTimeout(() => setCopiedKey(null), 2000);
    };

    const renderData = () => {
        if (!decryptedData) {
            return <p className="text-red-500 text-sm">Decryption failed. PIN may have changed.</p>;
        }
        
        const fields = Object.entries(decryptedData);
        
        return fields.map(([key, value]) => (
            <div key={key} className="flex justify-between items-center group">
                <span className="text-sm font-medium text-slate-600 dark:text-gray-400 capitalize">{key}:</span>
                <div className="flex items-center space-x-2">
                    <span className={`text-sm text-slate-900 dark:text-white ${!isVisible && item.type === 'password' ? 'blur-sm' : 'blur-none'}`}>
                        {value}
                    </span>
                    <button onClick={() => copyToClipboard(value, key)} className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-primary">
                        {copiedKey === key ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                    </button>
                </div>
            </div>
        ));
    };

    return (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md border border-slate-200 dark:border-slate-700 p-4">
            <div className="flex justify-between items-start mb-3">
                <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{item.title}</h3>
                    <span className="text-xs text-slate-500 dark:text-gray-400">
                        {formatTimestamp(item.createdAt, true)}
                    </span>
                </div>
                <div className="flex space-x-2">
                    {item.type === 'password' && (
                        <button onClick={() => setIsVisible(!isVisible)} className="text-slate-500 hover:text-primary">
                            {isVisible ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    )}
                    <button onClick={onDelete} className="text-red-500 hover:text-red-700">
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>
            <div className="space-y-2">
                {renderData()}
            </div>
        </div>
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

    const handleSave = () => {
        const dataToEncrypt = fields.reduce((acc, field) => {
            if (field.key.trim()) {
                acc[field.key.trim()] = field.value;
            }
            return acc;
        }, {});
        onSave(title, type, dataToEncrypt);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-md w-full">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Add New Vault Item</h3>
                
                <div className="space-y-4">
                    <input
                        type="text"
                        placeholder="Title (e.g., 'Google Account')"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="form-input w-full bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600 rounded-md"
                    />
                    <select
                        value={type}
                        onChange={handleTypeChange}
                        className="form-select w-full bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600 rounded-md"
                    >
                        <option value="password">Password</option>
                        <option value="contact">Contact</option>
                        <option value="note">Secure Note</option>
                    </select>
                    
                    {fields.map((field, index) => (
                        <div key={index} className="flex space-x-2">
                            <input
                                type="text"
                                placeholder="Field Name"
                                value={field.key}
                                onChange={(e) => handleFieldChange(index, 'key', e.target.value)}
                                className="form-input w-1/3 bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600 rounded-md text-sm"
                            />
                            <input
                                type="text"
                                placeholder="Value"
                                value={field.value}
                                onChange={(e) => handleFieldChange(index, 'value', e.target.value)}
                                className="form-input w-2/3 bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600 rounded-md text-sm"
                            />
                        </div>
                    ))}
                    
                    <button onClick={handleAddField} className="text-sm text-primary" style={{ color: 'var(--color-primary-hex)' }}>
                        + Add Field
                    </button>
                </div>
                
                <div className="flex justify-end space-x-2 mt-6">
                    <button
                        onClick={onClose}
                        className="py-2 px-4 rounded-md text-sm font-medium text-slate-700 dark:text-gray-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="py-2 px-4 rounded-md text-sm font-medium text-white"
                        style={{ backgroundColor: 'var(--color-primary-hex)' }}
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
};

export default function VaultView() {
    const { vaultItems, unlockedPin, setUnlockedPin, checkPin, handleAddVaultItem, handleDeleteVaultItem, appPin } = useAppContext();
    const [showAddModal, setShowAddModal] = useState(false);

    const decryptedItems = useMemo(() => {
        if (!unlockedPin || !vaultItems) return [];
        return vaultItems
            .map(item => ({
                ...item,
                decryptedData: decryptData(item.encryptedData, unlockedPin)
            }))
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }, [vaultItems, unlockedPin]);
    
    if (!appPin) {
         return (
             <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                <AlertTriangle size={48} className="text-amber-500 mb-4" />
                <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-2">PIN Not Set</h2>
                <p className="text-slate-600 dark:text-gray-400">
                    Please set an App PIN in Settings to use the secure vault.
                </p>
            </div>
         );
    }

    if (!unlockedPin) {
        return <VaultPinScreen onUnlock={() => console.log("Vault unlocked")} />;
    }

    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Vault</h2>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center space-x-1 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2"
                        style={{ backgroundColor: 'var(--color-primary-hex)', '--tw-ring-color': 'var(--color-primary-hex)' }}
                    >
                        <Plus size={20} />
                        <span>Add Item</span>
                    </button>
                </div>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6">
                <AnimatePresence>
                    {decryptedItems.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {decryptedItems.map(item => (
                                <VaultItem 
                                    key={item.id} 
                                    item={item} 
                                    decryptedData={item.decryptedData} 
                                    onDelete={() => handleDeleteVaultItem(item.id)}
                                />
                            ))}
                        </div>
                    ) : (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex flex-col items-center justify-center h-full text-center"
                        >
                            <Shield size={48} className="text-slate-400 dark:text-slate-500 mb-4" />
                            <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-1">
                                Your vault is empty
                            </h3>
                            <p className="text-sm text-slate-600 dark:text-gray-400">
                                Click "Add Item" to save your first secure note.
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            
            {showAddModal && (
                <AddVaultItemModal 
                    onClose={() => setShowAddModal(false)}
                    onSave={handleAddVaultItem}
                />
            )}
        </div>
    );
}