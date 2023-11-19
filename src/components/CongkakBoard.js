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
const posMultiplier = 0.55;

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
  
  const [currentTurn, setCurrentTurn] = useState(Players.LOW);

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
    let justFilledHome = false;

    newSeeds[index] = 0; // Pick up all seeds

    // Distribute seeds in a clockwise direction
    let currentIndex = index;
    while (seedsInHand > 0) {
      // Check if the next hole is House
      if (currentIndex == 6 && currentTurn === Players.TOP) {
        // Animate cursor to TOP house and increment seeds
        // Ensure topHouseRef.current is valid
        if (topHouseRef.current) {
          const topHouseRect = topHouseRef.current.getBoundingClientRect();
          setCursorLeft(topHouseRect.left + window.scrollX + 'px');
          setCursorTop(topHouseRect.top + window.scrollY + (-0.1 * topHouseRect.height) + 'px');
          await new Promise(resolve => setTimeout(resolve, 600)); // Animation delay
          setTopHouseSeeds(prevSeeds => prevSeeds + 1);
          seedsInHand--;
          if (seedsInHand > 0) {
            justFilledHome = true;
            currentIndex = 7
          } else {
            continue;
          }
        }
      } else if (currentIndex == 13 && currentTurn === Players.LOW) {
        // Animate cursor to LOW house and increment seeds
        // Ensure lowHouseRef.current is valid
        if (lowHouseRef.current) {
          const lowHouseRect = lowHouseRef.current.getBoundingClientRect();
          setCursorLeft(lowHouseRect.left + window.scrollX + 'px');
          setCursorTop(lowHouseRect.top + window.scrollY + (0.1 * lowHouseRect.height) + 'px');
          await new Promise(resolve => setTimeout(resolve, 600)); // Animation delay
          setLowHouseSeeds(prevSeeds => prevSeeds + 1);
          seedsInHand--;
          if (seedsInHand > 0) {
            justFilledHome = true;
            currentIndex = 0
          } else {
            continue;
          }
        }
      }

      // Move to the next hole in a circular way
      // If it's just filled home, the index is not incremented to avoid hole skipping
      if (justFilledHome) {
        justFilledHome = false;
      } else {
        currentIndex = (currentIndex + 1) % 14;
        seedsInHand--;
      }
      
      // Animate cursor
      updateCursorPosition(holeRefs, currentIndex, setCursorLeft, setCursorTop, verticalPos);
      setCurrentSeedsInHand(seedsInHand);
      
      // Update holes
      await new Promise(resolve => setTimeout(resolve, 300)); // 650ms delay for each sowing step
      newSeeds[currentIndex]++;
      setSeeds([...newSeeds]);
      
      // If the current hole has more seeds, continue the sowing process
      if (seedsInHand === 0 && newSeeds[currentIndex] > 1) {
        seedsInHand = newSeeds[currentIndex]; // Pick up all seeds from the current hole
        setCurrentSeedsInHand(seedsInHand);
        pickUpAnimation(holeRefs, currentIndex, setCursorTop);
        newSeeds[currentIndex] = 0; // Leave no seed in the current hole
        setSeeds([...newSeeds]);
        // await new Promise(resolve => setTimeout(resolve, 200));
      }
      
      await new Promise(resolve => setTimeout(resolve, 300)); // 650ms delay for each sowing step
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
