import React from "react";
import config from "../config/config";

export function toggleTurn (setCurrentTurn, currentTurn, Players) {
    setCurrentTurn(currentTurn === Players.UPPER ? Players.LOWER : Players.UPPER);
  };

export const updateCursorPosition = (holeRefs, currentIndex, setCursorLeft, setCursorTop, verticalPos) => {
    if (holeRefs.current[currentIndex]) {
      const holeRect = holeRefs.current[currentIndex].getBoundingClientRect();
      setCursorLeft(holeRect.left + window.scrollX + 'px');
      setCursorTop(holeRect.top + window.scrollY + (verticalPos * holeRect.height) + 'px');
    }
  };

export const pickUpAnimation = (holeRefs, currentIndex, setCursorTop) => {
    const holeRect = holeRefs.current[currentIndex].getBoundingClientRect();
    setCursorTop(holeRect.top + window.scrollY + 'px');
  };

export function updateCursorToRowStart(currentTurn, Players, holeRefs, setCursorLeft, setCursorTop, verticalPos) {
  const startIndex = currentTurn === Players.UPPER 
    ? Math.round((config.MIN_INDEX_UPPER + config.MAX_INDEX_UPPER) / 2)
    : Math.round((config.MIN_INDEX_LOWER + config.MAX_INDEX_LOWER) / 2); // 0 for UPPER, 7 for LOWER

  console.log('Current turn', currentTurn);

  if (holeRefs.current[startIndex]) {
    console.log('Executing updateCursorToRowStart')
    const holeRect = holeRefs.current[startIndex].getBoundingClientRect();
    setCursorLeft(holeRect.left + window.scrollX + 'px');
    setCursorTop(holeRect.top + window.scrollY + (verticalPos * holeRect.height) + 'px');
  }
};  

export function sumOfSeedsInCurrentRow(seeds, currentTurn, config) {
  let sum = 0;
  const startIndex = currentTurn === config.PLAYER_UPPER ? config.MIN_INDEX_UPPER : config.MIN_INDEX_LOWER;
  const endIndex = currentTurn === config.PLAYER_UPPER ? config.MAX_INDEX_UPPER : config.MAX_INDEX_LOWER;

  for (let i = startIndex; i <= endIndex; i++) {
    sum += seeds[i];
  }

  return sum;
}

export function sumOfSeedsInRow(seeds, startIndex, endIndex) {
  let sum = 0;

  // Ensure startIndex and endIndex are within bounds
  startIndex = Math.max(startIndex, 0);
  endIndex = Math.min(endIndex, seeds.length - 1);

  for (let i = startIndex; i <= endIndex; i++) {
    sum += seeds[i];
  }

  return sum;
}

export function areBothRowsEmpty(seeds, config) {
  const sumUpperRow = sumOfSeedsInRow(seeds, config.MIN_INDEX_UPPER, config.MAX_INDEX_UPPER);
  const sumLowerRow = sumOfSeedsInRow(seeds, config.MIN_INDEX_LOWER, config.MAX_INDEX_LOWER);
  return sumUpperRow === 0 && sumLowerRow === 0;
}

export function determineOutcome(topHouseSeeds, lowHouseSeeds) {
  if (topHouseSeeds > lowHouseSeeds) {
    return 'UPPER wins';
  } else if (lowHouseSeeds > topHouseSeeds) {
    return 'LOWER wins';
  } else {
    return 'Draw';
  }
}

export const handleCheckGameEnd = (seeds, config, topHouseSeeds, lowHouseSeeds, setIsGameOver, setOutcomeMessage) => {
  if (areBothRowsEmpty(seeds, config)) {
    setIsGameOver(true);
    const outcome = determineOutcome(topHouseSeeds, lowHouseSeeds);
    setOutcomeMessage(outcome); // Set the outcome message
    console.log(outcome); // Logging the outcome
  }
};

