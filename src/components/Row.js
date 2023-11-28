import React from 'react';
import Hole from './Hole';
import config from '../config/config';

const Row = ({ seeds, isUpper, rowType, onClick, refs, selectedHole }) => {
  return (
    <div className="circles-row">
      {seeds.map((seedCount, index) => {
        // Adjust the index based on the row type
        const adjustedIndex = rowType === 'upper' ? index : config.MAX_INDEX_LOWER - index;
        const isSelected = adjustedIndex === selectedHole;

        return (
          <Hole 
            key={adjustedIndex} 
            ref={el => refs[adjustedIndex] = el}
            index={adjustedIndex}
            isUpper={isUpper}
            seedCount={seedCount} 
            onClick={onClick}
            isSelected={isSelected}
          />
        );
      })}
    </div>
  );
};

export default Row;