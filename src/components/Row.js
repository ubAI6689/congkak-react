import React from 'react';
import Hole from './Hole';
import config from '../config/config';

const Row = ({ holes, isUpper, rowType, onClick, refs }) => {
  return (
    <div className="circles-row">
      {holes.map((hole, index) => {
        // Adjust the index based on the row type
        const adjustedIndex = rowType === 'upper' ? index : config.MAX_INDEX_LOWER - index;

        return (
          <Hole 
            key={adjustedIndex} 
            ref={el => refs[adjustedIndex] = el}
            index={adjustedIndex}
            isUpper={isUpper}
            seedCount={hole.seeds} 
            setSeedCount={hole.setSeeds} // Pass the setSeeds function to each Hole
            onClick={() => onClick(adjustedIndex)} 
          />
        );
      })}
    </div>
  );
};

export default Row;
