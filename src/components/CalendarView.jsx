import React, { useState, useMemo } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { useAppState } from '../contexts/StateProvider';
import { format, isSameDay } from 'date-fns';
import { BookOpen } from 'lucide-react';
import { getEntryType } from '../constants';

const EntryTile = ({ entry, onSelect }) => {
    const type = getEntryType(entry.type);
    return (
        <div 
            onClick={() => onSelect(entry.id)} 
            className="flex items-center space-x-2 p-2 -mx-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
        >
            <type.icon size={16} className="text-primary flex-shrink-0" style={{ color: 'var(--color-primary-hex)' }} />
            <div className="truncate">
                <h4 className="text-sm font-semibold text-slate-800 dark:text-white truncate">
                    {entry.title || "Untitled"}
                </h4>
                <p className="text-xs text-slate-500 dark:text-gray-400 truncate">
                    {entry.content?.replace(/<[^>]+>/g, '') || "No content"}
                </p>
            </div>
        </div>
    );
};

export default function CalendarView() {
    const { allEntries, handleSelectEntry } = useAppState();
    const [activeDate, setActiveDate] = useState(new Date());

    const entriesByDate = useMemo(() => {
        const map = new Map();
        if (!allEntries) return map;
        
        allEntries.forEach(entry => {
            const date = entry.createdAt;
            if (!date) return;
            
            const dateKey = format(date, 'yyyy-MM-dd');
            if (!map.has(dateKey)) {
                map.set(dateKey, []);
            }
            map.get(dateKey).push(entry);
        });
        return map;
    }, [allEntries]);

    const entriesOnSelectedDate = useMemo(() => {
        const dateKey = format(activeDate, 'yyyy-MM-dd');
        return entriesByDate.get(dateKey) || [];
    }, [activeDate, entriesByDate]);

    const tileClassName = ({ date, view }) => {
        if (view === 'month') {
            const dateKey = format(date, 'yyyy-MM-dd');
            if (entriesByDate.has(dateKey)) {
                return 'has-entry';
            }
        }
        return null;
    };
    
    const tileContent = ({ date, view }) => {
        if (view === 'month') {
            const dateKey = format(date, 'yyyy-MM-dd');
            if (entriesByDate.has(dateKey)) {
                return <div className="entry-dot" style={{ backgroundColor: 'var(--color-primary-hex)' }} />;
            }
        }
        return null;
    };

    return (
        <div className="flex flex-col md:flex-row h-full overflow-hidden">
            <div className="md:w-1/2 lg:w-3/5 p-4 overflow-y-auto custom-scrollbar">
                <Calendar
                    onChange={setActiveDate}
                    value={activeDate}
                    className="w-full border-none p-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    tileClassName={tileClassName}
                    tileContent={tileContent}
                />
            </div>
            <div className="md:w-1/2 lg:w-2/5 p-4 border-l border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex flex-col overflow-y-auto custom-scrollbar">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                    Entries for {format(activeDate, 'MMMM d, yyyy')}
                </h3>
                <div className="space-y-2">
                    {entriesOnSelectedDate.length > 0 ? (
                        entriesOnSelectedDate.map(entry => (
                            <EntryTile key={entry.id} entry={entry} onSelect={handleSelectEntry} />
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center text-slate-500 dark:text-gray-400 pt-10">
                            <BookOpen size={32} className="mb-2" />
                            <p className="text-sm">No entries for this day.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}