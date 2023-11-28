// animationUtils.js
import config from "../config/config";

const { MIN_INDEX_LOWER } = config;

// Function to handle wrong selection
export const handleWrongSelection = (setShakeCursor) => {
  console.log("Shake cursor called!")
  setShakeCursor(true);
  setTimeout(() => setShakeCursor(false), 500); // Reset after animation duration
};
// // Function to update cursor position for PlayerUpper
// const updateCursorPositionUpper = async (holeIndex, holeRefs, setCursorLeftUpper, setCursorTopUpper, verticalPosUpper) => {
//   if (holeRefs.current[holeIndex]) {
//     const rect = holeRefs.current[holeIndex].getBoundingClientRect();
//     setCursorLeftUpper(rect.left + window.scrollX);
//     setCursorTopUpper(rect.top + window.scrollY + (verticalPosUpper * rect.height));
//     await new Promise(resolve => setTimeout(resolve, 400)); // Animation delay
//   }
// };

// // Function to update cursor position for PlayerLower
// const updateCursorPositionLower = async (holeIndex, holeRefs, setCursorLeftLower, setCursorTopLower, verticalPosLower) => {
//   if (holeRefs.current[holeIndex]) {
//     const rect = holeRefs.current[holeIndex].getBoundingClientRect();
//     setCursorLeftLower(rect.left + window.scrollX);
//     setCursorTopLower(rect.top + window.scrollY + (verticalPosLower * rect.height));
//     await new Promise(resolve => setTimeout(resolve, 400)); // Animation delay
//   }
// };

function snapToClosestHole(holeRefs, closestHoleIndex, verticalPos, setCursorLeft, setCursorTop) {
    if (holeRefs.current[closestHoleIndex]) {
      const closestHoleRect = holeRefs.current[closestHoleIndex].getBoundingClientRect();
      const cursorLeftOffset = closestHoleRect.left + window.scrollX + (closestHoleRect.width / 5);
      const cursorTopOffset = closestHoleRect.top + window.scrollY + (verticalPos * closestHoleRect.height);
  
      setCursorLeft(cursorLeftOffset + 'px');
      setCursorTop(cursorTopOffset + 'px');
    }
  }
