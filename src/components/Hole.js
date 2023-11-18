import React, { forwardRef } from 'react';

const Hole = forwardRef(({ index, seedCount, onClick }, ref) => {
  return (
    <div ref={ref} className="circle" onClick={() => onClick(index)}>
      <div className="circle-index">{index+1}</div>
      {seedCount}
    </div>
  );
});

export default Hole;
