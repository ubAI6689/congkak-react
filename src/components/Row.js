import React from 'react';
import Hole from './Hole';
import config from '../config/config';

const Row = ({ seeds, rowType, onClick, refs }) => {
  return (
    <div className="circles-row">
      {seeds.map((seedCount, index) => {
        // Adjust the index based on the row type
        const adjustedIndex = rowType === 'upper' ? index : config.MAX_INDEX_LOWER - index;

        return (
          <Hole 
            key={adjustedIndex} 
            ref={el => refs[adjustedIndex] = el}
            index={adjustedIndex} 
            seedCount={seedCount} 
            onClick={onClick} 
          />
        );
      })}
    </div>
  );
};

export default Row;
