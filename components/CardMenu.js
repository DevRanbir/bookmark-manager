import React from 'react';

function CardMenu({ onEdit, onDuplicate, onDelete, isArchived }) {
  return (
    <div className="card-menu">
      <button 
        onClick={onEdit} 
        disabled={isArchived}
        style={{ opacity: isArchived ? 0.5 : 1, cursor: isArchived ? 'not-allowed' : 'pointer' }}
      >
        Edit
      </button>
      <button 
        onClick={onDuplicate}
        disabled={isArchived}
        style={{ opacity: isArchived ? 0.5 : 1, cursor: isArchived ? 'not-allowed' : 'pointer' }}
      >
        Duplicate
      </button>
      <button onClick={onDelete}>
        Delete
      </button>
    </div>
  );
}

export default CardMenu;