import React, { useState, useEffect, useRef } from 'react';
import './CongkakBoard.css';
import House from './House';
import Cursor from './Cursor';

const Players = {
  TOP: 'TOP',
  LOW: 'LOW'
}

const CongkakBoard = () => {
  const initialSeedCount = 7;
  const [seeds, setSeeds] = useState(new Array(14).fill(initialSeedCount)); // 14 holes excluding houses
  
  const holeRefs = useRef([]);
  const [cursorVisible, setCursorVisible] = useState(true); // Initialize cursor visibility
  const [cursorLeft, setCursorLeft] = useState(1200);
  const [cursorTop, setCursorTop] = useState(550);

  const [isSowing, setIsSowing] = useState(false);
  const [currentSeedsInHand, setCurrentSeedsInHand] = useState(0);

  const [currentTurn, setCurrentTurn] = useState(Players.TOP);
  
  const gameContainerRef = useRef(null);
  
  const updateCursorToRowStart = () => {
    const startIndex = currentTurn === Players.TOP ? 0 : 7; // 0 for TOP, 7 for LOW
    if (holeRefs.current[startIndex]) {
      const holeRect = holeRefs.current[startIndex].getBoundingClientRect();
      setCursorLeft(holeRect.left + window.scrollX + 'px');
      setCursorTop(holeRect.top + window.scrollY + (0.6 * holeRect.height) + 'px');
    }
  };  

  useEffect(() => {
    updateCursorToRowStart();
  }, [currentTurn]);

  useEffect(() => {
    const gameContainer = gameContainerRef.current;
    const handleMouseMove = (event) => {
      if (isSowing) return; // Do not update cursor position during sowing
      
      const mouseX = event.clientX;
      
      let closestHoleIndex = 0;
      let closestDistance = Infinity;
  
      holeRefs.current.forEach((hole, index) => {
        // Determine if the hole is in the current turn's row
        const isTopRowHole = index < 7;
        const isCurrentTurnRow = (currentTurn === Players.TOP && isTopRowHole) || 
                                 (currentTurn === Players.LOW && !isTopRowHole);
    
        if (hole && isCurrentTurnRow) {
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
        const cursorTopOffset = closestHoleRect.top + window.scrollY + (0.55 * closestHoleRect.height);
  
        setCursorLeft(cursorLeftOffset + 'px');
        setCursorTop(cursorTopOffset + 'px');
      }
    };
  
    if (gameContainer) {
      gameContainer.addEventListener('mousemove', handleMouseMove);
    }
  
    return () => {
      if (gameContainer) {
        gameContainer.removeEventListener('mousemove', handleMouseMove);
      }
    };
  }, [isSowing]);


  const toggleTurn = () => {
    setCurrentTurn(currentTurn === Players.TOP ? Players.LOW : Players.TOP);
  };  

  const handleHoleClick = async (index) => {

    if (currentTurn === Players.TOP && index > 6) return;
    if (currentTurn === Players.LOW && index <= 6) return;

    if (seeds[index] === 0) return; // Prevent picking from empty hole

    setIsSowing(true); // Indicate that sowing has started

    let newSeeds = [...seeds];
    let seedsInHand = newSeeds[index];
    newSeeds[index] = 0; // Pick up all seeds

    // Distribute seeds in a clockwise direction
    let currentIndex = index;
    while (seedsInHand > 0) {
      currentIndex = (currentIndex + 1) % 14; // Move to next hole in a circular way
      // if (currentIndex === index) continue; // Skip the starting hole
      
      // Move the hand cursor to the current hole
      if (holeRefs.current[currentIndex]) {
        const holeRect = holeRefs.current[currentIndex].getBoundingClientRect();
        setCursorLeft(holeRect.left + window.scrollX + 'px');
        setCursorTop(holeRect.top + window.scrollY + (0.55 * holeRect.height) + 'px'); // Keeping the vertical position at 60% of the hole's height
      }
      
      seedsInHand--;
      setCurrentSeedsInHand(seedsInHand);
      newSeeds[currentIndex]++;
      setSeeds([...newSeeds]); // Update the state with the new distribution of seeds

      // If the current hole has more seeds, continue the sowing process
      if (seedsInHand === 0 && newSeeds[currentIndex] > 1) {
        
        setCurrentSeedsInHand(0);
        await new Promise(resolve => setTimeout(resolve, 500));

        const holeRect = holeRefs.current[currentIndex].getBoundingClientRect();
        setCursorTop(holeRect.top + window.scrollY + 'px');

        seedsInHand = newSeeds[currentIndex]; // Pick up all seeds from the current hole
        setCurrentSeedsInHand(seedsInHand);
        newSeeds[currentIndex] = 0; // Leave no seed in the current hole
      }
      
      await new Promise(resolve => setTimeout(resolve, 500)); // 300ms delay for each sowing step
    }
    setCurrentSeedsInHand(0);
    setIsSowing(false); // Indicate that sowing has finished
    toggleTurn();
  };

  return (
    <div ref={gameContainerRef} className="game-container">
      Current Turn: {currentTurn}
      <House position="low" seedCount={0}/>
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
      <House position="top" seedCount={0}/>
      <Cursor top={cursorTop} left={cursorLeft} visible={cursorVisible} seedCount={currentSeedsInHand} />
    </div>
  );
};

export default CongkakBoard;
