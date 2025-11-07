import React, { useState } from 'react';
import { Popover, Transition } from '@headlessui/react';
import { ChevronDown, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAppState } from '../contexts/StateProvider';
import { REGULAR_ENTRY_TYPES } from '../constants.js';

const menuItems = REGULAR_ENTRY_TYPES; // Only show regular entries, not vault items

export default function CreateEntryMenu({ isExpanded }) {
    const { handleCreateEntry } = useAppState();

    if (!isExpanded) {
        return (
            <Popover className="relative">
                {({ open }) => (
                    <div className="relative">
                        <Popover.Button 
                            className="p-3 rounded-full text-white focus:outline-none focus:ring-2"
                            style={{ backgroundColor: 'var(--color-primary-hex)', '--tw-ring-color': 'var(--color-primary-hex)' }}
                            title="Create new"
                        >
                            <Plus size={24} />
                        </Popover.Button>
                        <CreateMenuPanel open={open} handleCreateEntry={handleCreateEntry} />
                    </div>
                )}
            </Popover>
        );
    }
    
    return (
         <Popover className="relative w-full">
            {({ open }) => (
                <div className="relative w-full">
                    <Popover.Button 
                        className={`w-full flex items-center justify-between text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 ${open ? 'ring-2' : ''}`}
                        style={{ backgroundColor: 'var(--color-primary-hex)', '--tw-ring-color': 'var(--color-primary-hex)' }}
                    >
                        <span>Create New</span>
                        <ChevronDown size={20} />
                    </Popover.Button>
                    <CreateMenuPanel open={open} handleCreateEntry={handleCreateEntry} />
                </div>
            )}
        </Popover>
    );
}

const CreateMenuPanel = ({ open, handleCreateEntry }) => {
    const [hoveredItem, setHoveredItem] = useState(null);

    return (
        <Transition
            show={open}
            as={React.Fragment}
            enter="transition ease-out duration-200"
            enterFrom="transform opacity-0 scale-95 translate-y-2"
            enterTo="transform opacity-100 scale-100 translate-y-0"
            leave="transition ease-in duration-150"
            leaveFrom="transform opacity-100 scale-100 translate-y-0"
            leaveTo="transform opacity-0 scale-95 translate-y-2"
        >
            <Popover.Panel className="fixed z-[100] w-72 mt-2 left-[18px] top-[120px] bg-white dark:bg-slate-800 rounded-xl shadow-2xl ring-1 ring-black/5 dark:ring-white/10 focus:outline-none overflow-hidden backdrop-blur-sm border-2 border-slate-200 dark:border-slate-700">
                <div className="p-2">
                    <div className="text-xs font-semibold text-slate-500 dark:text-gray-400 px-3 py-2 uppercase tracking-wider">
                        Choose Entry Type
                    </div>
                    {menuItems.map((item, index) => {
                        const TypeIcon = item.icon;
                        return (
                            <Popover.Button
                                key={item.value}
                                as={motion.button}
                                onClick={() => handleCreateEntry(item.value)}
                                onMouseEnter={() => setHoveredItem(item.value)}
                                onMouseLeave={() => setHoveredItem(null)}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.03, duration: 0.2 }}
                                className="w-full text-left flex items-center px-3 py-2.5 rounded-lg text-sm text-slate-700 dark:text-gray-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all duration-200 group relative overflow-hidden"
                            >
                                {/* Hover background effect */}
                                <motion.div
                                    className="absolute inset-0 opacity-0"
                                    style={{ backgroundColor: item.color }}
                                    animate={{ opacity: hoveredItem === item.value ? 0.08 : 0 }}
                                    transition={{ duration: 0.2 }}
                                />
                                
                                {/* Icon with color on hover */}
                                <motion.div
                                    className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center mr-3 relative"
                                    style={{ backgroundColor: `${item.color}15` }}
                                    whileHover={{ scale: 1.1, rotate: 5 }}
                                    transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                                >
                                    <TypeIcon size={16} style={{ color: item.color }} />
                                </motion.div>
                                
                                {/* Text content */}
                                <div className="flex-1 relative z-10">
                                    <div className="flex items-center space-x-2">
                                        <span className="font-medium">{item.emoji}</span>
                                        <span className="font-semibold">{item.label}</span>
                                    </div>
                                    <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">
                                        {item.description}
                                    </p>
                                </div>

                                {/* Hover indicator */}
                                <motion.div
                                    className="w-1 h-8 rounded-full absolute right-2"
                                    style={{ backgroundColor: item.color }}
                                    initial={{ opacity: 0, scale: 0 }}
                                    animate={{ 
                                        opacity: hoveredItem === item.value ? 1 : 0,
                                        scale: hoveredItem === item.value ? 1 : 0
                                    }}
                                    transition={{ duration: 0.2 }}
                                />
                            </Popover.Button>
                        );
                    })}
                </div>
            </Popover.Panel>
        </Transition>
    );
};