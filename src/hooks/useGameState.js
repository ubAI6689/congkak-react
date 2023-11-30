import { useState, useCallback } from 'react';
import config from '../config/config';
import gamePhaseConfig from '../config/gamePhaseConfig';

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
  TURN_BASED_SOWING,
  TURN_BASED_SELECT
} = gamePhaseConfig

const startIndexUpper = Math.round((MIN_INDEX_UPPER + MAX_INDEX_UPPER) / 2);
const startIndexLower = Math.round((MIN_INDEX_LOWER + MAX_INDEX_LOWER) / 2);

export const useGameState = () => {
  const [seeds, setSeeds] = useState(new Array(HOLE_NUMBERS).fill(INIT_SEEDS_COUNT)); // 14 holes excluding houses
  const [gamePhase, setGamePhase] = useState(STARTING_PHASE);
  const [isStartButtonPressed, setIsStartButtonPressed] = useState(false);
  const [startingPositionUpper, setStartingPositionUpper] = useState(null);
  const [startingPositionLower, setStartingPositionLower] = useState(null);
  const [currentHoleIndexUpper, setCurrentHoleIndexUpper] = useState(startIndexUpper); 
  const [currentHoleIndexLower, setCurrentHoleIndexLower] = useState(startIndexLower);
  const [isSowingUpper, setIsSowingUpper] = useState(false);
  const [isSowingLower, setIsSowingLower] = useState(false);
  const [currentSeedsInHandUpper, setCurrentSeedsInHandUpper] = useState(0);
  const [currentSeedsInHandLower, setCurrentSeedsInHandLower] = useState(0);
  const [topHouseSeeds, setTopHouseSeeds] = useState(0);
  const [lowHouseSeeds, setLowHouseSeeds] = useState(0);
  const [currentTurn, setCurrentTurn] = useState(null);
  const [passedHouse, setPassedHouse] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [outcomeMessage, setOutcomeMessage] = useState('');
  const [showSelectionMessage, setShowSelectionMessage] = useState(false);

  const toggleTurn = useCallback(() => {
    setCurrentTurn(prevTurn => prevTurn === PLAYER_UPPER ? PLAYER_LOWER : PLAYER_UPPER);
  }, []);

  // handle the logic for both START and RESUME button
  const startButtonPressed = useCallback((handleWrongSelection, setShakeCursor, simultaneousSowing) => {
    if (gamePhase === STARTING_PHASE) {
      if (startingPositionUpper === null || seeds[startingPositionUpper] === 0) {
        console.log("startingPosUpper: ", startingPositionUpper);
        console.log("Please select starting position for Player Upper")
        handleWrongSelection(setShakeCursor, setShowSelectionMessage);
      } else if (startingPositionLower === null || seeds[startingPositionLower] === 0) {
        handleWrongSelection(setShakeCursor, setShowSelectionMessage);
        console.log("Please select starting position for Player Lower")
      } else {
        console.log("START GAME!")
        setIsStartButtonPressed(true);
        simultaneousSowing(startingPositionUpper, startingPositionLower);
      }
    } else if (gamePhase === SIMULTANEOUS_SELECT) {
      if (startingPositionUpper === null || seeds[startingPositionUpper] === 0 || (startingPositionLower !== null && MAX_INDEX_UPPER - startingPositionUpper === MAX_INDEX_LOWER - startingPositionLower)) {
        console.log("startingPosUpper: ", startingPositionUpper);
        console.log("Please select starting position for Player Upper")
        handleWrongSelection(setShakeCursor, setShowSelectionMessage);
      } else if (startingPositionLower === null || seeds[startingPositionLower] === 0 || 
        (startingPositionUpper !== null && MAX_INDEX_UPPER - startingPositionUpper === MAX_INDEX_LOWER - startingPositionLower)) {
        handleWrongSelection(setShakeCursor, setShowSelectionMessage, setShowSelectionMessage);
        console.log("Please select starting position for Player Lower")
      } else {
        console.log("START GAME!")
        setIsStartButtonPressed(true);
        simultaneousSowing(startingPositionUpper, startingPositionLower);
      }
    // resume button logic
    } else if (gamePhase === SIMULTANEOUS_SELECT_UPPER) {
      if (startingPositionUpper === null || seeds[startingPositionUpper] === 0 || startingPositionUpper === currentHoleIndexLower) {
        console.log("Please select starting position for Player Upper");
        handleWrongSelection(setShakeCursor, setShowSelectionMessage);
      } else {
        setIsStartButtonPressed(true);
        simultaneousSowing(startingPositionUpper, null);
      }
    } else if (gamePhase === SIMULTANEOUS_SELECT_LOWER) {
      if (startingPositionLower === null || seeds[startingPositionLower] === 0 || startingPositionLower === currentHoleIndexUpper) {
        console.log("Please select starting position for Player Lower");
        handleWrongSelection(setShakeCursor, setShowSelectionMessage);
      } else {
        setIsStartButtonPressed(true);
        simultaneousSowing(null, startingPositionLower);
      }
    }
  },[gamePhase, startingPositionUpper, startingPositionLower, seeds, currentHoleIndexLower, currentHoleIndexUpper]);

  const handleSButtonPress = useCallback(async (index, updateCursorPositionUpper, holeRefs, verticalPosUpper, turnBasedSowing, setShakeCursor, handleWrongSelection, updateCursorPositionLower, topHouseRef, lowHouseRef, verticalPosLower) => {
    if (!isSowingUpper) {
        // The logic that mimics the 'S' key press
      if (gamePhase === TURN_BASED_SELECT && currentTurn === PLAYER_UPPER) {
        await updateCursorPositionUpper(holeRefs, index, verticalPosUpper);
        setGamePhase(TURN_BASED_SOWING);
        turnBasedSowing(index, PLAYER_UPPER, false, 0, 
          {seeds, setSeeds,
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
          verticalPosUpper, verticalPosLower,
          setShowSelectionMessage}
          );
      } else if (gamePhase === STARTING_PHASE || gamePhase === SIMULTANEOUS_SELECT || gamePhase === SIMULTANEOUS_SELECT_UPPER) {
        await updateCursorPositionUpper(holeRefs, index, verticalPosUpper);
        setStartingPositionUpper(index);
      }
    }
  },[isSowingUpper, gamePhase, currentTurn, setGamePhase, setStartingPositionUpper]);

  const handleArrowDownPress = useCallback(async (index, updateCursorPositionLower, holeRefs, verticalPosLower, turnBasedSowing, setShakeCursor, handleWrongSelection, updateCursorPositionUpper, topHouseRef, lowHouseRef, verticalPosUpper) => {
    if (!isSowingLower) {
      // The logic that mimics the 'ArrowDown' key press
      if (gamePhase === TURN_BASED_SELECT && currentTurn === PLAYER_LOWER) {
        await updateCursorPositionLower(holeRefs, index, verticalPosLower);
        setGamePhase(TURN_BASED_SOWING);
        turnBasedSowing(index, PLAYER_LOWER, false, 0, 
          {seeds, setSeeds,
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
          verticalPosUpper, verticalPosLower,
          setShowSelectionMessage}
          );
      } else if (gamePhase === STARTING_PHASE || gamePhase === SIMULTANEOUS_SELECT || gamePhase === SIMULTANEOUS_SELECT_LOWER) {
        await updateCursorPositionLower(holeRefs, index, verticalPosLower);
        setStartingPositionLower(index);
      }
    }
  },[isSowingLower, gamePhase, currentTurn, setGamePhase, setStartingPositionLower]);

  return {
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
    showSelectionMessage, setShowSelectionMessage,
    currentHoleIndexUpper, setCurrentHoleIndexUpper,
    currentHoleIndexLower, setCurrentHoleIndexLower,
    isStartButtonPressed, setIsStartButtonPressed,
    toggleTurn, startButtonPressed, handleSButtonPress, handleArrowDownPress
  }
};