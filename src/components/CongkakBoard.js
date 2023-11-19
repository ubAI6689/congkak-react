import React, { useState, useEffect, useRef } from 'react';
import './CongkakBoard.css';
import House from './House';
import Cursor from './Cursor';
import Row from './Row';
import { updateCursorPosition, pickUpAnimation, toggleTurn } from '../utils/utils';

const Players = {
  TOP: 'TOP',
  LOW: 'LOW'
}

const initialSeedCount = 7;
const posMultiplier = 0.55

const CongkakBoard = () => {
  
  const [seeds, setSeeds] = useState(new Array(2*initialSeedCount).fill(initialSeedCount)); // 14 holes excluding houses
  
  const holeRefs = useRef([]);
  const topHouseRef = useRef(null);
  const lowHouseRef = useRef(null);

  const [cursorVisible, setCursorVisible] = useState(true); // Initialize cursor visibility
  const [cursorLeft, setCursorLeft] = useState(1200);
  const [cursorTop, setCursorTop] = useState(550);
  
  const [isSowing, setIsSowing] = useState(false);
  const [currentSeedsInHand, setCurrentSeedsInHand] = useState(0);
  
  const [currentTurn, setCurrentTurn] = useState(Players.TOP);

  const [topHouseSeeds, setTopHouseSeeds] = useState(0);
  const [lowHouseSeeds, setLowHouseSeeds] = useState(0);
  
  const gameContainerRef = useRef(null);
  
  const verticalPos = currentTurn === Players.TOP ? -posMultiplier : posMultiplier;
  
  const updateCursorToRowStart = () => {
    const startIndex = currentTurn === Players.TOP ? 0 : 7; // 0 for TOP, 7 for LOW
    if (holeRefs.current[startIndex]) {
      const holeRect = holeRefs.current[startIndex].getBoundingClientRect();
      setCursorLeft(holeRect.left + window.scrollX + 'px');
      setCursorTop(holeRect.top + window.scrollY + (verticalPos * holeRect.height) + 'px');
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
        const cursorTopOffset = closestHoleRect.top + window.scrollY + (verticalPos * closestHoleRect.height);
  
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

  const handleHoleClick = async (index) => {
    
    if (seeds[index] === 0) return; // Prevent picking from empty hole
    if (currentTurn === Players.TOP && index > 6) return;
    if (currentTurn === Players.LOW && index <= 6) return;

    setIsSowing(true); // Indicate that sowing has started

    let newSeeds = [...seeds];
    let seedsInHand = newSeeds[index];
    newSeeds[index] = 0; // Pick up all seeds

    // Distribute seeds in a clockwise direction
    let currentIndex = index;
    while (seedsInHand > 0) {
      currentIndex = (currentIndex + 1) % 14; // Move to next hole in a circular way
      
      /* Updating holes */
      // Move the hand cursor to the current hole
      updateCursorPosition(holeRefs, currentIndex, setCursorLeft, setCursorTop, verticalPos);
      seedsInHand--;
      setCurrentSeedsInHand(seedsInHand);
      newSeeds[currentIndex]++;
      setSeeds([...newSeeds]); // Update the state with the new distribution of seeds

      /* Updating House */
        // Check if the next hole is a house
      if ((currentTurn === Players.TOP && currentIndex === 6) || (currentTurn === Players.LOW && currentIndex === 13)) {
        await new Promise(resolve => setTimeout(resolve, 500)); // Animation
        // Add seed to the appropriate house
        if (currentTurn === Players.TOP) {
          // Animate cursor to TOP house and increment seeds
          // Ensure topHouseRef.current is valid
          if (topHouseRef.current) {
            const topHouseRect = topHouseRef.current.getBoundingClientRect();
            setCursorLeft(topHouseRect.left + window.scrollX + 'px');
            setCursorTop(topHouseRect.top + window.scrollY + (-0.1 * topHouseRect.height) + 'px');
            await new Promise(resolve => setTimeout(resolve, 500)); // Animation delay
            setTopHouseSeeds(prevSeeds => prevSeeds + 1);
          }
        } else {
          // Animate cursor to LOW house and increment seeds
          // Ensure lowHouseRef.current is valid
          if (lowHouseRef.current) {
            const lowHouseRect = lowHouseRef.current.getBoundingClientRect();
            setCursorLeft(lowHouseRect.left + window.scrollX + 'px');
            setCursorTop(lowHouseRect.top + window.scrollY + (0.1 * lowHouseRect.height) + 'px');
            await new Promise(resolve => setTimeout(resolve, 500)); // Animation delay
            setLowHouseSeeds(prevSeeds => prevSeeds + 1);
          }
        }
        seedsInHand--;
        continue;
      }

      // If the current hole has more seeds, continue the sowing process
      if (seedsInHand === 0 && newSeeds[currentIndex] > 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
        pickUpAnimation(holeRefs, currentIndex, setCursorTop);
        
        setCurrentSeedsInHand(0);
        seedsInHand = newSeeds[currentIndex]; // Pick up all seeds from the current hole
        setCurrentSeedsInHand(seedsInHand);
        newSeeds[currentIndex] = 0; // Leave no seed in the current hole
      }
      
      await new Promise(resolve => setTimeout(resolve, 500)); // 300ms delay for each sowing step
    }
    setCurrentSeedsInHand(0);
    setIsSowing(false); // Indicate that sowing has finished
    toggleTurn(setCurrentTurn, currentTurn, Players);
  };

  return (
    <div ref={gameContainerRef} className="game-container">
      Current Turn: {currentTurn}
      <House position="low" seedCount={lowHouseSeeds} ref={lowHouseRef}/>
      <div className="rows-container">
        <Row seeds={seeds.slice(0, 7)} rowType="top" onClick={handleHoleClick} refs={holeRefs.current} />
        <Row seeds={seeds.slice(7).reverse()} rowType="low" onClick={handleHoleClick} refs={holeRefs.current} />
      </div>
      <House position="top" seedCount={topHouseSeeds} ref={topHouseRef}/>
      <Cursor top={cursorTop} left={cursorLeft} visible={cursorVisible} seedCount={currentSeedsInHand} isTopTurn={currentTurn===Players.TOP} />
    </div>
  );
};

export default CongkakBoard;
