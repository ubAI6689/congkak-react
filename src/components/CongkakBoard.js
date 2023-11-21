import React, { useState, useEffect, useRef, useCallback } from 'react';
import './CongkakBoard.css';
import House from './House';
import Cursor from './Cursor';
import Row from './Row';
import { toggleTurn, sumOfSeedsInCurrentRow, handleCheckGameEnd } from '../utils/helpers';
import { updateCursorPositionLower, updateCursorPositionUpper } from '../utils/animation';
import config from '../config/config';

const { 
  INIT_SEEDS_COUNT,
  HOLE_NUMBERS,
  PLAYER_LOWER,
  PLAYER_UPPER,
  MIN_INDEX_UPPER,
  MAX_INDEX_UPPER,
  MIN_INDEX_LOWER,
  MAX_INDEX_LOWER,
  POS_MULTIPLIER,
} = config;

const CongkakBoard = () => {
  const [seeds, setSeeds] = useState(new Array(HOLE_NUMBERS).fill(INIT_SEEDS_COUNT)); // 14 holes excluding houses
  
  const holeRefs = useRef([]);
  const topHouseRef = useRef(null);
  const lowHouseRef = useRef(null);

  const [gamePhase, setGamePhase] = useState('SIMULTANEOUS'); // or 'TURN_BASED'

  const [cursorStatePlayerUpper, setCursorStatePlayerUpper] = useState({ visible: true, left: 0, top: 0 });
  const [cursorStatePlayerLower, setCursorStatePlayerLower] = useState({ visible: true, left: 0, top: 0 });

  const startIndexUpper = Math.round((MIN_INDEX_UPPER + MAX_INDEX_UPPER) / 2);
  const startIndexLower = Math.round((MIN_INDEX_LOWER + MAX_INDEX_LOWER) / 2);

  const [currentHoleIndexUpper, setCurrentHoleIndexUpper] = useState(startIndexUpper); 
  const [currentHoleIndexLower, setCurrentHoleIndexLower] = useState(startIndexLower);

  const [cursorLeftUpper, setCursorLeftUpper] = useState(0);
  const [cursorTopUpper, setCursorTopUpper] = useState(0);
  const [cursorLeftLower, setCursorLeftLower] = useState(1200);
  const [cursorTopLower, setCursorTopLower] = useState(550);

  const [cursorVisible, setCursorVisible] = useState(true); // Initialize cursor visibility
  const [cursorLeft, setCursorLeft] = useState(1200);
  const [cursorTop, setCursorTop] = useState(550);
  const [resetCursor, setResetCursor] = useState(false);
  
  const [currentTurn, setCurrentTurn] = useState(null);
  const [isSowing, setIsSowing] = useState(false);
  
  const [currentSeedsInHand, setCurrentSeedsInHand] = useState(0);
  const [topHouseSeeds, setTopHouseSeeds] = useState(0);
  const [lowHouseSeeds, setLowHouseSeeds] = useState(0);
  
  const [isGameOver, setIsGameOver] = useState(false);
  const [outcomeMessage, setOutcomeMessage] = useState('');

  const gameContainerRef = useRef(null);
  
  const verticalPos = currentTurn === PLAYER_UPPER ? -POS_MULTIPLIER : POS_MULTIPLIER;
  const verticalPosUpper = -POS_MULTIPLIER;
  const verticalPosLower = POS_MULTIPLIER;

  // Reset Cursor Position
  useEffect(() => {
    resetCursorPosition();
    const handleResize = () => resetCursorPosition();
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
    
    function resetCursorPosition() {
      // Set initial position for PlayerUpper cursor
      if (holeRefs.current[startIndexUpper]) {
        const rectUpper = holeRefs.current[startIndexUpper].getBoundingClientRect();
        setCursorLeftUpper(rectUpper.left + window.scrollX);
        setCursorTopUpper(rectUpper.top + window.scrollY + (-0.5 * rectUpper.height));
      }

      // Set initial position for PlayerLower cursor
      if (holeRefs.current[startIndexLower]) {
        const rectLower = holeRefs.current[startIndexLower].getBoundingClientRect();
        setCursorLeftLower(rectLower.left + window.scrollX);
        setCursorTopLower(rectLower.top + window.scrollY + (0.6 * rectLower.height));
      }
    }
  }, [holeRefs]);

  // Event listener for keydown events
  useEffect(() => {
    const handleKeyDown = (event) => {
      let newIndexUpper = currentHoleIndexUpper;
      let newIndexLower = currentHoleIndexLower;
  
      // PlayerUpper: A (left), D (right)
      if (event.key === 'a' || event.key === 'A') {
        newIndexUpper = Math.max(0, currentHoleIndexUpper - 1); // decrease
      } else if (event.key === 'd' || event.key === 'D') {
        newIndexUpper = Math.min(MAX_INDEX_UPPER, currentHoleIndexUpper + 1); // increase
      }
  
      // PlayerLower: Left arrow (right move), Right arrow (left move)
      if (event.key === 'ArrowLeft') {
        newIndexLower = Math.min(MAX_INDEX_LOWER, currentHoleIndexLower + 1); // Increment index
      } else if (event.key === 'ArrowRight') {
        newIndexLower = Math.max(MIN_INDEX_LOWER, currentHoleIndexLower - 1); // Decrement index
      }
      
      console.log("Current Index Lower: ", currentHoleIndexLower)
      console.log("New Index Lower: ", newIndexLower)
      // Update hole indices and cursor positions if changed
      if (newIndexUpper !== currentHoleIndexUpper) {
        setCurrentHoleIndexUpper(newIndexUpper);
        updateCursorPositionUpper(newIndexUpper, holeRefs, setCursorLeftUpper, setCursorTopUpper, verticalPosUpper);
      }
      if (newIndexLower !== currentHoleIndexLower) {
        setCurrentHoleIndexLower(newIndexLower);
        updateCursorPositionLower(newIndexLower, holeRefs, setCursorLeftLower, setCursorTopLower, verticalPosLower);
      }
    };
  
    window.addEventListener('keydown', handleKeyDown);
  
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentHoleIndexUpper, currentHoleIndexLower, holeRefs, verticalPosUpper, verticalPosLower]);
  

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
        toggleTurn(setCurrentTurn, currentTurn);
      }
    }
  }, [seeds, currentTurn, isSowing, isGameOver]);

/**==============================================
 *        Sowing and capturing logic 
 * =============================================*/
  
  // const handleHoleClick = async (index) => {
    
  //   if (seeds[index] === 0) return; // Prevent picking from empty hole
  //   if (currentTurn === PLAYER_UPPER && index > MAX_INDEX_UPPER) return;
  //   if (currentTurn === PLAYER_LOWER && index <= MAX_INDEX_UPPER) return;

  //   setIsSowing(true); // Indicate that sowing has started
    
  //   let newSeeds = [...seeds];
  //   let seedsInHand = 0;
  //   let justFilledHome = false;
  //   let getAnotherTurn = false;
  //   let hasPassedHouse = 0;
    
  //   await updateCursorPosition(holeRefs, index, setCursorLeft, setCursorTop, 0)

  //   // Pick up all seeds
  //   seedsInHand = newSeeds[index]; 
  //   newSeeds[index] = 0; 
  //   setCurrentSeedsInHand(seedsInHand);
  //   setSeeds([...newSeeds]);

  //   // Distribute seeds in a clockwise direction
  //   let currentIndex = index;
  //   while (seedsInHand > 0) {
    
  //     /** ============================================
  //      *              Sowing to House
  //      * ===========================================*/

  //     // Check if the next hole is House
  //     if ((currentIndex === MAX_INDEX_UPPER && currentTurn === PLAYER_UPPER) ||
  //         (currentIndex === MAX_INDEX_LOWER && currentTurn === PLAYER_LOWER)) {
          
  //       // Determine which house to update
  //       const isUpper = currentTurn === PLAYER_UPPER;
  //       const houseRef = isUpper ? topHouseRef : lowHouseRef;
  //       const setHouseSeeds = isUpper ? setTopHouseSeeds : setLowHouseSeeds;
  //       const verticalAdjustment = isUpper ? -0.1 : 0.1;
  //       const nextIndex = isUpper ? MIN_INDEX_LOWER : 0;
          
  //       // Animate cursor to the appropriate house and increment seeds
  //       hasPassedHouse++;
  //       await updateCursorPosition(houseRef, houseRef.current, setCursorLeft, setCursorTop, verticalAdjustment);
  //       setHouseSeeds(prevSeeds => prevSeeds + 1);
  //       seedsInHand--;
  //       setCurrentSeedsInHand(seedsInHand);
          
  //       // Determine next action based on remaining seeds
  //       if (seedsInHand > 0) {
  //         justFilledHome = true;
  //         currentIndex = nextIndex;
  //       } else { // If ended in own house, get another turn.
  //         getAnotherTurn = true;
  //         setResetCursor(prev => !prev);
  //         continue;
  //       }
  //     }

  //     /** ============================================
  //      *           Sowing to regular holes
  //      * ===========================================*/

  //     // If it's just filled home, the index is not incremented to avoid hole skipping
  //     if (justFilledHome) {
  //       justFilledHome = false;
  //     } else {
  //       currentIndex = (currentIndex + 1) % HOLE_NUMBERS;
  //     }
      
  //     // Animate cursor
  //     await updateCursorPosition(holeRefs, currentIndex, setCursorLeft, setCursorTop, verticalPos);
      
  //     // Update holes
  //     seedsInHand--;
  //     setCurrentSeedsInHand(seedsInHand);
  //     newSeeds[currentIndex]++;
  //     setSeeds([...newSeeds]);
      
  //     // If landed in non-empty hole, continue the sowing process
  //     if (seedsInHand === 0 && newSeeds[currentIndex] > 1) {
  //       await new Promise(resolve => setTimeout(resolve, 200)); // Animation delay
  //       await updateCursorPosition(holeRefs, currentIndex, setCursorLeft, setCursorTop, 0)
  //       seedsInHand = newSeeds[currentIndex]; // Pick up all seeds from the current hole
  //       setCurrentSeedsInHand(seedsInHand);
  //       newSeeds[currentIndex] = 0;
  //       setSeeds([...newSeeds]);
  //     } 
      
  //     /** ============================================
  //      *               Capturing
  //      * ===========================================*/
      
  //     // If landed in empty hole, check for capture
  //     if (seedsInHand === 0 && newSeeds[currentIndex] === 1) {
  //       // Capture only if the player has passed their house at least once
  //       if (hasPassedHouse === 0) continue;

  //       // Determine if the row is the current player's side
  //       const isTopRowHole = currentIndex < MIN_INDEX_LOWER;
  //       const isCurrentTurnRow = (currentTurn === PLAYER_UPPER && isTopRowHole) || 
  //                                (currentTurn === PLAYER_LOWER && !isTopRowHole);

  //       if (!isCurrentTurnRow) continue; // Skip if not

  //       // Calculate the opposite index
  //       const oppositeIndex = MAX_INDEX_LOWER - currentIndex;
  //       // Check if the opposite hole has seeds
  //       if (newSeeds[oppositeIndex] === 0) continue;
        
  //       // Pick up current hole animation
  //       await updateCursorPosition(holeRefs, currentIndex, setCursorLeft, setCursorTop, 0)
  //       seedsInHand = newSeeds[currentIndex];
  //       setCurrentSeedsInHand(seedsInHand);
  //       newSeeds[currentIndex] = 0;
  //       setSeeds([...newSeeds]);

  //       // Capturing ... (picking up from opposite hole)
  //       await updateCursorPosition(holeRefs, oppositeIndex, setCursorLeft, setCursorTop, verticalPos)
  //       const capturedSeeds = newSeeds[oppositeIndex] + seedsInHand;
  //       seedsInHand = capturedSeeds;
  //       setCurrentSeedsInHand(seedsInHand);
  //       newSeeds[oppositeIndex] = 0;
  //       setSeeds([...newSeeds]);

  //       // Send captured seeds to House
  //       const isUpper = currentTurn === PLAYER_UPPER;
  //       const houseRef = isUpper ? topHouseRef : lowHouseRef;
  //       const setHouseSeeds = isUpper ? setTopHouseSeeds : setLowHouseSeeds;
  //       const verticalAdjustment = isUpper ? -0.1 : 0.1;

  //       // Animate cursor to the appropriate house and add captured seeds
  //       await updateCursorPosition(houseRef, houseRef.current, setCursorLeft, setCursorTop, verticalAdjustment);
  //       setHouseSeeds(prevSeeds => prevSeeds + capturedSeeds);

  //       // Update the state with the new distribution of seeds
  //       seedsInHand = 0;
  //       setCurrentSeedsInHand(seedsInHand);
  //       setSeeds([...newSeeds]);
  //     }
  //   }
  //   setCurrentSeedsInHand(0);
  //   setSeeds([...newSeeds]);
  //   if (!getAnotherTurn) toggleTurn(setCurrentTurn, currentTurn);
  //   setIsSowing(false); // Indicate that sowing has finished
  // };

  return (
    <div ref={gameContainerRef} className={`game-container ${isGameOver ? 'game-over' : ''}`}>
      {/* <div className="current-turn">Current Turn: {currentTurn}</div> */}
      <div className='game-content'>
        <House position="lower" seedCount={lowHouseSeeds} ref={lowHouseRef}/>
        <div className="rows-container">
          <Row seeds={seeds.slice(MIN_INDEX_UPPER, MIN_INDEX_LOWER)} rowType="upper" isUpper={true} refs={holeRefs.current} />
          <Row seeds={seeds.slice(MIN_INDEX_LOWER).reverse()} rowType="lower" refs={holeRefs.current} />
        </div>
        <House position="upper" seedCount={topHouseSeeds} ref={topHouseRef} isUpper={true}/>
        {/* <Cursor top={cursorTop} left={cursorLeft} visible={cursorVisible} seedCount={currentSeedsInHand} isTopTurn={currentTurn===PLAYER_UPPER} /> */}
        <Cursor 
          top={cursorTopUpper} 
          left={cursorLeftUpper} 
          visible={cursorStatePlayerUpper.visible} 
          // seedCount={currentSeedsInHandPlayerUpper} // Adjust based on Player 1's state
          isTopTurn={true} // Always true for Player 1
        />

        <Cursor 
          top={cursorTopLower} 
          left={cursorLeftLower} 
          visible={cursorStatePlayerLower.visible} 
          // seedCount={currentSeedsInHandPlayerLower} // Adjust based on Player 2's state
          isTopTurn={false} // Always false for Player 2
        />
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


