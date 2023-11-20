import React, { useState, useEffect, useRef } from 'react';
import './CongkakBoard.css';
import House from './House';
import Cursor from './Cursor';
import Row from './Row';
import { updateCursorPosition, pickUpAnimation, toggleTurn, updateCursorToRowStart } from '../utils/utils';

const Players = {
  UPPER: 'UPPER',
  LOWER: 'LOWER'
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
  
  const [currentTurn, setCurrentTurn] = useState(Players.LOWER);

  const [topHouseSeeds, setTopHouseSeeds] = useState(0);
  const [lowHouseSeeds, setLowHouseSeeds] = useState(0);
  
  const gameContainerRef = useRef(null);
  
  const verticalPos = currentTurn === Players.UPPER ? -posMultiplier : posMultiplier;

  useEffect(() => {
    updateCursorToRowStart(currentTurn, Players, holeRefs, setCursorLeft, setCursorTop, verticalPos);
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
        const isCurrentTurnRow = (currentTurn === Players.UPPER && isTopRowHole) || 
                                 (currentTurn === Players.LOWER && !isTopRowHole);
    
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
    if (currentTurn === Players.UPPER && index > 6) return;
    if (currentTurn === Players.LOWER && index <= 6) return;

    setIsSowing(true); // Indicate that sowing has started
    
    let newSeeds = [...seeds];
    let seedsInHand = 0;
    let justFilledHome = false;
    let getAnotherTurn = false;
    let hasPassedHouse = 0;
    
    if (holeRefs.current[index]) {
      // Start moving and updating cursor/hole
      const holeRect = holeRefs.current[index].getBoundingClientRect();
      setCursorTop(holeRect.top + window.scrollY + 'px');
      await new Promise(resolve => setTimeout(resolve, 200)); // Animation delay
      // Pick up all seeds
      seedsInHand = newSeeds[index]; 
      newSeeds[index] = 0; 
      setCurrentSeedsInHand(seedsInHand);
      setSeeds([...newSeeds]);
    }

    // Distribute seeds in a clockwise direction
    let currentIndex = index;
    while (seedsInHand > 0) {
    
      /** 
       * Filling House
      */

      // Check if the next hole is House
      if (currentIndex == 6 && currentTurn === Players.UPPER) {
        // Animate cursor to UPPER house and increment seeds
        // Ensure topHouseRef.current is valid
        hasPassedHouse++;
        if (topHouseRef.current) {
          const topHouseRect = topHouseRef.current.getBoundingClientRect();
          setCursorLeft(topHouseRect.left + window.scrollX + 'px');
          setCursorTop(topHouseRect.top + window.scrollY + (-0.1 * topHouseRect.height) + 'px');
          await new Promise(resolve => setTimeout(resolve, 400)); // Animation delay
          setTopHouseSeeds(prevSeeds => prevSeeds + 1);
          seedsInHand--;
          setCurrentSeedsInHand(seedsInHand);
          if (seedsInHand > 0) {
            justFilledHome = true;
            currentIndex = 7;
          } else {
            getAnotherTurn = true;
            continue;
          }
        }
      } else if (currentIndex == 13 && currentTurn === Players.LOWER) {
        // Animate cursor to LOWER house and increment seeds
        // Ensure lowHouseRef.current is valid
        hasPassedHouse++;
        if (lowHouseRef.current) {
          const lowHouseRect = lowHouseRef.current.getBoundingClientRect();
          setCursorLeft(lowHouseRect.left + window.scrollX + 'px');
          setCursorTop(lowHouseRect.top + window.scrollY + (0.1 * lowHouseRect.height) + 'px');
          await new Promise(resolve => setTimeout(resolve, 400)); // Animation delay
          setLowHouseSeeds(prevSeeds => prevSeeds + 1);
          seedsInHand--;
          setCurrentSeedsInHand(seedsInHand);
          if (seedsInHand > 0) {
            justFilledHome = true;
            currentIndex = 0;
          } else {
            getAnotherTurn = true;
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
      }
      
      // Animate cursor
      updateCursorPosition(holeRefs, currentIndex, setCursorLeft, setCursorTop, verticalPos);
      await new Promise(resolve => setTimeout(resolve, 200)); // Animation delay
      
      // Update holes
      seedsInHand--;
      setCurrentSeedsInHand(seedsInHand);
      newSeeds[currentIndex]++;
      setSeeds([...newSeeds]);
      
      // If the current hole has more seeds, continue the sowing process
      if (seedsInHand === 0 && newSeeds[currentIndex] > 1) {
        seedsInHand = newSeeds[currentIndex]; // Pick up all seeds from the current hole
        pickUpAnimation(holeRefs, currentIndex, setCursorTop);
        await new Promise(resolve => setTimeout(resolve, 200));
        newSeeds[currentIndex] = 0; // Leave no seed in the current hole
        setCurrentSeedsInHand(seedsInHand);
        setSeeds([...newSeeds]);
      } 
      
      /**
       *  CAPTURING LOGIC
       */

      if (seedsInHand === 0 && newSeeds[currentIndex] === 1) {
        // Capture only if the player has passed their house at least once
        if (hasPassedHouse === 0) {
          continue;
        }
        // Determine if the row is the current's player's side
        const isTopRowHole = currentIndex < 7;
        const isCurrentTurnRow = (currentTurn === Players.UPPER && isTopRowHole) || 
                                 (currentTurn === Players.LOWER && !isTopRowHole);

        if (isCurrentTurnRow) {
          // Calculate the opposite index
          const oppositeIndex = 13 - currentIndex;

          // Check if the opposite hole has seeds
          if (newSeeds[oppositeIndex] > 0) {
            
            pickUpAnimation(holeRefs, currentIndex, setCursorTop);
            await new Promise(resolve => setTimeout(resolve, 400));
            seedsInHand = newSeeds[currentIndex];
            setCurrentSeedsInHand(seedsInHand);
            newSeeds[currentIndex] = 0;
            setSeeds([...seeds]);

            // Animate cursor movement from current hole to opposite hole
            updateCursorPosition(holeRefs, oppositeIndex, setCursorLeft, setCursorTop, verticalPos)
            await new Promise(resolve => setTimeout(resolve, 400));
            // Capture logic: Move seeds from the opposite hole and current hole to the House
            const capturedSeeds = newSeeds[oppositeIndex] + seedsInHand;
            seedsInHand = capturedSeeds;
            setCurrentSeedsInHand(seedsInHand);
            newSeeds[oppositeIndex] = 0;
            setSeeds([...seeds]);

            if (currentTurn === Players.UPPER) {
              // // TODO: Animate cursor movement from opposite hole to house
              if (topHouseRef.current) {
                const topHouseRect = topHouseRef.current.getBoundingClientRect();
                setCursorLeft(topHouseRect.left + window.scrollX + 'px');
                setCursorTop(topHouseRect.top + window.scrollY + (-0.1 * topHouseRect.height) + 'px');
                await new Promise(resolve => setTimeout(resolve, 400));
              }
              // Add captured seeds to UPPER's house
              setTopHouseSeeds(prevSeeds => prevSeeds + capturedSeeds);
            } else {
              // Animate cursor from opposite hole to lower house
              if (lowHouseRef.current) {
                const lowHouseRect = lowHouseRef.current.getBoundingClientRect();
                setCursorLeft(lowHouseRect.left + window.scrollX + 'px');
                setCursorTop(lowHouseRect.top + window.scrollY + (0.1 * lowHouseRect.height) + 'px');
                await new Promise(resolve => setTimeout(resolve, 400));
              }
              // Add captured seeds to LOWER's house
              setLowHouseSeeds(prevSeeds => prevSeeds + capturedSeeds);
            }
            // Update the state with the new distribution of seeds
            seedsInHand = 0;
            setCurrentSeedsInHand(seedsInHand);
            setSeeds([...newSeeds]);
          }
        }
      }
      await new Promise(resolve => setTimeout(resolve, 200)); // 200ms delay for each sowing step
    }
    setCurrentSeedsInHand(0);
    setIsSowing(false); // Indicate that sowing has finished
    if (!getAnotherTurn) toggleTurn(setCurrentTurn, currentTurn, Players);
    updateCursorToRowStart(currentTurn, Players, holeRefs, setCursorLeft, setCursorTop, verticalPos);
  };

  return (
    <div ref={gameContainerRef} className="game-container">
      <div className="current-turn">Current Turn: {currentTurn}</div>
      <div className='game-content'>
        <House position="lower" seedCount={lowHouseSeeds} ref={lowHouseRef}/>
        <div className="rows-container">
          <Row seeds={seeds.slice(0, 7)} rowType="upper" onClick={handleHoleClick} refs={holeRefs.current} />
          <Row seeds={seeds.slice(7).reverse()} rowType="lower" onClick={handleHoleClick} refs={holeRefs.current} />
        </div>
        <House position="upper" seedCount={topHouseSeeds} ref={topHouseRef}/>
        <Cursor top={cursorTop} left={cursorLeft} visible={cursorVisible} seedCount={currentSeedsInHand} isTopTurn={currentTurn===Players.UPPER} />
      </div>
    </div>
  );
};

export default CongkakBoard;
