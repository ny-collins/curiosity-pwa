import React from 'react';
import { FileText, Archive, FileJson } from 'lucide-react';
import { Modal, ModalHeader, ModalBody } from './Modal';

const ExportOption = ({ icon: Icon, title, description, onClick }) => (
    <button
        onClick={onClick}
        className="flex items-center w-full p-4 rounded-lg text-left transition-colors bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 focus:outline-none focus:ring-2"
        style={{'--tw-ring-color': 'var(--color-primary-hex)'}}
    >
        <div className="p-3 bg-white dark:bg-slate-800 rounded-lg shadow">
            <Icon size={24} className="text-primary" style={{color: 'var(--color-primary-hex)'}} />
        </div>
        <div className="ml-4">
            <h3 className="font-semibold text-slate-900 dark:text-white">{title}</h3>
            <p className="text-sm text-slate-600 dark:text-gray-300">{description}</p>
        </div>
    </button>
);

export default function ExportModal({ show, onClose, onExport }) {
    if (!show) {
        return null;
    }

    const handleExport = (format) => {
        onExport(format);
        onClose();
    };

    return (
        <Modal isOpen={show} onClose={onClose} className="max-w-lg">
            <ModalHeader>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Export Your Data</h2>
            </ModalHeader>

            <ModalBody>
                <p className="text-sm text-slate-600 dark:text-gray-300 mb-6">
                    Choose a format to download all your entries, reminders, and settings.
                </p>

                <div className="space-y-4">
                    <ExportOption
                        icon={Archive}
                        title="Markdown (.zip)"
                        description="A zip file containing all entries as individual .md files. Best for portability."
                        onClick={() => handleExport('markdown')}
                    />
                    <ExportOption
                        icon={FileText}
                        title="PDF Document"
                        description="A single, printable PDF document of all your entries, sorted by date."
                        onClick={() => handleExport('pdf')}
                    />
                    <ExportOption
                        icon={FileJson}
                        title="JSON Backup"
                        description="A single .json file. Best for backup and re-importing (coming soon)."
                        onClick={() => handleExport('json')}
                    />
                </div>
            </ModalBody>
        </Modal>
    );
}
