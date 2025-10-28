// src/components/DeleteDataModal.jsx
import React, { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';

const CONFIRMATION_PHRASE = "delete all my data"; // The exact phrase to type

function DeleteDataModal({ onClose, onConfirmDelete }) {
    const [confirmationText, setConfirmationText] = useState("");

    const isMatch = confirmationText === CONFIRMATION_PHRASE;

    const handleSubmit = () => {
        if (isMatch) {
            onConfirmDelete();
            onClose();
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 transition-opacity duration-300"
            onClick={onClose}
        >
            <div
                className="bg-slate-800 rounded-lg shadow-xl p-6 w-full max-w-md transform transition-all duration-300 scale-100 opacity-100"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-semibold text-red-500 flex items-center">
                        <AlertTriangle size={24} className="mr-2"/>
                        Are you sure?
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-full text-gray-500 hover:text-white hover:bg-slate-700 focus:ring-2 focus:ring-teal-500"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Warning Content */}
                <div className="space-y-4">
                    <p className="text-gray-300">
                        This action is **irreversible**. All your entries, reminders, and settings will be permanently
                        deleted from the cloud. This cannot be undone.
                    </p>
                    <p className="text-gray-300">
                        To confirm, please type the following phrase exactly:
                    </p>
                    <p className="text-center font-mono text-teal-400 bg-slate-900 rounded-md p-2">
                        {CONFIRMATION_PHRASE}
                    </p>
                    <input
                        type="text"
                        value={confirmationText}
                        onChange={(e) => setConfirmationText(e.target.value)}
                        className="w-full bg-slate-700 text-white rounded-md border-slate-600 focus:border-red-500 focus:ring-red-500 p-2"
                        placeholder="Type to confirm..."
                    />
                </div>

                {/* Delete Button */}
                <div className="mt-6 flex justify-end">
                    <button
                        onClick={handleSubmit}
                        disabled={!isMatch}
                        className="w-full bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-400 disabled:bg-slate-600 disabled:text-gray-400 disabled:cursor-not-allowed"
                    >
                        I understand the consequences, delete all my data
                    </button>
                </div>
            </div>
        </div>
    );
}

export default DeleteDataModal;
