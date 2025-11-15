import React, { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

export default function DeleteDataModal({ onClose, onConfirmDelete }) {
    const [isLoading, setIsLoading] = useState(false);
    const [confirmText, setConfirmText] = useState("");

    const canDelete = confirmText === "DELETE";

    const handleConfirm = () => {
        if (canDelete) {
            setIsLoading(true);
            onConfirmDelete();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md p-6 relative animate-slide-in-up">
                
                <button 
                    onClick={onClose} 
                    className="absolute top-3 right-3 p-1 rounded-full text-slate-500 dark:text-gray-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                >
                    <X size={20} />
                </button>

                <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                        <AlertTriangle size={24} className="text-red-600" />
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Delete All Data</h2>
                        <p className="text-sm text-slate-600 dark:text-gray-400">This action is irreversible.</p>
                    </div>
                </div>

                <div className="mt-4 space-y-3">
                    <p className="text-sm text-slate-700 dark:text-gray-300">
                        You are about to permanently delete all your entries, reminders, and settings from the cloud. This cannot be undone.
                    </p>
                    
                    <p className="text-sm text-slate-700 dark:text-gray-300">
                        To confirm, please type <strong>DELETE</strong> in the box below.
                    </p>

                    <input 
                        type="text"
                        value={confirmText}
                        onChange={(e) => setConfirmText(e.target.value)}
                        className="themed-input w-full rounded-md"
                        style={{ backgroundColor: 'var(--color-bg-secondary)', color: 'var(--color-text-primary)' }}
                        placeholder="DELETE"
                    />
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                    <button
                        onClick={onClose}
                        className="py-2 px-4 rounded-md text-sm font-medium bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-gray-200 hover:bg-slate-300 dark:hover:bg-slate-600 focus:outline-none focus:ring-2"
                        style={{'--tw-ring-color': 'var(--color-primary-hex)'}}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={!canDelete || isLoading}
                        className="py-2 px-4 rounded-md text-sm font-medium bg-red-600 text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-red-400 dark:disabled:bg-red-800 disabled:cursor-not-allowed"
                    >
                        {isLoading ? <LoadingSpinner size={20} /> : "Delete Everything"}
                    </button>
                </div>
            </div>
        </div>
    );
}
