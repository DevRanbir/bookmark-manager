export function generateIconFromTitle(title) {
    // Generate a letter icon for the card
    const letter = title.charAt(0).toUpperCase();
    return { type: 'letter', letter,};
  }
  
// You could extend this with more icon utility functions
// For example, random color generation for letter icons
export function generateRandomColor() {
  const colors = ['#ff6b6b', '#4ecdc4', '#ff9f43', '#6c5ce7', '#fdcb6e', '#0984e3', '#00b894', '#e84393'];
  return colors[Math.floor(Math.random() * colors.length)];
}