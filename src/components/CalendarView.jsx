import React, { useState, useMemo } from 'react';
import Calendar from 'react-calendar';
import { Bell, X, BookOpen, Plus } from 'lucide-react';
import { keyToDate, dateToKey } from '../utils';

function CalendarView({ reminders, onAddReminder, onDeleteReminder, entries, onSelect }) {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [newReminderText, setNewReminderText] = useState('');

    const remindersByDate = useMemo(() => {
        return reminders.reduce((acc, reminder) => {
            const dateStr = reminder.date;
            if (!acc[dateStr]) {
                acc[dateStr] = [];
            }
            acc[dateStr].push(reminder);
            return acc;
        }, {});
    }, [reminders]);

    const entriesByDate = useMemo(() => {
        return entries.reduce((acc, entry) => {
            if (entry.createdAtDate) {
                const dateStr = dateToKey(entry.createdAtDate);
                if (!acc[dateStr]) {
                    acc[dateStr] = [];
                }
                acc[dateStr].push(entry);
            }
            return acc;
        }, {});
    }, [entries]);

    const upcomingReminders = useMemo(() => {
        const today = dateToKey(new Date());
        return reminders
            .filter(r => r.date >= today)
            .sort((a, b) => a.date.localeCompare(b.date));
    }, [reminders]);
    
    const selectedDateKey = dateToKey(selectedDate);
    const remindersForSelectedDate = remindersByDate[selectedDateKey] || [];
    const entriesForSelectedDate = entriesByDate[selectedDateKey] || [];

    const handleAddReminder = (e) => {
        e.preventDefault();
        if (newReminderText.trim() && selectedDate) {
            onAddReminder(newReminderText.trim(), selectedDate);
            setNewReminderText('');
        }
    };

    const tileContent = ({ date, view }) => {
        if (view === 'month') {
            const dateStr = dateToKey(date);
            const hasReminder = remindersByDate[dateStr] && remindersByDate[dateStr].length > 0;
            const hasEntry = entriesByDate[dateStr] && entriesByDate[dateStr].length > 0;
            
            if (hasReminder && hasEntry) {
                 return (
                    <>
                        <Bell size={12} className="reminder-bell-marker" style={{ top: '4px', left: '35%' }} />
                        <BookOpen size={12} className="entry-book-marker" style={{ color: 'var(--color-primary-hex)', position: 'absolute', top: '4px', left: '65%' }} />
                    </>
                );
            } else if (hasReminder) {
                return <Bell size={12} className="reminder-bell-marker" />;
            } else if (hasEntry) {
                 return <BookOpen size={12} className="entry-book-marker" style={{ color: 'var(--color-primary-hex)', position: 'absolute', top: '4px', left: '50%', transform: 'translateX(-50%)' }} />;
            }
        }
        return null;
    };

    const tileClassName = ({ date, view }) => {
        if (view === 'month') {
            const dateStr = dateToKey(date);
            if (entriesByDate[dateStr] && entriesByDate[dateStr].length > 0) {
                return 'has-entry';
            }
        }
        return null;
    };

    return (
        <div className="flex flex-col md:flex-row h-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white overflow-hidden">
            <div className="flex-1 md:flex-auto md:w-2/3 lg:w-3/4 p-4 md:p-6 overflow-y-auto custom-scrollbar">
                <div className="max-w-3xl mx-auto">
                    <div className="bg-white dark:bg-slate-900 rounded-lg shadow p-4">
                        <Calendar
                            onChange={setSelectedDate}
                            value={selectedDate}
                            tileContent={tileContent}
                            tileClassName={tileClassName}
                            className="react-calendar-override"
                        />
                    </div>

                    <div className="mt-6">
                        <h3 className="text-xl font-semibold mb-3 text-slate-900 dark:text-white">
                            Events for {selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </h3>
                        
                        <form onSubmit={handleAddReminder} className="mb-4 p-4 bg-white dark:bg-slate-900 rounded-lg shadow">
                            <label htmlFor="reminder-text" className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">New Reminder</label>
                            <div className="flex space-x-2">
                                <input
                                    id="reminder-text"
                                    type="text"
                                    value={newReminderText}
                                    onChange={(e) => setNewReminderText(e.target.value)}
                                    className="form-input flex-1 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-slate-300 dark:border-slate-700 rounded-md"
                                    placeholder="Add a new reminder..."
                                />
                                <button
                                    type="submit"
                                    className="flex items-center justify-center px-4 py-2 rounded-md text-white font-semibold transition-colors focus:outline-none focus:ring-2"
                                    style={{ backgroundColor: 'var(--color-primary-hex)', '--tw-ring-color': 'var(--color-primary-hex)' }}
                                >
                                    <Plus size={18} />
                                </button>
                            </div>
                        </form>

                        <div className="space-y-4">
                            {remindersForSelectedDate.length > 0 && (
                                <div>
                                    <h4 className="text-lg font-semibold mb-2 flex items-center text-amber-500">
                                        <Bell size={18} className="mr-2" /> Reminders
                                    </h4>
                                    <ul className="space-y-2">
                                        {remindersForSelectedDate.map(reminder => (
                                            <li key={reminder.id} className="flex justify-between items-center p-3 bg-white dark:bg-slate-900 rounded-lg shadow-sm">
                                                <span className="text-slate-800 dark:text-gray-200">{reminder.text}</span>
                                                <button onClick={() => onDeleteReminder(reminder.id)} className="text-red-500 hover:text-red-700 dark:hover:text-red-400 p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50">
                                                    <X size={16} />
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {entriesForSelectedDate.length > 0 && (
                                <div>
                                    <h4 className="text-lg font-semibold mb-2 flex items-center" style={{ color: 'var(--color-primary-hex)' }}>
                                        <BookOpen size={18} className="mr-2" /> Journal Entries
                                    </h4>
                                    <ul className="space-y-2">
                                        {entriesForSelectedDate.map(entry => (
                                            <li key={entry.id} className="p-3 bg-white dark:bg-slate-900 rounded-lg shadow-sm">
                                                <button onClick={() => onSelect(entry.id)} className="text-left w-full">
                                                    <h5 className="font-semibold text-primary" style={{ color: 'var(--color-primary-hex)' }}>{entry.title || "Untitled"}</h5>
                                                    <p className="text-sm text-slate-600 dark:text-gray-400 truncate">
                                                        {entry.content ? entry.content.substring(0, 100) + '...' : 'No content'}
                                                    </p>
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {remindersForSelectedDate.length === 0 && entriesForSelectedDate.length === 0 && (
                                <div className="text-center p-6 bg-white dark:bg-slate-900 rounded-lg shadow-sm">
                                    <p className="text-slate-500 dark:text-gray-400">No entries or reminders for this date.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="md:w-1/3 lg:w-1/4 h-full md:border-l border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-y-auto custom-scrollbar flex-shrink-0">
                <div className="p-4">
                    <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">Upcoming Reminders</h3>
                    {upcomingReminders.length > 0 ? (
                        <ul className="space-y-3">
                            {upcomingReminders.map(reminder => (
                                <li key={reminder.id} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg flex justify-between items-start">
                                    <div>
                                        <p className="text-sm font-medium text-slate-800 dark:text-gray-200">{reminder.text}</p>
                                        <p className="text-xs font-medium text-amber-600 dark:text-amber-400">
                                            {keyToDate(reminder.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                                        </p>
                                    </div>
                                    <button onClick={() => onDeleteReminder(reminder.id)} className="text-red-500 hover:text-red-700 dark:hover:text-red-400 p-1 -mr-1 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50 flex-shrink-0">
                                        <X size={16} />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                            <p className="text-sm text-slate-500 dark:text-gray-400">Your schedule is clear.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default CalendarView;
