import React from 'react';
import Card from './Card';

function CardGrid({ cards, viewMode = 'grid', onEdit, onArchive, onDelete, onDuplicate }) {
  // Set the container class based on the viewMode
  const containerClassName = `cards-container ${viewMode}-view`;
  
  return (
    <div className={containerClassName}>
      {cards.map((card) => (
        <Card
          key={card.id}
          card={card}
          viewMode={viewMode}
          onEdit={onEdit}
          onArchive={onArchive}
          onDelete={onDelete}
          onDuplicate={onDuplicate}
        />
      ))}
    </div>
  );
}

export default CardGrid;