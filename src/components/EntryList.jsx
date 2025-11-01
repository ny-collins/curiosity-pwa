import React from 'react';
import { Search, X, Filter, ChevronDown, Calendar, Tag, Type } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { formatTimestamp, stripMarkdown } from '../utils.js';
import { ENTRY_TYPES, getEntryType } from '../constants.js';

const EntryItem = ({ entry, onSelect, onDelete }) => {
    const entryType = getEntryType(entry.type);
    const snippet = stripMarkdown(entry.content || '').substring(0, 100);

    return (
        <article 
            className="p-4 rounded-lg bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => onSelect(entry.id)}
        >
            <div className="flex justify-between items-start">
                <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">{entry.title || "Untitled Entry"}</h3>
                    <div className="flex items-center space-x-3 text-xs text-slate-500 dark:text-gray-400 mb-2">
                        <span className="flex items-center space-x-1">
                            <entryType.icon size={12} />
                            <span>{entryType.label}</span>
                        </span>
                        <span>•</span>
                        <span>{formatTimestamp(entry.updatedAt || entry.createdAt)}</span>
                    </div>
                </div>
                <button 
                    onClick={(e) => { e.stopPropagation(); onDelete(entry.id); }}
                    className="p-1 -mr-1 -mt-1 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50"
                    title="Delete Entry"
                >
                    <X size={16} />
                </button>
            </div>
            
            <p className="text-sm text-slate-600 dark:text-gray-300 leading-snug">
                {snippet}{snippet.length === 100 && '...'}
            </p>
            
            {entry.tags && entry.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                    {entry.tags.map(tag => (
                        <span key={tag} className="px-2 py-0.5 bg-primary-light text-primary-dark text-xs font-medium rounded-full" style={{backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary-hex)'}}>
                            {tag}
                        </span>
                    ))}
                </div>
            )}
        </article>
    );
};

const FilterSelect = ({ icon: Icon, value, onChange, options, placeholder, allLabel = "All" }) => (
    <div className="relative">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3">
            <Icon size={16} className="text-slate-500 dark:text-gray-400" />
        </span>
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="form-select block w-full appearance-none rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white py-2 pl-9 pr-8 shadow-sm focus:border-primary focus:ring-1 focus:ring-primary"
            style={{'--tw-ring-color': 'var(--color-primary-hex)', '--tw-border-color': 'var(--color-primary-hex)'}}
        >
            <option value="All">{allLabel}</option>
            {options.map(option => (
                <option key={option.value || option} value={option.value || option}>
                    {option.label || option}
                </option>
            ))}
        </select>
        <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            <ChevronDown size={16} className="text-slate-500 dark:text-gray-400" />
        </span>
    </div>
);

export default function EntryList() {
    const {
        filteredEntries, searchTerm, setSearchTerm,
        filterYear, handleFilterYearChange,
        filterMonth, setFilterMonth, availableYears,
        filterTag, setFilterTag, availableTags,
        filterType, setFilterType,
        handleSelectEntry, handleDeleteEntry, handleClearFilters
    } = useAppContext();
    
    const monthOptions = Array.from({ length: 12 }, (_, i) => ({
        value: i + 1,
        label: new Date(0, i).toLocaleString('default', { month: 'long' })
    }));

    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-800">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                <div className="relative">
                    <input
                        type="search"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search entries..."
                        className="form-input w-full pl-10 pr-4 py-2 rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2">
                        <Search size={20} className="text-slate-400" />
                    </span>
                </div>
            </div>
            
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 grid grid-cols-2 md:grid-cols-4 gap-3">
                <FilterSelect
                    icon={Type}
                    value={filterType}
                    onChange={setFilterType}
                    options={ENTRY_TYPES}
                    allLabel="All Types"
                />
                <FilterSelect
                    icon={Calendar}
                    value={filterYear}
                    onChange={handleFilterYearChange}
                    options={availableYears}
                    allLabel="All Years"
                />
                <FilterSelect
                    icon={Calendar}
                    value={filterMonth}
                    onChange={setFilterMonth}
                    options={monthOptions}
                    allLabel="All Months"
                />
                <FilterSelect
                    icon={Tag}
                    value={filterTag}
                    onChange={setFilterTag}
                    options={availableTags}
                    allLabel="All Tags"
                />
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                        {filteredEntries.length} {filteredEntries.length === 1 ? 'Entry' : 'Entries'}
                    </h2>
                    <button 
                        onClick={handleClearFilters}
                        className="text-sm font-medium text-primary hover:text-primary-dark"
                        style={{color: 'var(--color-primary-hex)'}}
                    >
                        Clear Filters
                    </button>
                </div>
                
                {filteredEntries.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredEntries.map(entry => (
                            <EntryItem
                                key={entry.id}
                                entry={entry}
                                onSelect={handleSelectEntry}
                                onDelete={handleDeleteEntry}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <p className="text-slate-500 dark:text-gray-400">No entries found.</p>
                        <p className="text-slate-500 dark:text-gray-400 text-sm">Try adjusting your filters or creating a new entry.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
