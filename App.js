import React, { useState, useCallback, useEffect } from 'react';
import './App.css';
import './themes.css'; // Import the new themes CSS file
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import CardGrid from './components/CardGrid';
import Footer from './components/Footer';
import AddCardModal from './components/AddCardModal';
import EditCardModal from './components/EditCardModal';
import SearchSuggestions from './components/SearchSuggestions';
import { useCards } from './hooks/useCards';
import { initToastSystem, setupToastListeners } from './components/ToastNotification';
import SettingsSidebar from './components/SettingsSidebar';
import StorageManager from './utils/StorageManager';

function App() {
  const { 
    addCard, 
    updateCard, 
    archiveCard, 
    deleteCard, 
    duplicateCard,
    exportCards,
    importCards,
    allTags
  } = useCards();
  
    // Load data from StorageManager instead of using useState with default values
    const [searchTerm, setSearchTerm] = useState('');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [selectedTag, setSelectedTag] = useState(null);
    const [isAddCardModalOpen, setIsAddCardModalOpen] = useState(false);
    const [isEditCardModalOpen, setIsEditCardModalOpen] = useState(false);
    const [currentCard, setCurrentCard] = useState(null);
    
    // Load these values from StorageManager
    const [viewMode, setViewMode] = useState(StorageManager.getViewMode()); 
    const [showArchived, setShowArchived] = useState(StorageManager.getShowArchived());
    const [prefilledCard, setPrefilledCard] = useState(null);
    const [currentTheme, setCurrentTheme] = useState(StorageManager.getTheme());
    const [customThemeColors, setCustomThemeColors] = useState(StorageManager.getCustomThemeColors());
    const [isSettingsSidebarOpen, setIsSettingsSidebarOpen] = useState(false);
    const [cards, setCards] = useState([]);

  // Initialize toast notification system
  useEffect(() => {
    initToastSystem();
    setupToastListeners();
  }, []);

  // Load saved theme from localStorage
  useEffect(() => {
    const storedCards = StorageManager.getCards();
    setCards(storedCards);
  }, []);

  // Apply theme to document
  useEffect(() => {
    document.body.className = currentTheme;
    localStorage.setItem('cardManagerTheme', currentTheme);
    
    // Apply custom theme if selected
    if (currentTheme === 'custom-theme' && customThemeColors) {
      const root = document.documentElement;
      
      for (const [key, value] of Object.entries(customThemeColors)) {
        let cssVarName;
        switch (key) {
          case 'primary':
            cssVarName = '--primary';
            // Also set the hover color (slightly darker)
            root.style.setProperty('--primary-hover', adjustColor(value, -20));
            break;
          case 'background':
            cssVarName = '--background';
            break;
          case 'cardBg':
            cssVarName = '--card-bg';
            break;
          case 'textPrimary':
            cssVarName = '--text-primary';
            break;
          case 'textSecondary':
            cssVarName = '--text-secondary';
            break;
          case 'border':
            cssVarName = '--border';
            break;
          default:
            cssVarName = `--${key}`;
        }
        
        root.style.setProperty(cssVarName, value);
      }
    }
  }, [currentTheme, customThemeColors]);

  // Helper function to adjust color brightness
  const adjustColor = (color, amount) => {
    return '#' + color.replace(/^#/, '').replace(/../g, color => 
      ('0' + Math.min(255, Math.max(0, parseInt(color, 16) + amount)).toString(16)).slice(-2)
    );
  };

  const toggleSettingsSidebar = useCallback(() => {
    setIsSettingsSidebarOpen(prev => !prev);
  }, []);
  
  const resetAllSettings = useCallback(() => {
    const success = StorageManager.resetAllSettings();
    if (success) {
      setViewMode('grid');
      setCurrentTheme('light-theme');
      setCustomThemeColors(null);
      setShowArchived(false);
      // Force reload to apply all changes
      setTimeout(() => window.location.reload(), 1000);
    }
  }, []);
  
  const exportSettings = useCallback(() => {
    const settings = StorageManager.exportSettings();
    if (settings) {
      const dataStr = JSON.stringify(settings, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      const exportFileName = 'card-manager-settings.json';
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileName);
      linkElement.click();
    }
  }, []);
  
  const importSettings = useCallback((fileContent) => {
    const success = StorageManager.importSettings(fileContent);
    if (success) {
      // Reload the page to apply all changes
      setTimeout(() => window.location.reload(), 1000);
    }
    return success;
  }, []);

  // Handle theme change
  const handleViewModeChange = useCallback((mode) => {
    StorageManager.saveViewMode(mode);
    setViewMode(mode);
  }, []);
  
  // Handle theme change
  const handleThemeChange = (themeId, customColors = null) => {
    StorageManager.saveTheme(themeId);
    setCurrentTheme(themeId);
    
    if (themeId === 'custom-theme' && customColors) {
      StorageManager.saveCustomThemeColors(customColors);
      setCustomThemeColors(customColors);
    }
  };

  // Enhanced card operations with toast notifications
  const enhancedAddCard = useCallback((cardData) => {
    try {
      const newCard = StorageManager.addCard(cardData);
      window.toast.success('Card added successfully');
      return newCard;
    } catch (error) {
      window.toast.error('Failed to add card');
      console.error('Error adding card:', error);
      throw error;
    }
  }, [addCard]);

  const enhancedUpdateCard = useCallback((id, cardData) => {
    try {
      const success = StorageManager.updateCard(id, cardData);
      if(success){
        setCards(prev => prev.map(card => card.id === id ? {...card, ...cardData} : card));
      }
      window.toast.success('Card updated successfully');
    } catch (error) {
      window.toast.error('Failed to update card');
      console.error('Error updating card:', error);
      throw error;
    }
  }, [updateCard]);

  const enhancedArchiveCard = useCallback((id, isArchived) => {
    try {
      archiveCard(id, isArchived);
      if (isArchived) {
        const success = StorageManager.archiveCard(id, isArchived);
        if (success) {
          setCards(prev => prev.map(card => 
            card.id === id ? {...card, isArchived} : card
          ));
        }
        window.toast.success('Card archived');
      } else {
        window.toast.info('Card state changed');
      }
    } catch (error) {
      window.toast.error(isArchived ? 'Failed to archive card' : 'Failed to restore card');
      console.error('Error archiving/restoring card:', error);
      throw error;
    }
  }, [archiveCard]);

  const enhancedDeleteCard = useCallback((id) => {
    try {
      deleteCard(id);
      const success = StorageManager.deleteCard(id);
      if (success) {
        setCards(prev => prev.filter(card => card.id !== id));
      }
      window.toast.info('Card deleted');
    } catch (error) {
      window.toast.error('Failed to delete card');
      console.error('Error deleting card:', error);
      throw error;
    }
  }, [deleteCard]);

  const enhancedDuplicateCard = useCallback((id) => {
    try {
      duplicateCard(id);
      const newCard = StorageManager.duplicateCard(id);
      if (newCard) {
        setCards(prev => [...prev, newCard]);
      }
      window.toast.success('Card duplicated successfully');
    } catch (error) {
      window.toast.error('Failed to duplicate card');
      console.error('Error duplicating card:', error);
      throw error;
    }
  }, [duplicateCard]);

  const enhancedExportCards = useCallback(() => {
    try {
      exportCards();
      window.toast.success('Cards exported successfully');
    } catch (error) {
      window.toast.error('Failed to export cards');
      console.error('Error exporting cards:', error);
      throw error;
    }
  }, [exportCards]);

  const enhancedImportCards = useCallback((data) => {
    try {
      const count = importCards(data);
      window.toast.success(`${count} cards imported successfully`);
      return count;
    } catch (error) {
      window.toast.error('Failed to import cards');
      console.error('Error importing cards:', error);
      throw error;
    }
  }, [importCards]);

  

  // Handle search term change
  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  // Effect to prefill the Add Card modal when opened via search
  useEffect(() => {
    if (isAddCardModalOpen && prefilledCard) {
      setCurrentCard(prefilledCard);
    }
  }, [isAddCardModalOpen, prefilledCard]);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen(prev => !prev);
  }, []);

  const filterByTag = useCallback((tag) => {
    setSelectedTag(prevTag => {
      const newTag = prevTag === tag ? null : tag;
      return newTag;
    });
  }, []);

  const openEditModal = useCallback((card) => {
    setCurrentCard({
      ...card,
      customTag: card.tags.join(', '),
      iconUrl: card.icon?.type === 'image' ? card.icon.url : ''
    });
    setIsEditCardModalOpen(true);
  }, []);

  const closeAddModal = useCallback(() => {
    setIsAddCardModalOpen(false);
    setPrefilledCard(null);
    setSearchTerm(''); 
  }, []);

  const closeEditModal = useCallback(() => {
    setIsEditCardModalOpen(false);
    setCurrentCard(null);
  }, []);

  // Open Add Card Modal with Search Term
  const handleOpenAddModalWithTerm = useCallback(() => {
    setPrefilledCard({
      title: searchTerm || '',
      description: '',
      tags: [],
      icon: null,
      url: '',
      customTag: ''
    });
    setIsAddCardModalOpen(true);
    setSearchTerm(''); 
  }, [searchTerm]);

  // Open Add Card Modal with Prefilled Data (Fix for Suggestions)
  const openAddModal = useCallback((prefillData = null) => {
    setPrefilledCard(prefillData ? {
      title: prefillData.title || '',
      description: prefillData.description || '',
      tags: prefillData.tags || [],
      icon: prefillData.icon || null,
      url: prefillData.url || '',
      customTag: prefillData.tags ? prefillData.tags.join(', ') : ''
    } : null);
    
    setIsAddCardModalOpen(true);
    setSearchTerm(''); // Clear search term when adding from suggestion
  }, []);

  // Filter Cards
  const filteredCards = cards.filter(card => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = !searchTerm || 
      card.title.toLowerCase().includes(searchLower) ||
      card.description.toLowerCase().includes(searchLower) ||
      card.tags.some(tag => tag.toLowerCase().includes(searchLower));

    const matchesTag = selectedTag === null || card.tags.includes(selectedTag);
    const matchesArchiveStatus = showArchived ? card.isArchived : !card.isArchived;

    return matchesSearch && matchesTag && matchesArchiveStatus;
  });

  // Count for Footer
  const activeCount = cards.filter(card => !card.isArchived).length;
  const archivedCount = cards.filter(card => card.isArchived).length;

  const toggleArchivedView = useCallback(() => {
    const newValue = !showArchived;
    StorageManager.saveShowArchived(newValue);
    setShowArchived(newValue);
  }, [showArchived]);

  // Show suggestions if no matching cards
  const showSuggestions = searchTerm && filteredCards.length === 0;

  return (
    <div className={`app ${currentTheme}`}>
      <Header 
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        toggleSidebar={toggleSidebar}
        openAddModal={handleOpenAddModalWithTerm}
        exportCards={enhancedExportCards}
        importCards={enhancedImportCards}
        viewMode={viewMode}
        toggleSettingsSidebar={toggleSettingsSidebar} // Add this prop
        setViewMode={handleViewModeChange}
      />

      <Sidebar 
        isOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        allTags={allTags}
        selectedTag={selectedTag}
        filterByTag={filterByTag}
        showArchived={showArchived}
        toggleArchivedView={toggleArchivedView}
        currentTheme={currentTheme}
        onThemeChange={handleThemeChange}
      />

      <main className={`cards-container ${isSidebarOpen ? 'with-sidebar' : ''}`}>
        {filteredCards.length > 0 ? (
          <CardGrid 
            cards={filteredCards}
            viewMode={viewMode}
            onEdit={openEditModal}
            onArchive={enhancedArchiveCard}
            onDelete={enhancedDeleteCard}
            onDuplicate={enhancedDuplicateCard}
          />
        ) : (
          <div className="no-results">
            {showSuggestions ? (
              <SearchSuggestions 
                searchTerm={searchTerm}
                onAddCard={openAddModal}
              />
            ) : (
              <p>No cards found. {searchTerm && 'Try a different search term or '} 
                {selectedTag && 'select a different tag or '} 
                <button onClick={() => setIsAddCardModalOpen(true)} className="text-button" style={{ display: 'inline' }}>
                  add a card ?
                </button>
              </p>
            )}
          </div>
        )}
      </main>

      <Footer 
        activeCount={activeCount} 
        archivedCount={archivedCount} 
        totalCount={cards.length} 
        showArchived={showArchived}
        toggleArchivedView={toggleArchivedView}
      />

      {isAddCardModalOpen && (
        <AddCardModal 
          onClose={closeAddModal}
          onAddCard={enhancedAddCard}
          prefillData={prefilledCard}
        />
      )}

      {isEditCardModalOpen && currentCard && (
        <EditCardModal 
          card={currentCard}
          onClose={closeEditModal}
          onUpdateCard={enhancedUpdateCard}
        />
      )}
      {isSettingsSidebarOpen && (
        <SettingsSidebar
          // ... other props
          currentTheme={currentTheme}
          onThemeChange={handleThemeChange}
          viewMode={viewMode}
          setViewMode={handleViewModeChange}
          showArchived={showArchived}
          toggleArchivedView={toggleArchivedView}
          resetAllSettings={resetAllSettings}
          customThemeColors={customThemeColors}
          exportSettings={exportSettings}
          importSettings={importSettings}
        />
      )}
    </div>
  );
}

export default App;