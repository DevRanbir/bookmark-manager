import { useState, useEffect, useCallback } from 'react';
import {generateRandomColor } from '../utils/iconUtils';

function generateIconFromTitle(title) {
  if (!title) return { type: 'letter', letter: '?', color: generateRandomColor() };
  const letter = title.charAt(0).toUpperCase();
  return { type: 'letter', letter, color: generateRandomColor() };
}

export { generateIconFromTitle, generateRandomColor };

const STORAGE_KEY = 'bookmarkCards';

export function useCards() {
  const [cards, setCards] = useState([]);
  const [allTags, setAllTags] = useState([]);

  // Load cards from localStorage on initial render
  useEffect(() => {
    try {
      const savedCards = localStorage.getItem(STORAGE_KEY);
      if (savedCards) {
        const parsedCards = JSON.parse(savedCards);
        // Validate that we received an array
        if (Array.isArray(parsedCards)) {
          setCards(parsedCards);
        } else {
          console.error('Stored cards data is not an array, using default cards');
          setDefaultCards();
        }
      } else {
        setDefaultCards();
      }
    } catch (error) {
      console.error('Error loading cards from localStorage:', error);
      setDefaultCards();
    }
  }, []);

  const setDefaultCards = () => {
    setCards([
      {
        id: '1',
        title: 'SKARK banking system',
        description: 'A fast and efficient banking system',
        tags: ['Author', 'SKARK'],
        icon: { type: 'image', url: 'https://via.placeholder.com/150/00e676/ffffff?text=$' },
        url: 'https://example.com/banking',
        isArchived: false
      },
      {
        id: '2',
        title: 'My webpage',
        description: 'Know more about me !',
        tags: ['Author', 'Webpage'],
        icon: { type: 'letter', letter: 'M', color: '#ff6b6b' },
        url: 'https://example.com/mypage',
        isArchived: false
      }
    ]);
  };

  // Save cards to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
    } catch (error) {
      console.error('Error saving cards to localStorage:', error);
    }
  }, [cards]);

  // Extract all unique tags from cards - optimized
  useEffect(() => {
    const uniqueTags = [...new Set(cards.flatMap(card => card.tags))];
    setAllTags(uniqueTags);
  }, [cards]);

  // Process tags from string or array

  const processTags = useCallback((tagsInput) => {
    if (Array.isArray(tagsInput)) {
      return tagsInput.filter(tag => tag.trim() !== '');
    }
    if (typeof tagsInput === 'string') {
      return tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
    }
    return [];
  }, []);

  // Process icon data
  const processIconData = useCallback((cardData) => {
    // Handle icon - prioritize URL if provided, then file, then generate from title
    let iconToUse = cardData.icon || generateIconFromTitle(cardData.title);
    
    // If icon URL is provided as a separate field, use it
    if (cardData.iconUrl && cardData.iconUrl.trim() !== '') {
      iconToUse = { type: 'image', url: cardData.iconUrl.trim() };
    }
    
    return iconToUse;
  }, []);

  const addCard = useCallback((newCard) => {
    const tagsArray = processTags(newCard.tags.length ? newCard.tags : newCard.customTag);
    const iconToUse = processIconData(newCard);
    
    const cardToAdd = {
      id: Date.now().toString(),
      title: newCard.title.trim(),
      description: newCard.description.trim(),
      tags: tagsArray,
      icon: iconToUse,
      url: newCard.url.trim(),
      isArchived: false
    };
    
    setCards(prevCards => [...prevCards, cardToAdd]);
  }, [processTags, processIconData]);

  const updateCard = useCallback((updatedCard) => {
    const tagsArray = processTags(updatedCard.customTag || updatedCard.tags);
    const iconToUse = processIconData(updatedCard);
    
    const cardToUpdate = {
      ...updatedCard,
      title: updatedCard.title.trim(),
      description: updatedCard.description.trim(),
      tags: tagsArray,
      icon: iconToUse,
      url: updatedCard.url.trim()
    };
    
    setCards(prevCards => 
      prevCards.map(card => card.id === updatedCard.id ? cardToUpdate : card)
    );
  }, [processTags, processIconData]);

  const archiveCard = useCallback((id) => {
    setCards(prevCards => 
      prevCards.map(card => 
        card.id === id ? { ...card, isArchived: !card.isArchived } : card
      )
    );
  }, []);

  const deleteCard = useCallback((id) => {
    setCards(prevCards => prevCards.filter(card => card.id !== id));
  }, []);

  const duplicateCard = useCallback((id) => {
    setCards(prevCards => {
      const cardToDuplicate = prevCards.find(card => card.id === id);
      if (!cardToDuplicate) return prevCards;
      
      const duplicatedCard = {
        ...cardToDuplicate,
        id: Date.now().toString(),
        title: `${cardToDuplicate.title} (Copy)`
      };
      
      return [...prevCards, duplicatedCard];
    });
  }, []);

  const exportCards = useCallback(() => {
    try {
      const dataStr = JSON.stringify(cards, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = 'bookmark-cards.json';
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    } catch (error) {
      console.error('Error exporting cards:', error);
      alert('There was an error exporting your cards. Please try again.');
    }
  }, [cards]);

  const importCards = useCallback((fileContent) => {
    try {
      const importedCards = JSON.parse(fileContent);
      if (Array.isArray(importedCards)) {
        setCards(importedCards);
        return true;
      } else {
        console.error('Imported data is not an array');
        alert('The imported file does not contain valid card data.');
        return false;
      }
    } catch (error) {
      console.error('Error parsing import file:', error);
      alert('There was an error importing your cards. Please check the file format.');
      return false;
    }
  }, []);

  return {
    cards,
    addCard,
    updateCard,
    archiveCard,
    deleteCard,
    duplicateCard,
    exportCards,
    importCards,
    allTags
  };
}