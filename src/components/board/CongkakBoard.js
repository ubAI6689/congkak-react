import React, { useState, useEffect, useRef } from 'react';
import { Analytics } from '@vercel/analytics/react';
import './CongkakBoard.css';
import House from './House';
import Cursor from './Cursor';
import Row from './Row';
import Sidebar from './sidebar';
import { useGameState } from '../../hooks/useGameState';
import { useCursorControl } from '../../hooks/useCursorControl';
import { handleWrongSelection, toggleSidebar } from '../../utils/animation';
import { sumOfSeedsInCurrentRow, handleCheckGameEnd } from '../../utils/helpers';
import gamePhaseConfig from '../../config/gamePhaseConfig';
import config from '../../config/config';
import { turnBasedSowing } from '../logics/GameLogic';

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

const {
  STARTING_PHASE,
  SIMULTANEOUS_SELECT,
  SIMULTANEOUS_SELECT_UPPER,
  SIMULTANEOUS_SELECT_LOWER,
  PASS_TO_TURN_BASED,
  TURN_BASED_SOWING,
  TURN_BASED_SELECT
} = gamePhaseConfig

// const startIndexUpper = Math.round((MIN_INDEX_UPPER + MAX_INDEX_UPPER) / 2);
// const startIndexLower = Math.round((MIN_INDEX_LOWER + MAX_INDEX_LOWER) / 2);

const startIndexUpper = MIN_INDEX_UPPER;
const startIndexLower = MIN_INDEX_LOWER;

const verticalPosUpper = config.VERTICAL_POS_UPPER;
const verticalPosLower = config.VERTICAL_POS_LOWER;

const CongkakBoard = () => {

  const {
    seeds, setSeeds,
    gamePhase, setGamePhase,
    startingPositionUpper, setStartingPositionUpper,
    startingPositionLower, setStartingPositionLower,
    currentTurn, setCurrentTurn,
    isSowingUpper, setIsSowingUpper,
    isSowingLower, setIsSowingLower,
    passedHouse, setPassedHouse,
    currentSeedsInHandUpper, setCurrentSeedsInHandUpper,
    currentSeedsInHandLower, setCurrentSeedsInHandLower,
    topHouseSeeds, setTopHouseSeeds,
    lowHouseSeeds, setLowHouseSeeds,
    isGameOver, setIsGameOver,
    outcomeMessage, setOutcomeMessage,
    currentHoleIndexUpper, setCurrentHoleIndexUpper,
    currentHoleIndexLower, setCurrentHoleIndexLower,
    isStartButtonPressed, setIsStartButtonPressed,
    resetGame, toggleTurn, startButtonPressed, handleSButtonPress, handleArrowDownPress,
  } = useGameState();

  const {
    cursorVisibilityUpper, setCursorVisibilityUpper,
    cursorVisibilityLower, setCursorVisibilityLower,
    cursorLeftUpper, setCursorLeftUpper,
    cursorLeftLower, setCursorLeftLower,
    cursorTopUpper, setCursorTopUpper,
    cursorTopLower, setCursorTopLower,
    resetCursor, setResetCursor,
    shakeCursor, setShakeCursor,
    updateCursorPositionUpper, updateCursorPositionLower
  } = useCursorControl();
  
  // Accessories UI 
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  
  // DOM references
  const gameContainerRef = useRef(null);
  const holeRefs = useRef([]);
  const topHouseRef = useRef(null);
  const lowHouseRef = useRef(null);

  /**=========================================================
  *   Transition from SIMULTANEOUS phase to TURN_BASED phase 
  * ==========================================================*/
  useEffect(() => {
    if (gamePhase === PASS_TO_TURN_BASED) {
      const nextTurn = isSowingUpper ? PLAYER_UPPER : PLAYER_LOWER;
      setCurrentTurn(nextTurn);
    }
  }, [gamePhase, isSowingUpper, isSowingLower]);

  // Effect to call turnBasedSowing when currentTurn updates
  useEffect(() => {
    if (gamePhase === PASS_TO_TURN_BASED && currentTurn !== null) {
      const currentPosition = currentTurn === PLAYER_UPPER ? currentHoleIndexUpper : currentHoleIndexLower;
      console.log(`Current Turn: ${currentTurn} | Current position: ${currentPosition} | Seeds: ${seeds[currentPosition]}` );
      setGamePhase(TURN_BASED_SOWING);
      turnBasedSowing(currentPosition, currentTurn, true, passedHouse, {seeds, setSeeds,
        setGamePhase, currentTurn, setCurrentTurn,
        setIsSowingUpper, setIsSowingLower,
        currentSeedsInHandUpper, setCurrentSeedsInHandUpper,
        setCurrentSeedsInHandLower,
        setTopHouseSeeds, setLowHouseSeeds,
        setCurrentHoleIndexUpper, setCurrentHoleIndexLower,
        toggleTurn, setShakeCursor, handleWrongSelection, 
        updateCursorPositionUpper, updateCursorPositionLower,
        HOLE_NUMBERS, PLAYER_UPPER, MAX_INDEX_UPPER, MIN_INDEX_LOWER, MAX_INDEX_LOWER, TURN_BASED_SELECT,
        holeRefs, topHouseRef, lowHouseRef,
        startIndexUpper, startIndexLower,
        verticalPosUpper, verticalPosLower});
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
    if (gamePhase === STARTING_PHASE || gamePhase === SIMULTANEOUS_SELECT || gamePhase === SIMULTANEOUS_SELECT_UPPER || gamePhase === SIMULTANEOUS_SELECT_LOWER) {
      setCursorVisibilityUpper({ visible: true });
    } else {
      if (currentTurn === PLAYER_UPPER) setCursorVisibilityUpper({ visible:true });
      else setCursorVisibilityUpper({ visible: false });
    }

    // for lower player
    if (gamePhase === STARTING_PHASE || gamePhase === SIMULTANEOUS_SELECT || gamePhase === SIMULTANEOUS_SELECT_UPPER || gamePhase === SIMULTANEOUS_SELECT_LOWER) {
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
          if (gamePhase === TURN_BASED_SELECT && currentTurn === PLAYER_UPPER) {
            // Start sowing for PlayerUpper
            setGamePhase(TURN_BASED_SOWING);
            turnBasedSowing(newIndexUpper, PLAYER_UPPER, false, 0, {seeds, setSeeds,
              setGamePhase, currentTurn, setCurrentTurn,
              setIsSowingUpper, setIsSowingLower,
              currentSeedsInHandUpper, setCurrentSeedsInHandUpper,
              setCurrentSeedsInHandLower,
              setTopHouseSeeds, setLowHouseSeeds,
              setCurrentHoleIndexUpper, setCurrentHoleIndexLower,
              toggleTurn, setShakeCursor, handleWrongSelection, 
              updateCursorPositionUpper, updateCursorPositionLower,
              HOLE_NUMBERS, PLAYER_UPPER, MAX_INDEX_UPPER, 
              MIN_INDEX_LOWER, MAX_INDEX_LOWER, TURN_BASED_SELECT,
              holeRefs, topHouseRef, lowHouseRef,
              startIndexUpper, startIndexLower,
              verticalPosUpper, verticalPosLower});
          } else if (gamePhase === STARTING_PHASE || gamePhase === SIMULTANEOUS_SELECT || gamePhase === SIMULTANEOUS_SELECT_UPPER) {
            setStartingPositionUpper(newIndexUpper);
            console.log("StartingPosU? ", startingPositionUpper);
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
          if (gamePhase === TURN_BASED_SELECT && currentTurn === PLAYER_LOWER) {
            // Start sowing for PlayerLower
            setGamePhase(TURN_BASED_SOWING);
            turnBasedSowing(newIndexLower, PLAYER_LOWER, false, 0, {seeds, setSeeds,
              setGamePhase, currentTurn, setCurrentTurn,
              setIsSowingUpper, setIsSowingLower,
              currentSeedsInHandUpper, setCurrentSeedsInHandUpper,
              setCurrentSeedsInHandLower,
              setTopHouseSeeds, setLowHouseSeeds,
              setCurrentHoleIndexUpper, setCurrentHoleIndexLower,
              toggleTurn, setShakeCursor, handleWrongSelection, 
              updateCursorPositionUpper, updateCursorPositionLower,
              HOLE_NUMBERS, PLAYER_UPPER, MAX_INDEX_UPPER, 
              MIN_INDEX_LOWER, MAX_INDEX_LOWER, TURN_BASED_SELECT,
              holeRefs, topHouseRef, lowHouseRef,
              startIndexUpper, startIndexLower,
              verticalPosUpper, verticalPosLower});
          } else if (gamePhase === STARTING_PHASE || gamePhase === SIMULTANEOUS_SELECT || gamePhase === SIMULTANEOUS_SELECT_LOWER) {
            setStartingPositionLower(newIndexLower);
          }
        }
      }

      if ((!isSowingUpper || !isSowingLower) || (!startButtonPressed && gamePhase === STARTING_PHASE)) {
        if (event.code === 'Space' || event.key === 32) {
          console.log("SPACE pressed")
          startButtonPressed(handleWrongSelection, setShakeCursor, simultaneousSowing);
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };    
  }, [currentHoleIndexUpper, currentHoleIndexLower, holeRefs, verticalPosUpper, verticalPosLower, isSowingUpper, isSowingLower, gamePhase]);

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
    
    if (gamePhase !== STARTING_PHASE && gamePhase !== SIMULTANEOUS_SELECT && gamePhase !== SIMULTANEOUS_SELECT_UPPER && gamePhase !== SIMULTANEOUS_SELECT_LOWER) return;
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
          setGamePhase(PASS_TO_TURN_BASED);
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
          setGamePhase(PASS_TO_TURN_BASED);
          return;
        }
      }
      
      // Update state for seeds in hand
      setCurrentSeedsInHandUpper(seedsInHandUpper);
      setCurrentSeedsInHandLower(seedsInHandLower);
      await new Promise(resolve => setTimeout(resolve, 400)); // Synchronization delay
    }    
  }

  return (
    <div className='app-wrapper'>
      <div className='game-info'>
        <div className="current-turn">
          <strong>{
           gamePhase === SIMULTANEOUS_SELECT_LOWER ? "SIMULTANEOUS: LOWER'S TURN" : 
           gamePhase === SIMULTANEOUS_SELECT_UPPER ? "SIMULTANEOUS: UPPER'S TURN" : 
           (gamePhase === STARTING_PHASE || gamePhase === SIMULTANEOUS_SELECT) ? "SIMULTANEOUS: BOTH TURN" : `TURN-BASED: ${currentTurn}'S TURN` 
          }</strong>
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
                onClick={(index) => {handleSButtonPress(
                  index, updateCursorPositionUpper, 
                  updateCursorPositionLower, holeRefs, 
                  topHouseRef, lowHouseRef, verticalPosUpper, 
                  verticalPosLower, turnBasedSowing, 
                  setShakeCursor, handleWrongSelection
                  )}} 
                refs={holeRefs.current} 
                selectedHole={startingPositionUpper}
              />
              <Row 
                seeds={seeds.slice(MIN_INDEX_LOWER).reverse()} rowType="lower" 
                onClick={(index) => {handleArrowDownPress(
                  index, updateCursorPositionUpper, 
                  updateCursorPositionLower, holeRefs, 
                  topHouseRef, lowHouseRef, verticalPosUpper, 
                  verticalPosLower, turnBasedSowing, 
                  setShakeCursor, handleWrongSelection
                  )}} 
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
        {!isStartButtonPressed && gamePhase === STARTING_PHASE && (
            <button className="button start" 
            onClick={() => startButtonPressed(handleWrongSelection, setShakeCursor, simultaneousSowing)}>START</button>
        )}
        {/* {isStartButtonPressed && (
            <button className='button reset' onClick={resetGame}>RESET</button>
        )} */}
        {!isStartButtonPressed && (gamePhase === SIMULTANEOUS_SELECT || gamePhase === SIMULTANEOUS_SELECT_LOWER || gamePhase === SIMULTANEOUS_SELECT_UPPER) && (
          <button className='button resume' onClick={() => startButtonPressed(handleWrongSelection, setShakeCursor, simultaneousSowing)}>RESUME</button>
        )}
        {isGameOver && (
          <div className="game-over-message">
            {outcomeMessage}
          </div>
        )}
        <Sidebar 
          isOpen={isSidebarOpen} 
          onToggle={() => toggleSidebar(isSidebarOpen, setSidebarOpen)} 
        />
        </div>
      </div>
      <div class="trademark-section">
        © 2023 <a href="https://twitter.com/ubaid_rac" target="_blank">Abu Kacak</a>. All Rights Reserved.
      </div>
      <Analytics/>
    </div>
  );
};

export default CongkakBoard;