import React from 'react';

const House = ({ position, seedCount }) => {
  return (
    <div className={`house ${position}-house`}>
      <span className='circle-index'>{position.toUpperCase()}</span>
      {seedCount}
    </div>
  );
};

export default House;
