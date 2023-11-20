import React from "react";
import config from "../config/config";

export const toggleTurn = (setCurrentTurn, currentTurn, Players) => {
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

export const updateCursorToRowStart = (currentTurn, Players, holeRefs, setCursorLeft, setCursorTop, verticalPos) => {
  const startIndex = currentTurn === Players.UPPER ? (config.MIN_INDEX_UPPER + config.MAX_INDEX_UPPER) / 2 : (config.MIN_INDEX_LOWER + config.MAX_INDEX_LOWER) / 2; // 0 for UPPER, 7 for LOWER
  if (holeRefs.current[startIndex]) {
    const holeRect = holeRefs.current[startIndex].getBoundingClientRect();
    setCursorLeft(holeRect.left + window.scrollX + 'px');
    setCursorTop(holeRect.top + window.scrollY + (verticalPos * holeRect.height) + 'px');
  }
};

export function sumOfSeedsInCurrentRow(seeds, currentTurn, Players) {
  let sum = 0;

  // Define the range of indexes for the current player's row
  const startIndex = currentTurn === Players.UPPER ? config.MIN_INDEX_UPPER : config.MAX_INDEX_UPPER;
  const endIndex = currentTurn === Players.UPPER ? config.MIN_INDEX_LOWER : config.MAX_INDEX_LOWER;

  // Sum the seeds in the current player's row
  for (let i = startIndex; i <= endIndex; i++) {
    sum += seeds[i];
  }

  return sum;
}
