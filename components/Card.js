import React, { useState, useEffect, useRef, useCallback } from 'react';
import CardMenu from './CardMenu';
import { validateImageUrl, validateWebsiteUrl, generateLetterIcon } from '../utils/urlValidationUtils';

function Card({ card, viewMode = 'grid', onEdit, onArchive, onDelete, onDuplicate }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showDescriptionPopup, setShowDescriptionPopup] = useState(false);
  const [isValidImage, setIsValidImage] = useState(true);
  const [isValidWebsite, setIsValidWebsite] = useState(true);
  const [cardIcon, setCardIcon] = useState(card.icon);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);
  const popupRef = useRef(null);

  // Validate URLs when card data changes
  useEffect(() => {
    const validateUrls = async () => {
      // Check image URL if it's an image icon
      if (card.icon && card.icon.type === 'image' && card.icon.url) {
        const isValid = await validateImageUrl(card.icon.url);
        setIsValidImage(isValid);
        
        // Only set image icon if showIcon is true (default to true if undefined)
        if (!isValid || card.showIcon === false) {
          setCardIcon(generateLetterIcon(card.title));
        } else {
          setCardIcon(card.icon);
        }
      } else {
        setCardIcon(card.icon);
      }

      // Check website URL
      if (card.url && card.url.trim() !== '') {
        const isValid = await validateWebsiteUrl(card.url);
        setIsValidWebsite(isValid);
      } else {
        setIsValidWebsite(false);
      }
    };

    validateUrls();
  }, [card.icon, card.url, card.title, card.showIcon]);

  const toggleMenu = useCallback(() => {
    if (!card.isArchived) { // Only toggle menu if card is not archived
      setIsMenuOpen(prev => !prev);
    }
  }, [card.isArchived]);

  const toggleDescriptionPopup = useCallback(() => {
    setShowDescriptionPopup(prev => !prev);
  }, []);

  // Handle clicks outside to close menu and popup
  useEffect(() => {
    function handleClickOutside(event) {
      // Handle menu click outside
      if (
        isMenuOpen && 
        menuRef.current && 
        buttonRef.current &&
        !menuRef.current.contains(event.target) && 
        !buttonRef.current.contains(event.target)
      ) {
        setIsMenuOpen(false);
      }
      
      // Handle description popup click outside
      if (
        showDescriptionPopup && 
        popupRef.current &&
        !popupRef.current.contains(event.target)
      ) {
        setShowDescriptionPopup(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen, showDescriptionPopup]);

  const handleVisit = useCallback(() => {
    if (!card.isArchived && isValidWebsite && card.url && card.url.trim() !== '') {
      window.open(card.url, '_blank', 'noopener,noreferrer');
    }
  }, [card.url, card.isArchived, isValidWebsite]);

  // Apply additional class based on view mode
  const cardClassName = `card card-${viewMode} ${card.isArchived ? 'card-archived' : ''}`;

  // Determine which icon to show
  const shouldShowImageIcon = card.showIcon !== false && 
                             cardIcon && 
                             cardIcon.type === 'image' && 
                             cardIcon.url && 
                             isValidImage;

  return (
    <div className={cardClassName}>
      <div className="card-top">
        {card.isArchived && <div className="status-dot" style={{ backgroundColor: '#e9ecef' }}></div>}
        {!card.isArchived && <div className="status-dot" style={{ backgroundColor: '#4ecdc4' }}></div>}
        <button 
          ref={buttonRef}
          className={`menu-dots ${card.isArchived ? 'disabled' : ''}`}
          onClick={toggleMenu}
          aria-label="Card menu"
          disabled={card.isArchived}
          style={{ opacity: card.isArchived ? 0.5 : 1, cursor: card.isArchived ? 'not-allowed' : 'pointer' }}
        >
          <svg viewBox="0 0 24 24" width="24" height="24">
            <circle cx="12" cy="6" r="2" fill="currentColor" />
            <circle cx="12" cy="12" r="2" fill="currentColor" />
            <circle cx="12" cy="18" r="2" fill="currentColor" />
          </svg>
        </button>
        {isMenuOpen && !card.isArchived && (
          <div ref={menuRef} className="card-menu">
            <CardMenu 
              onEdit={() => onEdit(card)}
              onDuplicate={() => onDuplicate(card.id)}
              onDelete={() => onDelete(card.id)}
              isArchived={card.isArchived}
            />
          </div>
        )}
      </div>
      
      <div className="card-icon-container">
        {shouldShowImageIcon ? (
          <img 
            src={cardIcon.url} 
            alt={`${card.title} icon`} 
            className="icon-image"
            style={{ opacity: card.isArchived ? 0.7 : 1 }}
            onError={() => {
              setIsValidImage(false);
              setCardIcon(generateLetterIcon(card.title));
            }}
          />
        ) : (
          <div 
            className="icon-letter" 
            style={{ 
              backgroundColor: cardIcon && cardIcon.type === 'letter' ? cardIcon.color : '#ff6b6b', 
              opacity: card.isArchived ? 0.7 : 1 
            }}
          >
            {cardIcon && cardIcon.type === 'letter' ? cardIcon.letter : card.title.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
      
      <div className="card-content">
        {Array.isArray(card.tags) && card.tags.length > 0 && (
          <div className="card-tags">
            {card.tags.map((tag, index) => (
              <span key={`${tag}-${index}`} className="tag" style={{ opacity: card.isArchived ? 0.7 : 1 }}>{tag}</span>
            ))}
          </div>
        )}
        <h3 className="card-title" style={{ opacity: card.isArchived ? 0.7 : 1 }}>{card.title}</h3>
        <p 
          className="card-description" 
          onClick={toggleDescriptionPopup}
          title="Click to view full description"
          style={{ cursor: 'pointer', opacity: card.isArchived ? 0.7 : 1 }}
        >
          {card.description}
        </p>
        
        {/* Description Popup */}
        {showDescriptionPopup && (
          <div className="description-popup-overlay">
            <div 
              ref={popupRef} 
              className="description-popup"
            >
              <div className="popup-header">
                <h3>{card.title}</h3>
                <button 
                  onClick={toggleDescriptionPopup}
                  className="close-popup"
                  aria-label="Close description"
                >
                  ×
                </button>
              </div>
              <div className="popup-content">
                <p>{card.description}</p>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="card-actions">
        <button 
          onClick={() => onArchive(card.id)} 
          className="action-button"
          aria-label={card.isArchived ? "Unarchive" : "Archive"}
        >
          {card.isArchived ? "Unarchive" : "Archive"}
        </button>
        <button 
          onClick={handleVisit} 
          className="action-button visit-button"
          disabled={card.isArchived || !isValidWebsite}
          style={{ 
            opacity: (card.isArchived || !isValidWebsite) ? 0.5 : 1,
            cursor: (card.isArchived || !isValidWebsite) ? 'not-allowed' : 'pointer'
          }}
          aria-label={isValidWebsite ? "Visit URL" : "Invalid URL"}
          title={isValidWebsite ? "Visit website" : "Invalid website URL"}
        >
          {isValidWebsite ? "Visit" : "Invalid URL"}
        </button>
      </div>
    </div>
  );
}

export default React.memo(Card);