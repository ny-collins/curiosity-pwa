import React from 'react';
import { X } from 'lucide-react';

export function Modal({ isOpen, onClose, children, className = "" }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className={`bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto ${className}`}>
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    aria-label="Close modal"
                >
                    <X size={20} />
                </button>
                {children}
            </div>
        </div>
    );
}

export function ModalHeader({ children }) {
    return (
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
            {children}
        </div>
    );
}

export function ModalBody({ children }) {
    return (
        <div className="p-6">
            {children}
        </div>
    );
}

export function ModalFooter({ children }) {
    return (
        <div className="flex justify-end space-x-3 p-6 border-t border-slate-200 dark:border-slate-700">
            {children}
        </div>
    );
}