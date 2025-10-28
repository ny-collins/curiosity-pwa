import React from 'react';
import { User, Calendar, List, PlusSquare, PanelLeft, PanelRight } from 'lucide-react'; 
import EntryList from './EntryList';
import CalendarView from './CalendarView';
import ThemedAvatar from './ThemedAvatar'; // Ensure this import is present

function Sidebar({
    entries, onSelect, onDelete, onCreate, activeEntryId,
    onShowSettings, className, settings, currentView, onViewChange,
    isExpanded, onToggleExpand 
}) {

    const sidebarWidth = isExpanded ? 'w-64' : 'w-16'; 
    const contentVisibility = isExpanded ? 'inline' : 'hidden'; 

    // Style object for primary color
    const primaryColorStyle = { backgroundColor: 'var(--color-primary-hex)' };
    const primaryTextStyle = { color: 'var(--color-primary-hex)' };
    
    // Helper function to apply active style
    const getActiveStyle = (viewName) => {
        if (currentView !== viewName) return { color: '#94a3b8' }; // slate-400
        if (isExpanded) {
            return { color: 'var(--color-primary-hex)', fontWeight: '600' }; // Bold text, primary color
        } else {
            return { backgroundColor: '#334155', color: 'var(--color-primary-hex)' }; // slate-700 bg
        }
    };
    
    // Helper for active indicator
    const activeIndicator = (viewName) => {
         if (currentView !== viewName) return null;
         if (isExpanded) {
             return <div className="absolute left-0 top-1 bottom-1 w-1 rounded-r-md" style={primaryColorStyle}></div>;
         }
         return <div className="absolute inset-1.5 bg-slate-700 rounded-md z-[-1]"></div>; // Adjusted inset
    };

    return (
        <div className={`bg-slate-900 h-full flex flex-col border-r border-slate-700 overflow-hidden transition-all duration-300 ease-in-out flex-shrink-0 ${sidebarWidth} ${className} z-30 relative`}>

            {/* Header Area */}
            <div className={`p-2 border-b border-slate-700 flex items-center flex-shrink-0 h-16 ${isExpanded ? 'justify-between px-3' : 'justify-center'}`}>
                 {isExpanded && (
                     <div className="flex items-center space-x-2">
                         <img src="/logo.svg" alt="Curiosity Logo" className="w-10 h-10" />
                         {/* Apply cursive font to logo text */}
                         <span className="font-semibold text-lg text-white" style={{ fontFamily: 'var(--font-logo)' }}>Curiosity</span>
                     </div>
                 )}
                 <button
                    onClick={onToggleExpand}
                    className="p-2 rounded-md text-gray-400 hover:text-white hover:bg-slate-700 transition-colors focus:outline-none"
                    aria-label={isExpanded ? "Collapse Sidebar" : "Expand Sidebar"}
                    title={isExpanded ? "Collapse Sidebar" : "Expand Sidebar"}
                >
                    {isExpanded ? <PanelLeft size={20} /> : <PanelRight size={20} />}
                </button>
            </div>

             {/* Navigation Area */}
             <nav className="flex-grow flex flex-col items-center space-y-2 py-4 px-2 overflow-y-auto custom-scrollbar">
                 <button
                    onClick={onCreate}
                    className={`w-full flex items-center rounded-md p-2 ${isExpanded ? 'justify-start px-4' : 'justify-center'} transition-colors`}
                    style={primaryTextStyle}
                    title="New Entry"
                 >
                     <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
                         <PlusSquare size={22}/>
                     </div>
                     <span className={`ml-3 font-semibold ${!isExpanded && 'hidden'}`}>New Entry</span>
                 </button>

                  <button
                     onClick={() => onViewChange('list')} 
                     className={`w-full flex items-center p-2 rounded-md relative ${isExpanded ? 'justify-start px-4' : 'justify-center'} transition-colors`}
                     style={getActiveStyle('list')}
                     title="List View"
                  >
                     {activeIndicator('list')}
                     <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
                         <List size={22} />
                     </div>
                     <span className={`ml-3 text-sm ${!isExpanded && 'hidden'}`}>List</span>
                  </button>
                 <button
                    onClick={() => onViewChange('calendar')}
                     className={`w-full flex items-center p-2 rounded-md relative ${isExpanded ? 'justify-start px-4' : 'justify-center'} transition-colors`}
                     style={getActiveStyle('calendar')}
                     title="Calendar View"
                 >
                     {activeIndicator('calendar')}
                     <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
                        <Calendar size={22} />
                     </div>
                    <span className={`ml-3 text-sm ${!isExpanded && 'hidden'}`}>Calendar</span>
                 </button>
            </nav>


            {/* Footer - Settings Button */}
            <div className={`p-2 border-t border-slate-700 mt-auto flex items-center flex-shrink-0 ${isExpanded ? 'justify-start px-2 h-16' : 'justify-center py-3'}`}>
                <button
                    onClick={onShowSettings} 
                    className={`w-full flex items-center p-1 rounded-full relative transition-colors ${currentView === 'settings' ? '' : 'text-gray-400 hover:text-white'} ${isExpanded ? '' : 'justify-center'}`}
                    style={getActiveStyle('settings')}
                    title="Settings"
                >
                     {activeIndicator('settings')}
                     {/* Use ThemedAvatar component */}
                     <ThemedAvatar 
                        profilePicUrl={settings?.profilePicUrl}
                        username={settings?.username}
                        className={isExpanded ? 'w-8 h-8 ml-1' : 'w-9 h-9'}
                     />
                     <span className={`ml-3 text-sm ${!isExpanded && 'hidden'}`}>Settings</span>
                </button>
            </div>
        </div>
    );
}

export default Sidebar;
