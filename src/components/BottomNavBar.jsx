// src/components/BottomNavBar.jsx
import React from 'react';
import { Plus, List, Calendar, User } from 'lucide-react';

function BottomNavBar({ onCreate, currentView, onViewChange, onShowSettings, settings }) {
    
    const navItems = [
        { id: 'list', label: 'List', icon: List },
        { id: 'calendar', label: 'Calendar', icon: Calendar },
    ];

    return (
        // Fixed position at bottom, visible only on mobile (md:hidden)
        <nav className="fixed bottom-0 left-0 right-0 bg-slate-800 border-t border-slate-700 md:hidden flex justify-around items-center h-16 z-10">
            {/* New Entry Button */}
            <button
                onClick={onCreate}
                className="flex flex-col items-center justify-center p-2 text-teal-400 hover:text-teal-300 focus:outline-none focus:ring-2 focus:ring-teal-500 rounded-lg"
                aria-label="New Entry"
            >
                <Plus size={24} />
                <span className="text-xs mt-1">New</span>
            </button>

            {/* View Toggle Buttons */}
            {navItems.map(item => (
                 <button
                    key={item.id}
                    onClick={() => onViewChange(item.id)}
                    className={`flex flex-col items-center justify-center p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                        currentView === item.id ? 'text-teal-400' : 'text-gray-400 hover:text-white' // Active state for list/calendar
                    }`}
                    aria-label={`Switch to ${item.label} view`}
                >
                    <item.icon size={24} />
                     <span className="text-xs mt-1">{item.label}</span>
                </button>
            ))}

            {/* Settings Button (Profile Pic) */}
            <button
                onClick={onShowSettings} // Now triggers setCurrentView('settings')
                 className={`p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                    currentView === 'settings' ? 'ring-2 ring-teal-400' : 'text-gray-400' // Active state for settings
                 }`}
                aria-label="Settings"
            >
                {settings.profilePicUrl ? (
                    <img src={settings.profilePicUrl}
                         alt="Profile"
                         className="w-8 h-8 rounded-full object-cover"
                         onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/32x32/4a5568/a0aec0?text=C"; }}
                    />
                ) : (
                    <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
                        <User size={18} />
                    </div>
                )}
            </button>
        </nav>
    );
}

export default BottomNavBar;
