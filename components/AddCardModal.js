import React, { useState, useRef, useEffect } from 'react';
import { searchWikipedia } from '../utils/wikipediaApi';
import { validateImageUrl, isValidUrl } from '../utils/urlValidationUtils';

function AddCardModal({ onClose, onAddCard, prefillData }) {
  const [newCard, setNewCard] = useState({
    title: '',
    description: '',
    tags: [],
    icon: '',
    url: '',
    customTag: '',
    iconUrl: '',
    showIcon: true // Default to true for new cards
  });
  
  const [urlError, setUrlError] = useState('');
  const [iconUrlError, setIconUrlError] = useState('');
  const fileInputRef = useRef(null);

  // Apply prefill data if provided
  useEffect(() => {
    if (prefillData) {
      setNewCard(prevCard => ({
        ...prevCard,
        ...prefillData,
        showIcon: prefillData.showIcon !== false // Default to true if not specified
      }));
    }
  }, [prefillData]);

  const validateUrls = async () => {
    let isValid = true;
    
    // Validate website URL if provided
    if (newCard.url && newCard.url.trim() !== '') {
      if (!isValidUrl(newCard.url)) {
        setUrlError('Please enter a valid URL (include http:// or https://)');
        isValid = false;
      } else {
        setUrlError('');
      }
    } else {
      setUrlError('');
    }
    
    // Validate icon URL if provided
    if (newCard.iconUrl && newCard.iconUrl.trim() !== '') {
      if (!isValidUrl(newCard.iconUrl)) {
        setIconUrlError('Please enter a valid image URL (include http:// or https://)');
        isValid = false;
      } else {
        const isValidImage = await validateImageUrl(newCard.iconUrl);
        if (!isValidImage) {
          setIconUrlError('The image URL appears to be invalid or inaccessible');
          isValid = false;
        } else {
          setIconUrlError('');
        }
      }
    } else {
      setIconUrlError('');
    }
    
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newCard.title.trim() === '') return;
    
    // Validate URLs before submitting
    const isValid = await validateUrls();
    if (!isValid) return;
    
    const processedCard = {
      ...newCard,
      tags: newCard.customTag.split(',').map(tag => tag.trim()).filter(tag => tag !== '')
    };
    
    onAddCard(processedCard);
    onClose();
  };

  const handleUrlChange = (e) => {
    const url = e.target.value;
    setNewCard({...newCard, url});
    
    // Clear error when field is emptied
    if (!url || url.trim() === '') {
      setUrlError('');
    }
  };

  const handleIconUrlChange = (e) => {
    const iconUrl = e.target.value;
    setNewCard({...newCard, iconUrl});
    
    // Clear error when field is emptied
    if (!iconUrl || iconUrl.trim() === '') {
      setIconUrlError('');
    }
  };

  const handleIconChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setNewCard({
          ...newCard,
          icon: { type: 'image', url: event.target.result }
        });
      };
      reader.readAsDataURL(file);
    }
  };


  const handleWikipediaSearch = async () => {
    if (!newCard.title.trim()) return;
    
    try {
      const wikiData = await searchWikipedia(newCard.title);
      if (wikiData) {
        setNewCard({
          ...newCard,
          title: wikiData.title || newCard.title,
          description: wikiData.extract || newCard.description,
          icon: wikiData.thumbnail ? { type: 'image', url: wikiData.thumbnail } : newCard.icon,
          url: wikiData.url || newCard.url,
          tags: ['Wikipedia'],
          iconUrl: wikiData.thumbnail || '',
          showIcon: newCard.showIcon // Preserve the show icon setting
        });
        
        // Validate the Wikipedia URL and image
        if (wikiData.url) {
          if (!isValidUrl(wikiData.url)) {
            setUrlError('The Wikipedia URL appears to be invalid');
          } else {
            setUrlError('');
          }
        }
        
        if (wikiData.thumbnail) {
          const isValidImage = await validateImageUrl(wikiData.thumbnail);
          if (!isValidImage) {
            setIconUrlError('The Wikipedia image appears to be invalid');
          } else {
            setIconUrlError('');
          }
        }
      }
    } catch (error) {
      console.error('Error fetching data from Wikipedia:', error);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal wide-modal">
        <h2>Add New Card</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Title</label>
              <input
                type="text"
                value={newCard.title}
                onChange={(e) => setNewCard({...newCard, title: e.target.value})}
                required
              />
              <button type="button" onClick={handleWikipediaSearch} className="wiki-search-button">
                Search Wikipedia
              </button>
            </div>
            <div className="form-group">
              <label>URL</label>
              <input
                type="url"
                value={newCard.url}
                onChange={handleUrlChange}
                className={urlError ? 'error-input' : ''}
              />
              {urlError && <div className="error-message">{urlError}</div>}
            </div>
          </div>
          
          <div className="form-group">
            <label>Description</label>
            <textarea
              value={newCard.description}
              onChange={(e) => setNewCard({...newCard, description: e.target.value})}
            />
          </div>
          
          <div className="form-group">
            <label>Tags (comma separated)</label>
            <input
              type="text"
              value={newCard.customTag}
              onChange={(e) => setNewCard({...newCard, customTag: e.target.value})}
            />
          </div>
          
          <div className="form-row icon-inputs">
            <div className="form-group">
              <label>Upload Icon Image</label>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleIconChange}
              />
            </div>
            <div className="form-group">
              <label>OR Icon Image URL</label>
              <input
                type="url"
                placeholder="https://example.com/image.jpg"
                value={newCard.iconUrl || ''}
                onChange={handleIconUrlChange}
                className={iconUrlError ? 'error-input' : ''}
              />
              {iconUrlError && <div className="error-message">{iconUrlError}</div>}
            </div>
          </div>
          
          
          {newCard.icon && (
            <div className="icon-preview">
              {newCard.showIcon ? (
                newCard.icon.type === 'image' ? (
                  <img 
                    src={newCard.iconUrl || newCard.icon.url} 
                    alt="Icon Preview" 
                    onError={() => {
                      setIconUrlError('The image could not be loaded');
                    }}
                  />
                ) : (
                  <div 
                    className="preview-icon-letter" 
                    style={{ backgroundColor: newCard.icon.color }}
                  >
                    {newCard.icon.letter}
                  </div>
                )
              ) : (
                <div className="preview-icon-letter" style={{ backgroundColor: '#ff6b6b' }}>
                  {newCard.title.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          )}
          
          <div className="modal-actions">
            <button type="button" onClick={onClose} className="cancel-button">
              Cancel
            </button>
            <button type="submit" className="submit-button">
              Add Card
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddCardModal;