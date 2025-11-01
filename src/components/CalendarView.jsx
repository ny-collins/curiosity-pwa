import React, { useState } from 'react';
import BaseCalendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { Plus, X, BookOpen, Clock } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { getEntryType } from '../constants.js';
import { keyToDate, dateToKey } from '../utils.js';

const TimePicker = ({ value, onChange }) => {
    const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
    const minutes = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, '0'));
    
    const [hour, minute] = value.split(':');

    const handleHourChange = (e) => onChange(`${e.target.value}:${minute}`);
    const handleMinuteChange = (e) => onChange(`${hour}:${e.target.value}`);

    return (
        <div className="flex items-center space-x-2">
            <select value={hour} onChange={handleHourChange} className="form-select bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 rounded-md">
                {hours.map(h => <option key={h} value={h}>{h}</option>)}
            </select>
            <span className="font-bold">:</span>
            <select value={minute} onChange={handleMinuteChange} className="form-select bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 rounded-md">
                {minutes.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
        </div>
    );
};

export default function CalendarView() {
    const {
        reminders,
        entries,
        handleAddReminder,
        handleDeleteReminder,
        handleSelectEntry
    } = useAppContext();

    const [selectedDate, setSelectedDate] = useState(new Date());
    const [reminderText, setReminderText] = useState('');
    const [reminderTime, setReminderTime] = useState('09:00');

    const onDateChange = (date) => {
        setSelectedDate(date);
    };

    const submitReminder = (e) => {
        e.preventDefault();
        if (!reminderText.trim()) return;

        const [hour, minute] = reminderTime.split(':');
        const reminderDate = new Date(selectedDate);
        reminderDate.setHours(parseInt(hour, 10), parseInt(minute, 10), 0, 0);
        
        handleAddReminder(reminderText, reminderDate);
        setReminderText('');
    };

    const selectedDateKey = dateToKey(selectedDate, true);
    
    const dailyReminders = reminders.filter(r => r.date && r.date.startsWith(selectedDateKey));
    dailyReminders.sort((a, b) => a.date.localeCompare(b.date));
    
    const dailyEntries = entries.filter(e => e.createdAtDate && dateToKey(e.createdAtDate, true) === selectedDateKey);
    dailyEntries.sort((a, b) => b.createdAtDate - a.createdAtDate);

    return (
        <div className="flex flex-col md:flex-row h-full overflow-hidden bg-slate-50 dark:bg-slate-800">
            <div className="flex-1 p-4 md:p-6 overflow-y-auto custom-scrollbar">
                <div className="bg-white dark:bg-slate-900 rounded-lg shadow border border-slate-200 dark:border-slate-700">
                    <BaseCalendar
                        onChange={onDateChange}
                        value={selectedDate}
                        className="react-calendar-themed"
                        tileContent={({ date, view }) => {
                            if (view === 'month') {
                                const dateKey = dateToKey(date, true);
                                const hasReminder = reminders.some(r => r.date && r.date.startsWith(dateKey));
                                const hasEntry = entries.some(e => e.createdAtDate && dateToKey(e.createdAtDate, true) === dateKey);
                                return (
                                    <div className="flex justify-center items-center space-x-1 pt-1">
                                        {hasReminder && <span className="h-1.5 w-1.5 bg-red-500 rounded-full"></span>}
                                        {hasEntry && <span className="h-1.5 w-1.5 bg-primary rounded-full" style={{backgroundColor: 'var(--color-primary-hex)'}}></span>}
                                    </div>
                                );
                            }
                            return null;
                        }}
                    />
                </div>
            </div>
            
            <div className="w-full md:w-96 flex-shrink-0 border-l border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex flex-col">
                <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                        {selectedDate.toLocaleDateString('default', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </h2>
                </div>
                
                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6">
                    <div>
                        <h3 className="text-sm font-semibold uppercase text-slate-500 dark:text-gray-400 mb-3">Reminders</h3>
                        <form onSubmit={submitReminder} className="mb-4 space-y-2">
                            <input
                                type="text"
                                value={reminderText}
                                onChange={(e) => setReminderText(e.target.value)}
                                placeholder="New reminder..."
                                className="form-input w-full bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 rounded-md"
                            />
                            <div className="flex justify-between items-center">
                                <TimePicker value={reminderTime} onChange={setReminderTime} />
                                <button
                                    type="submit"
                                    className="p-2 rounded-full text-white"
                                    style={{ backgroundColor: 'var(--color-primary-hex)' }}
                                >
                                    <Plus size={18} />
                                </button>
                            </div>
                        </form>
                        
                        <div className="space-y-2">
                            {dailyReminders.length > 0 ? dailyReminders.map(r => {
                                const time = r.date.substring(11).replace('-', ':');
                                return (
                                    <div key={r.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-md">
                                        <div className="flex items-center space-x-2">
                                            <Clock size={14} className="text-slate-500 dark:text-gray-400" />
                                            <div>
                                                <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{r.text}</span>
                                                <span className="block text-xs text-slate-500 dark:text-gray-400">{time}</span>
                                            </div>
                                        </div>
                                        <button onClick={() => handleDeleteReminder(r.id)} className="p-1 rounded-full text-slate-400 hover:text-red-500">
                                            <X size={16} />
                                        </button>
                                    </div>
                                );
                            }) : (
                                <p className="text-sm text-slate-500 dark:text-gray-400 italic">No reminders for this day.</p>
                            )}
                        </div>
                    </div>
                    
                    <div>
                        <h3 className="text-sm font-semibold uppercase text-slate-500 dark:text-gray-400 mb-3">Entries</h3>
                        <div className="space-y-2">
                            {dailyEntries.length > 0 ? dailyEntries.map(e => {
                                const entryType = getEntryType(e.type);
                                return (
                                    <button 
                                        key={e.id} 
                                        onClick={() => handleSelectEntry(e.id)}
                                        className="w-full text-left flex items-center space-x-2 p-3 bg-slate-50 dark:bg-slate-800 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700"
                                    >
                                        <entryType.icon size={14} className="text-slate-500 dark:text-gray-400" />
                                        <span className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{e.title || "Untitled Entry"}</span>
                                    </button>
                                );
                            }) : (
                                <p className="text-sm text-slate-500 dark:text-gray-400 italic">No entries for this day.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
