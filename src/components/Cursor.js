// Cursor.js
import React from "react";
import "./Cursos.css";

const Cursor = ({ top, left, visible, seedCount, isTopTurn }) => {
  const cursorImage = isTopTurn ? '/assets/images/handcursor_TOP.png' : '/assets/images/handcursor_LOW.png';
  
  const cursorStyle = {
    top,
    left,
    opacity: visible ? 1 : 0,
    backgroundImage: `url(${cursorImage})`
  };

  const seedCountStyle = {
    // Adjust these styles based on your design needs
    position: 'absolute',
    top: isTopTurn ? '30%' : '60%', // Adjust top position based on the turn
    left: '50%',
    transform: 'translate(-50%, -50%)',
    color: 'black', // Adjust color if needed
    fontSize: '20px',
    fontWeight: 'bold'
    // Add more styling as needed
  };

  return (
    <div className="hand-cursor" style={cursorStyle}>
      {seedCount >= 0 && <span className="seeds-count" style={seedCountStyle}>{seedCount}</span>}
    </div>
  );
};

export default Cursor;
