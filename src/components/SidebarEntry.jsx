// src/components/SidebarEntry.jsx
import React from 'react';
import { Trash2 } from 'lucide-react';
import { formatTimestamp } from '../utils'; // Assuming utils.js exists or will be created

function SidebarEntry({ entry, onSelect, onDelete, isActive }) {
    const handleDelete = (e) => {
        e.stopPropagation();
        onDelete(entry.id);
    };

    return (
        <div
            onClick={() => onSelect(entry.id)}
            className={`p-3 rounded-lg cursor-pointer transition-colors duration-200 ${isActive ? 'bg-slate-700' : 'hover:bg-slate-800'}`}
        >
            <div className="flex justify-between items-center">
                <h3 className="font-semibold text-white truncate w-4/5">{entry.title || 'Untitled'}</h3>
                <button
                    onClick={handleDelete}
                    className="p-1 rounded-full text-gray-500 hover:text-red-400 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                    aria-label="Delete entry"
                >
                    <Trash2 size={16} />
                </button>
            </div>
            <p className="text-sm text-gray-400 truncate mt-1">{entry.content ? entry.content.substring(0, 40) + (entry.content.length > 40 ? '...' : '') : <span className="italic">No content</span>}</p>
            <p className="text-xs text-gray-500 mt-1">{formatTimestamp(entry.updatedAt)}</p>
        </div>
    );
}

export default SidebarEntry;
