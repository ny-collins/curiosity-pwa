import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Check, CheckCircle, Circle, ChevronDown, ChevronRight, Target, Edit2 } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { formatDistanceToNow } from 'date-fns';

const TaskItem = ({ task }) => {
    const { handleToggleTask, handleDeleteTask } = useAppContext();
    return (
        <div className="flex items-center space-x-2 py-2 group">
            <button onClick={() => handleToggleTask(task.id, !task.completed)}>
                {task.completed ? (
                    <CheckCircle size={18} className="text-primary" style={{ color: 'var(--color-primary-hex)' }} />
                ) : (
                    <Circle size={18} className="text-slate-400" />
                )}
            </button>
            <span className={`flex-1 text-sm ${task.completed ? 'line-through text-slate-500' : 'text-slate-800 dark:text-slate-200'}`}>
                {task.text}
            </span>
            <button 
                onClick={() => handleDeleteTask(task.id)} 
                className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700"
            >
                <Trash2 size={14} />
            </button>
        </div>
    );
};

const GoalCard = ({ goal, tasks }) => {
    const { handleUpdateGoalStatus, handleDeleteGoal, handleAddTask, toast } = useAppContext();
    const [taskText, setTaskText] = useState('');
    const [isExpanded, setIsExpanded] = useState(true);

    const completedTasks = useMemo(() => tasks.filter(t => t.completed).length, [tasks]);
    const progress = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;
    
    const timeAgo = formatDistanceToNow(goal.createdAt, { addSuffix: true });
    
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
            exit={{ opacity: 0 }}
            className="bg-white dark:bg-slate-800 rounded-lg shadow-md border border-slate-200 dark:border-slate-700 overflow-hidden"
        >
            <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                <div className="flex justify-between items-start">
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{goal.title}</h3>
                        <span className="text-xs text-slate-500 dark:text-gray-400">Created {timeAgo}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                         <select
                            value={goal.status}
                            onChange={handleStatusChange}
                            className="form-select text-xs py-1 px-2 bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600 rounded-md"
                        >
                            <option value="pending">Pending</option>
                            <option value="in-progress">In Progress</option>
                            <option value="completed">Completed</option>
                        </select>
                        <button 
                            onClick={() => handleDeleteGoal(goal.id)}
                            className="text-red-500 hover:text-red-700"
                        >
                            <Trash2 size={16} />
                        </button>
                        <button onClick={() => setIsExpanded(!isExpanded)}>
                            {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                        </button>
                    </div>
                </div>
                
                <div className="mt-3">
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-medium text-slate-600 dark:text-gray-300">Progress</span>
                        <span className="text-xs font-semibold" style={{ color: 'var(--color-primary-hex)' }}>
                            {completedTasks} / {tasks.length}
                        </span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                        <div 
                            className="h-2 rounded-full transition-all" 
                            style={{ width: `${progress}%`, backgroundColor: 'var(--color-primary-hex)' }}
                        />
                    </div>
                </div>
            </div>
            
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="p-4">
                            <p className="text-sm text-slate-600 dark:text-gray-300 mb-3">
                                {goal.description || "No description."}
                            </p>
                            
                            <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-2">Tasks</h4>
                            <div>
                                {tasks.length > 0 ? (
                                    tasks.map(task => <TaskItem key={task.id} task={task} />)
                                ) : (
                                    <p className="text-xs text-slate-500 dark:text-gray-400">No tasks for this goal yet.</p>
                                )}
                            </div>
                            
                            <form onSubmit={handleTaskSubmit} className="flex space-x-2 mt-3">
                                <input
                                    type="text"
                                    value={taskText}
                                    onChange={(e) => setTaskText(e.target.value)}
                                    placeholder="Add a new task..."
                                    className="form-input flex-1 text-sm bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 rounded-md shadow-sm"
                                />
                                <button
                                    type="submit"
                                    className="p-2 text-white rounded-md focus:outline-none focus:ring-2"
                                    style={{ backgroundColor: 'var(--color-primary-hex)', '--tw-ring-color': 'var(--color-primary-hex)' }}
                                >
                                    <Plus size={18} />
                                </button>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default function GoalsView() {
    const { goals, tasks, handleAddGoal } = useAppContext();
    const [newGoalTitle, setNewGoalTitle] = useState('');
    const [newGoalDesc, setNewGoalDesc] = useState('');
    const [showCreator, setShowCreator] = useState(false);

    const goalsWithTasks = useMemo(() => {
        if (!goals || !tasks) return [];
        return goals.map(goal => ({
            ...goal,
            tasks: tasks.filter(task => task.goalId === goal.id)
                          .sort((a, b) => a.createdAt - b.createdAt)
        })).sort((a, b) => b.createdAt - a.createdAt);
    }, [goals, tasks]);
    
    const handleGoalSubmit = (e) => {
        e.preventDefault();
        if (newGoalTitle.trim()) {
            handleAddGoal(newGoalTitle, newGoalDesc);
            setNewGoalTitle('');
            setNewGoalDesc('');
            setShowCreator(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Goals</h2>
                    <button
                        onClick={() => setShowCreator(!showCreator)}
                        className="flex items-center space-x-1 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2"
                        style={{ backgroundColor: 'var(--color-primary-hex)', '--tw-ring-color': 'var(--color-primary-hex)' }}
                    >
                        <Plus size={20} />
                        <span>New Goal</span>
                    </button>
                </div>
                
                <AnimatePresence>
                    {showCreator && (
                        <motion.form
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1, marginTop: '16px' }}
                            exit={{ height: 0, opacity: 0 }}
                            onSubmit={handleGoalSubmit}
                            className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-inner border border-slate-200 dark:border-slate-700 space-y-3"
                        >
                             <input
                                type="text"
                                value={newGoalTitle}
                                onChange={(e) => setNewGoalTitle(e.target.value)}
                                placeholder="What's the goal?"
                                className="form-input w-full bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 rounded-md shadow-sm"
                            />
                            <textarea
                                value={newGoalDesc}
                                onChange={(e) => setNewGoalDesc(e.target.value)}
                                placeholder="Add a short description (optional)..."
                                className="form-textarea w-full bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 rounded-md shadow-sm"
                                rows="2"
                            />
                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    className="flex items-center space-x-1 text-white font-semibold py-2 px-3 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2"
                                    style={{ backgroundColor: 'var(--color-primary-hex)', '--tw-ring-color': 'var(--color-primary-hex)' }}
                                >
                                    <Check size={18} />
                                    <span>Add Goal</span>
                                </button>
                            </div>
                        </motion.form>
                    )}
                </AnimatePresence>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6">
                <AnimatePresence>
                    {goalsWithTasks.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {goalsWithTasks.map(goal => (
                                <GoalCard key={goal.id} goal={goal} tasks={goal.tasks} />
                            ))}
                        </div>
                    ) : (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex flex-col items-center justify-center h-full text-center"
                        >
                            <Target size={48} className="text-slate-400 dark:text-slate-500 mb-4" />
                            <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-1">
                                No goals set yet
                            </h3>
                            <p className="text-sm text-slate-600 dark:text-gray-400">
                                Click "New Goal" to start tracking your progress.
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}