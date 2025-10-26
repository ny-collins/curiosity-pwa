import React, { useState, useMemo } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { Bell, Trash2 } from 'lucide-react'; 
import { dateToKey, keyToDate } from '../utils'; 

function CalendarView({ reminders, onAddReminder, onDeleteReminder }) {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [newReminderText, setNewReminderText] = useState("");
    const datesWithReminders = useMemo(() => {
        const dates = new Set();
        reminders.forEach(reminder => {
            if (reminder.date) { 
                dates.add(reminder.date);
            }
        });
        return dates;
    }, [reminders]);

    const remindersForSelectedDate = useMemo(() => {
        const selectedDateKey = dateToKey(selectedDate); // Use helper
        if (!selectedDateKey) return [];
        return reminders
            .filter(reminder => reminder.date === selectedDateKey)
            .sort((a, b) => (a.createdAt?.toMillis() || 0) - (b.createdAt?.toMillis() || 0));
    }, [reminders, selectedDate]);

    const upcomingReminders = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0); 
        const todayKey = dateToKey(today);
        const sevenDaysLater = new Date(today);
        sevenDaysLater.setDate(today.getDate() + 7);

        const sevenDaysLaterKey = dateToKey(sevenDaysLater); 

        return reminders
            .filter(reminder => {
                return reminder.date && reminder.date >= todayKey && reminder.date < sevenDaysLaterKey; 
            })
            .sort((a, b) => {
                 const dateComparison = (a.date || "").localeCompare(b.date || "");
                 if (dateComparison !== 0) return dateComparison;
                 return (a.createdAt?.toMillis() || 0) - (b.createdAt?.toMillis() || 0);
            });
    }, [reminders]);

    const tileContent = ({ date, view }) => {
         if (view === 'month') {
            const dateString = dateToKey(date);
            if (dateString && datesWithReminders.has(dateString)) {
                return <Bell className="reminder-bell-marker" size={12} />;
            }
        }
        return null;
    }

    const handleAddReminder = () => {
        if (!newReminderText.trim()) return; 
        onAddReminder(newReminderText, selectedDate);
        setNewReminderText(""); 
    };

    const handleInputKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleAddReminder();
        }
    };


    return (
        <div className="flex-1 flex flex-col md:flex-row md:space-x-4 overflow-y-auto p-4 custom-scrollbar">
            {/* Left Column: Calendar */}
            <div className="calendar-container-wrapper md:w-1/2 lg:w-2/5 flex-shrink-0 mb-4 md:mb-0">
                <div className="bg-slate-800 rounded-lg p-3 shadow sticky top-0"> 
                    <Calendar
                        onChange={setSelectedDate}
                        value={selectedDate}
                        tileContent={tileContent}
                        className="react-calendar-override"
                    />
                </div>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto custom-scrollbar"> 

                <div className="bg-slate-800 rounded-lg p-3 shadow">
                     <h4 className="text-sm font-semibold text-teal-400 mb-3 border-b border-slate-700 pb-2">
                        Reminders for {selectedDate.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                    </h4>

                     <div className="flex space-x-2 mb-3">
                         <input
                            type="text"
                            value={newReminderText}
                            onChange={(e) => setNewReminderText(e.target.value)}
                            onKeyPress={handleInputKeyPress}
                            placeholder="Add a reminder for this date..."
                            className="flex-grow bg-slate-700 text-white rounded-md border-slate-600 focus:border-teal-500 focus:ring-teal-500 p-2 text-sm"
                        />
                        <button
                            onClick={handleAddReminder}
                            disabled={!newReminderText.trim()}
                            className="text-sm bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2 px-3 rounded focus:outline-none focus:ring-2 focus:ring-teal-400 disabled:bg-slate-500 disabled:cursor-not-allowed flex-shrink-0"
                        >
                            Add
                        </button>
                     </div>

                    {/* List of existing reminders for selected date */}
                    {remindersForSelectedDate.length > 0 ? (
                        <div className="space-y-2">
                            {remindersForSelectedDate.map(reminder => (
                                <div key={reminder.id} className="text-sm text-gray-300 p-2 rounded bg-slate-700 flex justify-between items-center">
                                    <span>{reminder.text}</span>
                                    <button
                                        onClick={() => onDeleteReminder(reminder.id)}
                                        className="p-1 rounded text-gray-500 hover:text-red-400 hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                                        aria-label="Delete reminder"
                                        title="Delete reminder"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-center py-4 text-sm">No reminders for this date.</p>
                    )}
                </div>

                 {/* Section: Upcoming Reminders */}
                 <div className="bg-slate-800 rounded-lg p-3 shadow">
                     <h4 className="text-sm font-semibold text-teal-400 mb-3 border-b border-slate-700 pb-2">
                        Upcoming (Next 7 Days)
                    </h4>
                    {upcomingReminders.length > 0 ? (
                        <div className="space-y-2">
                            {upcomingReminders.map(reminder => (
                                <div key={reminder.id} className="text-sm text-gray-300 p-2 rounded bg-slate-700 flex justify-between items-center">
                                    <div className="flex flex-col">
                                        <span>{reminder.text}</span>
                                        {/* Use keyToDate helper */}
                                        <span className="text-xs text-gray-400">{keyToDate(reminder.date)?.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                                    </div>
                                    <button
                                        onClick={() => onDeleteReminder(reminder.id)}
                                        className="p-1 rounded text-gray-500 hover:text-red-400 hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                                        aria-label="Delete reminder"
                                        title="Delete reminder"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-center py-4 text-sm">No upcoming reminders in the next week.</p>
                    )}
                 </div>
            </div>

            <style>{`
                /* --- Calendar theme overrides remain the same --- */
                 .react-calendar-override { width: 100%; border: none; background: transparent; font-family: inherit; }
                .react-calendar-override button { color: #cbd5e1; border-radius: 0.375rem; transition: background-color 0.2s ease-in-out, color 0.2s ease-in-out; border: none; padding: 0.5em; }
                .react-calendar-override button:enabled:hover { background-color: #334155; }
                .react-calendar-override button:enabled:focus { outline: 2px solid transparent; outline-offset: 2px; box-shadow: 0 0 0 2px #5eead4; }
                .react-calendar-override .react-calendar__navigation button { min-width: 40px; background: none; font-size: 0.9rem; font-weight: 600; color: #f1f5f9; }
                .react-calendar-override .react-calendar__navigation button:enabled:hover { background-color: #334155; }
                .react-calendar-override .react-calendar__navigation button:disabled { color: #475569; background-color: transparent !important; }
                .react-calendar-override .react-calendar__month-view__weekdays__weekday { text-align: center; text-transform: uppercase; font-weight: 600; font-size: 0.7rem; color: #94a3b8; padding-bottom: 0.5rem; }
                .react-calendar-override .react-calendar__month-view__weekdays__weekday abbr { text-decoration: none; }
                .react-calendar-override .react-calendar__month-view__days__day { color: #cbd5e1; }
                .react-calendar-override .react-calendar__month-view__days__day--weekend { color: #fbbf24; }
                .react-calendar-override .react-calendar__month-view__days__day--neighboringMonth { color: #475569; }
                .react-calendar-override .react-calendar__tile { height: auto; aspect-ratio: 1 / 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 0.1rem; position: relative; font-size: 0.8rem; line-height: 1; }
                .react-calendar-override .react-calendar__tile abbr { display: block; }
                .react-calendar-override .react-calendar__tile--now { background: #334155; color: #5eead4; font-weight: bold; border-radius: 0.375rem; }
                .react-calendar-override .react-calendar__tile--now:hover { background: #475569; }
                .react-calendar-override .react-calendar__tile--active { background: #0d9488; color: white; font-weight: bold; border-radius: 0.375rem; }
                .react-calendar-override .react-calendar__tile--active:enabled:hover, .react-calendar-override .react-calendar__tile--active:enabled:focus { background: #0f766e; }
                .react-calendar-override .reminder-bell-marker { color: #fbbf24; position: absolute; top: 4px; left: 50%; transform: translateX(-50%); }
                .react-calendar-override .react-calendar__tile--active .reminder-bell-marker, .react-calendar-override .react-calendar__tile--now .reminder-bell-marker { color: #f1f5f9; }
                .react-calendar-override .react-calendar__tile:has(.reminder-bell-marker) abbr { margin-top: 14px; }
                .react-calendar__year-view__months__month, .react-calendar__decade-view__years__year, .react-calendar__century-view__decades__decade { color: #cbd5e1; padding: 1em 0.5em; border-radius: 0.375rem; }
                .react-calendar__year-view__months__month:enabled:hover, .react-calendar__decade-view__years__year:enabled:hover, .react-calendar__century-view__decades__decade:enabled:hover { background-color: #334155; }
                .react-calendar__tile--hasActive { background: #334155 !important; color: #5eead4 !important; font-weight: bold; border-radius: 0.375rem; }

            `}</style>
        </div>
    );
}

export default CalendarView;
