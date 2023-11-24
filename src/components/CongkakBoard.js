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
  // const [seeds, setSeeds] = useState(new Array(HOLE_NUMBERS).fill(INIT_SEEDS_COUNT)); // 14 holes excluding houses

  // Initialize holes state with seed count and placeholder for setter function
  const [holes, setHoles] = useState(
    Array.from({ length: HOLE_NUMBERS }, () => ({
      seeds: INIT_SEEDS_COUNT,
      setSeeds: () => {}
    }))
  );

  // Function to update the seed count of a specific hole
  const updateHoleSeeds = useCallback((holeIndex, newSeedCount) => {
    setHoles(prevHoles =>
      prevHoles.map((hole, index) =>
        index === holeIndex ? { ...hole, seeds: newSeedCount } : hole
      )
    );
  }, []);

  // Initialize setter functions for each hole
  useEffect(() => {
    setHoles(prevHoles =>
      prevHoles.map((hole, index) => ({
        ...hole,
        setSeeds: newSeedCount => updateHoleSeeds(index, newSeedCount)
      }))
    );
  }, [updateHoleSeeds]);

  // Now we can use holes[index].setSeeds(newCount) to update a specific hole
  
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

  const [cursorLeftUpper, setCursorLeftUpper] = useState(window.innerWidth / 2);
  const [cursorTopUpper, setCursorTopUpper] = useState(window.innerHeight / 3);
  const [cursorLeftLower, setCursorLeftLower] = useState(window.innerWidth / 2);
  const [cursorTopLower, setCursorTopLower] = useState(window.innerHeight * 2 / 3);

  const [cursorVisible, setCursorVisible] = useState(true); // Initialize cursor visibility
  const [resetCursor, setResetCursor] = useState(false);
  const [updateBoard, setUpdateBoard] = useState(false);
  
  const [currentTurn, setCurrentTurn] = useState(null);
  const [isSowingUpper, setIsSowingUpper] = useState(false);
  const [isSowingLower, setIsSowingLower] = useState(false);
  
  // const [currentSeedsInHand, setCurrentSeedsInHand] = useState(0);
  const [currentSeedsInHandUpper, setCurrentSeedsInHandUpper] = useState(0);
  const [currentSeedsInHandLower, setCurrentSeedsInHandLower] = useState(0);
  const [topHouseSeeds, setTopHouseSeeds] = useState(0);
  const [lowHouseSeeds, setLowHouseSeeds] = useState(0);
  
  const [isGameOver, setIsGameOver] = useState(false);
  const [outcomeMessage, setOutcomeMessage] = useState('');

  const gameContainerRef = useRef(null);
  
  const verticalPos = currentTurn === PLAYER_UPPER ? -POS_MULTIPLIER : POS_MULTIPLIER;
  const verticalPosUpper = -POS_MULTIPLIER;
  const verticalPosLower = POS_MULTIPLIER;

  // Function to update cursor position for PlayerUpper
  const updateCursorPositionUpper = async (ref, indexOrElement, verticalPosUpper) => {
    let element;
    
    // determine if indexOrElement is an index or a DOM element
    if (typeof indexOrElement === "number") {
      element = ref.current[indexOrElement];
    } else {
      element = indexOrElement;
    }

    if (element) {
      const rect = element.getBoundingClientRect();
      setCursorLeftUpper(rect.left + window.scrollX);
      setCursorTopUpper(rect.top + window.scrollY + (verticalPosUpper * rect.height));
      await new Promise(resolve => setTimeout(resolve, 400)); // Animation delay
    }
  };

  // Function to update cursor position for PlayerLower
  const updateCursorPositionLower = async (ref, indexOrElement, verticalPosLower) => {
    let element;
    // determine if indexOrElement is an index or a DOM element
    if (typeof indexOrElement === "number") {
      element = ref.current[indexOrElement];
    } else {
      element = indexOrElement;
    }
    
    if (element) {
      const rect = element.getBoundingClientRect();
      setCursorLeftLower(rect.left + window.scrollX);
      setCursorTopLower(rect.top + window.scrollY + (verticalPosLower * rect.height));
      await new Promise(resolve => setTimeout(resolve, 400)); // Animation delay
    }
  };

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
        setCursorTopLower(rectLower.top + window.scrollY + (0.5 * rectLower.height));
      }
    }
  }, [holeRefs, resetCursor]);

  // Event listener for keydown events
  useEffect(() => {
    const handleKeyDown = (event) => {
      let newIndexUpper = currentHoleIndexUpper;
      let newIndexLower = currentHoleIndexLower;
    
      // Handle PlayerUpper's left and right movement
      if (!isSowingUpper) {
        if (event.key === 'a' || event.key === 'A') {
          newIndexUpper = Math.max(0, currentHoleIndexUpper - 1); // decrease
        } else if (event.key === 'd' || event.key === 'D') {
          newIndexUpper = Math.min(MAX_INDEX_UPPER, currentHoleIndexUpper + 1); // increase
        }

        // Start sowing
        if (event.key === 's' || event.key === 'S') {
          // Start sowing for PlayerUpper
          handleHoleClick(newIndexUpper, PLAYER_UPPER);
        }
      }
      
      if (!isSowingUpper) {
        // Handle PlayerLower's left and right movement (reversed)
        if (event.key === 'ArrowLeft') {
          newIndexLower = Math.min(MAX_INDEX_LOWER, currentHoleIndexLower + 1); // Increment index
        } else if (event.key === 'ArrowRight') {
          newIndexLower = Math.max(MIN_INDEX_LOWER, currentHoleIndexLower - 1); // Decrement index
        }
    
        if (event.key === 'ArrowDown') {
        // Start sowing for PlayerLower
        handleHoleClick(newIndexLower, PLAYER_LOWER);
        }
      }
      
      // Update hole indices and cursor positions if changed
      if (newIndexUpper !== currentHoleIndexUpper) {
        setCurrentHoleIndexUpper(newIndexUpper);
        updateCursorPositionUpper(holeRefs, newIndexUpper, verticalPosUpper);
      }
      if (newIndexLower !== currentHoleIndexLower) {
        setCurrentHoleIndexLower(newIndexLower);
        updateCursorPositionLower(holeRefs, newIndexLower, verticalPosLower);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };    
  }, [currentHoleIndexUpper, currentHoleIndexLower, holeRefs, verticalPosUpper, verticalPosLower, isSowingUpper, isSowingLower]);

/**==============================================
 *        useEffect implementations
 * =============================================*/

  // GameOver Checker
  // useEffect(() => {
  //   if (!isSowing) {
  //     handleCheckGameEnd(seeds, config, topHouseSeeds, lowHouseSeeds, setIsGameOver, setOutcomeMessage);
  //   }
  // }, [isSowing, seeds, topHouseSeeds, lowHouseSeeds]);

  // // Skip turn if the whole row is empty
  // useEffect(() => {
  //   if (!isSowing && !isGameOver) {
  //     let sum = sumOfSeedsInCurrentRow(seeds, currentTurn, config);
  //     if (sum === 0) {
  //       toggleTurn(setCurrentTurn, currentTurn);
  //     }
  //   }
  // }, [seeds, currentTurn, isSowing, isGameOver]);

/**==============================================
 *        Sowing and capturing logic 
 * =============================================*/
  const handleHoleClick = async (index, player) => {
    
    // Prevent picking from empty hole
    if (holes[index].seeds === 0) return;
  
    // Determine player-specific states and actions
    const isUpperPlayer = player === PLAYER_UPPER;
    const currentHouseRef = isUpperPlayer ? topHouseRef : lowHouseRef;
    const setIsSowing = isUpperPlayer ? setIsSowingUpper : setIsSowingLower;
    const setHouseSeeds = isUpperPlayer ? setTopHouseSeeds : setLowHouseSeeds;
    const setCurrentSeedsInHand = isUpperPlayer ? setCurrentSeedsInHandUpper : setCurrentSeedsInHandLower;
    const verticalAdjustment = isUpperPlayer ? -0.5 : 0.5;
    const maxIndex = isUpperPlayer ? MAX_INDEX_UPPER : MAX_INDEX_LOWER;
    const minIndex = isUpperPlayer ? MIN_INDEX_LOWER : 0;
  
    let currentIndex = index;
    let hasPassedHouse = 0;
    let justFilledHome = false;
    let getAnotherTurn = false;
    
    // Start sowing
    setIsSowing(true);

    let seedsInHand = holes[index].seeds;
    setCurrentSeedsInHand(seedsInHand);
    
    // Update the starting hole using functional update
    setHoles(prevHoles =>
      prevHoles.map((hole, i) => 
        i === index ? { ...hole, seeds: 0 } : hole)
    );
  
    if (isUpperPlayer) {
      await updateCursorPositionUpper(holeRefs, currentIndex, 0);
    } else {
      await updateCursorPositionLower(holeRefs, currentIndex, 0);
    }
  
    while (seedsInHand > 0) {
      // Check if the next hole is House
      if ((currentIndex === maxIndex && player === currentTurn) ||
          (currentIndex === maxIndex && gamePhase === 'SIMULTANEOUS')) {
        hasPassedHouse++;
        if (isUpperPlayer) {
          await updateCursorPositionUpper(currentHouseRef, currentHouseRef.current, -0.1);
        } else {
          await updateCursorPositionLower(currentHouseRef, currentHouseRef.current, 0.1);
        }
        setHouseSeeds(prevSeeds => prevSeeds + 1);
        seedsInHand--;
        setCurrentSeedsInHand(seedsInHand);
        if (seedsInHand > 0) {
          justFilledHome = true;
          currentIndex = minIndex;
        } else {
          getAnotherTurn = true;
          if (isUpperPlayer) {
            if (holeRefs.current[startIndexUpper]) {
              const rectUpper = holeRefs.current[startIndexUpper].getBoundingClientRect();
              setCursorLeftUpper(rectUpper.left + window.scrollX);
              setCursorTopUpper(rectUpper.top + window.scrollY + (-0.5 * rectUpper.height));
            } 
          } else {
            // Set initial position for PlayerLower cursor
            if (holeRefs.current[startIndexLower]) {
              const rectLower = holeRefs.current[startIndexLower].getBoundingClientRect();
              setCursorLeftLower(rectLower.left + window.scrollX);
              setCursorTopLower(rectLower.top + window.scrollY + (0.5 * rectLower.height));
            }
          }
          setIsSowing(false);
          continue;
        }
      }
    
      // Move to the next hole in a circular way
      if (justFilledHome) {
        justFilledHome = false;
      } else {
        currentIndex = (currentIndex + 1) % HOLE_NUMBERS;
      }

      // Updating current hole's seeds
      setHoles(prevHoles =>
        prevHoles.map((hole, i) =>
          i === currentIndex ? { ...hole, seeds: hole.seeds + 1 } : hole)
      );

      if (isUpperPlayer) {
        await updateCursorPositionUpper(holeRefs, currentIndex, verticalAdjustment);
      } else {
        await updateCursorPositionLower(holeRefs, currentIndex, verticalAdjustment);
      }

      // Update holes
      seedsInHand--;
      setCurrentSeedsInHand(seedsInHand);
    
      // Continue sowing
      if (seedsInHand === 0 && holes[currentIndex].seeds > 1) {
        // await new Promise(resolve => setTimeout(resolve, 200)); // Animation delay
        const seedsToPickUp = holes[currentIndex].seeds;
        seedsInHand = seedsToPickUp; // Pick up all seeds from the current hole
        setCurrentSeedsInHand(seedsToPickUp);
        
        // Empty the current hole
        setHoles(prevHoles =>
          prevHoles.map((hole, i) => 
            i === currentIndex ? { ...hole, seeds: 0 } : hole)
        );

        if (isUpperPlayer) {
          await updateCursorPositionUpper(holeRefs, currentIndex, 0);
        } else {
          await updateCursorPositionLower(holeRefs, currentIndex, 0);
        }

      } 
    
      // Capture logic goes here (similar to previous implementation)
      // If landed in empty hole, check for capture
      if (seedsInHand === 0 && holes[currentIndex].seeds === 1) {
        
        // Capture only if the player has passed their house at least once
        if (hasPassedHouse === 0) continue;
      
        // Determine if the row is the current player's side
        const isTopRowHole = currentIndex < MIN_INDEX_LOWER;
        const isCurrentTurnRow = (isUpperPlayer && isTopRowHole) || 
                                 (!isUpperPlayer && !isTopRowHole);
      
        // Skip if not
        if (!isCurrentTurnRow) continue;
        
        // Calculate the opposite index
        const oppositeIndex = MAX_INDEX_LOWER - currentIndex;
        
        // Check if the opposite hole has seeds
        if (holes[oppositeIndex].seeds === 0) continue;
         
        // Pick up current hole animation
        if (isUpperPlayer) {
          await updateCursorPositionUpper(holeRefs, currentIndex, 0);
        } else {
          await updateCursorPositionLower(holeRefs, currentIndex, 0);
        }
        seedsInHand = holes[currentIndex].seeds;
        setCurrentSeedsInHand(seedsInHand);
        holes[currentIndex].setSeeds(0);
      
        // Capturing ... (picking up from opposite hole)
        if (isUpperPlayer) {
          await updateCursorPositionUpper(holeRefs, oppositeIndex, verticalAdjustment);
        } else {
          await updateCursorPositionLower(holeRefs, oppositeIndex, verticalAdjustment);
        }
        const capturedSeeds = holes[oppositeIndex].seeds + seedsInHand;
        seedsInHand = capturedSeeds;
        setCurrentSeedsInHand(seedsInHand);
        holes[oppositeIndex].setSeeds(0);
      
        // Send captured seeds to House
        // Animate cursor to the appropriate house and add captured seeds
        if (isUpperPlayer) {
          await updateCursorPositionUpper(currentHouseRef, currentHouseRef.current, -0.1);
        } else {
          await updateCursorPositionLower(currentHouseRef, currentHouseRef.current, 0.1);
        }
        setHouseSeeds(prevSeeds => prevSeeds + capturedSeeds);
        setResetCursor(prev => !prev);
      
        // Update the state with the new distribution of seeds
        seedsInHand = 0;
        setCurrentSeedsInHand(seedsInHand);
      }
    }
  
    // End of sowing
    if (!getAnotherTurn && gamePhase !== 'SIMULTANEOUS') {
      toggleTurn(setCurrentTurn, currentTurn);
    }
    setResetCursor(prev => !prev)
    setIsSowing(false);
  };

  return (
    <div ref={gameContainerRef} className={`game-container ${isGameOver ? 'game-over' : ''}`}>
      {/* <div className="current-turn">Current Turn: {currentTurn}</div> */}
      <div className='game-content'>
        <House position="lower" seedCount={lowHouseSeeds} ref={lowHouseRef}/>
        <div className="rows-container">
        {/* Update the Row for upper player */}
        <Row 
          holes={holes.slice(MIN_INDEX_UPPER, MIN_INDEX_LOWER)} 
          rowType="upper" 
          isUpper={true} 
          refs={holeRefs.current} 
          onClick={handleHoleClick} 
        />

        <Row 
          holes={holes.slice(MIN_INDEX_LOWER).reverse()} 
          rowType="lower" 
          refs={holeRefs.current} 
          onClick={handleHoleClick} 
        />

      </div>
        <House position="upper" seedCount={topHouseSeeds} ref={topHouseRef} isUpper={true}/>
        {/* <Cursor top={cursorTop} left={cursorLeft} visible={cursorVisible} seedCount={currentSeedsInHand} isTopTurn={currentTurn===PLAYER_UPPER} /> */}
        <Cursor 
          top={cursorTopUpper} 
          left={cursorLeftUpper} 
          visible={cursorStatePlayerUpper.visible} 
          seedCount={currentSeedsInHandUpper} // Adjust based on Player 1's state
          isTopTurn={true} // Always true for Player 1
        />

        <Cursor 
          top={cursorTopLower} 
          left={cursorLeftLower} 
          visible={cursorStatePlayerLower.visible} 
          seedCount={currentSeedsInHandLower} // Adjust based on Player 2's state
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