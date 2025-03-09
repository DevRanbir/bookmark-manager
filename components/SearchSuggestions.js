import React, { useState, useEffect } from 'react';
import { searchWikipedia } from '../utils/wikipediaApi';


function SearchSuggestions({ searchTerm, onAddCard, setIsAddCardModalOpen }) {
  const [isLoading, setIsLoading] = useState(false);
  const [wikiData, setWikiData] = useState(null);
  
  useEffect(() => {
    const fetchWikiData = async () => {
      if (!searchTerm || searchTerm.length < 2) {
        setWikiData(null);
        return;
      }
      
      setIsLoading(true);
      try {
        const data = await searchWikipedia(searchTerm);
        setWikiData(data);
      } catch (error) {
        console.error('Error fetching wiki data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    // Debounce the search to avoid too many API calls
    const timer = setTimeout(() => {
      fetchWikiData();
    }, 500);
    
    return () => clearTimeout(timer);
  }, [searchTerm]);
  
  const handleCreateFromWiki = () => {
    if (wikiData) {
      const newCard = {
        title: wikiData.title,
        description: wikiData.extract,
        tags: ['Wikipedia'],
        icon: wikiData.thumbnail ? { type: 'image', url: wikiData.thumbnail } : null,
        url: wikiData.url,
        iconUrl: wikiData.thumbnail || ''
      };
      
      onAddCard(newCard);
    } else {
      // If no wiki data, open the add card modal pre-filled with search term
      setIsAddCardModalOpen(true);
    }
  };
  
  if (!searchTerm) return null;
  
  return (
    <div className="search-suggestions">
      {isLoading ? (
        <div className="suggestion-loading">Looking up "{searchTerm}"...</div>
      ) : wikiData ? (
        <div className="suggestion-card" onClick={handleCreateFromWiki}>
          <div className="suggestion-icon">
            {wikiData.thumbnail ? (
              <img src={wikiData.thumbnail} alt={wikiData.title} />
            ) : (
              <div className="plus-icon">+</div>
            )}
          </div>
          <div className="suggestion-content">
            <div className="suggestion-title">Create card for: {wikiData.title}</div>
            <div className="suggestion-description">{wikiData.extract}</div>
          </div>
        </div>
      ) : (
        <div className="suggestion-card" onClick={() => setIsAddCardModalOpen(true)}>
          <div className="suggestion-icon">
            <div className="plus-icon">+</div>
          </div>
          <div className="suggestion-content">
            <div className="suggestion-title">Create new card: "{searchTerm}"</div>
            <div className="suggestion-description">No Wikipedia entry found. Click to create a custom card.</div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SearchSuggestions;