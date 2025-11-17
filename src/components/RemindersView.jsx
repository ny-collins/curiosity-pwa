import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Plus, Trash2, Calendar, Clock, AlertTriangle } from 'lucide-react';
import { useAppState } from '../contexts/StateProvider';
import { format, parseISO, isPast, isToday, isFuture } from 'date-fns';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
const ReminderItem = ({ reminder, onDelete }) => {
    const date = parseISO(reminder.date);
    const isOverdue = isPast(date) && !isToday(date);
    const isUpcoming = isToday(date);
    
    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: -20, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            whileHover={{ y: -2, scale: 1.01 }}
            className={`group relative flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-xl shadow-md border overflow-hidden
                ${isOverdue ? 'border-red-500/30 bg-red-50/50 dark:bg-red-900/10' : 
                  isUpcoming ? 'border-blue-500/30 bg-blue-50/50 dark:bg-blue-900/10' : 
                  'border-slate-200 dark:border-slate-700'}`}
        >
            {/* Gradient glow on overdue */}
            {isOverdue && (
                <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-orange-500/10 blur-xl opacity-50" />
            )}
            
            {/* Shine effect */}
            <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none"
                initial={{ x: '-100%' }}
                whileHover={{ x: '100%' }}
                transition={{ duration: 0.6 }}
            />
            
            <div className="flex-1 relative z-10">
                <div className="flex items-start space-x-3">
                    {/* Status indicator */}
                    <motion.div
                        animate={isOverdue ? {
                            scale: [1, 1.2, 1],
                            rotate: [0, 5, -5, 0]
                        } : isUpcoming ? {
                            scale: [1, 1.1, 1]
                        } : {}}
                        transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                        className={`mt-1 p-2 rounded-lg ${
                            isOverdue ? 'bg-red-100 dark:bg-red-900/30' :
                            isUpcoming ? 'bg-blue-100 dark:bg-blue-900/30' :
                            'bg-slate-100 dark:bg-slate-700/50'
                        }`}
                    >
                        <Bell size={16} className={
                            isOverdue ? 'text-red-600 dark:text-red-400' :
                            isUpcoming ? 'text-blue-600 dark:text-blue-400' :
                            'text-slate-600 dark:text-slate-400'
                        } />
                    </motion.div>
                    
                    <div className="flex-1">
                        <p className={`text-base font-medium ${
                            isOverdue ? 'text-red-600 dark:text-red-400' : 
                            isUpcoming ? 'text-blue-600 dark:text-blue-400' :
                            'text-slate-900 dark:text-white'
                        }`}>
                            {reminder.text}
                        </p>
                        <div className="flex items-center space-x-3 text-sm text-slate-500 dark:text-gray-400 mt-2">
                            <div className="flex items-center space-x-1">
                                <Calendar size={14} />
                                <span>{format(date, 'MMM d, yyyy')}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                                <Clock size={14} />
                                <span>{format(date, 'p')}</span>
                            </div>
                            {isOverdue && (
                                <motion.span
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="text-xs px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 font-medium"
                                >
                                    Overdue
                                </motion.span>
                            )}
                            {isUpcoming && (
                                <motion.span
                                    animate={{ opacity: [0.5, 1, 0.5] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className="text-xs px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium"
                                >
                                    Today
                                </motion.span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            
            <motion.button
                onClick={onDelete}
                whileHover={{ 
                    scale: 1.1,
                    rotate: [0, -10, 10, -10, 0],
                    transition: { rotate: { duration: 0.5, type: "tween" } }
                }}
                whileTap={{ scale: 0.9 }}
                className="relative z-10 p-2 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
            >
                <Trash2 size={18} />
            </motion.button>
        </motion.div>
    );
};
const NotificationPrompt = () => {
    const { handleRequestNotificationPermission } = useAppState();
    const [status, setStatus] = useState(Notification.permission);
    
    if (status === 'granted') return null;
    
    const handleClick = async () => {
        const newStatus = await handleRequestNotificationPermission();
        setStatus(newStatus);
    };
    
    return (
        <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative p-4 bg-yellow-100 dark:bg-yellow-900/50 border border-yellow-300 dark:border-yellow-700 rounded-xl flex items-center justify-between overflow-hidden shadow-lg"
        >
            {/* Animated warning pulse */}
            <motion.div
                className="absolute inset-0 bg-yellow-500/10"
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
            />
            
            <div className="flex items-center space-x-3 relative z-10">
                <motion.div
                    animate={{ 
                        rotate: [0, -10, 10, -10, 0],
                        scale: [1, 1.1, 1]
                    }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 1, type: "tween" }}
                >
                    <AlertTriangle size={20} className="text-yellow-600 dark:text-yellow-400" />
                </motion.div>
                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                    {status === 'denied' ? 'Notifications are blocked.' : 'Enable notifications to get reminders.'}
                </p>
            </div>
            {status !== 'denied' && (
                <motion.button
                    onClick={handleClick}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative py-2 px-4 rounded-lg text-sm font-medium text-white bg-primary overflow-hidden shadow-md z-10"
                    style={{ backgroundColor: 'var(--color-primary-hex)' }}
                >
                    {/* Shimmer effect */}
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                        animate={{ x: ['-100%', '100%'] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    />
                    <span className="relative z-10">Enable</span>
                </motion.button>
            )}
        </motion.div>
    );
};
export default function RemindersView() {
    const { reminders, handleAddReminder, handleDeleteReminder } = useAppState();
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
        <div className="flex flex-col h-full bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900">
            <motion.div 
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="p-6 border-b border-slate-200 dark:border-slate-700 flex-shrink-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl"
            >
                <div className="flex items-center space-x-3">
                    <motion.div
                        whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
                        transition={{ duration: 0.5, type: "tween" }}
                        className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg"
                    >
                        <Bell size={24} className="text-white" />
                    </motion.div>
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white" style={{fontFamily: 'var(--font-serif)'}}>
                            Reminders
                        </h2>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Never forget what matters</p>
                    </div>
                </div>
            </motion.div>
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6 space-y-6">
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                >
                    <NotificationPrompt />
                </motion.div>
                
                <motion.form 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 300, damping: 25 }}
                    onSubmit={handleSubmit} 
                    className="relative p-5 bg-white dark:bg-slate-800 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 space-y-4 overflow-hidden"
                >
                    {/* Shine effect on hover */}
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/5 to-transparent pointer-events-none"
                        initial={{ x: '-100%' }}
                        whileHover={{ x: '100%' }}
                        transition={{ duration: 0.8 }}
                    />
                    
                    <div className="relative z-10">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Reminder Text
                        </label>
                        <motion.input
                            whileFocus={{ scale: 1.01 }}
                            type="text"
                            value={newReminderText}
                            onChange={(e) => setNewReminderText(e.target.value)}
                            placeholder="What do you want to be reminded of?"
                            className="themed-input w-full rounded-xl shadow-sm border-2 border-slate-200 dark:border-slate-600 px-4 py-3
                                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            style={{ backgroundColor: 'var(--color-bg-secondary)', color: 'var(--color-text-primary)' }}
                        />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Date & Time
                            </label>
                            <DatePicker
                                selected={newReminderDate}
                                onChange={(date) => setNewReminderDate(date)}
                                showTimeSelect
                                dateFormat="MMM d, yyyy h:mm aa"
                                className="themed-input w-full rounded-xl shadow-sm border-2 border-slate-200 dark:border-slate-600 px-4 py-3
                                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                style={{ backgroundColor: 'var(--color-bg-secondary)', color: 'var(--color-text-primary)' }}
                                placeholderText="Select date and time"
                            />
                        </div>
                        <div className="flex items-end">
                            <motion.button
                                type="submit"
                                disabled={!newReminderText.trim()}
                                whileHover={newReminderText.trim() ? { scale: 1.02, y: -2 } : {}}
                                whileTap={newReminderText.trim() ? { scale: 0.98 } : {}}
                                className="relative w-full sm:w-auto px-6 py-3 text-white font-semibold rounded-xl focus:outline-none focus:ring-2 
                                         disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg overflow-hidden"
                                style={{
                                    backgroundColor: newReminderText.trim() ? 'var(--color-primary-hex)' : '#cbd5e1',
                                    '--tw-ring-color': 'var(--color-primary-hex)',
                                    boxShadow: newReminderText.trim() ? '0 10px 25px -5px rgba(59, 130, 246, 0.3)' : 'none'
                                }}
                            >
                                {/* Shimmer effect when enabled */}
                                {newReminderText.trim() && (
                                    <motion.div
                                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                                        animate={{ x: ['-100%', '100%'] }}
                                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                    />
                                )}
                                <span className="relative z-10 flex items-center justify-center">
                                    <Plus size={20} className="mr-2" />
                                    Add Reminder
                                </span>
                            </motion.button>
                        </div>
                    </div>
                </motion.form>
                <section>
                    <motion.h3 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-lg font-semibold text-slate-800 dark:text-white mb-4 flex items-center space-x-2" 
                        style={{fontFamily: 'var(--font-serif)'}}
                    >
                        <motion.div
                            animate={{ rotate: [0, 10, -10, 0] }}
                            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                            className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/30"
                        >
                            <Bell size={16} className="text-blue-600 dark:text-blue-400" />
                        </motion.div>
                        <span>Upcoming</span>
                    </motion.h3>
                    <AnimatePresence mode="wait">
                        {upcoming.length > 0 ? (
                            <motion.div 
                                key="upcoming-list"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="space-y-3"
                            >
                                {upcoming.map((r, index) => (
                                    <motion.div
                                        key={r.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.4 + index * 0.05 }}
                                    >
                                        <ReminderItem reminder={r} onDelete={() => handleDeleteReminder(r.id)} />
                                    </motion.div>
                                ))}
                            </motion.div>
                        ) : (
                            <motion.div
                                key="upcoming-empty"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="flex flex-col items-center justify-center py-12 text-center"
                            >
                                <motion.div
                                    animate={{ 
                                        y: [0, -10, 0],
                                        rotate: [0, 5, -5, 0]
                                    }}
                                    transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
                                    className="p-4 rounded-full bg-slate-100 dark:bg-slate-800 mb-4"
                                >
                                    <Bell size={32} className="text-slate-400 dark:text-slate-500" />
                                </motion.div>
                                <p className="text-sm text-slate-500 dark:text-gray-400 font-medium">No upcoming reminders.</p>
                                <p className="text-xs text-slate-400 dark:text-gray-500 mt-1">Add one above to get started!</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </section>
                {past.length > 0 && (
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                    >
                        <motion.h3 
                            className="text-lg font-semibold text-slate-800 dark:text-white mb-4 flex items-center space-x-2" 
                            style={{fontFamily: 'var(--font-serif)'}}
                        >
                            <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-700/50">
                                <Clock size={16} className="text-slate-600 dark:text-slate-400" />
                            </div>
                            <span>Past</span>
                        </motion.h3>
                        <AnimatePresence>
                            <motion.div 
                                className="space-y-3 opacity-60"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 0.6 }}
                            >
                                {past.map((r, index) => (
                                    <motion.div
                                        key={r.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.6 + index * 0.05 }}
                                    >
                                        <ReminderItem reminder={r} onDelete={() => handleDeleteReminder(r.id)} />
                                    </motion.div>
                                ))}
                            </motion.div>
                        </AnimatePresence>
                    </motion.section>
                )}
            </div>
        </div>
    );
}
