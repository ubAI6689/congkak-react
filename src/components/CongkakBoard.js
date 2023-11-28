import React, { useState, useEffect, useRef } from 'react';
import './CongkakBoard.css';
import House from './House';
import Cursor from './Cursor';
import Row from './Row';
import { handleWrongSelection } from '../utils/animation';
import { toggleTurn, sumOfSeedsInCurrentRow, handleCheckGameEnd } from '../utils/helpers';
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
  // const [isStartingPhase, setIsStartingPhase] = useState(true);
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
  const [cursorTopLower, setCursorTopLower] = useState(window.innerHeight * 2 / 4);

  const [resetCursor, setResetCursor] = useState(false);
  
  const [currentTurn, setCurrentTurn] = useState(null);
  const [isSowingUpper, setIsSowingUpper] = useState(false);
  const [isSowingLower, setIsSowingLower] = useState(false);
  
  // const [currentSeedsInHand, setCurrentSeedsInHand] = useState(0);
  const [passedHouse, setPassedHouse] = useState(0);
  const [currentSeedsInHandUpper, setCurrentSeedsInHandUpper] = useState(0);
  const [currentSeedsInHandLower, setCurrentSeedsInHandLower] = useState(0);
  const [topHouseSeeds, setTopHouseSeeds] = useState(0);
  const [lowHouseSeeds, setLowHouseSeeds] = useState(0);
  
  const [isGameOver, setIsGameOver] = useState(false);
  const [outcomeMessage, setOutcomeMessage] = useState('');

  const gameContainerRef = useRef(null);
  
  const verticalPosUpper = config.VERTICAL_POS_UPPER;
  const verticalPosLower = config.VERTICAL_POS_LOWER;

  const [shakeCursor, setShakeCursor] = useState(false);

  // Define the handlers for the mobile buttons
  const handleSButtonPress = async (index) => {
    if (!isSowingUpper) {
        // The logic that mimics the 'S' key press
      if (gamePhase === 'TURN_BASED_SELECT' && currentTurn === PLAYER_UPPER) {
        await updateCursorPositionUpper(holeRefs, index, verticalPosUpper);
        setGamePhase('TURN_BASED_SOWING');
        turnBasedSowing(index, PLAYER_UPPER);
      } else if (gamePhase === 'STARTING_PHASE' || gamePhase === 'SIMULTANEOUS_SELECT' || gamePhase === 'SIMULTANEOUS_SELECT_UPPER') {
        await updateCursorPositionUpper(holeRefs, index, verticalPosUpper);
        setStartingPositionUpper(index);
      }
    }
  };

  const handleArrowDownPress = async (index) => {
    if (!isSowingLower) {
      // The logic that mimics the 'ArrowDown' key press
      if (gamePhase === 'TURN_BASED_SELECT' && currentTurn === PLAYER_LOWER) {
        await updateCursorPositionLower(holeRefs, index, verticalPosLower);
        setGamePhase('TURN_BASED_SOWING');
        turnBasedSowing(index, PLAYER_LOWER);
      } else if (gamePhase === 'STARTING_PHASE' || gamePhase === 'SIMULTANEOUS_SELECT' || gamePhase === 'SIMULTANEOUS_SELECT_LOWER') {
        await updateCursorPositionLower(holeRefs, index, verticalPosLower);
        setStartingPositionLower(index);
      }
    }
  };

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

  // RESET function
  const resetGame = () => {
    setSeeds(new Array(HOLE_NUMBERS).fill(INIT_SEEDS_COUNT));
    setGamePhase('STARTING_PHASE');
    setIsStartButtonPressed(false);
    setStartingPositionUpper(null);
    setStartingPositionLower(null);
    setCurrentHoleIndexUpper(startIndexUpper);
    setCurrentHoleIndexLower(startIndexLower);
    setIsSowingUpper(false);
    setIsSowingLower(false);
    setCurrentSeedsInHandUpper(0);
    setCurrentSeedsInHandLower(0);
    setTopHouseSeeds(0);
    setLowHouseSeeds(0);
    setIsGameOver(false);
    setOutcomeMessage('');
    setCurrentTurn(null);
    // Reset any other state variables relevant to your game
  };

  /**=========================================================
  *                 start button function 
  * ==========================================================*/
  const startButtonPressed = () => {
    // handle the logic for both START and RESUME button
    if (gamePhase === 'STARTING_PHASE' || gamePhase === 'SIMULTANEOUS_SELECT') {
      if (startingPositionUpper === null || seeds[startingPositionUpper] === 0) {
        console.log("Please select starting position for Player Upper")
        handleWrongSelection(setShakeCursor);
      } else if (startingPositionLower === null || seeds[startingPositionLower] === 0) {
        handleWrongSelection(setShakeCursor);
        console.log("Please select starting position for Player Lower")
      } else {
        console.log("START GAME!")
        setIsStartButtonPressed(true);
        simultaneousSowing(startingPositionUpper, startingPositionLower);
      }
    // resume button logic
    } else if (gamePhase === 'SIMULTANEOUS_SELECT_UPPER') {
      if (startingPositionUpper === null || seeds[startingPositionUpper] === 0) {
        console.log("Please select starting position for Player Upper")
      } else {
        setIsStartButtonPressed(true);
        simultaneousSowing(startingPositionUpper, null);
      }
    } else if (gamePhase === 'SIMULTANEOUS_SELECT_LOWER') {
      if (startingPositionLower === null || seeds[startingPositionLower] === 0) {
        console.log("Please select starting position for Player Lower")
      } else {
        setIsStartButtonPressed(true);
        simultaneousSowing(null, startingPositionLower);
      }
    }
  }

  
  /**=========================================================
  *   Transition from SIMULTANEOUS phase to TURN_BASED phase 
  * ==========================================================*/
  useEffect(() => {
    if (gamePhase === 'PASS_TO_TURN_BASED') {
      const nextTurn = isSowingUpper ? PLAYER_UPPER : PLAYER_LOWER;
      setCurrentTurn(nextTurn);
    }
  }, [gamePhase, isSowingUpper, isSowingLower]);

  // Effect to call turnBasedSowing when currentTurn updates
  useEffect(() => {
    if (gamePhase === 'PASS_TO_TURN_BASED' && currentTurn !== null) {
      const currentPosition = currentTurn === PLAYER_UPPER ? currentHoleIndexUpper : currentHoleIndexLower;
      console.log(`Current Turn: ${currentTurn} | Current position: ${currentPosition} | Seeds: ${seeds[currentPosition]}` );
      setGamePhase('TURN_BASED_SOWING');
      turnBasedSowing(currentPosition, currentTurn, true, passedHouse);
    }
  }, [currentTurn, gamePhase, currentHoleIndexUpper, currentHoleIndexLower]);

  
  /**=========================================================
  *                      Reset cursors 
  * ==========================================================*/
  useEffect(() => {
    resetCursorPosition();
    const handleResize = () => resetCursorPosition();
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
    
    function resetCursorPosition() {
      const resetUpper = () => {
        updateCursorPositionUpper(holeRefs, startIndexUpper, verticalPosUpper);
        setCurrentHoleIndexUpper(startIndexUpper);
      }

      const resetLower = () => {
        updateCursorPositionLower(holeRefs, startIndexLower, verticalPosLower);
        setCurrentHoleIndexLower(startIndexLower);
      }

      if (!isSowingUpper) {
        resetUpper();
      } 
      
      if (!isSowingLower) { 
        resetLower();
      } 
    }
  }, [holeRefs, resetCursor, isSowingUpper, isSowingLower]);

  /**=========================================================
  *                    Cursor visibility
  * ==========================================================*/
  useEffect(() => {
    // for upper player
    if (gamePhase === 'STARTING_PHASE' || gamePhase === 'SIMULTANEOUS_SELECT' || gamePhase === 'SIMULTANEOUS_SELECT_UPPER' || gamePhase === 'SIMULTANEOUS_SELECT_LOWER') {
      setCursorVisibilityUpper({ visible: true });
    } else {
      if (currentTurn === PLAYER_UPPER) setCursorVisibilityUpper({ visible:true });
      else setCursorVisibilityUpper({ visible: false });
    }

    // for lower player
    if (gamePhase === 'STARTING_PHASE' || gamePhase === 'SIMULTANEOUS_SELECT' || gamePhase === 'SIMULTANEOUS_SELECT_UPPER' || gamePhase === 'SIMULTANEOUS_SELECT_LOWER') {
      setCursorVisibilityLower({ visible: true });
    } else {
      if (currentTurn === PLAYER_LOWER) setCursorVisibilityLower({ visible:true });
      else setCursorVisibilityLower({ visible: false });
    }
  },[gamePhase, currentTurn]);


  /**=========================================================
  *                    Keydown listener 
  * ==========================================================*/
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
            setGamePhase('TURN_BASED_SOWING');
            turnBasedSowing(newIndexUpper, PLAYER_UPPER);
          } else if (gamePhase === 'STARTING_PHASE' || gamePhase === 'SIMULTANEOUS_SELECT' || gamePhase === 'SIMULTANEOUS_SELECT_UPPER') {
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
            setGamePhase('TURN_BASED_SOWING');
            turnBasedSowing(newIndexLower, PLAYER_LOWER);
          } else if (gamePhase === 'STARTING_PHASE' || gamePhase === 'SIMULTANEOUS_SELECT' || gamePhase === 'SIMULTANEOUS_SELECT_LOWER') {
            setStartingPositionLower(newIndexLower);
          }
        }
      }

      if ((!isSowingUpper || !isSowingLower) || (!startButtonPressed && gamePhase === 'STARTING_PHASE')) {
        if (event.code === 'Space' || event.key === 32) {
          console.log("SPACE pressed")
          startButtonPressed();
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
// useEffect(() => {
//   const lockOrientation = async () => {
//       // eslint-disable-next-line no-restricted-globals
//       if (typeof screen !== 'undefined' && screen.orientation && typeof screen.orientation.lock === 'function') {
//         try {
//           // eslint-disable-next-line no-restricted-globals
//           await screen.orientation.lock('landscape');
//         } catch (error) {
//           console.error('Could not lock screen orientation:', error);
//         }
//       }
//     };

//     lockOrientation();

//     return () => {
//       // eslint-disable-next-line no-restricted-globals
//       if (typeof screen !== 'undefined' && screen.orientation && typeof screen.orientation.unlock === 'function') {
//         // eslint-disable-next-line no-restricted-globals
//         screen.orientation.unlock();
//       }
//     };
//   }, []);


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

/**==============================================
 *        SIMULTANEOUS SOWING LOGIC
 * =============================================*/
  const simultaneousSowing = async (startingPositionUpper, startingPositionLower) => {
    console.log("Start simultaneous sowing!")
    
    if (gamePhase !== 'STARTING_PHASE' && gamePhase !== 'SIMULTANEOUS_SELECT' && gamePhase !== 'SIMULTANEOUS_SELECT_UPPER' && gamePhase !== 'SIMULTANEOUS_SELECT_LOWER') return;
    setIsSowingUpper(true);
    setIsSowingLower(true);
    
    let currentIndexUpper = startingPositionUpper !== null ? startingPositionUpper : currentHoleIndexUpper;
    let currentIndexLower = startingPositionLower !== null ? startingPositionLower : currentHoleIndexLower;
    setStartingPositionUpper(null);
    setStartingPositionLower(null);
    let newSeeds = [...seeds];
    let seedsInHandUpper = startingPositionUpper !== null ? newSeeds[startingPositionUpper] : currentSeedsInHandUpper;
    let seedsInHandLower = startingPositionLower !== null ? newSeeds[startingPositionLower] : currentSeedsInHandLower;
    setCurrentSeedsInHandUpper(seedsInHandUpper);
    setCurrentSeedsInHandLower(seedsInHandLower);

    console.log("Starting index upper: ", currentIndexUpper)
    console.log("Starting index lower: ", currentIndexLower)
  
    let hasPassedHouseUpper = 0;
    let hasPassedHouseLower = 0;
    let justFilledHomeUpper = false;
    let justFilledHomeLower = false;
    
    newSeeds[currentIndexUpper] = 0;
    setSeeds([...newSeeds]);
    newSeeds[currentIndexLower] = 0;
    setSeeds([...newSeeds]);
    
    updateCursorPositionUpper(holeRefs, currentIndexUpper, 0);
    updateCursorPositionLower(holeRefs, currentIndexLower, 0);
    
    await new Promise(resolve => setTimeout(resolve, 400)); // Animation delay
    
    // Helper function to get the next index
    function getNextIndex(currentIndex, justFilledHome, maxIndex, minIndex) {
      if (justFilledHome) {
        return minIndex;
      }
      return currentIndex === maxIndex ? minIndex : (currentIndex + 1) % HOLE_NUMBERS;
    }

    // Separate function to handle upper player's sowing
    const handleUpperPlayerSowing = async () => {
      if (seedsInHandUpper > 0) {
        let nextIndexUpper = getNextIndex(currentIndexUpper, justFilledHomeUpper, MAX_INDEX_UPPER, MIN_INDEX_LOWER);
        let sowIntoHouseUpper = nextIndexUpper === MIN_INDEX_LOWER && !justFilledHomeUpper;
        if (sowIntoHouseUpper) {
          hasPassedHouseUpper++;
          await updateCursorPositionUpper(topHouseRef, topHouseRef.current, -0.1);
          setTopHouseSeeds(prevSeeds => prevSeeds + 1);
          seedsInHandUpper -= 1;
          justFilledHomeUpper = true;
        } else {
          await updateCursorPositionUpper(holeRefs, nextIndexUpper, -0.5);
          newSeeds[nextIndexUpper]++;
          seedsInHandUpper -= 1;
          currentIndexUpper = nextIndexUpper;
          justFilledHomeUpper = false;
        }
        // setSeeds([...newSeeds]);
        setCurrentSeedsInHandUpper(seedsInHandUpper);
      }
    };

    // Separate function to handle lower player's sowing
    const handleLowerPlayerSowing = async () => {
      if (seedsInHandLower > 0) {
        let nextIndexLower = getNextIndex(currentIndexLower, justFilledHomeLower, MAX_INDEX_LOWER, MIN_INDEX_UPPER);
        let sowIntoHouseLower = nextIndexLower === MIN_INDEX_UPPER && !justFilledHomeLower;
        if (sowIntoHouseLower) {
          hasPassedHouseLower++;
          await updateCursorPositionLower(lowHouseRef, lowHouseRef.current, 0.1);
          setLowHouseSeeds(prevSeeds => prevSeeds + 1);
          seedsInHandLower -= 1;
          justFilledHomeLower = true;
        } else {
          await updateCursorPositionLower(holeRefs, nextIndexLower, 0.5);
          newSeeds[nextIndexLower]++;
          seedsInHandLower -= 1;
          currentIndexLower = nextIndexLower;
          justFilledHomeLower = false;
        }
        // setSeeds([...newSeeds]);
        setCurrentSeedsInHandLower(seedsInHandLower);
      }
    };
    
    while (seedsInHandUpper >= 0 || seedsInHandLower >= 0) {
      let endAtHouseUpper = (seedsInHandUpper === 0) && justFilledHomeUpper;
      let endAtHouseLower = (seedsInHandLower === 0) && justFilledHomeLower;

      let endMoveUpper = (seedsInHandUpper === 0) && seeds[currentIndexUpper] === 1;
      let endMoveLower = (seedsInHandLower === 0) && seeds[currentIndexLower] === 1;

      if ((endAtHouseUpper && endAtHouseLower) || (endMoveUpper && endMoveLower)) {
        // Execute the moves for both players up to the house
        console.log("Both end simultaneously.");
        setIsSowingUpper(false);
        setIsSowingLower(false);
        setIsStartButtonPressed(false);
        setResetCursor(prev => !prev);
        setGamePhase("SIMULTANEOUS_SELECT");
        break;
      }

      handleUpperPlayerSowing();
      handleLowerPlayerSowing();
      setSeeds([...newSeeds]);
      await new Promise(resolve => setTimeout(resolve, 0)); // Synchronization delay 
      
    /** ============================================
     *      Continue sowing movement & capturing
     * ===========================================*/
      // // TODO: Implement capturing

      if (seedsInHandUpper === 0) {
        if (justFilledHomeUpper) {
          console.log("End at House Upper");
          // get the opponent's state
          setCurrentSeedsInHandLower(seedsInHandLower);
          setCurrentHoleIndexLower(currentIndexLower);
          // reset the lower cursor
          setIsSowingUpper(false);
          setIsStartButtonPressed(false);
          setGamePhase("SIMULTANEOUS_SELECT_UPPER");
          break;
        } else if (newSeeds[currentIndexUpper] > 1) {
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
            console.log('[UPPER] now capturing...')
            // // TODO : Implement capturing here
            // // TODO : Pick up from current hole
            await updateCursorPositionUpper(holeRefs, currentIndexUpper, 0);
            seedsInHandUpper = newSeeds[currentIndexUpper];
            setCurrentSeedsInHandUpper(seedsInHandUpper);
            newSeeds[currentIndexUpper] = 0;
            setSeeds([...newSeeds]);
            // // TODO : Pick up from opposite hole
            await updateCursorPositionUpper(holeRefs, oppositeIndex, -0.5);
            let capturedSeeds = newSeeds[oppositeIndex] + seedsInHandUpper;
            seedsInHandUpper = capturedSeeds;
            setCurrentSeedsInHandUpper(seedsInHandUpper);
            newSeeds[oppositeIndex] = 0;
            setSeeds([...newSeeds]);
            await new Promise(resolve => setTimeout(resolve, 400));
            // // TODO : Send captured seeds to House
            await updateCursorPositionUpper(topHouseRef, topHouseRef.current, -0.1);
            setTopHouseSeeds(prevSeeds => prevSeeds + capturedSeeds);
            seedsInHandUpper = 0;
            setCurrentSeedsInHandUpper(seedsInHandUpper);
          } 
          // end movement,
          setIsSowingUpper(false);
          // get the opponent position
          setCurrentHoleIndexLower(currentIndexLower);
          console.log("Current lower position: ", currentIndexLower);
          console.log("Current seeds in lower position: ", newSeeds[currentIndexLower]);
          // get opponent's passed house status
          setPassedHouse(hasPassedHouseLower);
          // Change game phase to TURN_BASED
          setGamePhase('PASS_TO_TURN_BASED');
          return;
        }
      } 
      
      if (seedsInHandLower === 0) {
        if (justFilledHomeLower) {
          console.log("End at House lower");
          // get the opponent's state
          setCurrentSeedsInHandUpper(seedsInHandUpper);
          setCurrentHoleIndexUpper(currentIndexUpper);
          // Reset the lower cursor
          setIsSowingLower(false);
          setIsStartButtonPressed(false);
          setGamePhase("SIMULTANEOUS_SELECT_LOWER");
          break;
        } else if (newSeeds[currentIndexLower] > 1) {
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
            newSeeds[oppositeIndex] = 0;
            setSeeds([...newSeeds]);
            await new Promise(resolve => setTimeout(resolve, 400));
            // // TODO : Send captured seeds to House
            await updateCursorPositionLower(lowHouseRef, lowHouseRef.current, 0.1);
            setLowHouseSeeds(prevSeeds => prevSeeds + capturedSeeds);
            seedsInHandLower = 0;
            setCurrentSeedsInHandLower(seedsInHandLower);
          }
          // end movement,
          setIsSowingLower(false);
          // get the opponent position
          setCurrentHoleIndexUpper(currentIndexUpper);
          // get opponent's passed house status
          setPassedHouse(hasPassedHouseUpper);
          // Change game phase to TURN_BASED
          setGamePhase('PASS_TO_TURN_BASED');
          return;
        }
      }
      
      // Update state for seeds in hand
      setCurrentSeedsInHandUpper(seedsInHandUpper);
      setCurrentSeedsInHandLower(seedsInHandLower);
      await new Promise(resolve => setTimeout(resolve, 400)); // Synchronization delay
    }    
  }

/**==============================================
 *        TURN BASED SOWING LOGIC
 * =============================================*/
  const turnBasedSowing = async (index, player, isContinuation = false, passedHouse = 0) => {
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
    let seedsInHand = isContinuation ? (isUpperPlayer ? currentSeedsInHandUpper : newSeeds[index]) : newSeeds[index];
    // let seedsInHand = newSeeds[index];
    let hasPassedHouse = passedHouse;
    let justFilledHome = false;
    let getAnotherTurn = false;
    
    if (!isContinuation) {
      // Prevent picking from empty hole
      if (seedsInHand === 0) {
        console.log("Cannot pick empty hole. Pick again.");
        setGamePhase('TURN_BASED_SELECT');
        getAnotherTurn = true;
        setIsSowing(false);
        return;
      }
    }
    setCurrentSeedsInHand(seedsInHand);
    newSeeds[index] = 0;
    setSeeds([...newSeeds]);
    
    // Pick up animation
    if (isUpperPlayer) {
      await updateCursorPositionUpper(holeRefs, currentIndex, 0);
    } else {
      await updateCursorPositionLower(holeRefs, currentIndex, 0);
    }
    console.log("Starting turn based sowing")
    console.log("Seeds in hands: ", seedsInHand);
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
          setIsSowing(false);

          // reset cursor position
          if (isUpperPlayer) {
            await updateCursorPositionUpper(holeRefs, startIndexUpper, verticalPosUpper);
            setCurrentHoleIndex(startIndexUpper);
          } else {
            await updateCursorPositionLower(holeRefs, startIndexLower, verticalPosLower);
            setCurrentHoleIndex(startIndexLower);
          }
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
    if (!getAnotherTurn) {
      toggleTurn(setCurrentTurn, currentTurn);
    }
    setIsSowing(false);
    setGamePhase('TURN_BASED_SELECT');
  };

  return (
    <div className='app-wrapper'>
      <div className='game-info'>
        <div className="current-turn">
          Current Turn: <strong>{
            (gamePhase === 'STARTING_PHASE' || 
            gamePhase === 'SIMULTANEOUS_SELECT' || 
            gamePhase === 'SIMULTANEOUS_SELECT_LOWER' || 
            gamePhase === 'SIMULTANEOUS_SELECT_UPPER')
              ? "SIMULTANEOUS"
              : currentTurn 
          }</strong>
           | PHASE: {gamePhase}
        </div>
      </div>
      <div className='game-area'>
        <div ref={gameContainerRef} className={`game-container ${isGameOver ? 'game-over' : ''}`}>
          <div className='game-content'>
            <House position="lower" seedCount={lowHouseSeeds} ref={lowHouseRef}/>
            <div className="rows-container">
              {/* Update the Row for upper player */}
              <Row 
                seeds={seeds.slice(MIN_INDEX_UPPER, MIN_INDEX_LOWER)} 
                rowType="upper" 
                isUpper={true} 
                onClick={(index) => {handleSButtonPress(index)}} 
                refs={holeRefs.current} 
                selectedHole={startingPositionUpper}
              />
              <Row 
                seeds={seeds.slice(MIN_INDEX_LOWER).reverse()} rowType="lower" 
                onClick={(index) => {handleArrowDownPress(index)}} 
                refs={holeRefs.current} 
                selectedHole={startingPositionLower} 
              />
            </div>
            <House position="upper" seedCount={topHouseSeeds} ref={topHouseRef} isUpper={true}/>
            <Cursor 
              shake={shakeCursor}
              triggerShake={handleWrongSelection}
              top={cursorTopUpper} 
              left={cursorLeftUpper} 
              visible={cursorVisibilityUpper.visible} 
              seedCount={currentSeedsInHandUpper} // Adjust based on Player 1's state
              isTopTurn={true} // Always true for Player 1
            />
            <Cursor 
              shake={shakeCursor}
              triggerShake={handleWrongSelection}
              top={cursorTopLower} 
              left={cursorLeftLower} 
              visible={cursorVisibilityLower.visible} 
              seedCount={currentSeedsInHandLower} // Adjust based on Player 2's state
              isTopTurn={false} // Always false for Player 2
            />
          </div>
        </div>
        <div className='button-group'>
        {!isStartButtonPressed && gamePhase === 'STARTING_PHASE' && (
            <button className="button start" 
            onClick={() => startButtonPressed()}>START</button>
        )}
        {/* {isStartButtonPressed && (
            <button className='button reset' onClick={resetGame}>RESET</button>
        )} */}
        {!isStartButtonPressed && (gamePhase === 'SIMULTANEOUS_SELECT' || gamePhase === 'SIMULTANEOUS_SELECT_LOWER' || gamePhase === 'SIMULTANEOUS_SELECT_UPPER') && (
          <button className='button resume' onClick={() => startButtonPressed()}>RESUME</button>
        )}
        {isGameOver && (
          <div className="game-over-message">
            {outcomeMessage}
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

export default CongkakBoard;