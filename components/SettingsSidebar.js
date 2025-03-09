import React, { useRef, useEffect, useState } from 'react';
import ThemeSelector from './ThemeSelector';

function SettingsSidebar({ 
  isOpen, 
  onClose, 
  currentTheme, 
  onThemeChange, 
  viewMode, 
  setViewMode,
  showArchived,
  toggleArchivedView,
  resetAllSettings,
  customThemeColors,
  exportSettings,
  importSettings
}) {
  const sidebarRef = useRef(null);
  const [showThemeSettings] = useState(false);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const fileInputRef = useRef(null);
  const [isThemeSelectorOpen, setIsThemeSelectorOpen] = useState(false);

  // Custom theme color state
  const [tempCustomColors, setTempCustomColors] = useState(customThemeColors || {
    primary: '#6366f1',
    background: '#f9fafb',
    cardBg: '#ffffff',
    textPrimary: '#1f2937',
    textSecondary: '#6b7280',
    border: '#e5e7eb'
  });

  // Reset temp colors when sidebar opens
  useEffect(() => {
    if (isOpen && customThemeColors) {
      setTempCustomColors(customThemeColors);
    }
  }, [isOpen, customThemeColors]);

  // Close sidebar when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleImportClick = () => {
    fileInputRef.current.click();
  };

  const openThemeSelector = () => {
    setIsThemeSelectorOpen(true);
  };

  const closeThemeSelector = () => {
    setIsThemeSelectorOpen(false);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      importSettings(event.target.result);
    };
    reader.readAsText(file);
    e.target.value = null;
  };

  const applyCustomTheme = () => {
    onThemeChange('custom-theme', tempCustomColors);
  };

  const resetCustomTheme = () => {
    setTempCustomColors({
        primary: '#6366f1',
        background: '#f9fafb',
        cardBg: '#ffffff',
        textPrimary: '#1f2937',
        textSecondary: '#6b7280',
        border: '#e5e7eb'
    });
  };

  return (
    <div className={`settings-sidebar ${isOpen ? 'open' : ''}`} ref={sidebarRef}>
      <div className="settings-header">
        <h2>Settings</h2>
        <button className="close-settings" onClick={onClose}>×</button>
      </div>
      
      <div className="settings-content">
        {/* Display Settings */}
        <div className="settings-section">
          <h3>Display Settings</h3>
          
          <div className="setting-group">
            <label>View Mode:</label>
            <div className="view-mode-buttons">
              <button 
                className={`view-button ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
              >
                Grid
              </button>
              <button 
                className={`view-button ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
              >
                List
              </button>
              <button 
                className={`view-button ${viewMode === 'compact' ? 'active' : ''}`}
                onClick={() => setViewMode('compact')}
              >
                Compact
              </button>
            </div>
          </div>
          
          <div className="setting-group">
            <label>Theme:</label>
            <div style={{ marginTop: 'auto', padding: '1rem 0' }}>
                <button 
                    className="theme-change-button"
                    onClick={openThemeSelector}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="5" />
                    <path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
                    </svg>
                    Change Theme
                </button>
            </div>
          </div>
          
          {/* Custom Theme Settings */}
          {showThemeSettings && (
            <div className="custom-theme-settings">
              <h4>Custom Theme Colors</h4>
              
              <div className="color-picker-group">
                <label>Primary Color:</label>
                <input 
                  type="color" 
                  value={tempCustomColors.primary}
                  onChange={(e) => setTempCustomColors({...tempCustomColors, primary: e.target.value})}
                />
              </div>
              
              <div className="color-picker-group">
                <label>Background:</label>
                <input 
                  type="color" 
                  value={tempCustomColors.background}
                  onChange={(e) => setTempCustomColors({...tempCustomColors, background: e.target.value})}
                />
              </div>
              
              <div className="color-picker-group">
                <label>Card Background:</label>
                <input 
                  type="color" 
                  value={tempCustomColors.cardBg}
                  onChange={(e) => setTempCustomColors({...tempCustomColors, cardBg: e.target.value})}
                />
              </div>
              
              <div className="color-picker-group">
                <label>Text Primary:</label>
                <input 
                  type="color" 
                  value={tempCustomColors.textPrimary}
                  onChange={(e) => setTempCustomColors({...tempCustomColors, textPrimary: e.target.value})}
                />
              </div>
              
              <div className="color-picker-group">
                <label>Text Secondary:</label>
                <input 
                  type="color" 
                  value={tempCustomColors.textSecondary}
                  onChange={(e) => setTempCustomColors({...tempCustomColors, textSecondary: e.target.value})}
                />
              </div>
              
              <div className="color-picker-group">
                <label>Border Color:</label>
                <input 
                  type="color" 
                  value={tempCustomColors.border}
                  onChange={(e) => setTempCustomColors({...tempCustomColors, border: e.target.value})}
                />
              </div>
              
              <div className="theme-action-buttons">
                <button onClick={applyCustomTheme}>Apply Theme</button>
                <button onClick={resetCustomTheme}>Reset Colors</button>
              </div>
            </div>
          )}
        </div>
        
        {/* Content Settings */}
        <div className="settings-section">
        <h3>Content Settings</h3>
        
        <div className="setting-group">
            <div className="setting-toggle">
            <input 
                type="checkbox" 
                id="toggleArchived"
                checked={showArchived}
                onChange={toggleArchivedView}
            />
            <label htmlFor="toggleArchived">Show Archived Cards</label>
            </div>
        </div>
        </div>

        
        {/* Advanced Settings */}
        <div className="settings-section">
          <h3 onClick={() => setShowAdvancedSettings(!showAdvancedSettings)} style={{ cursor: 'pointer' }}>
            Advanced Settings {showAdvancedSettings ? '▼' : '►'}
          </h3>
          
          {showAdvancedSettings && (
            <>
              <div className="setting-group">
                <button onClick={exportSettings} className="full-width-button">
                  Export All Settings
                </button>
              </div>
              
              <div className="setting-group">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  style={{ display: 'none' }} 
                  accept=".json" 
                  onChange={handleFileChange} 
                />
                <button onClick={handleImportClick} className="full-width-button">
                  Import Settings
                </button>
              </div>
              
              <div className="setting-group">
                <button onClick={resetAllSettings} className="full-width-button danger-button">
                  Reset All Settings
                </button>
              </div>
            </>
          )}
          {isThemeSelectorOpen && (
            <ThemeSelector 
            isOpen={isThemeSelectorOpen}
            onClose={closeThemeSelector}
            onThemeChange={onThemeChange}
            currentTheme={currentTheme}
            />
        )}
        </div>
      </div>
    </div>
  );
}

export default SettingsSidebar;