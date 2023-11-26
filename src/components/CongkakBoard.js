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
  
  // New states for the starting phase
  const [isStartingPhase, setIsStartingPhase] = useState(true);
  const [isStartButtonPressed, setIsStartButtonPressed] = useState(false);

  // States for starting phase
  const [startingPositionUpper, setStartingPositionUpper] = useState(null);
  const [startingPositionLower, setStartingPositionLower] = useState(null);
  const [upperPlayerConfirmed, setUpperPlayerConfirmed] = useState(false);
  const [lowerPlayerConfirmed, setLowerPlayerConfirmed] = useState(false);

  const [cursorVisibilityUpper, setCursorVisibilityUpper] = useState({ visible: true });
  const [cursorVisibilityLower, setCursorVisibilityLower] = useState({ visible: true });

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
  const verticalPosUpper = config.VERTICAL_POS_UPPER;
  const verticalPosLower = config.VERTICAL_POS_LOWER;

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
      updateCursorPositionUpper(holeRefs, startIndexUpper, verticalPosUpper);
      setCurrentHoleIndexUpper(startIndexUpper);

      updateCursorPositionLower(holeRefs, startIndexLower, verticalPosLower);
      setCurrentHoleIndexLower(startIndexLower);
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
        setCurrentHoleIndexUpper(newIndexUpper);
        updateCursorPositionUpper(holeRefs, newIndexUpper, verticalPosUpper);
        
        // Start sowing
        if (event.key === 's' || event.key === 'S') {
          if (!isStartingPhase) {
            // Start sowing for PlayerUpper
            handleHoleClick(newIndexUpper, PLAYER_UPPER);
          } else if (!upperPlayerConfirmed) {
            setStartingPositionUpper(newIndexUpper);
            setUpperPlayerConfirmed(true);
          }
        }
      }
      
      if (!isSowingUpper) {
        // Handle PlayerLower's left and right movement (reversed)
        if (event.key === 'ArrowLeft') {
          newIndexLower = Math.min(MAX_INDEX_LOWER, currentHoleIndexLower + 1); // Increment index
        } else if (event.key === 'ArrowRight') {
          newIndexLower = Math.max(MIN_INDEX_LOWER, currentHoleIndexLower - 1); // Decrement index
        }
        setCurrentHoleIndexLower(newIndexLower);
        updateCursorPositionLower(holeRefs, newIndexLower, verticalPosLower);
    
        if (event.key === 'ArrowDown') {
          if (!isStartingPhase) {
            // Start sowing for PlayerLower
            handleHoleClick(newIndexLower, PLAYER_LOWER);
          } else if (!lowerPlayerConfirmed) {
            setStartingPositionLower(newIndexLower);
            setLowerPlayerConfirmed(true);
          }
        }
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

  const startSimultaneousSowing = async (startingPositionUpper, startingPositionLower) => {
    if (!upperPlayerConfirmed) {
      console.log("Please select starting position for Player Upper")
    } else if (!lowerPlayerConfirmed) {
      console.log("Please select starting position for Player Lower")
    } else {
      console.log("Start button pressed here!")
      
      setIsSowingUpper(true);
      setIsSowingLower(true);

      let currentIndexUpper = startingPositionUpper;
      let currentIndexLower = startingPositionLower;
      console.log(`startIndexU: ${currentIndexUpper}, startIndexL: ${currentIndexLower}`)
      let newSeeds = [...seeds];
      // let newSeedsLower = [...seeds];
      let seedsInHandUpper = 0;
      let seedsInHandLower = 0;
      let hasPassedHouseUpper = 0;
      let hasPassedHouseLower = 0;
      let justFilledHomeUpper = false;
      let justFilledHomeLower = false;
      let getAnotherTurnUpper = false;
      let getAnotherTurnLower = false;

      seedsInHandUpper = newSeeds[currentIndexUpper];
      seedsInHandLower = newSeeds[currentIndexLower];
      setCurrentSeedsInHandUpper(seedsInHandUpper);
      setCurrentSeedsInHandLower(seedsInHandLower);

      newSeeds[currentIndexUpper] = 0;
      setSeeds([...newSeeds]);
      newSeeds[currentIndexLower] = 0;
      setSeeds([...newSeeds]);
      
      updateCursorPositionUpper(holeRefs, currentIndexUpper, 0);
      updateCursorPositionLower(holeRefs, currentIndexLower, 0);
      
      await new Promise(resolve => setTimeout(resolve, 400)); // Animation delay       
      
      while (seedsInHandUpper > 0 && seedsInHandLower > 0) {
        // Determine next moves without updating UI
        let nextIndexUpper = getNextIndex(currentIndexUpper, justFilledHomeUpper, MAX_INDEX_UPPER, MIN_INDEX_LOWER);
        let nextIndexLower = getNextIndex(currentIndexLower, justFilledHomeLower, MAX_INDEX_LOWER, MIN_INDEX_UPPER);
    
        let sowIntoHouseUpper = nextIndexUpper === MIN_INDEX_LOWER && !justFilledHomeUpper;
        let sowIntoHouseLower = nextIndexLower === MIN_INDEX_UPPER && !justFilledHomeLower;
    
        // Update seeds in hand
        seedsInHandUpper -= 1;
        seedsInHandLower -= 1;
    
        // Now perform UI updates simultaneously
        if (sowIntoHouseUpper) {
          updateCursorPositionUpper(topHouseRef, topHouseRef.current, -0.1);
          setTopHouseSeeds(prevSeeds => prevSeeds + 1);
          justFilledHomeUpper = true;
        } else {
          updateCursorPositionUpper(holeRefs, nextIndexUpper, -0.5);
          newSeeds[nextIndexUpper]++;
          currentIndexUpper = nextIndexUpper;
          justFilledHomeUpper = false;
        }
    
        if (sowIntoHouseLower) {
          updateCursorPositionLower(lowHouseRef, lowHouseRef.current, 0.1);
          setLowHouseSeeds(prevSeeds => prevSeeds + 1);
          justFilledHomeLower = true;
        } else {
          updateCursorPositionLower(holeRefs, nextIndexLower, 0.5);
          newSeeds[nextIndexLower]++;
          currentIndexLower = nextIndexLower;
          justFilledHomeLower = false;
        }
    
        setSeeds([...newSeeds]);
    
        // Update state for seeds in hand
        setCurrentSeedsInHandUpper(seedsInHandUpper);
        setCurrentSeedsInHandLower(seedsInHandLower);
    
        await new Promise(resolve => setTimeout(resolve, 400)); // Synchronization delay
      }
    }
  }

  // Helper function to get the next index
  function getNextIndex(currentIndex, justFilledHome, maxIndex, minIndex) {
    if (justFilledHome) {
      return minIndex;
    }
    return currentIndex === maxIndex ? minIndex : (currentIndex + 1) % HOLE_NUMBERS;
  }

  

/**==============================================
 *        Sowing and capturing logic 
 * =============================================*/
  const handleHoleClick = async (index, player) => {
    
    // Prevent picking from empty hole
    if (seeds[index] === 0) return;
  
    // Determine player-specific states and actions
    const isUpperPlayer = player === PLAYER_UPPER;
    const currentHouseRef = isUpperPlayer ? topHouseRef : lowHouseRef;
    const setIsSowing = isUpperPlayer ? setIsSowingUpper : setIsSowingLower;
    const setHouseSeeds = isUpperPlayer ? setTopHouseSeeds : setLowHouseSeeds;
    const setCurrentSeedsInHand = isUpperPlayer ? setCurrentSeedsInHandUpper : setCurrentSeedsInHandLower;
    const verticalAdjustment = isUpperPlayer ? -0.5 : 0.5;
    const maxIndex = isUpperPlayer ? MAX_INDEX_UPPER : MAX_INDEX_LOWER;
    const minIndex = isUpperPlayer ? MIN_INDEX_LOWER : 0;
    
    // Start sowing
    setIsSowing(true);

    let currentIndex = index;
    let newSeeds = [...seeds];
    let seedsInHand = 0;
    let hasPassedHouse = 0;
    let justFilledHome = false;
    let getAnotherTurn = false;
    
    // Pick up all seed
    seedsInHand = newSeeds[index];
    setCurrentSeedsInHand(seedsInHand);
    newSeeds[index] = 0;
    setSeeds([...newSeeds]);
    
    // Pick up animation
    if (isUpperPlayer) {
      await updateCursorPositionUpper(holeRefs, currentIndex, 0);
    } else {
      await updateCursorPositionLower(holeRefs, currentIndex, 0);
    }
    
    while (seedsInHand > 0) {
      /** ============================================
       *              Sowing to House
       * ===========================================*/
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
          // reset cursor position
          if (isUpperPlayer) {
            await updateCursorPositionUpper(holeRefs, startIndexUpper, verticalPosUpper);
          } else {
            await updateCursorPositionLower(holeRefs, startIndexLower, verticalPosLower);
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

      if (isUpperPlayer) {
        await updateCursorPositionUpper(holeRefs, currentIndex, verticalAdjustment);
      } else {
        await updateCursorPositionLower(holeRefs, currentIndex, verticalAdjustment);
      }

      // Update holes
      newSeeds[currentIndex]++;
      setSeeds([...newSeeds]);

      // Update seeds in hand
      seedsInHand--;
      setCurrentSeedsInHand(seedsInHand);
    
      /** ============================================
       *  If landed on non-empty house, continue sowing
       * ===========================================*/
      if (seedsInHand === 0 && newSeeds[currentIndex] > 1) {
        await new Promise(resolve => setTimeout(resolve, 200)); // Animation delay
        seedsInHand = newSeeds[currentIndex]; // Pick up all seeds from the current hole
        setCurrentSeedsInHand(seedsInHand);
        
        // Empty the current hole
        newSeeds[currentIndex] = 0;
        setSeeds([...newSeeds]);

        // Pick up animation
        if (isUpperPlayer) {
          await updateCursorPositionUpper(holeRefs, currentIndex, 0);
        } else {
          await updateCursorPositionLower(holeRefs, currentIndex, 0);
        }

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
        const isCurrentTurnRow = (isUpperPlayer && isTopRowHole) || 
                                 (!isUpperPlayer && !isTopRowHole);
      
        // Skip if not
        if (!isCurrentTurnRow) continue;
        
        // Calculate the opposite index
        const oppositeIndex = MAX_INDEX_LOWER - currentIndex;
        
        // Check if the opposite hole has seeds
        if (newSeeds[oppositeIndex] === 0) continue;
         
        // Pick up current hole animation
        if (isUpperPlayer) {
          await updateCursorPositionUpper(holeRefs, currentIndex, 0);
        } else {
          await updateCursorPositionLower(holeRefs, currentIndex, 0);
        }
        seedsInHand = newSeeds[currentIndex];
        setCurrentSeedsInHand(seedsInHand);
        newSeeds[currentIndex] = 0;
        setSeeds([...newSeeds]);
      
        // Capturing ... (picking up from opposite hole)
        if (isUpperPlayer) {
          await updateCursorPositionUpper(holeRefs, oppositeIndex, verticalAdjustment);
        } else {
          await updateCursorPositionLower(holeRefs, oppositeIndex, verticalAdjustment);
        }
        const capturedSeeds = newSeeds[oppositeIndex] + seedsInHand;
        seedsInHand = capturedSeeds;
        setCurrentSeedsInHand(seedsInHand);
        newSeeds[oppositeIndex] = 0;
        setSeeds([...newSeeds]);
      
        // Send captured seeds to House
        // Animate cursor to the appropriate house and add captured seeds
        if (isUpperPlayer) {
          await updateCursorPositionUpper(currentHouseRef, currentHouseRef.current, -0.1);
        } else {
          await updateCursorPositionLower(currentHouseRef, currentHouseRef.current, 0.1);
        }
        setHouseSeeds(prevSeeds => prevSeeds + capturedSeeds);

        // reset cursor position
        if (isUpperPlayer) {
          await updateCursorPositionUpper(holeRefs, startIndexUpper, verticalPosUpper);
        } else {
          await updateCursorPositionLower(holeRefs, startIndexLower, verticalPosLower);
        }
      
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
    <div className='game-area'>
      <div ref={gameContainerRef} className={`game-container ${isGameOver ? 'game-over' : ''}`}>
        {/* <div className="current-turn">Current Turn: {currentTurn}</div> */}
        <div className='game-content'>
          <House position="lower" seedCount={lowHouseSeeds} ref={lowHouseRef}/>
          <div className="rows-container">
          {/* Update the Row for upper player */}
          <Row seeds={seeds.slice(MIN_INDEX_UPPER, MIN_INDEX_LOWER)} rowType="upper" isUpper={true} onClick={handleHoleClick} refs={holeRefs.current} selectedHole={startingPositionUpper}/>
          <Row seeds={seeds.slice(MIN_INDEX_LOWER).reverse()} rowType="lower" onClick={handleHoleClick} refs={holeRefs.current} selectedHole={startingPositionLower} />

        </div>
          <House position="upper" seedCount={topHouseSeeds} ref={topHouseRef} isUpper={true}/>
          {/* <Cursor top={cursorTop} left={cursorLeft} visible={cursorVisible} seedCount={currentSeedsInHand} isTopTurn={currentTurn===PLAYER_UPPER} /> */}
          <Cursor 
            top={cursorTopUpper} 
            left={cursorLeftUpper} 
            visible={cursorVisibilityUpper.visible} 
            seedCount={currentSeedsInHandUpper} // Adjust based on Player 1's state
            isTopTurn={true} // Always true for Player 1
          />

          <Cursor 
            top={cursorTopLower} 
            left={cursorLeftLower} 
            visible={cursorVisibilityLower.visible} 
            seedCount={currentSeedsInHandLower} // Adjust based on Player 2's state
            isTopTurn={false} // Always false for Player 2
          />
        </div>
      </div>
      {!isStartButtonPressed && isStartingPhase && (
          <button className="start-button" 
          onClick={() => startSimultaneousSowing(startingPositionUpper, startingPositionLower)} >START</button>
      )}
      {isGameOver && (
        <div className="game-over-message">
          {outcomeMessage}
        </div>
      )}
    </div>
  );
};

export default CongkakBoard;