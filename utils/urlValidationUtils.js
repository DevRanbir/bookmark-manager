/**
 * URL Validation Utilities
 * Provides functions to validate image URLs and website URLs
 */

// Check if a URL is valid
export const isValidUrl = (url) => {
    if (!url || typeof url !== 'string' || url.trim() === '') {
      return false;
    }
    
    try {
      // Check for valid URL format
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  };
  
  // Check if an image URL exists by attempting to load it
  export const validateImageUrl = (url) => {
    return new Promise((resolve) => {
      if (!isValidUrl(url)) {
        resolve(false);
        return;
      }
  
      const img = new Image();
      
      img.onload = () => {
        resolve(true);
      };
      
      img.onerror = () => {
        resolve(false);
      };
      
      // Set a timeout in case the image takes too long to load
      setTimeout(() => {
        if (!img.complete) {
          resolve(false);
        }
      }, 5000);
      
      img.src = url;
    });
  };
  
  // Check if a website URL exists by sending a fetch request
  export const validateWebsiteUrl = (url) => {
    return new Promise((resolve) => {
      if (!isValidUrl(url)) {
        resolve(false);
        return;
      }
  
      // Try to fetch the URL to check if it's valid
      fetch(url, { method: 'HEAD', mode: 'no-cors' })
        .then(() => {
          resolve(true);
        })
        .catch(() => {
          resolve(false);
        });
  
      // Set a timeout in case the fetch takes too long
      setTimeout(() => {
        resolve(false);
      }, 5000);
    });
  };
  
  // Helper function for generating letter icons
  export const generateLetterIcon = (title) => {
    const letter = title && title.length > 0 ? title.charAt(0).toUpperCase() : '?';
    return { 
      type: 'letter', 
      letter, 
      color: generateRandomColor() 
    };
  };
  
  // Generate a random color for the letter icon (reusing your existing function)
  export const generateRandomColor = () => {
    const colors = ['#ff6b6b', '#4ecdc4', '#ff9f43', '#6c5ce7', '#fdcb6e', '#0984e3', '#00b894', '#e84393'];
    return colors[Math.floor(Math.random() * colors.length)];
  };