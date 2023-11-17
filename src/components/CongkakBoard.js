import React, { useState } from 'react';
import './CongkakBoard.css';

const CongkakBoard = () => {
  const initialSeedCount = 7;
  const [seeds, setSeeds] = useState(new Array(14).fill(initialSeedCount)); // 14 holes excluding houses
  const [cursorTop, setCursorTop] = useState(0); // Initialize cursorTop state
  const [cursorLeft, setCursorLeft] = useState(0); // Initialize cursorLeft state
  const [cursorVisible, setCursorVisible] = useState(true); // Initialize cursor visibility

  const handleHoleClick = (index) => {
    if (seeds[index] === 0) return; // Prevent picking from empty hole

    let newSeeds = [...seeds];
    let seedsInHand = newSeeds[index];
    newSeeds[index] = 0; // Pick up all seeds

    // Distribute seeds in a clockwise direction
    let currentIndex = index;
    while (seedsInHand > 0) {
      currentIndex = (currentIndex + 1) % 14; // Move to next hole in a circular way
      if (currentIndex === index) continue; // Skip the starting hole
      newSeeds[currentIndex]++;
      seedsInHand--;
    }

    setSeeds(newSeeds); // Update the state

      // Logic to animate cursor movement
    const animateSowing = async (startIndex, seedCount) => {
      for (let i = 0; i < seedCount; i++) {
        const currentIndex = (startIndex + i) % 14;
        // Logic to calculate cursor position based on currentIndex
        // Update state to move cursor
        setCursorTop(/* calculated top position */);
        setCursorLeft(/* calculated left position */);
        setCursorVisible(true);

        // Wait for a bit before moving to the next hole
        await new Promise(resolve => setTimeout(resolve, 300)); // Adjust timing as needed
      }
      setCursorVisible(false); // Hide cursor at the end
    };

    animateSowing(index, seedsInHand);
  };

  return (
    <div className="game-container">
      <div className="house left-house">{0}</div>
      <div className="rows-container">
        <div className="circles-row">
          {seeds.slice(0, 7).map((seedCount, index) => (
            <div key={`top-${index + 1}`} className="circle" onClick={() => handleHoleClick(index)}>
              <div className="circle-index">{index + 1}</div>{seedCount}</div>
          ))}
        </div>
        <div className="circles-row">
          {seeds.slice(7).map((seedCount, index) => (
            <div key={`bottom-${index + 7}`} className="circle" onClick={() => handleHoleClick(index + 7)}>
            <div className="circle-index">{14-index}</div>{seedCount}</div>
          ))}
        </div>
      </div>
      <div className="house right-house">{0}</div>
      <div 
        className="hand-cursor" 
        style={{ 
          top: cursorTop, 
          left: cursorLeft, 
          opacity: cursorVisible ? 1 : 0,
          backgroundImage: `url('/assets/images/handcursor.png')` // Directly referencing from the public folder
        }}
      ></div>
    </div>
  );
};

export default CongkakBoard;
