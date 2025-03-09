import { v4 as uuidv4 } from 'uuid';

/**
 * StorageManager - Handles all browser storage operations with toast notifications
 * 
 * This utility provides a standardized way to interact with localStorage for:
 * - Cards data
 * - Theme settings
 * - View preferences
 * - Any other application settings
 */
class StorageManager {
  // Storage keys
  static KEYS = {
    CARDS: 'cardManager_cards',
    THEME: 'cardManager_theme',
    CUSTOM_COLORS: 'cardManager_customColors',
    VIEW_MODE: 'cardManager_viewMode',
    SHOW_ARCHIVED: 'cardManager_showArchived',
    APP_TITLE: 'cardManager_title',
    SETTINGS: 'cardManager_settings'
  };
  
  /**
   * Initialize the storage system
   * - Sets up default values if not present
   * - Validates existing data
   */
  static init() {
    // Ensure cards storage exists
    if (!localStorage.getItem(this.KEYS.CARDS)) {
      localStorage.setItem(this.KEYS.CARDS, JSON.stringify([]));
    }
    
    // Set default theme if not present
    if (!localStorage.getItem(this.KEYS.THEME)) {
      localStorage.setItem(this.KEYS.THEME, 'light-theme');
    }
    
    // Set default view mode if not present
    if (!localStorage.getItem(this.KEYS.VIEW_MODE)) {
      localStorage.setItem(this.KEYS.VIEW_MODE, 'grid');
    }
    
    // Set default archived view preference
    if (localStorage.getItem(this.KEYS.SHOW_ARCHIVED) === null) {
      localStorage.setItem(this.KEYS.SHOW_ARCHIVED, 'false');
    }
    
    // Set default app title
    if (!localStorage.getItem(this.KEYS.APP_TITLE)) {
      localStorage.setItem(this.KEYS.APP_TITLE, 'My Cards');
    }
    
    // Validate data integrity
    this.validateStorageIntegrity();
  }
  
  /**
   * Check if storage has valid data structure
   */
  static validateStorageIntegrity() {
    try {
      // Validate cards data structure
      const cardsString = localStorage.getItem(this.KEYS.CARDS);
      if (cardsString) {
        const cards = JSON.parse(cardsString);
        if (!Array.isArray(cards)) {
          console.error('Cards storage is corrupted, resetting to empty array');
          localStorage.setItem(this.KEYS.CARDS, JSON.stringify([]));
          window.toast?.error('Cards data was corrupted and has been reset');
        }
      }
      
      // Validate theme colors
      const customColorsString = localStorage.getItem(this.KEYS.CUSTOM_COLORS);
      if (customColorsString) {
        try {
          JSON.parse(customColorsString);
        } catch (e) {
          console.error('Custom colors data corrupted, removing');
          localStorage.removeItem(this.KEYS.CUSTOM_COLORS);
          window.toast?.error('Theme settings were corrupted and have been reset');
        }
      }
    } catch (error) {
      console.error('Error during storage validation:', error);
    }
  }
  
  // Card Operations
  
  /**
   * Get all cards from storage
   * @returns {Array} Array of card objects
   */
  static getCards() {
    try {
      const cards = JSON.parse(localStorage.getItem(this.KEYS.CARDS) || '[]');
      return cards;
    } catch (error) {
      console.error('Failed to get cards:', error);
      window.toast?.error('Failed to load cards');
      return [];
    }
  }
  
  /**
   * Save cards to storage
   * @param {Array} cards - Array of card objects
   * @param {boolean} showToast - Whether to show a toast notification
   * @param {string} toastMessage - Custom toast message
   */
  static saveCards(cards, showToast = false, toastMessage = 'Cards saved successfully') {
    try {
      localStorage.setItem(this.KEYS.CARDS, JSON.stringify(cards));
      if (showToast && window.toast) {
        window.toast.success(toastMessage);
      }
      return true;
    } catch (error) {
      console.error('Failed to save cards:', error);
      if (window.toast) {
        window.toast.error('Failed to save cards');
      }
      return false;
    }
  }
  
  /**
   * Add a new card
   * @param {Object} cardData - Card data object
   * @returns {Object|null} - Added card with ID or null on failure
   */
  static addCard(cardData) {
    try {
      const cards = this.getCards();
      const newCard = {
        ...cardData,
        id: uuidv4(),
        createdAt: new Date().toISOString(),
        isArchived: false
      };
      
      cards.push(newCard);
      this.saveCards(cards, true, 'Card added successfully');
      return newCard;
    } catch (error) {
      console.error('Failed to add card:', error);
      window.toast?.error('Failed to add card');
      return null;
    }
  }
  
  /**
   * Update an existing card
   * @param {string} id - Card ID
   * @param {Object} cardData - Updated card data
   * @returns {boolean} - Success status
   */
  static updateCard(id, cardData) {
    try {
      const cards = this.getCards();
      const index = cards.findIndex(card => card.id === id);
      
      if (index === -1) {
        window.toast?.error('Card not found');
        return false;
      }
      
      cards[index] = {
        ...cards[index],
        ...cardData,
        updatedAt: new Date().toISOString()
      };
      
      this.saveCards(cards, true, 'Card updated successfully');
      return true;
    } catch (error) {
      console.error('Failed to update card:', error);
      window.toast?.error('Failed to update card');
      return false;
    }
  }
  
  /**
   * Archive or unarchive a card
   * @param {string} id - Card ID
   * @param {boolean} isArchived - Archive status
   * @returns {boolean} - Success status
   */
  static archiveCard(id, isArchived) {
    try {
      const cards = this.getCards();
      const index = cards.findIndex(card => card.id === id);
      
      if (index === -1) {
        window.toast?.error('Card not found');
        return false;
      }
      
      cards[index] = {
        ...cards[index],
        isArchived,
        updatedAt: new Date().toISOString()
      };
      
      const message = isArchived ? 'Card archived' : 'Card unarchived';
      this.saveCards(cards, true, message);
      return true;
    } catch (error) {
      console.error('Failed to change archive status:', error);
      window.toast?.error('Failed to change archive status');
      return false;
    }
  }
  
  /**
   * Delete a card
   * @param {string} id - Card ID
   * @returns {boolean} - Success status
   */
  static deleteCard(id) {
    try {
      const cards = this.getCards();
      const newCards = cards.filter(card => card.id !== id);
      
      if (cards.length === newCards.length) {
        window.toast?.error('Card not found');
        return false;
      }
      
      this.saveCards(newCards, true, 'Card deleted');
      return true;
    } catch (error) {
      console.error('Failed to delete card:', error);
      window.toast?.error('Failed to delete card');
      return false;
    }
  }
  
  /**
   * Duplicate a card
   * @param {string} id - Card ID to duplicate
   * @returns {Object|null} - New card or null on failure
   */
  static duplicateCard(id) {
    try {
      const cards = this.getCards();
      const cardToDuplicate = cards.find(card => card.id === id);
      
      if (!cardToDuplicate) {
        window.toast?.error('Card not found');
        return null;
      }
      
      const { id: _, createdAt, updatedAt, ...cardData } = cardToDuplicate;
      const duplicatedCard = {
        ...cardData,
        title: `${cardData.title} (Copy)`,
        id: uuidv4(),
        createdAt: new Date().toISOString(),
        isArchived: false
      };
      
      cards.push(duplicatedCard);
      this.saveCards(cards, true, 'Card duplicated successfully');
      return duplicatedCard;
    } catch (error) {
      console.error('Failed to duplicate card:', error);
      window.toast?.error('Failed to duplicate card');
      return null;
    }
  }
  
  // Theme Operations
  
  /**
   * Get current theme
   * @returns {string} - Theme ID
   */
  static getTheme() {
    return localStorage.getItem(this.KEYS.THEME) || 'light-theme';
  }
  
  /**
   * Save theme selection
   * @param {string} themeId - Theme identifier
   * @param {boolean} showToast - Whether to show toast notification
   */
  static saveTheme(themeId, showToast = true) {
    try {
      localStorage.setItem(this.KEYS.THEME, themeId);
      if (showToast && window.toast) {
        window.toast.success(`Theme changed to ${themeId.replace('-theme', '')}`);
      }
      return true;
    } catch (error) {
      console.error('Failed to save theme:', error);
      window.toast?.error('Failed to save theme preference');
      return false;
    }
  }
  
  /**
   * Get custom theme colors
   * @returns {Object|null} - Custom colors object or null
   */
  static getCustomThemeColors() {
    try {
      const colorsString = localStorage.getItem(this.KEYS.CUSTOM_COLORS);
      return colorsString ? JSON.parse(colorsString) : null;
    } catch (error) {
      console.error('Failed to get custom theme colors:', error);
      return null;
    }
  }
  
  /**
   * Save custom theme colors
   * @param {Object} colors - Custom colors object
   * @param {boolean} showToast - Whether to show toast notification
   */
  static saveCustomThemeColors(colors, showToast = true) {
    try {
      localStorage.setItem(this.KEYS.CUSTOM_COLORS, JSON.stringify(colors));
      if (showToast && window.toast) {
        window.toast.success('Custom theme saved');
      }
      return true;
    } catch (error) {
      console.error('Failed to save custom theme colors:', error);
      window.toast?.error('Failed to save custom theme');
      return false;
    }
  }
  
  // View Preferences
  
  /**
   * Get current view mode
   * @returns {string} - View mode (grid, list, compact)
   */
  static getViewMode() {
    return localStorage.getItem(this.KEYS.VIEW_MODE) || 'grid';
  }
  
  /**
   * Save view mode preference
   * @param {string} mode - View mode
   * @param {boolean} showToast - Whether to show toast notification
   */
  static saveViewMode(mode, showToast = true) {
    try {
      localStorage.setItem(this.KEYS.VIEW_MODE, mode);
      if (showToast && window.toast) {
        window.toast.info(`View changed to ${mode} mode`);
      }
      return true;
    } catch (error) {
      console.error('Failed to save view mode:', error);
      window.toast?.error('Failed to save view preference');
      return false;
    }
  }
  
  /**
   * Get archived cards visibility preference
   * @returns {boolean} - Whether to show archived cards
   */
  static getShowArchived() {
    return localStorage.getItem(this.KEYS.SHOW_ARCHIVED) === 'true';
  }
  
  /**
   * Save archived cards visibility preference
   * @param {boolean} show - Whether to show archived cards
   * @param {boolean} showToast - Whether to show toast notification
   */
  static saveShowArchived(show, showToast = true) {
    try {
      localStorage.setItem(this.KEYS.SHOW_ARCHIVED, String(show));
      if (showToast && window.toast) {
        window.toast.info(show ? 'Showing archived cards' : 'Hiding archived cards');
      }
      return true;
    } catch (error) {
      console.error('Failed to save archived visibility preference:', error);
      window.toast?.error('Failed to save archive view preference');
      return false;
    }
  }
  
  // App Title
  
  /**
   * Get application title
   * @returns {string} - App title
   */
  static getAppTitle() {
    return localStorage.getItem(this.KEYS.APP_TITLE) || 'My Cards';
  }
  
  /**
   * Save application title
   * @param {string} title - New app title
   * @param {boolean} showToast - Whether to show toast notification
   */
  static saveAppTitle(title, showToast = true) {
    try {
      localStorage.setItem(this.KEYS.APP_TITLE, title);
      if (showToast && window.toast) {
        window.toast.success('App title updated');
      }
      return true;
    } catch (error) {
      console.error('Failed to save app title:', error);
      window.toast?.error('Failed to save app title');
      return false;
    }
  }
  
  // Bulk Settings Operations
  
  /**
   * Export all settings (not including cards)
   * @returns {Object} - Settings object
   */
  static exportSettings() {
    try {
      const settings = {
        title: this.getAppTitle(),
        theme: this.getTheme(),
        customThemeColors: this.getCustomThemeColors(),
        viewMode: this.getViewMode(),
        showArchived: this.getShowArchived()
      };
      
      if (window.toast) {
        window.toast.success('Settings exported successfully');
      }
      
      return settings;
    } catch (error) {
      console.error('Failed to export settings:', error);
      window.toast?.error('Failed to export settings');
      return null;
    }
  }
  
  /**
   * Import settings
   * @param {Object|string} settings - Settings object or JSON string
   * @returns {boolean} - Success status
   */
  static importSettings(settings) {
    try {
      // Parse if string
      const settingsObj = typeof settings === 'string' ? JSON.parse(settings) : settings;
      
      // Apply settings
      if (settingsObj.title) {
        this.saveAppTitle(settingsObj.title, false);
      }
      
      if (settingsObj.theme) {
        this.saveTheme(settingsObj.theme, false);
      }
      
      if (settingsObj.customThemeColors) {
        this.saveCustomThemeColors(settingsObj.customThemeColors, false);
      }
      
      if (settingsObj.viewMode) {
        this.saveViewMode(settingsObj.viewMode, false);
      }
      
      if (typeof settingsObj.showArchived === 'boolean') {
        this.saveShowArchived(settingsObj.showArchived, false);
      }
      
      if (window.toast) {
        window.toast.success('Settings imported successfully');
      }
      
      return true;
    } catch (error) {
      console.error('Failed to import settings:', error);
      window.toast?.error('Failed to import settings');
      return false;
    }
  }
  
  /**
   * Reset all settings to defaults
   * @param {boolean} confirmFirst - Whether to ask for confirmation
   * @returns {boolean} - Success status
   */
  static resetAllSettings(confirmFirst = true) {
    try {
      if (confirmFirst && !window.confirm('Are you sure you want to reset all settings? This will not delete your cards.')) {
        return false;
      }
      
      // Reset theme
      localStorage.setItem(this.KEYS.THEME, 'light-theme');
      localStorage.removeItem(this.KEYS.CUSTOM_COLORS);
      
      // Reset view preferences
      localStorage.setItem(this.KEYS.VIEW_MODE, 'grid');
      localStorage.setItem(this.KEYS.SHOW_ARCHIVED, 'false');
      
      // Reset app title
      localStorage.setItem(this.KEYS.APP_TITLE, 'My Cards');
      
      if (window.toast) {
        window.toast.info('All settings have been reset');
      }
      
      return true;
    } catch (error) {
      console.error('Failed to reset settings:', error);
      window.toast?.error('Failed to reset settings');
      return false;
    }
  }
  
  /**
   * Check if storage is available
   * @returns {boolean} - Whether localStorage is available
   */
  static isStorageAvailable() {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      return false;
    }
  }
  
  /**
   * Get storage usage info
   * @returns {Object} - Storage usage information
   */
  static getStorageInfo() {
    try {
      let totalSize = 0;
      let itemCount = 0;
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('cardManager_')) {
          const value = localStorage.getItem(key);
          totalSize += key.length + (value ? value.length : 0);
          itemCount++;
        }
      }
      
      // Convert to KB
      const sizeInKB = (totalSize / 1024).toFixed(2);
      
      return {
        itemCount,
        sizeInKB,
        approximateLimit: '5MB', // Most browsers limit is around 5MB
        percentUsed: ((totalSize / (5 * 1024 * 1024)) * 100).toFixed(2)
      };
    } catch (error) {
      console.error('Failed to get storage info:', error);
      return null;
    }
  }
}

// Initialize on script load
try {
  StorageManager.init();
} catch (error) {
  console.error('Failed to initialize StorageManager:', error);
  if (window.toast) {
    window.toast.error('Failed to initialize storage system');
  }
}

export default StorageManager;