import React, { forwardRef } from 'react';

const Hole = forwardRef(({ index, isUpper, seedCount, onClick }, ref) => {
  return (
    <div ref={ref} className={`circle ${isUpper ? 'upper-row' : ''}`} onClick={() => onClick(index)}>
      <div className="circle-index">{index}</div>
      <div className={`seed-count ${isUpper ? 'flipped' : ''}`}>
        {seedCount}
      </div>
    </div>
  );
});

export default Hole;

