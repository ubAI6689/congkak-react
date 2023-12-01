import config from "../config/config";

// Constants
const { MIN_INDEX_UPPER, MAX_INDEX_UPPER, MIN_INDEX_LOWER, MAX_INDEX_LOWER,  PLAYER_UPPER, PLAYER_LOWER } = config;

export function toggleTurn (setCurrentTurn, currentTurn) {
    setCurrentTurn(currentTurn === PLAYER_UPPER ? PLAYER_LOWER : PLAYER_UPPER);
  };

export function sumOfSeedsInCurrentRow(seeds, currentTurn) {
  let sum = 0;
  const startIndex = currentTurn === PLAYER_UPPER ? MIN_INDEX_UPPER : MIN_INDEX_LOWER;
  const endIndex = currentTurn === PLAYER_UPPER ? MAX_INDEX_UPPER : MAX_INDEX_LOWER;

  for (let i = startIndex; i <= endIndex; i++) {
    sum += seeds[i];
  }

  return sum;
}

function sumOfSeedsInRow(seeds, startIndex, endIndex) {
  let sum = 0;

  // Ensure startIndex and endIndex are within bounds
  startIndex = Math.max(startIndex, 0);
  endIndex = Math.min(endIndex, seeds.length - 1);

  for (let i = startIndex; i <= endIndex; i++) {
    sum += seeds[i];
  }

  return sum;
}

function areBothRowsEmpty(seeds) {
  const sumUpperRow = sumOfSeedsInRow(seeds, MIN_INDEX_UPPER, MAX_INDEX_UPPER);
  const sumLowerRow = sumOfSeedsInRow(seeds, MIN_INDEX_LOWER, MAX_INDEX_LOWER);
  return sumUpperRow === 0 && sumLowerRow === 0;
}

function determineOutcome(topHouseSeeds, lowHouseSeeds) {
  if (topHouseSeeds > lowHouseSeeds) {
    return 'DARK WINS';
  } else if (lowHouseSeeds > topHouseSeeds) {
    return 'WHITE WINS';
  } else {
    return 'DRAW';
  }
}

export const handleCheckGameEnd = (seeds, topHouseSeeds, lowHouseSeeds, setIsGameOver, setOutcomeMessage) => {
  if (areBothRowsEmpty(seeds)) {
    setIsGameOver(true);
    const outcome = determineOutcome(topHouseSeeds, lowHouseSeeds);
    setOutcomeMessage(outcome); // Set the outcome message
    console.log(outcome); // Logging the outcome
  }
};

