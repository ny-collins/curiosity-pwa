import React from 'react';
import { AlertTriangle, Check, Save, Trash2, X } from 'lucide-react';

function UnsavedChangesModal({ onSave, onDiscard, onCancel }) {
    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-sm w-full">
                <div className="flex items-center space-x-3 mb-4">
                    <div className="p-2 bg-amber-100 dark:bg-amber-900/50 rounded-full">
                        <AlertTriangle size={24} className="text-amber-600 dark:text-amber-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Unsaved Changes</h3>
                </div>
                <p className="text-sm text-slate-600 dark:text-gray-300 mb-6">
                    You have unsaved changes. Do you want to save your new entry?
                </p>
                <div className="flex flex-col sm:flex-row sm:justify-end sm:space-x-2">
                    <button
                        onClick={onDiscard}
                        className="w-full sm:w-auto py-2 px-4 mb-2 sm:mb-0 rounded-md text-sm font-medium text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/50 hover:bg-red-200 dark:hover:bg-red-900/80 focus:outline-none focus:ring-2"
                        style={{'--tw-ring-color': 'var(--color-primary-hex)'}}
                    >
                        <Trash2 size={16} className="inline mr-1 -mt-0.5" />
                        Discard
                    </button>
                    <button
                        onClick={onCancel}
                        className="w-full sm:w-auto py-2 px-4 mb-2 sm:mb-0 rounded-md text-sm font-medium text-slate-700 dark:text-gray-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 focus:outline-none focus:ring-2"
                        style={{'--tw-ring-color': 'var(--color-primary-hex)'}}
                    >
                        <X size={16} className="inline mr-1 -mt-0.5" />
                        Cancel
                    </button>
                    <button
                        onClick={onSave}
                        className="w-full sm:w-auto py-2 px-4 rounded-md text-sm font-medium text-white"
                        style={{ backgroundColor: 'var(--color-primary-hex)' }}
                    >
                        <Save size={16} className="inline mr-1 -mt-0.5" />
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
}

export default UnsavedChangesModal;
