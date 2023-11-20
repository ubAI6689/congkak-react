// config.js

const INIT_SEEDS_COUNT = 7;
const HOLE_NUMBERS = INIT_SEEDS_COUNT*2;
const MIN_INDEX_UPPER = 0;

const config = {
    PLAYER_UPPER: 'UPPER',
    PLAYER_LOWER: 'LOWER',
    INIT_SEEDS_COUNT: INIT_SEEDS_COUNT,
    HOLE_NUMBERS: HOLE_NUMBERS,
    MIN_INDEX_LOWER: INIT_SEEDS_COUNT, // 7
    MAX_INDEX_LOWER: HOLE_NUMBERS - 1, // 13
    MIN_INDEX_UPPER: MIN_INDEX_UPPER, // 0
    MAX_INDEX_UPPER: INIT_SEEDS_COUNT - 1, // 6
}

export default config;