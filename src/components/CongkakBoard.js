import React from 'react';
import './CongkakBoard.css';

const CongkakBoard = () => {
  const numberOfCircles = 7;
  const initialSeedCount = 7; // Each hole starts with 7 seeds

  return (
    <div className="game-container">
      <div className="house left-house"></div> {/* Left House */}
      <div className="rows-container">
        <div className="circles-row">
          {Array.from({ length: numberOfCircles }).map((_, index) => (
            <div key={`top-${index}`} className="circle">{initialSeedCount}</div> // Displaying 7 seeds in each hole
          ))}
        </div>
        <div className="circles-row">
          {Array.from({ length: numberOfCircles }).map((_, index) => (
            <div key={`bottom-${index}`} className="circle">{initialSeedCount}</div> // Displaying 7 seeds in each hole
          ))}
        </div>
      </div>
      <div className="house right-house"></div> {/* Right House */}
    </div>
  );
};

export default CongkakBoard;
