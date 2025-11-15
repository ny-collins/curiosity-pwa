import React from 'react';
import { AlertTriangle, Check, Save, Trash2, X } from 'lucide-react';
import { Modal, ModalHeader, ModalBody, ModalFooter } from './Modal';
import { Button } from './Button';

function UnsavedChangesModal({ onSave, onDiscard, onCancel }) {
    return (
        <Modal isOpen={true} onClose={onCancel} className="max-w-sm">
            <ModalHeader>
                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-amber-100 dark:bg-amber-900/50 rounded-full">
                        <AlertTriangle size={24} className="text-amber-600 dark:text-amber-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Unsaved Changes</h3>
                </div>
            </ModalHeader>

            <ModalBody>
                <p className="text-sm text-slate-600 dark:text-gray-300">
                    You have unsaved changes. Do you want to save your new entry?
                </p>
            </ModalBody>

            <ModalFooter>
                <Button variant="danger" onClick={onDiscard} className="flex items-center">
                    <Trash2 size={16} className="mr-1" />
                    Discard
                </Button>
                <Button variant="secondary" onClick={onCancel} className="flex items-center">
                    <X size={16} className="mr-1" />
                    Cancel
                </Button>
                <Button onClick={onSave} className="flex items-center">
                    <Save size={16} className="mr-1" />
                    Save
                </Button>
            </ModalFooter>
        </Modal>
    );
}

export default UnsavedChangesModal;
