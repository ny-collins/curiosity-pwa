import React from 'react';
import { Popover, Transition } from '@headlessui/react';
import { ChevronDown, Plus, BookOpen, CheckSquare, Brain } from 'lucide-react';
import { useAppContext } from '../context/AppContext.jsx';
import { ENTRY_TYPES, getEntryType } from '../constants.js';

const menuItems = ENTRY_TYPES;

export default function CreateEntryMenu({ isExpanded }) {
    const { handleCreateEntry } = useAppContext();

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

const CreateMenuPanel = ({ open, handleCreateEntry }) => (
     <Transition
        show={open}
        as={React.Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
    >
        <Popover.Panel className="absolute z-20 w-56 mt-2 origin-top-right bg-white dark:bg-slate-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none bottom-full mb-2 right-0 md:bottom-auto md:mb-0">
            <div className="py-1">
                {menuItems.map((item) => {
                    const TypeIcon = item.icon;
                    return (
                        <Popover.Button
                            key={item.value}
                            as="button"
                            onClick={() => handleCreateEntry(item.value)}
                            className="w-full text-left flex items-center px-4 py-2 text-sm text-slate-700 dark:text-gray-200 hover:bg-slate-100 dark:hover:bg-slate-700"
                        >
                            <TypeIcon size={16} className="mr-3" style={{ color: 'var(--color-primary-hex)' }} />
                            {item.label}
                        </Popover.Button>
                    );
                })}
            </div>
        </Popover.Panel>
    </Transition>
);