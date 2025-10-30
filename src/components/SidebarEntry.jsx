import React from 'react';
import { Trash2 } from 'lucide-react';
import { formatTimestamp, stripMarkdown } from '../utils';

function SidebarEntry({ entry, onSelect, onDelete, isActive }) {
    const handleDelete = (e) => {
        e.stopPropagation();
        onDelete(entry.id);
    };
    
    const previewText = stripMarkdown(entry.content || '');

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
            
            {entry.tags && entry.tags.length > 0 && (
                <div className="flex flex-wrap gap-x-2 gap-y-1 mt-1.5">
                    {entry.tags.slice(0, 3).map(tag => (
                        <span 
                            key={tag} 
                            className="text-xs px-1.5 py-0.5 rounded" 
                            style={{
                                color: 'var(--color-primary-hex)', 
                                backgroundColor: 'rgba(var(--color-primary-rgb, 20, 184, 172), 0.1)'
                            }}
                        >
                            #{tag}
                        </span>
                    ))}
                </div>
            )}
            
            <p className="text-sm text-gray-400 truncate mt-1.5">
                {previewText ? (
                    previewText.substring(0, 40) + (previewText.length > 40 ? '...' : '')
                 ) : (
                    <span className="italic">No content</span>
                 )}
            </p>
            <p className="text-xs text-gray-500 mt-1">{formatTimestamp(entry.updatedAt)}</p>
        </div>
    );
}

export default SidebarEntry;
