// animationUtils.js

export const updateCursorPosition = async (refs, indexOrElement, setCursorLeft, setCursorTop, verticalPos) => {
  let element;
  
  // Determine if indexOrElement is an index or a DOM element
  if (typeof indexOrElement === "number") {
    element = refs.current[indexOrElement];
  } else {
    element = indexOrElement;
  }

  if (element) {
    const rect = element.getBoundingClientRect();
    setCursorLeft(rect.left + window.scrollX + 'px');
    setCursorTop(rect.top + window.scrollY + (verticalPos * rect.height) + 'px');
    await new Promise(resolve => setTimeout(resolve, 400)); // Animation delay
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

      let closestHoleIndex = 0;
      let closestDistance = Infinity;

      holeRefs.current.forEach((hole, index) => {
        // console.log(`Looping, Index: ${index}, Hole: ${hole}`);
        const isTopRowHole = index < config.MIN_INDEX_LOWER;
        const isCurrentTurnRow = (currentTurn === config.PLAYER_UPPER && isTopRowHole) ||
                                 (currentTurn === config.PLAYER_LOWER && !isTopRowHole);

        if (hole && isCurrentTurnRow) {

          const holeRect = hole.getBoundingClientRect();
          const holeCenterX = holeRect.left + window.scrollX + (holeRect.width / 2);
          const distance = Math.abs(mouseX - holeCenterX);

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
