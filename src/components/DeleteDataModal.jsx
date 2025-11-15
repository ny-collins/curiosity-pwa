import React, { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';
import { Modal, ModalHeader, ModalBody, ModalFooter } from './Modal';
import { Button } from './Button';

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
        <Modal isOpen={true} onClose={onClose} className="max-w-md">
            <ModalHeader>
                <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                        <AlertTriangle size={24} className="text-red-600" />
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Delete All Data</h2>
                        <p className="text-sm text-slate-600 dark:text-gray-400">This action is irreversible.</p>
                    </div>
                </div>
            </ModalHeader>

            <ModalBody>
                <div className="space-y-3">
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
            </ModalBody>

            <ModalFooter>
                <Button variant="secondary" onClick={onClose}>
                    Cancel
                </Button>
                <Button
                    variant="danger"
                    onClick={handleConfirm}
                    disabled={!canDelete || isLoading}
                >
                    {isLoading ? <LoadingSpinner size={20} /> : "Delete Everything"}
                </Button>
            </ModalFooter>
        </Modal>
    );
}
