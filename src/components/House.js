import React, { forwardRef } from 'react';

const House = forwardRef(({ position, seedCount }, ref) => {
  return (
    <div className={`house ${position}-house`} ref={ref}>
      <span className='circle-index'>{position.toUpperCase()}</span>
      {seedCount}
    </div>
  );
});

export default House;
