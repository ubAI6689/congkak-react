import React, { useState, useEffect, useRef, useCallback } from 'react';
import './CongkakBoard.css';
import House from './House';
import Cursor from './Cursor';
import Row from './Row';
import { toggleTurn, sumOfSeedsInCurrentRow, handleCheckGameEnd } from '../utils/helpers';
import { updateCursorPosition, handleMouseMovement } from '../utils/animation';
import config from '../config/config';

const Players = {
  UPPER: config.PLAYER_UPPER,
  LOWER: config.PLAYER_LOWER,
}

const INIT_SEEDS_COUNT = config.INIT_SEEDS_COUNT;
const HOLE_NUMBERS = config.HOLE_NUMBERS;
const MIN_INDEX_LOWER = config.MIN_INDEX_LOWER;
const MAX_INDEX_LOWER = config.MAX_INDEX_LOWER;
const MIN_INDEX_UPPER = config.MIN_INDEX_UPPER;
const MAX_INDEX_UPPER = config.MAX_INDEX_UPPER;

const posMultiplier = config.POS_MULTIPLIER;

const CongkakBoard = () => {
  const [seeds, setSeeds] = useState(new Array(HOLE_NUMBERS).fill(INIT_SEEDS_COUNT)); // 14 holes excluding houses
  
  const holeRefs = useRef([]);
  const topHouseRef = useRef(null);
  const lowHouseRef = useRef(null);

  const [cursorVisible, setCursorVisible] = useState(true); // Initialize cursor visibility
  const [cursorLeft, setCursorLeft] = useState(1200);
  const [cursorTop, setCursorTop] = useState(550);
  const [resetCursor, setResetCursor] = useState(false);
  
  const [currentTurn, setCurrentTurn] = useState(Players.LOWER);
  const [isSowing, setIsSowing] = useState(false);
  
  const [currentSeedsInHand, setCurrentSeedsInHand] = useState(0);
  const [topHouseSeeds, setTopHouseSeeds] = useState(0);
  const [lowHouseSeeds, setLowHouseSeeds] = useState(0);
  
  const [isGameOver, setIsGameOver] = useState(false);
  const [outcomeMessage, setOutcomeMessage] = useState('');

  const gameContainerRef = useRef(null);
  
  const verticalPos = currentTurn === Players.UPPER ? -posMultiplier : posMultiplier;

/**==============================================
 *        useEffect implementations
 * =============================================*/

  // GameOver Checker
  useEffect(() => {
    if (!isSowing) {
      handleCheckGameEnd(seeds, config, topHouseSeeds, lowHouseSeeds, setIsGameOver, setOutcomeMessage);
    }
  }, [isSowing, seeds, topHouseSeeds, lowHouseSeeds]);

  // Skip turn if the whole row is empty
  useEffect(() => {
    if (!isSowing && !isGameOver) {
      let sum = sumOfSeedsInCurrentRow(seeds, currentTurn, config);
      if (sum === 0) {
        toggleTurn(setCurrentTurn, currentTurn, Players);
      }
    }
  }, [seeds, currentTurn, isSowing, isGameOver]);

  // Reset cursor position in every turn
  useEffect(() => {
    const startIndex = currentTurn === Players.UPPER ? 
      Math.round((config.MIN_INDEX_UPPER + config.MAX_INDEX_UPPER) / 2) :
      Math.round((config.MIN_INDEX_LOWER + config.MAX_INDEX_LOWER) / 2);

      updateCursorPosition(holeRefs, startIndex, setCursorLeft, setCursorTop, verticalPos);
  }, [currentTurn, resetCursor, verticalPos]);
  
  // Handle mouse movement
  const handleMouseMove = useCallback(handleMouseMovement(isSowing, holeRefs, currentTurn, verticalPos, setCursorLeft, setCursorTop, config), 
  [isSowing, holeRefs, currentTurn, verticalPos, setCursorLeft, setCursorTop, config]);

  useEffect(() => {
    const gameContainer = gameContainerRef.current;
  
    if (gameContainer) {
      gameContainer.addEventListener('mousemove', handleMouseMove);
    }
  
    return () => {
      if (gameContainer) {
        gameContainer.removeEventListener('mousemove', handleMouseMove);
      }
    };
  }, [handleMouseMove]);

/**==============================================
 *        Sowing and capturing logic 
 * =============================================*/

  const handleHoleClick = async (index) => {
    
    if (seeds[index] === 0) return; // Prevent picking from empty hole
    if (currentTurn === Players.UPPER && index > MAX_INDEX_UPPER) return;
    if (currentTurn === Players.LOWER && index <= MAX_INDEX_UPPER) return;

    setIsSowing(true); // Indicate that sowing has started
    
    let newSeeds = [...seeds];
    let seedsInHand = 0;
    let justFilledHome = false;
    let getAnotherTurn = false;
    let hasPassedHouse = 0;
    
    await updateCursorPosition(holeRefs, index, setCursorLeft, setCursorTop, 0)

    // Pick up all seeds
    seedsInHand = newSeeds[index]; 
    newSeeds[index] = 0; 
    setCurrentSeedsInHand(seedsInHand);
    setSeeds([...newSeeds]);

    // Distribute seeds in a clockwise direction
    let currentIndex = index;
    while (seedsInHand > 0) {
    
      /** ============================================
       *              Sowing to House
       * ===========================================*/

      // Check if the next hole is House
      if ((currentIndex === MAX_INDEX_UPPER && currentTurn === Players.UPPER) ||
          (currentIndex === MAX_INDEX_LOWER && currentTurn === Players.LOWER)) {
          
        // Determine which house to update
        const isUpper = currentTurn === Players.UPPER;
        const houseRef = isUpper ? topHouseRef : lowHouseRef;
        const setHouseSeeds = isUpper ? setTopHouseSeeds : setLowHouseSeeds;
        const verticalAdjustment = isUpper ? -0.1 : 0.1;
        const nextIndex = isUpper ? MIN_INDEX_LOWER : 0;
          
        // Animate cursor to the appropriate house and increment seeds
        hasPassedHouse++;
        await updateCursorPosition(houseRef, houseRef.current, setCursorLeft, setCursorTop, verticalAdjustment);
        setHouseSeeds(prevSeeds => prevSeeds + 1);
        seedsInHand--;
        setCurrentSeedsInHand(seedsInHand);
          
        // Determine next action based on remaining seeds
        if (seedsInHand > 0) {
          justFilledHome = true;
          currentIndex = nextIndex;
        } else { // If ended in own house, get another turn.
          getAnotherTurn = true;
          setResetCursor(prev => !prev);
          continue;
        }
      }

      /** ============================================
       *           Sowing to regular holes
       * ===========================================*/

      // If it's just filled home, the index is not incremented to avoid hole skipping
      if (justFilledHome) {
        justFilledHome = false;
      } else {
        currentIndex = (currentIndex + 1) % HOLE_NUMBERS;
      }
      
      // Animate cursor
      await updateCursorPosition(holeRefs, currentIndex, setCursorLeft, setCursorTop, verticalPos);
      
      // Update holes
      seedsInHand--;
      setCurrentSeedsInHand(seedsInHand);
      newSeeds[currentIndex]++;
      setSeeds([...newSeeds]);
      
      // If landed in non-empty hole, continue the sowing process
      if (seedsInHand === 0 && newSeeds[currentIndex] > 1) {
        await updateCursorPosition(holeRefs, currentIndex, setCursorLeft, setCursorTop, 0)
        seedsInHand = newSeeds[currentIndex]; // Pick up all seeds from the current hole
        setCurrentSeedsInHand(seedsInHand);
        newSeeds[currentIndex] = 0;
        setSeeds([...newSeeds]);
      } 
      
      /** ============================================
       *               Capturing
       * ===========================================*/
      
      // If landed in empty hole, check for capture
      if (seedsInHand === 0 && newSeeds[currentIndex] === 1) {
        // Capture only if the player has passed their house at least once
        if (hasPassedHouse === 0) continue;

        // Determine if the row is the current player's side
        const isTopRowHole = currentIndex < MIN_INDEX_LOWER;
        const isCurrentTurnRow = (currentTurn === Players.UPPER && isTopRowHole) || 
                                 (currentTurn === Players.LOWER && !isTopRowHole);

        if (!isCurrentTurnRow) continue; // Skip if not

        // Calculate the opposite index
        const oppositeIndex = MAX_INDEX_LOWER - currentIndex;
        // Check if the opposite hole has seeds
        if (newSeeds[oppositeIndex] === 0) continue;
        
        // Pick up current hole animation
        await updateCursorPosition(holeRefs, currentIndex, setCursorLeft, setCursorTop, 0)
        seedsInHand = newSeeds[currentIndex];
        setCurrentSeedsInHand(seedsInHand);
        newSeeds[currentIndex] = 0;
        setSeeds([...newSeeds]);

        // Capturing ... (picking up from opposite hole)
        await updateCursorPosition(holeRefs, oppositeIndex, setCursorLeft, setCursorTop, verticalPos)
        const capturedSeeds = newSeeds[oppositeIndex] + seedsInHand;
        seedsInHand = capturedSeeds;
        setCurrentSeedsInHand(seedsInHand);
        newSeeds[oppositeIndex] = 0;
        setSeeds([...newSeeds]);

        // Send captured seeds to House
        const isUpper = currentTurn === Players.UPPER;
        const houseRef = isUpper ? topHouseRef : lowHouseRef;
        const setHouseSeeds = isUpper ? setTopHouseSeeds : setLowHouseSeeds;
        const verticalAdjustment = isUpper ? -0.1 : 0.1;

        // Animate cursor to the appropriate house and add captured seeds
        await updateCursorPosition(houseRef, houseRef.current, setCursorLeft, setCursorTop, verticalAdjustment);
        setHouseSeeds(prevSeeds => prevSeeds + capturedSeeds);

        // // Send captured seeds to House
        // if (currentTurn === Players.UPPER) {
        //   // // TODO: Animate cursor movement from opposite hole to house
        //   await updateCursorPosition(topHouseRef, topHouseRef.current, setCursorLeft, setCursorTop, -0.1)
        //   // Add captured seeds to UPPER's house
        //   setTopHouseSeeds(prevSeeds => prevSeeds + capturedSeeds);
        // } else {
        //   // Animate cursor from opposite hole to lower house
        //   await updateCursorPosition(lowHouseRef, lowHouseRef.current, setCursorLeft, setCursorTop, 0.1)
        //   // Add captured seeds to LOWER's house
        //   setLowHouseSeeds(prevSeeds => prevSeeds + capturedSeeds);
        // }

        // Update the state with the new distribution of seeds
        seedsInHand = 0;
        setCurrentSeedsInHand(seedsInHand);
        setSeeds([...newSeeds]);
      }
    }
    setCurrentSeedsInHand(0);
    setSeeds([...newSeeds]);
    if (!getAnotherTurn) toggleTurn(setCurrentTurn, currentTurn, Players);
    setIsSowing(false); // Indicate that sowing has finished
  };

  return (
    <div ref={gameContainerRef} className={`game-container ${isGameOver ? 'game-over' : ''}`}>
      <div className="current-turn">Current Turn: {currentTurn}</div>
      <div className='game-content'>
        <House position="lower" seedCount={lowHouseSeeds} ref={lowHouseRef}/>
        <div className="rows-container">
          <Row seeds={seeds.slice(MIN_INDEX_UPPER, MIN_INDEX_LOWER)} rowType="upper" isUpper={true} onClick={handleHoleClick} refs={holeRefs.current} />
          <Row seeds={seeds.slice(MIN_INDEX_LOWER).reverse()} rowType="lower" onClick={handleHoleClick} refs={holeRefs.current} />
        </div>
        <House position="upper" seedCount={topHouseSeeds} ref={topHouseRef} isUpper={true}/>
        <Cursor top={cursorTop} left={cursorLeft} visible={cursorVisible} seedCount={currentSeedsInHand} isTopTurn={currentTurn===Players.UPPER} />
      </div>
      {isGameOver && (
      <div className="game-over-message">
        {outcomeMessage}
      </div>
      )}
    </div>
  );
};

export default CongkakBoard;