import { useState, useCallback } from "react";

export const useCursorControl = () => {
    // cursor control states
  const [cursorVisibilityUpper, setCursorVisibilityUpper] = useState({ visible: true });
  const [cursorVisibilityLower, setCursorVisibilityLower] = useState({ visible: true });
  const [cursorLeftUpper, setCursorLeftUpper] = useState(window.innerWidth / 2);
  const [cursorTopUpper, setCursorTopUpper] = useState(window.innerHeight / 3); 
  const [cursorLeftLower, setCursorLeftLower] = useState(window.innerWidth / 2);
  const [cursorTopLower, setCursorTopLower] = useState(window.innerHeight * 2 / 4);
  const [resetCursor, setResetCursor] = useState(false);
  const [shakeCursor, setShakeCursor] = useState(false);

  // Function to update cursor position for PlayerUpper
  const updateCursorPositionUpper = useCallback(async (ref, indexOrElement, verticalPosUpper) => {
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
  },[]);

  // Function to update cursor position for PlayerLower
  const updateCursorPositionLower = useCallback(async (ref, indexOrElement, verticalPosLower) => {
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
  },[]);

  return {
    cursorVisibilityUpper, setCursorVisibilityUpper,
    cursorVisibilityLower, setCursorVisibilityLower,
    cursorLeftUpper, setCursorLeftUpper,
    cursorLeftLower, setCursorLeftLower,
    cursorTopUpper, setCursorTopUpper,
    cursorTopLower, setCursorTopLower,
    resetCursor, setResetCursor,
    shakeCursor, setShakeCursor,
    updateCursorPositionUpper, updateCursorPositionLower
  }

}