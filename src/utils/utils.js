import React from "react";

export const toggleTurn = (setCurrentTurn, currentTurn, Players) => {
    setCurrentTurn(currentTurn === Players.TOP ? Players.LOW : Players.TOP);
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
}