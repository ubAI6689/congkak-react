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
} = config;

const CongkakBoard = () => {

  const [seeds, setSeeds] = useState(new Array(HOLE_NUMBERS).fill(INIT_SEEDS_COUNT)); // 14 holes excluding houses

  const holeRefs = useRef([]);
  const topHouseRef = useRef(null);
  const lowHouseRef = useRef(null);

  const [gamePhase, setGamePhase] = useState('STARTING_PHASE'); // or 'TURN_BASED'
  
  // New states for the starting phase
  const [isStartingPhase, setIsStartingPhase] = useState(true);
  const [isStartButtonPressed, setIsStartButtonPressed] = useState(false);

  // States for starting phase
  const [startingPositionUpper, setStartingPositionUpper] = useState(null);
  const [startingPositionLower, setStartingPositionLower] = useState(null);

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

  const [resetCursor, setResetCursor] = useState(false);
  
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

  const startButtonPressed = () => {
    if (startingPositionUpper === null) {
      console.log("Please select starting position for Player Upper")
    } else if (startingPositionLower === null) {
      console.log("Please select starting position for Player Lower")
    } else {
      console.log("START GAME!")
      setIsStartButtonPressed(true);
      // setGamePhase('SIMULTANEOUS_SOWING');
      simultaneousSowing(startingPositionUpper, startingPositionLower);
    }
  }

  // Effect to update currentTurn
  useEffect(() => {
    if (gamePhase === 'TURN_BASED_SOWING') {
      const nextTurn = isSowingUpper ? PLAYER_UPPER : PLAYER_LOWER;
      setCurrentTurn(nextTurn);
      setIsStartingPhase(false);
    }
  }, [gamePhase, isSowingUpper, isSowingLower]);

  // Effect to call turnBasedSowing when currentTurn updates
  useEffect(() => {
    if (gamePhase === 'TURN_BASED_SOWING' && currentTurn !== null) {
      const currentPosition = currentTurn === PLAYER_UPPER ? currentHoleIndexUpper : currentHoleIndexLower;
      turnBasedSowing(currentPosition, currentTurn, true);
    }
  }, [currentTurn, gamePhase, currentHoleIndexUpper, currentHoleIndexLower]);

  
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
          if (gamePhase === 'TURN_BASED_SELECT' && currentTurn === PLAYER_UPPER) {
            // Start sowing for PlayerUpper
            turnBasedSowing(newIndexUpper, PLAYER_UPPER);
          } else if (gamePhase === 'STARTING_PHASE') {
            setStartingPositionUpper(newIndexUpper);
          }
        }
      }
      
      if (!isSowingLower) {
        // Handle PlayerLower's left and right movement (reversed)
        if (event.key === 'ArrowLeft') {
          newIndexLower = Math.min(MAX_INDEX_LOWER, currentHoleIndexLower + 1); // Increment index
        } else if (event.key === 'ArrowRight') {
          newIndexLower = Math.max(MIN_INDEX_LOWER, currentHoleIndexLower - 1); // Decrement index
        }
        setCurrentHoleIndexLower(newIndexLower);
        updateCursorPositionLower(holeRefs, newIndexLower, verticalPosLower);
        
        if (event.key === 'ArrowDown') {
          if (gamePhase === 'TURN_BASED_SELECT' && currentTurn === PLAYER_LOWER) {
            // Start sowing for PlayerLower
            turnBasedSowing(newIndexLower, PLAYER_LOWER);
          } else if (gamePhase === 'STARTING_PHASE') {
            setStartingPositionLower(newIndexLower);
          }
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };    
  }, [currentHoleIndexUpper, currentHoleIndexLower, holeRefs, verticalPosUpper, verticalPosLower, isSowingUpper, isSowingLower, gamePhase]);

/**==============================================
 *        useEffect implementations
 * =============================================*/

  // GameOver Checker
  useEffect(() => {
    if (!isSowingUpper && !isSowingLower) {
      handleCheckGameEnd(seeds, topHouseSeeds, lowHouseSeeds, setIsGameOver, setOutcomeMessage);
    }
  }, [isSowingUpper, isSowingLower, seeds, topHouseSeeds, lowHouseSeeds]);

  // Skip turn if the whole row is empty
  useEffect(() => {
    if ((!isSowingUpper && !isSowingLower ) && !isGameOver) {
      let sum = sumOfSeedsInCurrentRow(seeds, currentTurn, config);
      if (sum === 0) {
        toggleTurn(setCurrentTurn, currentTurn);
      }
    }
  }, [seeds, currentTurn, isSowingUpper, isSowingLower, isGameOver]);

  const simultaneousSowing = async (startingPositionUpper, startingPositionLower) => {
    console.log("Start button pressed here!")
    
    if (gamePhase !== 'STARTING_PHASE') return;
    setIsSowingUpper(true);
    setIsSowingLower(true);
    
    let currentIndexUpper = startingPositionUpper;
    let currentIndexLower = startingPositionLower;
    let newSeeds = [...seeds];
    let seedsInHandUpper = 0;
    let seedsInHandLower = 0;
    let hasPassedHouseUpper = 0;
    let hasPassedHouseLower = 0;
    let justFilledHomeUpper = false;
    let justFilledHomeLower = false;
    
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
    
    while (seedsInHandUpper > 0 || seedsInHandLower > 0) {
      // Determine next moves without updating UI
      let nextIndexUpper = getNextIndex(currentIndexUpper, justFilledHomeUpper, MAX_INDEX_UPPER, MIN_INDEX_LOWER);
      let nextIndexLower = getNextIndex(currentIndexLower, justFilledHomeLower, MAX_INDEX_LOWER, MIN_INDEX_UPPER);
      let sowIntoHouseUpper = nextIndexUpper === MIN_INDEX_LOWER && !justFilledHomeUpper;
      let sowIntoHouseLower = nextIndexLower === MIN_INDEX_UPPER && !justFilledHomeLower;
      
      // TODO: Implement the case where one or both end at house
      let endAtHouseUpper = sowIntoHouseUpper && currentSeedsInHandUpper === 1;
      let endAtHouseLower = sowIntoHouseLower && currentSeedsInHandLower === 1;

      if (endAtHouseUpper || endAtHouseLower) {
        // if only upper end at house
        if (!endAtHouseLower) {
          // Animate sowing into house and update the seeds
          updateCursorPositionUpper(topHouseRef, topHouseRef.current, -0.1);
          setTopHouseSeeds(prevSeeds => prevSeeds + 1);
          seedsInHandUpper -= 1;
          // Execute the opposite move here, could be sowIntoHouseLower or normal sowing but this would be redundant (too verbose)?

          // Trigger change of game phase 
          setIsSowingUpper(false);
          setGamePhase('SIMULTANEOUS_SELECT');
          // Get the last position of cursors
          setCurrentHoleIndexUpper(startIndexUpper);
          setCurrentHoleIndexUpper(currentIndexLower);
        }
      }

      // Now perform UI updates simultaneously
      if (seedsInHandUpper > 0) {
        if (sowIntoHouseUpper) {
          updateCursorPositionUpper(topHouseRef, topHouseRef.current, -0.1);
          setTopHouseSeeds(prevSeeds => prevSeeds + 1);
          seedsInHandUpper -= 1;
          hasPassedHouseUpper++;
          justFilledHomeUpper = true;
        } else {
          updateCursorPositionUpper(holeRefs, nextIndexUpper, -0.5);
          seedsInHandUpper -= 1;
          newSeeds[nextIndexUpper]++;
          currentIndexUpper = nextIndexUpper;
          justFilledHomeUpper = false;
        }
      }
      
      if (seedsInHandLower > 0) {
        if (sowIntoHouseLower) {
          updateCursorPositionLower(lowHouseRef, lowHouseRef.current, 0.1);
          setLowHouseSeeds(prevSeeds => prevSeeds + 1);
          seedsInHandLower -= 1;
          hasPassedHouseLower++;
          justFilledHomeLower = true;
        } else {
          updateCursorPositionLower(holeRefs, nextIndexLower, 0.5);
          seedsInHandLower -= 1;
          newSeeds[nextIndexLower]++;
          currentIndexLower = nextIndexLower;
          justFilledHomeLower = false;
        }
      }
      
      setSeeds([...newSeeds]);
      // Animation delay
      await new Promise(resolve => setTimeout(resolve, 0)); 
      
    /** ============================================
     *      Continue sowing movement & capturing
     * ===========================================*/
      // // TODO: Implement capturing

      if (seedsInHandUpper === 0) {
        if (newSeeds[currentIndexUpper] > 1) {
          await updateCursorPositionUpper(holeRefs, currentIndexUpper, 0);
          seedsInHandUpper = newSeeds[currentIndexUpper];
          setCurrentSeedsInHandUpper(seedsInHandUpper);
          newSeeds[currentIndexUpper] = 0;
          setSeeds([...newSeeds]);
        } else if (newSeeds[currentIndexUpper] === 1) {
          console.log("[UPPER] Check for capturing or end movement")
          let oppositeIndex = MAX_INDEX_LOWER - currentIndexUpper;
          const isOwnRow = currentIndexUpper < MIN_INDEX_LOWER;
          if (isOwnRow && newSeeds[oppositeIndex] > 0 && hasPassedHouseUpper > 0) {
            console.log('UPPER: now capturing...')
            // // TODO : Implement capturing here
            // // TODO : Pick up from current hole
            await updateCursorPositionUpper(holeRefs, currentIndexUpper, 0);
            seedsInHandUpper = newSeeds[currentIndexUpper];
            setCurrentSeedsInHandUpper(seedsInHandUpper);
            newSeeds[currentIndexUpper] = 0;
            setSeeds([...newSeeds]);
            // // TODO : Pick up from opposite hole
            await updateCursorPositionUpper(holeRefs, oppositeIndex, 0.5);
            let capturedSeeds = newSeeds[oppositeIndex] + seedsInHandUpper;
            seedsInHandUpper = capturedSeeds;
            setCurrentSeedsInHandUpper(seedsInHandUpper);
            newSeeds[currentIndexUpper] = 0;
            setSeeds([...newSeeds]);
            await new Promise(resolve => setTimeout(resolve, 400));
            // // TODO : Send captured seeds to House
            await updateCursorPositionUpper(topHouseRef, topHouseRef.current, 0.1);
            setLowHouseSeeds(prevSeeds => prevSeeds + capturedSeeds);
          } 
          // end movement,
          setIsSowingUpper(false);
          // hide cursor
          // setCursorVisibilityLower(prev => !prev);
          // get the opponent position
          setCurrentHoleIndexLower(currentIndexLower);
          // reset cursor index
          setCurrentHoleIndexUpper(startIndexUpper);
          // Change game phase to TURN_BASED
          setGamePhase('TURN_BASED_SOWING');
          return;
        }
      } 
      
      if (seedsInHandLower === 0) {
        // continue sowing movement
        if (newSeeds[currentIndexLower] > 1) {
          await updateCursorPositionLower(holeRefs, currentIndexLower, 0);
          seedsInHandLower = newSeeds[currentIndexLower];
          setCurrentSeedsInHandLower(seedsInHandLower);
          newSeeds[currentIndexLower] = 0;
          setSeeds([...newSeeds]);
        } else if (newSeeds[currentIndexLower] === 1) { 
          // capturing
          console.log("[LOWER] Check for capturing or end movement.")
          let oppositeIndex = MAX_INDEX_LOWER - currentIndexLower;
          const isOwnRow = currentIndexLower > MAX_INDEX_UPPER;
          if (isOwnRow && newSeeds[oppositeIndex] > 0 && hasPassedHouseLower > 0) {
            console.log('LOWER: now capturing...')
            // // TODO : Implement capturing here
            // // TODO : Pick up from current hole
            await updateCursorPositionLower(holeRefs, currentIndexLower, 0);
            seedsInHandLower = newSeeds[currentIndexLower];
            setCurrentSeedsInHandLower(seedsInHandLower);
            newSeeds[currentIndexLower] = 0;
            setSeeds([...newSeeds]);
            // // TODO : Pick up from opposite hole
            await updateCursorPositionLower(holeRefs, oppositeIndex, 0.5);
            let capturedSeeds = newSeeds[oppositeIndex] + seedsInHandLower;
            seedsInHandLower = capturedSeeds;
            setCurrentSeedsInHandLower(seedsInHandLower);
            newSeeds[currentIndexLower] = 0;
            setSeeds([...newSeeds]);
            await new Promise(resolve => setTimeout(resolve, 400));
            // // TODO : Send captured seeds to House
            await updateCursorPositionLower(lowHouseRef, lowHouseRef.current, 0.1);
            setLowHouseSeeds(prevSeeds => prevSeeds + capturedSeeds);
          } 
          // end movement,
          setIsSowingLower(false);
          // hide cursor
          // setCursorVisibilityLower(prev => !prev);
          // get the opponent position
          setCurrentHoleIndexUpper(currentIndexUpper);
          // reset cursor index
          setCurrentHoleIndexLower(startIndexLower);
          // Change game phase to TURN_BASED
          setGamePhase('TURN_BASED_SOWING');
          return;
        }
      }
      
      // Update state for seeds in hand
      setCurrentSeedsInHandUpper(seedsInHandUpper);
      setCurrentSeedsInHandLower(seedsInHandLower);
      
      await new Promise(resolve => setTimeout(resolve, 400)); // Synchronization delay
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
  const turnBasedSowing = async (index, player, isContinuation = false) => {
    // Prevent picking from empty hole
    // if (seeds[index] === 0) return;
    
    // Determine player-specific states and actions
    const isUpperPlayer = player === PLAYER_UPPER;
    const currentHouseRef = isUpperPlayer ? topHouseRef : lowHouseRef;
    const setIsSowing = isUpperPlayer ? setIsSowingUpper : setIsSowingLower;
    const setHouseSeeds = isUpperPlayer ? setTopHouseSeeds : setLowHouseSeeds;
    const setCurrentSeedsInHand = isUpperPlayer ? setCurrentSeedsInHandUpper : setCurrentSeedsInHandLower;
    const setCurrentHoleIndex = isUpperPlayer ? setCurrentHoleIndexUpper : setCurrentHoleIndexLower;
    const verticalAdjustment = isUpperPlayer ? -0.5 : 0.5;
    const maxIndex = isUpperPlayer ? MAX_INDEX_UPPER : MAX_INDEX_LOWER;
    const minIndex = isUpperPlayer ? MIN_INDEX_LOWER : 0;
    
    // Start sowing
    setIsSowing(true);
    
    let currentIndex = index;
    let newSeeds = [...seeds];
    let seedsInHand = isContinuation ? (isUpperPlayer ? currentSeedsInHandUpper : currentSeedsInHandLower) : newSeeds[index];
    let hasPassedHouse = 0;
    let justFilledHome = false;
    let getAnotherTurn = false;
    
    if (!isContinuation) {
      // Prevent picking from empty hole
      if (seedsInHand === 0) {
        return;
      }
      setCurrentSeedsInHand(seedsInHand);
      newSeeds[index] = 0;
      setSeeds([...newSeeds]);
    }
    
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
      if (currentIndex === maxIndex) {
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
            setCurrentHoleIndex(startIndexUpper);
          } else {
            await updateCursorPositionLower(holeRefs, startIndexLower, verticalPosLower);
            setCurrentHoleIndex(startIndexLower);
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
        
        await new Promise(resolve => setTimeout(resolve, 400)); // Animation delay
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
    if (!getAnotherTurn) toggleTurn(setCurrentTurn, currentTurn);
    setIsSowing(false);
    setGamePhase('TURN_BASED_SELECT');
  };

  return (
    <div className='game-area'>
        <div className="current-turn">Current Turn: {currentTurn}</div>
      <div ref={gameContainerRef} className={`game-container ${isGameOver ? 'game-over' : ''}`}>
        <div className='game-content'>
          <House position="lower" seedCount={lowHouseSeeds} ref={lowHouseRef}/>
          <div className="rows-container">
          {/* Update the Row for upper player */}
          <Row seeds={seeds.slice(MIN_INDEX_UPPER, MIN_INDEX_LOWER)} rowType="upper" isUpper={true} onClick={turnBasedSowing} refs={holeRefs.current} selectedHole={startingPositionUpper}/>
          <Row seeds={seeds.slice(MIN_INDEX_LOWER).reverse()} rowType="lower" onClick={turnBasedSowing} refs={holeRefs.current} selectedHole={startingPositionLower} />

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
      {!isStartButtonPressed && gamePhase === 'STARTING_PHASE' && (
          <button className="button start" 
          // onClick={() => simultaneousSowing(startingPositionUpper, startingPositionLower)}>START</button>
          onClick={() => startButtonPressed()}>START</button>
      )}
      {isStartButtonPressed && (
          <button className='button reset'>RESET</button>
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