import React from 'react';
import { Popover, Transition } from '@headlessui/react';
import { ENTRY_TYPES } from '../constants';

export default function CreateEntryMenu({ onCreate, children, position = 'right' }) {
    const positionClasses = {
        right: 'origin-left left-full top-0 ml-2',
        top: 'origin-bottom bottom-full mb-2',
    };

    return (
        <Popover className="relative">
            {({ open }) => (
                <>
                    <Popover.Button as={React.Fragment}>
                        {children}
                    </Popover.Button>
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
                        <Popover.Panel 
                            static 
                            className={`absolute z-40 w-56 bg-white dark:bg-slate-800 shadow-lg rounded-lg ring-1 ring-black ring-opacity-5 dark:ring-slate-700 p-2 ${positionClasses[position]}`}
                        >
                            {({ close }) => (
                                <div className="flex flex-col space-y-1">
                                    <span className="px-3 py-2 text-xs font-semibold text-slate-500 dark:text-gray-400">New Entry...</span>
                                    {ENTRY_TYPES.map((type) => (
                                        <button
                                            key={type.value}
                                            onClick={() => {
                                                onCreate(type.value);
                                                close();
                                            }}
                                            className="flex items-center space-x-3 w-full px-3 py-2 text-left text-sm text-slate-800 dark:text-slate-200 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700"
                                        >
                                            <type.icon size={16} className="text-slate-500 dark:text-gray-400" />
                                            <span>{type.label}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </Popover.Panel>
                    </Transition>
                </>
            )}
        </Popover>
    );
}
