import React, { useState, useEffect, useRef } from 'react';
import './CongkakBoard.css';

const CongkakBoard = () => {
  const initialSeedCount = 7;
  const [seeds, setSeeds] = useState(new Array(14).fill(initialSeedCount)); // 14 holes excluding houses
  
  const holeRefs = useRef([]);
  const [cursorVisible, setCursorVisible] = useState(true); // Initialize cursor visibility
  const [cursorLeft, setCursorLeft] = useState(1200);
  const [cursorTop, setCursorTop] = useState(550);
  
  const gameContainerRef = useRef(null);
  
  useEffect(() => {
    if (holeRefs.current[8]) { // Accessing hole number 8 (index 13)
      const holeRect = holeRefs.current[8].getBoundingClientRect();
      setCursorLeft(holeRect.left + window.scrollX + (holeRect.width / 5)); // Adjust for 1/3 position
      setCursorTop(holeRect.top + window.scrollY + (0.6*holeRect.height)); // Adjust for 1/3 position
    }
    
    const handleMouseMove = (event) => {
      const mouseX = event.clientX;
      
      let closestHoleIndex = 0;
      let closestDistance = Infinity;
  
      holeRefs.current.forEach((hole, index) => {
        if (hole) {
          const holeRect = hole.getBoundingClientRect();
          const holeCenterX = holeRect.left + window.scrollX + (holeRect.width / 2);
          const distance = Math.abs(mouseX - holeCenterX);
          
          if (distance < closestDistance) {
            closestDistance = distance;
            closestHoleIndex = index;
          }
        }
      });
  
      // Snap cursor to the specific position within the closest hole
      if (holeRefs.current[closestHoleIndex]) {
        const closestHoleRect = holeRefs.current[closestHoleIndex].getBoundingClientRect();
        const cursorLeftOffset = closestHoleRect.left + window.scrollX + (closestHoleRect.width / 5);
        const cursorTopOffset = closestHoleRect.top + window.scrollY + (0.6 * closestHoleRect.height);
  
        setCursorLeft(cursorLeftOffset + 'px');
        setCursorTop(cursorTopOffset + 'px');
      }
    };
  
    const gameContainer = gameContainerRef.current;
    gameContainer.addEventListener('mousemove', handleMouseMove);
  
    return () => gameContainer.removeEventListener('mousemove', handleMouseMove);
  }, []);


  const handleHoleClick = async (index) => {
    if (seeds[index] === 0) return; // Prevent picking from empty hole

    let newSeeds = [...seeds];
    let seedsInHand = newSeeds[index];
    newSeeds[index] = 0; // Pick up all seeds

    // Distribute seeds in a clockwise direction
    let currentIndex = index;
    while (seedsInHand > 0) {
      currentIndex = (currentIndex + 1) % 14; // Move to next hole in a circular way
      if (currentIndex === index) continue; // Skip the starting hole
      
      // Move the hand cursor to the current hole
      if (holeRefs.current[currentIndex]) {
        const holeRect = holeRefs.current[currentIndex].getBoundingClientRect();
        setCursorLeft(holeRect.left + window.scrollX + 'px');
        setCursorTop(holeRect.top + window.scrollY + (0.6 * holeRect.height) + 'px'); // Keeping the vertical position at 60% of the hole's height
      }
      
      newSeeds[currentIndex]++;
      seedsInHand--;
      setSeeds([...newSeeds]); // Update the state with the new distribution of seeds

      await new Promise(resolve => setTimeout(resolve, 600)); // 300ms delay for each sowing step
    }
  };

  return (
    <div ref={gameContainerRef} className="game-container">
      <div className="house left-house">
        <span className='circle-index'>LOW</span>
        {0}
      </div>
      <div className="rows-container">
        <div className="circles-row">
          {seeds.slice(0, 7).map((seedCount, index) => (
            <div 
            ref={el => holeRefs.current[index] = el}
              key={`top-${index}`} 
              className="circle" 
              onClick={() => handleHoleClick(index)}
            >
            <div className="circle-index">{index + 1}</div>{seedCount}</div>
          ))}
        </div>
        <div className="circles-row">
          {seeds.slice(7).reverse().map((seedCount, index) => (
            <div 
              ref={el => holeRefs.current[13 - index] = el} // Assign refs to holes
              key={`bottom-${13 - index}`} 
              className="circle" 
              onClick={() => handleHoleClick(13 - index)}
            >
            <div className="circle-index">{14 - index}</div>{seedCount}</div>
          ))}
        </div>
      </div>
      <div className="house right-house">
        <span className='circle-index'>TOP</span>
        {0}
      </div>
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
