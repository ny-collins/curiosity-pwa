import React from 'react';
// Added PanelLeft, PanelRight for toggle
import { User, Calendar, List, PlusSquare, PanelLeft, PanelRight } from 'lucide-react';
// REMOVED EntryList, CalendarView imports

// Receive isExpanded state and toggle function from App
function Sidebar({
    // REMOVED entries, onSelect, onDelete, activeEntryId props
    onCreate, onShowSettings, className, settings,
    currentView, onViewChange,
    isExpanded, onToggleExpand
}) {

    // Determine width and visibility based on expanded state
    const sidebarWidth = isExpanded ? 'w-64' : 'w-16'; // Adjusted expanded width
    const contentVisibility = isExpanded ? 'inline' : 'hidden'; // Hide text when collapsed

    return (
        // Added transition-all for smooth width change. Added z-30 for potential overlay interaction.
        <div className={`bg-slate-900 h-full flex flex-col border-r border-slate-700 overflow-hidden transition-all duration-300 ease-in-out flex-shrink-0 ${sidebarWidth} ${className} z-30 relative`}>

            {/* Header Area - Toggle Button & Logo (when expanded) */}
            {/* Adjusted padding and added space-x-2 */}
            <div className={`p-2 border-b border-slate-700 flex items-center flex-shrink-0 h-16 ${isExpanded ? 'justify-between px-3' : 'justify-center'}`}>
                 {/* Display Logo when expanded */}
                 {isExpanded && (
                     <div className="flex items-center space-x-2">
                         {/* Increased logo size */}
                         <img src="/logo.svg" alt="Curiosity Logo" className="w-10 h-10" /> 
                         <span className="font-semibold text-lg text-white">Curiosity</span>
                     </div>
                 )}

                 {/* Toggle Expand Button */}
                 <button
                    onClick={onToggleExpand}
                    className="p-2 rounded-md text-gray-400 hover:text-white hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500"
                    aria-label={isExpanded ? "Collapse Sidebar" : "Expand Sidebar"}
                    title={isExpanded ? "Collapse Sidebar" : "Expand Sidebar"}
                >
                    {isExpanded ? <PanelLeft size={20} /> : <PanelRight size={20} />}
                </button>
            </div>

             {/* Navigation Area - Always takes remaining space */}
             <nav className="flex-grow flex flex-col items-center space-y-2 py-4 px-2 overflow-y-auto custom-scrollbar"> {/* Added px-2 */}
                  {/* New Entry Button */}
                 <button
                    onClick={onCreate}
                    className={`w-full flex items-center text-teal-400 hover:bg-slate-700 hover:text-teal-300 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 rounded-md p-2 ${isExpanded ? 'justify-start px-4' : 'justify-center'}`}
                    aria-label="New Entry"
                    title="New Entry"
                 >
                     <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
                         <PlusSquare size={22}/>
                     </div>
                     <span className={`ml-3 font-semibold ${!isExpanded && 'hidden'}`}>New Entry</span>
                 </button>

                 {/* View Toggle Buttons */}
                  <button
                     onClick={() => onViewChange('list')}
                     className={`w-full flex items-center p-2 rounded-md relative focus:outline-none focus:ring-2 focus:ring-teal-500 ${currentView === 'list' ? 'text-teal-400' : 'text-gray-400 hover:text-white hover:bg-slate-700'} ${isExpanded ? 'justify-start px-4' : 'justify-center'}`}
                     aria-label="List View"
                     title="List View"
                  >
                     {/* Active Indicator: Left border when expanded, background when collapsed */}
                     {currentView === 'list' && isExpanded && <div className="absolute left-0 top-0 bottom-0 w-1 bg-teal-400 rounded-r-md"></div>}
                     {!isExpanded && currentView === 'list' && <div className="absolute inset-1 bg-slate-700 rounded-md z-[-1]"></div>}

                     <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
                         <List size={22} />
                     </div>
                     <span className={`ml-3 text-sm ${!isExpanded && 'hidden'}`}>List</span>
                  </button>
                 <button
                    onClick={() => onViewChange('calendar')}
                     className={`w-full flex items-center p-2 rounded-md relative focus:outline-none focus:ring-2 focus:ring-teal-500 ${currentView === 'calendar' ? 'text-teal-400' : 'text-gray-400 hover:text-white hover:bg-slate-700'} ${isExpanded ? 'justify-start px-4' : 'justify-center'}`}
                     aria-label="Calendar View"
                     title="Calendar View"
                 >
                     {/* Active Indicator: Left border when expanded, background when collapsed */}
                     {currentView === 'calendar' && isExpanded && <div className="absolute left-0 top-0 bottom-0 w-1 bg-teal-400 rounded-r-md"></div>}
                     {!isExpanded && currentView === 'calendar' && <div className="absolute inset-1 bg-slate-700 rounded-md z-[-1]"></div>}

                     <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
                        <Calendar size={22} />
                     </div>
                    <span className={`ml-3 text-sm ${!isExpanded && 'hidden'}`}>Calendar</span>
                 </button>
            </nav>


            {/* Footer - Settings Button */}
            <div className={`p-2 border-t border-slate-700 mt-auto flex items-center flex-shrink-0 ${isExpanded ? 'justify-start px-2 h-16' : 'justify-center py-3'}`}>
                {/* Profile/Settings Button */}
                <button
                    onClick={onShowSettings}
                    // Adjusted padding and removed fixed size when collapsed to rely on container
                    className={`w-full flex items-center p-1 rounded-full text-gray-400 hover:text-white hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 ${isExpanded ? '' : 'justify-center'}`}
                    aria-label="Settings"
                    title="Settings"
                >
                     {/* Fixed size container for the icon/image */}
                     <div className={`flex-shrink-0 rounded-full overflow-hidden ${isExpanded ? 'w-8 h-8' : 'w-9 h-9'} bg-slate-700 flex items-center justify-center`}>
                        {settings && settings.profilePicUrl ? (
                            <img src={settings.profilePicUrl}
                                 alt="Profile"
                                 className={`w-full h-full object-cover`} // Let the container define size
                                 onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/36x36/4a5568/a0aec0?text=C"; }}
                            />
                        ) : (
                            <User size={isExpanded ? 18 : 20} />
                        )}
                    </div>
                     <span className={`ml-3 text-sm ${!isExpanded && 'hidden'}`}>Settings</span>
                </button>
            </div>
        </div>
    );
}

export default Sidebar;
