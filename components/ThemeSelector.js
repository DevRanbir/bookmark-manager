import React, { useState } from 'react';

const predefinedThemes = [
  { name: 'Light', id: 'light-theme' },
  { name: 'Dark', id: 'dark-theme' },
  { name: 'Sunset', id: 'sunset-theme' },
  { name: 'Ocean', id: 'ocean-theme' },
  { name: 'Forest', id: 'forest-theme' }
];

function ThemeSelector({ isOpen, onClose, onThemeChange, currentTheme }) {
  const [customColors, setCustomColors] = useState({
    primary: '#6366f1',
    background: '#f9fafb',
    cardBg: '#ffffff',
    textPrimary: '#1f2937',
    textSecondary: '#6b7280',
    border: '#e5e7eb'
  });

  const handleCustomColorChange = (colorKey, value) => {
    setCustomColors(prev => ({
      ...prev,
      [colorKey]: value
    }));
  };

  const applyCustomTheme = () => {
    onThemeChange('custom-theme', customColors);
    onClose();
  };

  return (
    <div className={`theme-selector-modal ${isOpen ? 'open' : ''}`}>
      <div className="theme-selector-content">
        <div className="theme-selector-header">
          <h3>Select Theme</h3>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="predefined-themes">
          <h4>Predefined Themes</h4>
          <div className="theme-buttons">
            {predefinedThemes.map(theme => (
              <button
                key={theme.id}
                className={`theme-button ${currentTheme === theme.id ? 'active' : ''}`}
                onClick={() => {
                  onThemeChange(theme.id);
                  onClose();
                }}
              >
                <div className={`theme-preview ${theme.id}`}></div>
                <span>{theme.name}</span>
              </button>
            ))}
          </div>
        </div>
        
        <div className="custom-theme">
          <h4>Custom Theme</h4>
          <div className="color-pickers">
            <div className="color-picker">
              <label>Primary Color</label>
              <input 
                type="color" 
                value={customColors.primary} 
                onChange={(e) => handleCustomColorChange('primary', e.target.value)} 
              />
            </div>
            <div className="color-picker">
              <label>Background</label>
              <input 
                type="color" 
                value={customColors.background} 
                onChange={(e) => handleCustomColorChange('background', e.target.value)} 
              />
            </div>
            <div className="color-picker">
              <label>Card Background</label>
              <input 
                type="color" 
                value={customColors.cardBg} 
                onChange={(e) => handleCustomColorChange('cardBg', e.target.value)} 
              />
            </div>
            <div className="color-picker">
              <label>Text Primary</label>
              <input 
                type="color" 
                value={customColors.textPrimary} 
                onChange={(e) => handleCustomColorChange('textPrimary', e.target.value)} 
              />
            </div>
            <div className="color-picker">
              <label>Text Secondary</label>
              <input 
                type="color" 
                value={customColors.textSecondary} 
                onChange={(e) => handleCustomColorChange('textSecondary', e.target.value)} 
              />
            </div>
            <div className="color-picker">
              <label>Border Color</label>
              <input 
                type="color" 
                value={customColors.border} 
                onChange={(e) => handleCustomColorChange('border', e.target.value)} 
              />
            </div>
          </div>
          
          <div className="preview-custom-theme">
            <div className="preview-panel" style={{
              backgroundColor: customColors.cardBg,
              color: customColors.textPrimary,
              border: `1px solid ${customColors.border}`
            }}>
              <div className="preview-header" style={{ color: customColors.primary }}>Preview</div>
              <div className="preview-content">
                <p style={{ color: customColors.textPrimary }}>Primary Text</p>
                <p style={{ color: customColors.textSecondary }}>Secondary Text</p>
                <button style={{ 
                  backgroundColor: customColors.primary, 
                  color: '#ffffff' 
                }}>Button</button>
              </div>
            </div>
          </div>
          
          <button className="apply-custom-theme" onClick={applyCustomTheme}>
            Apply Custom Theme
          </button>
        </div>
      </div>
    </div>
  );
}

export default ThemeSelector;