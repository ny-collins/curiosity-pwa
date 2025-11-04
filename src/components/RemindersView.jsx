import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Plus, Trash2, Calendar, Clock, AlertTriangle } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { format, parseISO, isPast, isToday, isFuture } from 'date-fns';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

const ReminderItem = ({ reminder, onDelete }) => {
    const date = parseISO(reminder.date);
    const isOverdue = isPast(date) && !isToday(date);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className={`flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-lg shadow-md border ${isOverdue ? 'border-red-500/30' : 'border-slate-200 dark:border-slate-700'}`}
        >
            <div className="flex-1">
                <p className={`text-base font-medium ${isOverdue ? 'text-red-600 dark:text-red-400' : 'text-slate-900 dark:text-white'}`}>
                    {reminder.text}
                </p>
                <div className="flex items-center space-x-2 text-sm text-slate-500 dark:text-gray-400 mt-1">
                    <Calendar size={14} />
                    <span>{format(date, 'MMM d, yyyy')}</span>
                    <Clock size={14} />
                    <span>{format(date, 'p')}</span>
                </div>
            </div>
            <button 
                onClick={onDelete} 
                className="p-2 -mr-2 rounded-full text-red-500 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/50"
            >
                <Trash2 size={18} />
            </button>
        </motion.div>
    );
};

const NotificationPrompt = () => {
    const { handleRequestNotificationPermission } = useAppContext();
    const [status, setStatus] = useState(Notification.permission);

    if (status === 'granted') return null;

    const handleClick = async () => {
        const newStatus = await handleRequestNotificationPermission();
        setStatus(newStatus);
    };

    return (
        <div className="p-4 bg-yellow-100 dark:bg-yellow-900/50 border border-yellow-300 dark:border-yellow-700 rounded-lg flex items-center justify-between">
            <div className="flex items-center space-x-3">
                <AlertTriangle size={20} className="text-yellow-600 dark:text-yellow-400" />
                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                    {status === 'denied' ? 'Notifications are blocked.' : 'Enable notifications to get reminders.'}
                </p>
            </div>
            {status !== 'denied' && (
                <button
                    onClick={handleClick}
                    className="py-1 px-3 rounded-md text-sm font-medium text-white bg-primary"
                    style={{ backgroundColor: 'var(--color-primary-hex)' }}
                >
                    Enable
                </button>
            )}
        </div>
    );
};

export default function RemindersView() {
    const { reminders, handleAddReminder, handleDeleteReminder } = useAppContext();
    const [newReminderText, setNewReminderText] = useState('');
    const [newReminderDate, setNewReminderDate] = useState(new Date());

    const { upcoming, past } = useMemo(() => {
        const now = new Date();
        const upcoming = [];
        const past = [];
        
        reminders.forEach(r => {
            const date = parseISO(r.date);
            if (isFuture(date) || isToday(date)) {
                upcoming.push(r);
            } else {
                past.push(r);
            }
        });
        return { upcoming, past };
    }, [reminders]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (newReminderText.trim()) {
            handleAddReminder(newReminderText, newReminderDate);
            setNewReminderText('');
            setNewReminderDate(new Date());
        }
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
                <h2 className="text-2xl font-semibold text-slate-900 dark:text-white" style={{fontFamily: 'var(--font-serif)'}}>
                    Reminders
                </h2>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6 space-y-6">
                <NotificationPrompt />
                
                <form onSubmit={handleSubmit} className="p-4 bg-white dark:bg-slate-800 rounded-lg shadow-md border border-slate-200 dark:border-slate-700 space-y-3">
                    <input
                        type="text"
                        value={newReminderText}
                        onChange={(e) => setNewReminderText(e.target.value)}
                        placeholder="What do you want to be reminded of?"
                        className="form-input w-full bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600 rounded-md shadow-sm"
                    />
                    <div className="flex space-x-2">
                        <DatePicker
                            selected={newReminderDate}
                            onChange={(date) => setNewReminderDate(date)}
                            showTimeSelect
                            dateFormat="MMM d, yyyy h:mm aa"
                            className="form-input w-full bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600 rounded-md shadow-sm"
                        />
                        <button
                            type="submit"
                            className="p-2 px-4 text-white rounded-md focus:outline-none focus:ring-2"
                            style={{ backgroundColor: 'var(--color-primary-hex)', '--tw-ring-color': 'var(--color-primary-hex)' }}
                        >
                            <Plus size={20} />
                        </button>
                    </div>
                </form>

                <section>
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-3" style={{fontFamily: 'var(--font-serif)'}}>
                        Upcoming
                    </h3>
                    <AnimatePresence>
                        {upcoming.length > 0 ? (
                            <div className="space-y-3">
                                {upcoming.map(r => (
                                    <ReminderItem key={r.id} reminder={r} onDelete={() => handleDeleteReminder(r.id)} />
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-slate-500 dark:text-gray-400">No upcoming reminders.</p>
                        )}
                    </AnimatePresence>
                </section>
                
                {past.length > 0 && (
                    <section>
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-3" style={{fontFamily: 'var(--font-serif)'}}>
                            Past
                        </h3>
                        <AnimatePresence>
                            <div className="space-y-3 opacity-60">
                                {past.map(r => (
                                    <ReminderItem key={r.id} reminder={r} onDelete={() => handleDeleteReminder(r.id)} />
                                ))}
                            </div>
                        </AnimatePresence>
                    </section>
                )}
            </div>
        </div>
    );
}