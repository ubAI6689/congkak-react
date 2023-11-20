// animationUtils.js
import config from "../config/config";

export const updateCursorPosition = (holeRefs, index, setCursorLeft, setCursorTop, verticalPos) => {
    if (holeRefs.current[index]) {
        const holeRect = holeRefs.current[index].getBoundingClientRect();
        setCursorLeft(holeRect.left + window.scrollX + 'px');
        setCursorTop(holeRect.top + window.scrollY + (verticalPos * holeRect.height) + 'px');
    }
};

export const pickUpAnimation = (holeRefs, index, setCursorTop, verticalPos) => {
    if (holeRefs.current[index]) {
        const holeRect = holeRefs.current[index].getBoundingClientRect();
        setCursorTop(holeRect.top + window.scrollY + 'px');
    }
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

export const animateToHouse = (houseRef, setCursorLeft, setCursorTop, verticalOffset) => {
    if (houseRef.current) {
        const houseRect = houseRef.current.getBoundingClientRect();
        setCursorLeft(houseRect.left + window.scrollX + 'px');
        setCursorTop(houseRect.top + window.scrollY + (verticalOffset * houseRect.height) + 'px');
    }
};

function snapToClosestHole(holeRefs, closestHoleIndex, verticalPos, setCursorLeft, setCursorTop) {
    if (holeRefs.current[closestHoleIndex]) {
      const closestHoleRect = holeRefs.current[closestHoleIndex].getBoundingClientRect();
      const cursorLeftOffset = closestHoleRect.left + window.scrollX + (closestHoleRect.width / 5);
      const cursorTopOffset = closestHoleRect.top + window.scrollY + (verticalPos * closestHoleRect.height);
  
      setCursorLeft(cursorLeftOffset + 'px');
      setCursorTop(cursorTopOffset + 'px');
    }
  }

export function handleMouseMovement(isSowing, holeRefs, currentTurn, verticalPos, setCursorLeft, setCursorTop, config) {
    return (event) => {
      if (isSowing) return; // Do not update cursor position during sowing

      const mouseX = event.clientX;
    //   console.log("Mouse X:", mouseX); // Debugging

      let closestHoleIndex = 0;
      let closestDistance = Infinity;

    //   console.log("Hole refs:", holeRefs.current);

      holeRefs.current.forEach((hole, index) => {
        // console.log(`Looping, Index: ${index}, Hole: ${hole}`);
        const isTopRowHole = index < config.MIN_INDEX_LOWER;
        const isCurrentTurnRow = (currentTurn === config.PLAYER_UPPER && isTopRowHole) ||
                                 (currentTurn === config.PLAYER_LOWER && !isTopRowHole);

        // console.log(`Mouse X: ${mouseX}, Index: ${index}, isTopRowHole: ${isTopRowHole}, Current Turn: ${currentTurn}, isCurrentTurnRow: ${isCurrentTurnRow}`);

        if (hole && isCurrentTurnRow) {
    
            // console.log(`Hole Exists: ${!!hole}, Current Turn Row: ${isCurrentTurnRow}`);

          const holeRect = hole.getBoundingClientRect();
          const holeCenterX = holeRect.left + window.scrollX + (holeRect.width / 2);
          const distance = Math.abs(mouseX - holeCenterX);

        //   console.log(`Hole Index: ${index}, Center X: ${holeCenterX}, Distance: ${distance}`); // Debugging

          if (distance < closestDistance) {
            closestDistance = distance;
            closestHoleIndex = index;
          }
        }
      });

      // Snap cursor to the specific position within the closest hole
      snapToClosestHole(holeRefs, closestHoleIndex, verticalPos, setCursorLeft, setCursorTop);
    };
}
