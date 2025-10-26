import React from 'react';
import SidebarEntry from './SidebarEntry';
// Added XCircle for Clear Filters button
import { Search, CalendarDays, XCircle } from 'lucide-react'; 

// Added onClearFilters prop
function EntryList({
    entries,
    searchTerm, onSearchChange,
    filterYear, onFilterYearChange,
    filterMonth, onFilterMonthChange,
    availableYears, 
    onSelect, onDelete, activeEntryId,
    onClearFilters // New prop
}) {

    const months = ["All Months", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    
    // Determine if any filters are active
    const isAnyFilterActive = searchTerm || filterYear !== 'All'; // Month is dependent on Year

    return (
        <div className="flex flex-col flex-1 h-full overflow-hidden">
            {/* Search and Filter Area */}
            <div className="p-4 flex-shrink-0 space-y-4">
                {/* Search Bar */}
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search entries..."
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="form-input w-full bg-slate-700 text-white rounded-md border-slate-600 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 p-2 pl-10 text-sm"
                    />
                    <div className="absolute left-3 top-0 bottom-0 flex items-center pointer-events-none">
                        <Search size={18} className="text-gray-400" />
                    </div>
                </div>
                {/* Date Filters Row - Added flex-wrap and gap */}
                <div className="flex items-center flex-wrap gap-x-3 gap-y-2 text-sm"> {/* Use gap for spacing */}
                     <div className="flex items-center flex-shrink-0"> {/* Group icon and label */}
                        <CalendarDays size={18} className="text-gray-400 mr-1" />
                        <span className="text-xs text-gray-400">Filter:</span>
                     </div>
                     {/* Year Filter */}
                     <div className="flex items-center space-x-1"> 
                         <label htmlFor="filter-year" className="text-xs text-gray-400">Year:</label>
                            <select
                                id="filter-year"
                                value={filterYear}
                                onChange={(e) => onFilterYearChange(e.target.value)}
                                className="form-select bg-slate-700 text-white rounded border border-slate-600 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 py-1 pl-2 pr-7 text-xs focus:outline-none cursor-pointer" 
                                aria-label="Filter by Year"
                            >
                                <option value="All">All</option>
                                {availableYears.map(year => <option key={year} value={year}>{year}</option>)}
                            </select>
                     </div>
                      {/* Month Filter */}
                     <div className="flex items-center space-x-1"> 
                          <label htmlFor="filter-month" className="text-xs text-gray-400">Month:</label>
                                <select
                                    id="filter-month"
                                    value={filterMonth}
                                    onChange={(e) => onFilterMonthChange(e.target.value)}
                                    disabled={filterYear === 'All'}
                                    className="form-select bg-slate-700 text-white rounded border border-slate-600 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 py-1 pl-2 pr-7 text-xs focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer" 
                                    aria-label="Filter by Month"
                                >
                                    {months.map((month, index) => <option key={month} value={index === 0 ? 'All' : index}>{month}</option>)}
                                </select>
                     </div>
                     {/* Clear Filters Button - Conditionally Rendered */}
                     {isAnyFilterActive && (
                         <button 
                            onClick={onClearFilters}
                            className="flex items-center text-xs text-gray-400 hover:text-red-400 p-1 rounded hover:bg-slate-700 focus:outline-none focus:ring-1 focus:ring-red-500"
                            title="Clear Filters"
                         >
                            <XCircle size={14} className="mr-1"/> Clear
                         </button>
                     )}
                </div>
            </div>

            {/* List Area */}
            <div className={`flex-grow overflow-y-auto custom-scrollbar border-t border-slate-700 ${entries.length === 0 ? 'flex items-center justify-center' : 'p-4 space-y-2'}`}>
                {/* ... list rendering ... */}
                {entries.length > 0 ? (
                    <div className="w-full">
                        {entries.map(entry => (
                            <SidebarEntry
                                key={entry.id}
                                entry={entry}
                                onSelect={onSelect}
                                onDelete={onDelete}
                                isActive={entry.id === activeEntryId}
                            />
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500 text-center p-4">
                        {searchTerm || filterYear !== 'All' ? 'No entries match your filters.' : 'No entries yet.'}
                    </p>
                )}
            </div>
        </div>
    );
}

export default EntryList;
