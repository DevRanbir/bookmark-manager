import React, { useState, useRef } from 'react';
import { validateImageUrl, isValidUrl } from '../utils/urlValidationUtils';

function EditCardModal({ card, onClose, onUpdateCard }) {
  const [currentCard, setCurrentCard] = useState({
    ...card,
    showIcon: card.showIcon !== false // Default to true if not explicitly set to false
  });
  const [urlError, setUrlError] = useState('');
  const [iconUrlError, setIconUrlError] = useState('');
  const fileInputRef = useRef(null);

  const validateUrls = async () => {
    let isValid = true;
    
    // Validate website URL if provided
    if (currentCard.url && currentCard.url.trim() !== '') {
      if (!isValidUrl(currentCard.url)) {
        setUrlError('Please enter a valid URL (include http:// or https://)');
        isValid = false;
      } else {
        setUrlError('');
      }
    } else {
      setUrlError('');
    }
    
    // Validate icon URL if provided
    if (currentCard.iconUrl && currentCard.iconUrl.trim() !== '') {
      if (!isValidUrl(currentCard.iconUrl)) {
        setIconUrlError('Please enter a valid image URL (include http:// or https://)');
        isValid = false;
      } else {
        const isValidImage = await validateImageUrl(currentCard.iconUrl);
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
    if (!currentCard || currentCard.title.trim() === '') return;
    
    // Validate URLs before submitting
    const isValid = await validateUrls();
    if (!isValid) return;
    
    onUpdateCard(currentCard);
    onClose();
  };

  const handleUrlChange = (e) => {
    const url = e.target.value;
    setCurrentCard({...currentCard, url});
    
    // Clear error when field is emptied
    if (!url || url.trim() === '') {
      setUrlError('');
    }
  };

  const handleIconUrlChange = (e) => {
    const iconUrl = e.target.value;
    setCurrentCard({...currentCard, iconUrl});
    
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
        setCurrentCard({
          ...currentCard,
          icon: { type: 'image', url: event.target.result }
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleShowIconChange = (e) => {
    setCurrentCard({
      ...currentCard,
      showIcon: e.target.checked
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal wide-modal">
        <h2>Edit Card</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Title</label>
              <input
                type="text"
                value={currentCard.title}
                onChange={(e) => setCurrentCard({...currentCard, title: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>URL</label>
              <input
                type="url"
                value={currentCard.url}
                onChange={handleUrlChange}
                className={urlError ? 'error-input' : ''}
              />
              {urlError && <div className="error-message">{urlError}</div>}
            </div>
          </div>
          
          <div className="form-group">
            <label>Description</label>
            <textarea
              value={currentCard.description}
              onChange={(e) => setCurrentCard({...currentCard, description: e.target.value})}
            />
          </div>
          
          <div className="form-group">
            <label>Tags (comma separated)</label>
            <input
              type="text"
              value={currentCard.customTag}
              onChange={(e) => setCurrentCard({...currentCard, customTag: e.target.value})}
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
                value={currentCard.iconUrl || ''}
                onChange={handleIconUrlChange}
                className={iconUrlError ? 'error-input' : ''}
              />
              {iconUrlError && <div className="error-message">{iconUrlError}</div>}
            </div>
          </div>
          
          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={currentCard.showIcon}
                onChange={handleShowIconChange}
              />
              Show icon image (if unchecked, a letter icon will be used instead)
            </label>
          </div>
          
          {currentCard.icon && (
            <div className="icon-preview">
              {currentCard.showIcon ? (
                currentCard.icon.type === 'image' ? (
                  <img 
                    src={currentCard.iconUrl || currentCard.icon.url} 
                    alt="Icon Preview" 
                    onError={() => {
                      setIconUrlError('The image could not be loaded');
                    }}
                  />
                ) : (
                  <div 
                    className="preview-icon-letter" 
                    style={{ backgroundColor: currentCard.icon.color }}
                  >
                    {currentCard.icon.letter}
                  </div>
                )
              ) : (
                <div className="preview-icon-letter" style={{ backgroundColor: '#ff6b6b' }}>
                  {currentCard.title.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          )}
          
          <div className="modal-actions">
            <button type="button" onClick={onClose} className="cancel-button">
              Cancel
            </button>
            <button type="submit" className="submit-button">
              Update Card
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditCardModal;