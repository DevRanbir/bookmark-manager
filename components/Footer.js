import React from 'react';

function Footer({ activeCount, archivedCount, totalCount, showArchived, toggleArchivedView }) {
  return (
    <footer className="footer">
      <div className="stats">
        <div className="stat-item">
          <span className="stat-count">{activeCount}</span>
          <span>Active</span>
        </div>
        <div className="stat-item">
          <span className="stat-count">{archivedCount}</span>
          <span>Archived</span>
        </div>
        <div className="stat-item">
          <span className="stat-count">{totalCount}</span>
          <span>Total</span>
        </div>
      </div>
      
      <button 
        className="toggle-archived" 
        onClick={toggleArchivedView}
      >
        {showArchived ? "Show Active Cards" : "Show Archived Cards"}
      </button>
    </footer>
  );
}

export default Footer;