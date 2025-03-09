import React, { useRef, useState, useEffect } from 'react';
import { searchWikipedia } from '../utils/wikipediaApi';

function Header({ 
  searchTerm, 
  onSearchChange, 
  toggleSidebar, 
  openAddModal, 
  exportCards, 
  importCards, 
  viewMode, 
  setViewMode,
  toggleSettingsSidebar // New prop for settings sidebar
}) {
  const fileInputRef = useRef(null);
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchRef = useRef(null);
  const [title, setTitle] = useState('My Cards');
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  const handleImportClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      importCards(event.target.result);
    };
    reader.readAsText(file);
    e.target.value = null;
  };

  // Close search suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchFocused(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Load saved title from localStorage
  useEffect(() => {
    const savedTitle = localStorage.getItem('cardManagerTitle');
    if (savedTitle) {
      setTitle(savedTitle);
    }
  }, []);

  // Save title to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('cardManagerTitle', title);
  }, [title]);

  const handleTitleChange = (e) => {
    setTitle(e.target.value);
  };

  const toggleTitleEdit = () => {
    setIsEditingTitle(prev => !prev);
  };

  const handleTitleSubmit = (e) => {
    if (e.key === 'Enter') {
      setIsEditingTitle(false);
    }
  };

  const handleSearchInputChange = async (e) => {
    const value = e.target.value;
    onSearchChange(e);
    
    if (value.length >= 2) {
      try {
        const wikiData = await searchWikipedia(value);
        
        // Prepare suggestions list
        let suggestions = [];
        
        if (wikiData) {
          suggestions.push({
            type: 'wiki',
            title: wikiData.title,
            description: wikiData.extract || 'No description available'
          });
        }

        // Always add "Create a new card" suggestion
        suggestions.push({
          type: 'create',
          title: value,
          description: 'Create a new card with this title'
        });

        setSearchSuggestions(suggestions);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        // If there's an error, only show the create suggestion
        setSearchSuggestions([
          { type: 'create', title: value, description: 'Create a new card with this title' }
        ]);
      }
    } else {
      setSearchSuggestions([]);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    const prefillData = {
      title: suggestion.title,
      description: suggestion.description,
      source: suggestion.type === 'wiki' ? 'Wikipedia' : 'Manual',
      tags: suggestion.type === 'wiki' ? ['Wikipedia'] : []
    };
  
    openAddModal(prefillData);
    setSearchSuggestions([]);
    setIsSearchFocused(false);
  };

  return (
    <header className="header">
      <div className="menu-search-container">
        <button className="menu-button" onClick={toggleSidebar}>
          <svg viewBox="0 0 24 24" width="24" height="24">
            <rect x="3" y="5" width="18" height="2" fill="currentColor" />
            <rect x="3" y="11" width="18" height="2" fill="currentColor" />
            <rect x="3" y="17" width="18" height="2" fill="currentColor" />
          </svg>
        </button>
        <div className="search-container" ref={searchRef}>
          <input
            type="text"
            placeholder="Search cards..."
            value={searchTerm}
            onChange={handleSearchInputChange}
            onFocus={() => setIsSearchFocused(true)}
            className="search-input"
          />
          
          {isSearchFocused && searchSuggestions.length > 0 && (
            <div className="search-dropdown">
              {searchSuggestions.map((suggestion, index) => (
                <div 
                  key={index} 
                  className="search-suggestion-item" 
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  <div className="suggestion-icon">+</div>
                  <div>
                    <div className="suggestion-item-title">{suggestion.title}</div>
                    <div className="suggestion-item-desc">
                      {suggestion.type === 'wiki' ? 'From Wikipedia' : 'Create new card'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <div className="view-controls">
        <button 
          className={`view-button ${viewMode === 'grid' ? 'active' : ''}`}
          onClick={() => setViewMode('grid')}
        >
          <svg viewBox="0 0 24 24" width="18" height="18">
            <rect x="3" y="3" width="7" height="7" fill="currentColor" />
            <rect x="14" y="3" width="7" height="7" fill="currentColor" />
            <rect x="3" y="14" width="7" height="7" fill="currentColor" />
            <rect x="14" y="14" width="7" height="7" fill="currentColor" />
          </svg>
          <span>Grid</span>
        </button>
        <button 
          className={`view-button ${viewMode === 'list' ? 'active' : ''}`}
          onClick={() => setViewMode('list')}
        >
          <svg viewBox="0 0 24 24" width="18" height="18">
            <rect x="3" y="5" width="18" height="2" fill="currentColor" />
            <rect x="3" y="11" width="18" height="2" fill="currentColor" />
            <rect x="3" y="17" width="18" height="2" fill="currentColor" />
          </svg>
          <span>List</span>
        </button>
        <button 
          className={`view-button ${viewMode === 'compact' ? 'active' : ''}`}
          onClick={() => setViewMode('compact')}
        >
          <svg viewBox="0 0 24 24" width="18" height="18">
            <rect x="3" y="3" width="4" height="4" fill="currentColor" />
            <rect x="10" y="3" width="4" height="4" fill="currentColor" />
            <rect x="17" y="3" width="4" height="4" fill="currentColor" />
            <rect x="3" y="10" width="4" height="4" fill="currentColor" />
            <rect x="10" y="10" width="4" height="4" fill="currentColor" />
            <rect x="17" y="10" width="4" height="4" fill="currentColor" />
            <rect x="3" y="17" width="4" height="4" fill="currentColor" />
            <rect x="10" y="17" width="4" height="4" fill="currentColor" />
            <rect x="17" y="17" width="4" height="4" fill="currentColor" />
          </svg>
          <span>Compact</span>
        </button>
      </div>
      
      <button 
        className="add-card-button"
        onClick={() => openAddModal()}
      >
        Add Card
      </button>
      
      <div className="title-container">
        {isEditingTitle ? (
          <input
            type="text"
            value={title}
            onChange={handleTitleChange}
            onBlur={() => setIsEditingTitle(false)}
            onKeyDown={handleTitleSubmit}
            className="title-edit-input"
            autoFocus
          />
        ) : (
          <h1 onClick={toggleTitleEdit}>{title}</h1>
        )}
        <svg 
          viewBox="0 0 24 24" 
          width="24" 
          height="24" 
          onClick={toggleTitleEdit}
          style={{ cursor: 'pointer' }}
        >
          <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="currentColor" />
        </svg>
      </div>

      <div className="header-actions">      
        <input 
          type="file" 
          ref={fileInputRef} 
          style={{ display: 'none' }} 
          accept=".json" 
          onChange={handleFileChange} 
        />
        <button 
          className="import-button" 
          onClick={handleImportClick}
        >
          Import
        </button>
        <button 
          className="export-button" 
          onClick={exportCards}
        >
          Export
        </button>

        {/* Settings Icon */}
        <button 
          className="settings-button"
          onClick={toggleSettingsSidebar}
          aria-label="Open settings"
        >
          ⚙️
        </button>

      </div>
    </header>
  );
}

export default Header;