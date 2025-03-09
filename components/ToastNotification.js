import React, { useState, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom/client';
import './ToastNotification.css';

// Toast types
export const TOAST_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  INFO: 'info',
  WARNING: 'warning'
};

// Toast container component
function ToastContainer() {
  const [toasts, setToasts] = useState([]);
  const [toastRegistry, setToastRegistry] = useState({});
  const [idCounter, setIdCounter] = useState(1);  // Add a sequential counter for unique IDs

  // Remove toast by id
  const removeToast = useCallback((id) => {
    setToasts(currentToasts => currentToasts.filter(toast => toast.id !== id));
    
    // Also remove from registry when toast is dismissed
    setToastRegistry(registry => {
      const newRegistry = { ...registry };
      Object.keys(newRegistry).forEach(key => {
        if (newRegistry[key] === id) {
          delete newRegistry[key];
        }
      });
      return newRegistry;
    });
  }, []);

  // Create a hash key for toast deduplication
  const createToastKey = useCallback((message, type) => {
    return `${type}:${message}`;
  }, []);

  // Add toast to the stack with deduplication
  const addToast = useCallback((message, type, autoHideDuration = 3000) => {
    // Create a unique key for this type of toast
    const toastKey = createToastKey(message, type);
    
    // Check if this exact toast is already showing
    if (toastRegistry[toastKey]) {
      // If it exists, just reset its timer by removing and re-adding it
      const existingId = toastRegistry[toastKey];
      
      // Update the registry with new timestamp for rate limiting
      setToastRegistry(registry => ({
        ...registry,
        [toastKey]: existingId
      }));
      
      // Reset the timer for this toast if it has an auto-hide duration
      if (autoHideDuration > 0) {
        // Clear any existing timeout for this toast
        const existingTimerId = toasts.find(t => t.id === existingId)?.timerId;
        if (existingTimerId) {
          clearTimeout(existingTimerId);
        }
        
        // Set a new timer
        const timerId = setTimeout(() => removeToast(existingId), autoHideDuration);
        
        // Update the toast's timer
        setToasts(currentToasts => 
          currentToasts.map(toast => 
            toast.id === existingId ? { ...toast, timerId } : toast
          )
        );
      }
      
      // Return the existing ID
      return existingId;
    }

    // Create a new toast with a truly unique ID (timestamp + counter)
    const uniqueId = `${Date.now()}-${idCounter}`;
    setIdCounter(prev => prev + 1);  // Increment the counter for next use
    
    let timerId = null;
    
    if (autoHideDuration > 0) {
      timerId = setTimeout(() => removeToast(uniqueId), autoHideDuration);
    }
    
    const newToast = { 
      id: uniqueId, 
      message, 
      type, 
      autoHideDuration,
      timerId,
      timestamp: Date.now()
    };

    setToasts(currentToasts => [...currentToasts, newToast]);
    
    // Register this toast to prevent duplicates
    setToastRegistry(registry => ({
      ...registry,
      [toastKey]: uniqueId
    }));

    return uniqueId;
  }, [removeToast, toastRegistry, createToastKey, toasts, idCounter]);

  // Clear all toasts
  const clearAllToasts = useCallback(() => {
    // Clear all timeouts
    toasts.forEach(toast => {
      if (toast.timerId) {
        clearTimeout(toast.timerId);
      }
    });
    
    setToasts([]);
    setToastRegistry({});
  }, [toasts]);

  useEffect(() => {
    // Limit the maximum number of toasts to prevent UI overload
    const MAX_TOASTS = 5;
    if (toasts.length > MAX_TOASTS) {
      // Remove the oldest toast
      const oldestToast = toasts.reduce((oldest, toast) => 
        (toast.timestamp < oldest.timestamp) ? toast : oldest
      , toasts[0]);
      
      if (oldestToast && oldestToast.timerId) {
        clearTimeout(oldestToast.timerId);
      }
      
      removeToast(oldestToast.id);
    }
  }, [toasts, removeToast]);

  useEffect(() => {
    window.toast = {
      success: (message, duration) => addToast(message, TOAST_TYPES.SUCCESS, duration),
      error: (message, duration) => addToast(message, TOAST_TYPES.ERROR, duration),
      info: (message, duration) => addToast(message, TOAST_TYPES.INFO, duration),
      warning: (message, duration) => addToast(message, TOAST_TYPES.WARNING, duration),
      remove: removeToast,
      clearAll: clearAllToasts
    };

    // Error handling for toast operations
    const originalToastMethods = {
      success: window.toast.success,
      error: window.toast.error,
      info: window.toast.info,
      warning: window.toast.warning
    };

    // Wrap toast methods with error handling
    Object.keys(originalToastMethods).forEach(method => {
      window.toast[method] = (...args) => {
        try {
          return originalToastMethods[method](...args);
        } catch (error) {
          console.error(`Error in toast.${method}:`, error);
          // Don't recursively call toast.error as it could cause an infinite loop
          if (method !== 'error') {
            window.toast.error(`Failed to show notification: ${error.message}`);
          }
          return null;
        }
      };
    });

    return () => {
      // Clean up on unmount
      toasts.forEach(toast => {
        if (toast.timerId) {
          clearTimeout(toast.timerId);
        }
      });
      delete window.toast;
    };
  }, [addToast, removeToast, clearAllToasts, toasts]);

  return (
    <div className="toast-container">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`toast toast-${toast.type}`}
          onClick={() => removeToast(toast.id)}
          role="alert"
        >
          <div className="toast-message">{toast.message}</div>
          <button
            className="toast-close"
            onClick={(e) => {
              e.stopPropagation();
              removeToast(toast.id);
            }}
            aria-label="Close notification"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}

// Initialize toast system using React 18's createRoot
export function initToastSystem() {
  try {
    let toastRoot = document.getElementById('toast-root');

    if (!toastRoot) {
      toastRoot = document.createElement('div');
      toastRoot.id = 'toast-root';
      document.body.appendChild(toastRoot);

      const root = ReactDOM.createRoot(toastRoot);
      root.render(<ToastContainer />);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Failed to initialize toast system:', error);
    return false;
  }
}

// Auto-detect actions and show appropriate toasts with rate limiting
export function setupToastListeners() {
  const actionPatterns = [
    { action: 'add', success: 'Card added successfully', error: 'Failed to add card' },
    { action: 'edit', success: 'Card updated successfully', error: 'Failed to update card' },
    { action: 'delete', success: 'Card deleted successfully', error: 'Failed to delete card' },
    { action: 'archive', success: 'Card archived successfully', error: 'Failed to archive card' },
    { action: 'unarchive', success: 'Card restored successfully', error: 'Failed to restore card' },
    { action: 'duplicate', success: 'Card duplicated successfully', error: 'Failed to duplicate card' },
    { action: 'import', success: 'Cards imported successfully', error: 'Failed to import cards' },
    { action: 'export', success: 'Cards exported successfully', error: 'Failed to export cards' }
  ];

  // Rate limiting for each action type
  const actionTimestamps = {};
  const RATE_LIMIT_MS = 1000; // Minimum time between identical action notifications

  window.addEventListener('cardAction', (e) => {
    const { action, status, message } = e.detail;
    
    // Create a key for this specific action and status
    const actionKey = `${action}:${status}`;
    const now = Date.now();
    
    // Check if this action is being rate limited
    if (actionTimestamps[actionKey] && (now - actionTimestamps[actionKey] < RATE_LIMIT_MS)) {
      console.log(`Rate limiting ${actionKey} toast`);
      return;
    }
    
    // Update timestamp for this action
    actionTimestamps[actionKey] = now;
    
    if (status === 'success') {
      window.toast.success(message || `${action} successful`);
    } else if (status === 'error') {
      window.toast.error(message || `${action} failed`);
    }
  });

  // Enhanced dispatchCardAction with additional context and error handling
  window.dispatchCardAction = (action, status, message, context = {}) => {
    try {
      const pattern = actionPatterns.find(p => p.action === action);
      let defaultMessage = '';
      
      if (pattern) {
        defaultMessage = status === 'success' ? pattern.success : pattern.error;
      } else {
        defaultMessage = status === 'success' ? `${action} successful` : `${action} failed`;
      }
      
      // Include more context in the message if provided
      const enhancedMessage = message || defaultMessage;
      
      const event = new CustomEvent('cardAction', {
        detail: {
          action,
          status,
          message: enhancedMessage,
          timestamp: Date.now(),
          context
        }
      });
      window.dispatchEvent(event);
    } catch (error) {
      console.error('Error dispatching card action:', error);
      // Direct call to toast.error as a fallback
      if (window.toast) {
        window.toast.error(`Failed to report ${action} action`);
      }
    }
  };

  console.log('Toast notification system initialized with rate limiting');
  return true;
}

// Named export object
const toastNotification = {
  initToastSystem,
  setupToastListeners,
  TOAST_TYPES
};

export default toastNotification;