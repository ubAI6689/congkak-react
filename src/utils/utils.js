import React from "react";

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
  const startIndex = currentTurn === Players.UPPER ? 3 : 11; // 0 for UPPER, 7 for LOWER
  if (holeRefs.current[startIndex]) {
    const holeRect = holeRefs.current[startIndex].getBoundingClientRect();
    setCursorLeft(holeRect.left + window.scrollX + 'px');
    setCursorTop(holeRect.top + window.scrollY + (verticalPos * holeRect.height) + 'px');
  }
};  