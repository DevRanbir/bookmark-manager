import React, { useEffect, useRef} from 'react';

function Sidebar({ isOpen, toggleSidebar, allTags, selectedTag, filterByTag, toggleArchivedView, showArchived, currentTheme, onThemeChange }) {
  const sidebarRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        toggleSidebar(); // Close sidebar when clicking outside
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, toggleSidebar]);


  return (
    <>
      <div className={`sidebar ${isOpen ? 'open' : ''}`} ref={sidebarRef} style={{ zIndex: 100000 }}>
        <div className="sidebar-header">
          <h2>Categories</h2>
          <button className="close-sidebar" onClick={toggleSidebar}>×</button>
        </div>
        
        <div className="tag-list">       
          <button 
            className="toggle-archived" 
            onClick={toggleArchivedView}
          >
            {showArchived ? "Show Active Cards" : "Show Archived Cards"}
          </button>

          
          
          <div 
            className={`sidebar-tag ${selectedTag === null ? 'active' : ''}`}
            onClick={() => filterByTag(null)}
          >
            All Cards
          </div>
          
          {allTags.map((tag, index) => (
            <div 
              key={index} 
              className={`sidebar-tag ${selectedTag === tag ? 'active' : ''}`}
              onClick={() => filterByTag(tag)}
            >
              {tag}
            </div>
          ))}
        </div>
        
        {/* Theme change button at the bottom of sidebar */}
      </div>
      
    </>
  );
}

export default Sidebar;