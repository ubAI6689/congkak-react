import React, { forwardRef } from 'react';

const House = forwardRef(({ position, seedCount, isUpper }, ref) => {
  return (
    <div className={`house ${position}-house`} ref={ref}>
      <span className='circle-index'>{position.toUpperCase()}</span>
      <div className={`seed-count ${isUpper ? 'flipped' : ''}`}>
        {seedCount}
      </div>
    </div>
  );
});

export default House;
