import React, { useState } from 'react';
import { Search, X, SlidersHorizontal, BookOpen, ChevronDown, Tag, Type } from 'lucide-react';
import { stripMarkdown, formatTimestamp } from '../utils.js';
import { ENTRY_TYPES, getEntryType } from '../constants.js';

function EntryItem({ entry, onSelect }) {
    const title = entry.title || 'Untitled';
    const snippet = stripMarkdown(entry.content || '').substring(0, 100);
    const timestamp = entry.updatedAt || entry.createdAt;
    const formattedTime = timestamp ? formatTimestamp(timestamp) : '';
    const EntryIcon = getEntryType(entry.type).icon;

    return (
        <button
            onClick={() => onSelect(entry.id)}
            className="w-full text-left p-4 rounded-lg transition-colors duration-150 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2"
            style={{'--tw-ring-color': 'var(--color-primary-hex)'}}
        >
            <div className="flex items-center justify-between mb-1">
                <div className="flex items-center space-x-2">
                    <EntryIcon size={16} className="text-primary flex-shrink-0" style={{ color: 'var(--color-primary-hex)'}} />
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white truncate">{title}</h3>
                </div>
                <span className="text-xs text-slate-500 dark:text-gray-400 flex-shrink-0 ml-2">{formattedTime}</span>
            </div>
            <p className="text-sm text-slate-600 dark:text-gray-300 line-clamp-2 mb-2">{snippet}</p>
            <div className="flex flex-wrap gap-1">
                {entry.tags?.map(tag => (
                    <span key={tag} className="text-xs font-medium px-2 py-0.5 rounded" style={{ backgroundColor: 'var(--color-primary-hex-20)', color: 'var(--color-primary-hex)'}}>
                        {tag}
                    </span>
                ))}
            </div>
        </button>
    );
}

function FilterBar({
    searchTerm, onSearchChange,
    filterYear, onFilterYearChange,
    filterMonth, onFilterMonthChange,
    availableYears,
    filterTag, onFilterTagChange,
    availableTags,
    filterType, onFilterTypeChange,
    availableTypes,
    onClearFilters
}) {
    const [showFilters, setShowFilters] = useState(false);
    const months = [
        "01_Jan", "02_Feb", "03_Mar", "04_Apr", "05_May", "06_Jun",
        "07_Jul", "08_Aug", "09_Sep", "10_Oct", "11_Nov", "12_Dec"
    ];

    return (
        <div className="p-4 space-y-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
            <div className="flex space-x-2">
                <div className="relative flex-grow">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                        <Search size={18} className="text-slate-500 dark:text-gray-400" />
                    </span>
                    <input
                        type="text"
                        placeholder="Search entries..."
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="form-input w-full pl-10 pr-4 py-2 rounded-lg text-sm bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-transparent focus:border-primary focus:ring-1 focus:ring-primary"
                        style={{'--tw-ring-color': 'var(--color-primary-hex)', '--tw-border-color': 'var(--color-primary-hex)'}}
                    />
                </div>
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="p-2 rounded-lg text-slate-500 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-primary focus:outline-none focus:ring-2"
                    style={{'--tw-ring-color': 'var(--color-primary-hex)'}}
                    aria-label="Toggle filters"
                    title="Toggle filters"
                >
                    <SlidersHorizontal size={18} />
                </button>
            </div>
            
            {showFilters && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="relative">
                        <label htmlFor="filterType" className="absolute -top-2 left-2 inline-block bg-white dark:bg-slate-900 px-1 text-xs font-medium text-slate-500 dark:text-gray-400">
                            Type
                        </label>
                        <div className="relative">
                             <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <Type size={16} className="text-slate-500 dark:text-gray-400" />
                            </span>
                            <select
                                id="filterType"
                                value={filterType}
                                onChange={(e) => onFilterTypeChange(e.target.value)}
                                className="form-select block w-full appearance-none rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white py-2 pl-9 pr-8 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary"
                                style={{'--tw-ring-color': 'var(--color-primary-hex)', '--tw-border-color': 'var(--color-primary-hex)'}}
                            >
                                <option value="All">All Types</option>
                                {availableTypes.map(type => (
                                    <option key={type.value} value={type.value}>{type.label}</option>
                                ))}
                            </select>
                            <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                                <ChevronDown size={16} className="text-slate-500 dark:text-gray-400" />
                            </span>
                        </div>
                    </div>

                    <div className="relative">
                        <label htmlFor="filterTag" className="absolute -top-2 left-2 inline-block bg-white dark:bg-slate-900 px-1 text-xs font-medium text-slate-500 dark:text-gray-400">
                            Tag
                        </label>
                        <div className="relative">
                             <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <Tag size={16} className="text-slate-500 dark:text-gray-400" />
                            </span>
                            <select
                                id="filterTag"
                                value={filterTag}
                                onChange={(e) => onFilterTagChange(e.target.value)}
                                className="form-select block w-full appearance-none rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white py-2 pl-9 pr-8 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary"
                                style={{'--tw-ring-color': 'var(--color-primary-hex)', '--tw-border-color': 'var(--color-primary-hex)'}}
                            >
                                <option value="All">All Tags</option>
                                {availableTags.map(tag => (
                                    <option key={tag} value={tag}>{tag}</option>
                                ))}
                            </select>
                            <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                                <ChevronDown size={16} className="text-slate-500 dark:text-gray-400" />
                            </span>
                        </div>
                    </div>
                    
                    <div className="relative">
                        <label htmlFor="filterYear" className="absolute -top-2 left-2 inline-block bg-white dark:bg-slate-900 px-1 text-xs font-medium text-slate-500 dark:text-gray-400">
                            Year
                        </label>
                        <select
                            id="filterYear"
                            value={filterYear}
                            onChange={(e) => onFilterYearChange(e.target.value)}
                            className="form-select block w-full appearance-none rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white py-2 px-3 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary"
                            style={{'--tw-ring-color': 'var(--color-primary-hex)', '--tw-border-color': 'var(--color-primary-hex)'}}
                        >
                            <option value="All">All Years</option>
                            {availableYears.map(year => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>
                    </div>
                    
                    <div className="relative">
                         <label htmlFor="filterMonth" className="absolute -top-2 left-2 inline-block bg-white dark:bg-slate-900 px-1 text-xs font-medium text-slate-500 dark:text-gray-400">
                            Month
                        </label>
                        <select
                            id="filterMonth"
                            value={filterMonth}
                            onChange={(e) => onFilterMonthChange(e.target.value)}
                            disabled={filterYear === 'All'}
                            className="form-select block w-full appearance-none rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white py-2 px-3 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{'--tw-ring-color': 'var(--color-primary-hex)', '--tw-border-color': 'var(--color-primary-hex)'}}
                        >
                            <option value="All">All Months</option>
                            {months.map((month, index) => (
                                <option key={month} value={index + 1}>{month.split('_')[1]}</option>
                            ))}
                        </select>
                    </div>
                    
                    <button
                        onClick={onClearFilters}
                        className="w-full sm:col-span-4 py-2 px-3 rounded-md text-sm font-medium text-slate-700 dark:text-gray-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 focus:outline-none focus:ring-2"
                        style={{'--tw-ring-color': 'var(--color-primary-hex)'}}
                    >
                        Clear All Filters
                    </button>
                </div>
            )}
        </div>
    );
}

function EmptyState() {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <div className="p-4 rounded-full bg-slate-100 dark:bg-slate-800" style={{ backgroundColor: 'var(--color-primary-hex-10)'}}>
                <BookOpen size={48} className="text-primary" style={{ color: 'var(--color-primary-hex)'}} />
            </div>
            <h3 className="mt-4 text-xl font-semibold text-slate-900 dark:text-white">No Entries Found</h3>
            <p className="mt-2 text-sm text-slate-500 dark:text-gray-400">
                It looks like there are no entries matching your filters. <br /> Try adjusting your search or create a new entry.
            </p>
        </div>
    );
}

function EntryList({
    entries,
    searchTerm, onSearchChange,
    filterYear, onFilterYearChange,
    filterMonth, onFilterMonthChange,
    availableYears,
    filterTag, onFilterTagChange,
    availableTags,
    filterType, onFilterTypeChange,
    availableTypes,
    onSelect,
    onClearFilters
}) {
    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900">
            <FilterBar
                searchTerm={searchTerm} onSearchChange={onSearchChange}
                filterYear={filterYear} onFilterYearChange={onFilterYearChange}
                filterMonth={filterMonth} onFilterMonthChange={onFilterMonthChange}
                availableYears={availableYears}
                filterTag={filterTag} onFilterTagChange={onFilterTagChange}
                availableTags={availableTags}
                filterType={filterType} onFilterTypeChange={onFilterTypeChange}
                availableTypes={availableTypes}
                onClearFilters={onClearFilters}
            />
            
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6 space-y-3">
                {entries.length > 0 ? (
                    entries.map(entry => (
                        <EntryItem
                            key={entry.id}
                            entry={entry}
                            onSelect={onSelect}
                        />
                    ))
                ) : (
                    <EmptyState />
                )}
            </div>
        </div>
    );
}

export default EntryList;
