import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Check, CheckCircle, Circle, ChevronDown, ChevronRight, ChevronUp, Target, Edit2, Calendar, Flag, TrendingUp, Award, Clock } from 'lucide-react';
import { useAppState } from '../contexts/StateProvider';
import { formatDistanceToNow, format, isPast, isFuture, differenceInDays } from 'date-fns';
const TaskItem = ({ task }) => {
    const { handleToggleTask, handleDeleteTask } = useAppState();
    
    return (
        <motion.div
            layout
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="flex items-center space-x-3 py-2 px-2 rounded-lg group hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors relative overflow-hidden"
            whileHover={{ x: 4 }}
        >
            {/* Shine effect */}
            <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                initial={{ x: '-100%' }}
                whileHover={{ x: '100%' }}
                transition={{ duration: 0.6 }}
            />
            
            <motion.button
                onClick={() => handleToggleTask(task.id, !task.completed)}
                whileHover={{ scale: 1.15, rotate: [0, -10, 10, 0] }}
                whileTap={{ scale: 0.9 }}
                className="relative z-10"
            >
                {task.completed ? (
                    <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", stiffness: 500, damping: 15 }}
                    >
                        <CheckCircle size={18} className="text-primary" style={{ color: 'var(--color-primary-hex)' }} />
                    </motion.div>
                ) : (
                    <Circle size={18} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors" />
                )}
            </motion.button>
            
            <span 
                className={`flex-1 text-sm transition-all duration-300 relative z-10 ${task.completed ? 'line-through text-slate-500' : ''}`}
                style={{ color: task.completed ? undefined : 'var(--color-text-primary)' }}
            >
                {task.text}
            </span>
            
            <motion.button
                onClick={() => handleDeleteTask(task.id)}
                className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 relative z-10"
                whileHover={{ scale: 1.15, rotate: [0, -5, 5, 0] }}
                whileTap={{ scale: 0.9 }}
            >
                <Trash2 size={14} />
            </motion.button>
        </motion.div>
    );
};
const GoalCard = ({ goal, tasks }) => {
    const { handleUpdateGoalStatus, handleDeleteGoal, handleAddTask } = useAppState();
    const [taskText, setTaskText] = useState('');
    const [isExpanded, setIsExpanded] = useState(false);
    const completedTasks = useMemo(() => tasks.filter(t => t.completed).length, [tasks]);
    const progress = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;
    const timeAgo = formatDistanceToNow(goal.createdAt, { addSuffix: true });
    const hasDeadline = goal.deadline;
    const isOverdue = hasDeadline && isPast(goal.deadline);
    const daysUntilDeadline = hasDeadline ? differenceInDays(goal.deadline, new Date()) : null;
    const statusConfig = {
        pending: { color: '#94a3b8', bg: 'rgba(148, 163, 184, 0.1)', label: 'Pending', icon: Clock },
        'in-progress': { color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)', label: 'In Progress', icon: TrendingUp },
        completed: { color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)', label: 'Completed', icon: Award }
    };
    const currentStatus = statusConfig[goal.status] || statusConfig.pending;
    const StatusIcon = currentStatus.icon;
    const handleTaskSubmit = (e) => {
        e.preventDefault();
        if (taskText.trim()) {
            handleAddTask(goal.id, taskText);
            setTaskText('');
        }
    };
    const handleStatusChange = (e) => {
        handleUpdateGoalStatus(goal.id, e.target.value);
    };
    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            whileHover={{ 
                y: -6, 
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                transition: { type: "spring", stiffness: 400, damping: 20 }
            }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="rounded-xl overflow-hidden relative group"
            style={{
                backgroundColor: 'var(--color-bg-content)',
                border: `1px solid var(--color-border)`
            }}
        >
            {/* Gradient accent on top */}
            <motion.div
                className="absolute top-0 left-0 right-0 h-1"
                style={{
                    background: progress === 100
                        ? 'linear-gradient(90deg, #10b981, #059669)'
                        : 'linear-gradient(90deg, var(--color-primary-hex), var(--color-primary-dark))'
                }}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
            />
            
            {/* Shine effect on hover */}
            <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none"
                initial={{ x: '-100%' }}
                whileHover={{ x: '100%' }}
                transition={{ duration: 0.6 }}
            />
            {}
            <div className="p-5 border-b" style={{ borderColor: 'var(--color-border)' }}>
                <div className="flex justify-between items-start mb-3">
                    <div className="flex-1 pr-4">
                        <h3 className="text-lg font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>
                            {goal.title}
                        </h3>
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                                Created {timeAgo}
                            </span>
                            {}
                            <motion.div
                                className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium shadow-sm"
                                style={{ backgroundColor: currentStatus.bg, color: currentStatus.color }}
                                whileHover={{ scale: 1.05, boxShadow: `0 4px 12px -2px ${currentStatus.color}40` }}
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                            >
                                <motion.div
                                    animate={{ rotate: goal.status === 'in-progress' ? 360 : 0 }}
                                    transition={{ duration: 2, repeat: goal.status === 'in-progress' ? Infinity : 0, ease: "linear" }}
                                >
                                    <StatusIcon size={12} />
                                </motion.div>
                                <span>{currentStatus.label}</span>
                            </motion.div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <motion.button
                            onClick={() => handleDeleteGoal(goal.id)}
                            className="p-2 rounded-lg transition-colors"
                            style={{ color: 'var(--color-text-muted)' }}
                            whileHover={{ scale: 1.1, color: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
                            whileTap={{ scale: 0.9 }}
                        >
                            <Trash2 size={16} />
                        </motion.button>
                        <motion.button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="p-2 rounded-lg transition-colors"
                            style={{ color: 'var(--color-text-muted)' }}
                            whileHover={{ scale: 1.1, backgroundColor: 'var(--color-bg-secondary)' }}
                            whileTap={{ scale: 0.9 }}
                            animate={{ rotate: isExpanded ? 0 : -90 }}
                        >
                            <ChevronDown size={20} />
                        </motion.button>
                    </div>
                </div>
                {}
                {hasDeadline && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-2 mb-3"
                    >
                        <div
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ${
                                isOverdue ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400' :
                                daysUntilDeadline <= 3 ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400' :
                                'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                            }`}
                        >
                            <Calendar size={12} />
                            <span>
                                {isOverdue ? 'Overdue' : `${daysUntilDeadline} days left`} · {format(goal.deadline, 'MMM d, yyyy')}
                            </span>
                        </div>
                    </motion.div>
                )}
                {}
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <span className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                            Progress
                        </span>
                        <motion.span
                            className="text-sm font-bold px-2 py-1 rounded-full"
                            style={{ 
                                color: 'var(--color-primary-hex)',
                                backgroundColor: 'rgba(var(--color-primary-rgb), 0.1)'
                            }}
                            key={progress}
                            initial={{ scale: 1.3, rotate: -10 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: "spring", stiffness: 400, damping: 15 }}
                        >
                            {completedTasks} / {tasks.length}
                        </motion.span>
                    </div>
                    <div className="relative w-full h-3 rounded-full overflow-hidden shadow-inner" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
                        {/* Background shimmer */}
                        <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                            animate={{ x: ['-100%', '100%'] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        />
                        
                        <motion.div
                            className="h-full rounded-full relative overflow-hidden"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.8, ease: "easeOut", type: "spring", stiffness: 100 }}
                            style={{
                                background: progress === 100
                                    ? 'linear-gradient(90deg, #10b981, #059669)'
                                    : 'linear-gradient(90deg, var(--color-primary-hex), var(--color-primary-dark))'
                            }}
                        >
                            {/* Shine effect */}
                            <motion.div
                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                                animate={{ x: ['-100%', '100%'] }}
                                transition={{ 
                                    duration: progress === 100 ? 1.5 : 2,
                                    repeat: Infinity,
                                    ease: "linear"
                                }}
                            />
                            
                            {/* Completion celebration */}
                            {progress === 100 && (
                                <motion.div
                                    className="absolute inset-0"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                                />
                            )}
                        </motion.div>
                    </div>
                </div>
            </div>
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                    >
                        <div className="p-5 space-y-4">
                            {}
                            {goal.description && (
                                <motion.p
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-sm leading-relaxed"
                                    style={{ color: 'var(--color-text-secondary)' }}
                                >
                                    {goal.description}
                                </motion.p>
                            )}
                            {}
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                            >
                                <label className="block text-xs font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                                    Status
                                </label>
                                <select
                                    value={goal.status}
                                    onChange={handleStatusChange}
                                    className="w-full text-sm py-2 px-3 rounded-lg border transition-all focus:ring-2"
                                    style={{
                                        backgroundColor: 'var(--color-bg-secondary)',
                                        borderColor: 'var(--color-border)',
                                        color: 'var(--color-text-primary)',
                                        '--tw-ring-color': 'var(--color-primary-hex)'
                                    }}
                                >
                                    <option value="pending">Pending</option>
                                    <option value="in-progress">In Progress</option>
                                    <option value="completed">Completed</option>
                                </select>
                            </motion.div>
                            {}
                            <div>
                                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
                                    <Flag size={14} />
                                    <span>Tasks</span>
                                </h4>
                                <div className="space-y-1">
                                    <AnimatePresence>
                                        {tasks.length > 0 ? (
                                            tasks.map((task, index) => (
                                                <motion.div
                                                    key={task.id}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    exit={{ opacity: 0, x: 20 }}
                                                    transition={{ delay: index * 0.05 }}
                                                >
                                                    <TaskItem task={task} />
                                                </motion.div>
                                            ))
                                        ) : (
                                            <motion.p
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className="text-xs py-2 text-center"
                                                style={{ color: 'var(--color-text-muted)' }}
                                            >
                                                No tasks yet. Add one below!
                                            </motion.p>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                            {}
                            <motion.form
                                onSubmit={handleTaskSubmit}
                                className="flex gap-2"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                            >
                                <input
                                    type="text"
                                    value={taskText}
                                    onChange={(e) => setTaskText(e.target.value)}
                                    placeholder="Add a new task..."
                                    className="flex-1 text-sm py-2 px-3 rounded-lg border transition-all focus:ring-2"
                                    style={{
                                        backgroundColor: 'var(--color-bg-content)',
                                        borderColor: 'var(--color-border)',
                                        color: 'var(--color-text-primary)',
                                        '--tw-ring-color': 'var(--color-primary-hex)'
                                    }}
                                />
                                <motion.button
                                    type="submit"
                                    className="p-2 rounded-lg text-white transition-colors focus:outline-none focus:ring-2"
                                    style={{
                                        backgroundColor: 'var(--color-primary-hex)',
                                        '--tw-ring-color': 'var(--color-primary-hex)'
                                    }}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <Plus size={18} />
                                </motion.button>
                            </motion.form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};
export default function GoalsView() {
    const { goals, tasks, handleAddGoal } = useAppState();
    const [newGoalTitle, setNewGoalTitle] = useState('');
    const [newGoalDesc, setNewGoalDesc] = useState('');
    const [newGoalDeadline, setNewGoalDeadline] = useState('');
    const [showCreator, setShowCreator] = useState(false);
    const [filterStatus, setFilterStatus] = useState('all');
    const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(false);
    const goalsWithTasks = useMemo(() => {
        if (!goals || !tasks) return [];
        let filteredGoals = goals;
        if (filterStatus !== 'all') {
            filteredGoals = goals.filter(goal => goal.status === filterStatus);
        }
        return filteredGoals.map(goal => ({
            ...goal,
            tasks: tasks.filter(task => task.goalId === goal.id)
                          .sort((a, b) => a.createdAt - b.createdAt)
        })).sort((a, b) => b.createdAt - a.createdAt);
    }, [goals, tasks, filterStatus]);
    const stats = useMemo(() => {
        if (!goals) return { total: 0, pending: 0, inProgress: 0, completed: 0 };
        return {
            total: goals.length,
            pending: goals.filter(g => g.status === 'pending').length,
            inProgress: goals.filter(g => g.status === 'in-progress').length,
            completed: goals.filter(g => g.status === 'completed').length
        };
    }, [goals]);
    const handleGoalSubmit = (e) => {
        e.preventDefault();
        if (newGoalTitle.trim()) {
            handleAddGoal(newGoalTitle, newGoalDesc, newGoalDeadline ? new Date(newGoalDeadline) : null);
            setNewGoalTitle('');
            setNewGoalDesc('');
            setNewGoalDeadline('');
            setShowCreator(false);
        }
    };
    return (
        <div className="flex flex-col h-full" style={{ backgroundColor: 'var(--color-bg-base)' }}>
            {}
            <motion.div
                className="flex-shrink-0 border-b"
                style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-content)' }}
                animate={{
                    paddingTop: isHeaderCollapsed ? '12px' : '24px',
                    paddingBottom: isHeaderCollapsed ? '12px' : '24px'
                }}
                transition={{ duration: 0.3 }}
            >
                <div className="px-6">
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                            {}
                            <motion.button
                                onClick={() => setIsHeaderCollapsed(!isHeaderCollapsed)}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                                style={{ color: 'var(--color-text-muted)' }}
                                title={isHeaderCollapsed ? "Expand header" : "Collapse header"}
                            >
                                <motion.div
                                    animate={{ rotate: isHeaderCollapsed ? 0 : 180 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <ChevronUp size={20} />
                                </motion.div>
                            </motion.button>
                            <div>
                                <h2 className="text-3xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
                                    Goals
                                </h2>
                                {!isHeaderCollapsed && (
                                    <motion.p
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="text-sm"
                                        style={{ color: 'var(--color-text-muted)' }}
                                    >
                                        Track your aspirations and achieve greatness
                                    </motion.p>
                                )}
                            </div>
                        </div>
                        <motion.button
                            onClick={() => setShowCreator(!showCreator)}
                            className="flex items-center gap-2 text-white font-semibold py-3 px-5 rounded-xl focus:outline-none focus:ring-2 shadow-lg relative overflow-hidden group"
                            style={{
                                backgroundColor: 'var(--color-primary-hex)',
                                '--tw-ring-color': 'var(--color-primary-hex)'
                            }}
                            whileHover={{ scale: 1.05, boxShadow: "0 10px 20px rgba(0, 0, 0, 0.15)" }}
                            whileTap={{ scale: 0.95 }}
                        >
                            {/* Shimmer effect */}
                            <motion.div
                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                                initial={{ x: '-100%' }}
                                whileHover={{ x: '100%' }}
                                transition={{ duration: 0.6 }}
                            />
                            <motion.div
                                animate={{ rotate: showCreator ? 45 : 0 }}
                                transition={{ type: "spring", stiffness: 400 }}
                                className="relative z-10"
                            >
                                <Plus size={20} />
                            </motion.div>
                            <span className="relative z-10">New Goal</span>
                        </motion.button>
                    </div>
                </div>
                {}
                <AnimatePresence>
                    {!isHeaderCollapsed && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                        >
                            <div className="px-6 pt-6">
                                {}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                    {[
                                        { label: 'Total', value: stats.total, color: '#64748b', icon: Target },
                                        { label: 'Pending', value: stats.pending, color: '#94a3b8', icon: Clock },
                                        { label: 'In Progress', value: stats.inProgress, color: '#3b82f6', icon: TrendingUp },
                                        { label: 'Completed', value: stats.completed, color: '#10b981', icon: Award }
                                    ].map((stat, index) => {
                                        const Icon = stat.icon;
                                        return (
                                            <motion.div
                                                key={stat.label}
                                                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                transition={{ 
                                                    delay: index * 0.1,
                                                    type: "spring",
                                                    stiffness: 400,
                                                    damping: 20
                                                }}
                                                className="p-4 rounded-xl relative overflow-hidden group"
                                                style={{
                                                    backgroundColor: `${stat.color}15`,
                                                    border: `1px solid ${stat.color}30`
                                                }}
                                                whileHover={{ y: -4, scale: 1.02 }}
                                            >
                                                {/* Shine effect */}
                                                <motion.div
                                                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                                                    initial={{ x: '-100%' }}
                                                    whileHover={{ x: '100%' }}
                                                    transition={{ duration: 0.6 }}
                                                />
                                                
                                                <div className="flex items-center justify-between mb-2 relative z-10">
                                                    <span className="text-xs font-medium" style={{ color: stat.color }}>
                                                        {stat.label}
                                                    </span>
                                                    <motion.div
                                                        whileHover={{ rotate: 360, scale: 1.2 }}
                                                        transition={{ duration: 0.5 }}
                                                    >
                                                        <Icon size={16} style={{ color: stat.color }} />
                                                    </motion.div>
                                                </div>
                                                <motion.div
                                                    className="text-2xl font-bold relative z-10"
                                                    style={{ color: stat.color }}
                                                    key={stat.value}
                                                    initial={{ scale: 1.3, rotate: -10 }}
                                                    animate={{ scale: 1, rotate: 0 }}
                                                    transition={{ type: "spring", stiffness: 500, damping: 20 }}
                                                >
                                                    {stat.value}
                                                </motion.div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                                {}
                                <div className="flex gap-2 overflow-x-auto pb-2">
                                    {[
                                        { value: 'all', label: 'All Goals' },
                                        { value: 'pending', label: 'Pending' },
                                        { value: 'in-progress', label: 'In Progress' },
                                        { value: 'completed', label: 'Completed' }
                                    ].map((filter) => (
                                        <motion.button
                                            key={filter.value}
                                            onClick={() => setFilterStatus(filter.value)}
                                            className="px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all"
                                            style={{
                                                backgroundColor: filterStatus === filter.value ? 'var(--color-primary-hex)' : 'var(--color-bg-secondary)',
                                                color: filterStatus === filter.value ? '#ffffff' : 'var(--color-text-secondary)',
                                                border: `1px solid ${filterStatus === filter.value ? 'var(--color-primary-hex)' : 'var(--color-border)'}`
                                            }}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            {filter.label}
                                        </motion.button>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
                {}
                <AnimatePresence>
                    {showCreator && (
                        <motion.form
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1, marginTop: '24px' }}
                            exit={{ height: 0, opacity: 0, marginTop: '0px' }}
                            transition={{ duration: 0.3 }}
                            onSubmit={handleGoalSubmit}
                            className="mx-6 rounded-xl p-6 space-y-4 overflow-hidden"
                            style={{
                                backgroundColor: 'var(--color-bg-secondary)',
                                border: '1px solid var(--color-border)'
                            }}
                        >
                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                                    Goal Title *
                                </label>
                                <input
                                    type="text"
                                    value={newGoalTitle}
                                    onChange={(e) => setNewGoalTitle(e.target.value)}
                                    placeholder="What do you want to achieve?"
                                    className="w-full py-3 px-4 rounded-lg border transition-all focus:ring-2"
                                    style={{
                                        backgroundColor: 'var(--color-bg-content)',
                                        borderColor: 'var(--color-border)',
                                        color: 'var(--color-text-primary)',
                                        '--tw-ring-color': 'var(--color-primary-hex)'
                                    }}
                                    autoFocus
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                                    Description
                                </label>
                                <textarea
                                    value={newGoalDesc}
                                    onChange={(e) => setNewGoalDesc(e.target.value)}
                                    placeholder="Add details about your goal..."
                                    className="w-full py-3 px-4 rounded-lg border transition-all focus:ring-2 resize-none"
                                    style={{
                                        backgroundColor: 'var(--color-bg-content)',
                                        borderColor: 'var(--color-border)',
                                        color: 'var(--color-text-primary)',
                                        '--tw-ring-color': 'var(--color-primary-hex)'
                                    }}
                                    rows="3"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                                    <Calendar size={14} className="inline mr-1" />
                                    Deadline (Optional)
                                </label>
                                <input
                                    type="date"
                                    value={newGoalDeadline}
                                    onChange={(e) => setNewGoalDeadline(e.target.value)}
                                    className="w-full py-3 px-4 rounded-lg border transition-all focus:ring-2"
                                    style={{
                                        backgroundColor: 'var(--color-bg-content)',
                                        borderColor: 'var(--color-border)',
                                        color: 'var(--color-text-primary)',
                                        '--tw-ring-color': 'var(--color-primary-hex)'
                                    }}
                                    min={format(new Date(), 'yyyy-MM-dd')}
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <motion.button
                                    type="button"
                                    onClick={() => setShowCreator(false)}
                                    className="px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
                                    style={{
                                        backgroundColor: 'var(--color-bg-base)',
                                        color: 'var(--color-text-secondary)',
                                        border: '1px solid var(--color-border)'
                                    }}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    Cancel
                                </motion.button>
                                <motion.button
                                    type="submit"
                                    className="flex items-center gap-2 text-white font-semibold px-5 py-2.5 rounded-lg focus:outline-none focus:ring-2"
                                    style={{
                                        backgroundColor: 'var(--color-primary-hex)',
                                        '--tw-ring-color': 'var(--color-primary-hex)'
                                    }}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <Check size={18} />
                                    <span>Create Goal</span>
                                </motion.button>
                            </div>
                        </motion.form>
                    )}
                </AnimatePresence>
            </motion.div>
            {}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                <AnimatePresence mode="popLayout">
                    {goalsWithTasks.length > 0 ? (
                        <motion.div
                            layout
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                        >
                            {goalsWithTasks.map((goal, index) => (
                                <motion.div
                                    key={goal.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <GoalCard goal={goal} tasks={goal.tasks} />
                                </motion.div>
                            ))}
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="flex flex-col items-center justify-center h-full text-center py-20"
                        >
                            <motion.div
                                animate={{
                                    y: [0, -10, 0],
                                    rotate: [0, 5, -5, 0]
                                }}
                                transition={{
                                    duration: 4,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                            >
                                <Target size={64} style={{ color: 'var(--color-text-muted)', opacity: 0.5 }} />
                            </motion.div>
                            <h3 className="text-xl font-bold mt-6 mb-2" style={{ color: 'var(--color-text-primary)' }}>
                                {filterStatus === 'all' ? 'No goals set yet' : `No ${filterStatus.replace('-', ' ')} goals`}
                            </h3>
                            <p className="text-sm mb-6" style={{ color: 'var(--color-text-muted)' }}>
                                {filterStatus === 'all'
                                    ? 'Click "New Goal" to start tracking your aspirations and watch your progress grow.'
                                    : 'Try changing the filter or create a new goal to get started.'}
                            </p>
                            {filterStatus === 'all' && (
                                <motion.button
                                    onClick={() => setShowCreator(true)}
                                    className="flex items-center gap-2 text-white font-semibold py-3 px-6 rounded-xl focus:outline-none focus:ring-2"
                                    style={{
                                        backgroundColor: 'var(--color-primary-hex)',
                                        '--tw-ring-color': 'var(--color-primary-hex)'
                                    }}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <Plus size={20} />
                                    <span>Create Your First Goal</span>
                                </motion.button>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
