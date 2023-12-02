import React from 'react';
import './InfoModal.css';

const InfoModal = ({ isOpen, toggleModal }) => {
  if (!isOpen) return null;

  // Function to stop event propagation from modal content
  const handleModalContentClick = (e) => {
    e.stopPropagation();
  };

  return (
    <div className='modal-overlay' onClick={toggleModal}>
      <div className='modal-content' onClick={handleModalContentClick}>
        <h2>Congkak Rules</h2>
        <ul>
          <li>Start simultaneously.</li>
          <li>Players move seeds clockwise, dropping one seed at a time to the next hole, from their row.</li>
          <li>Landing the last seed in your house earns you another turn.</li>
          <li>Landing in a non-empty hole lets you continue moving with all seeds from that hole.</li>
          <li>Landing in an empty hole will end turn.</li>
          <li>Landing in an empty hole in your row will capture all seeds opposite an empty hole in your row.</li>
          <li>The game ends if one house reaches at least half + 1 of total seeds (50). The house with higher seeds wins.</li>
        </ul>
        {/* Add links to GitHub and social media */}
        <div className='modal-links'>
        <a href="https://github.com/ubAI6689/congkak-react" target="_blank" rel="noopener noreferrer">GitHub</a>
        <a href="https://twitter.com/AyuInMetaverse" target="_blank" rel="noopener noreferrer">Social</a>
        {/* Add other social media links as needed */}
  </div>
      </div>
    </div>
  );
};

export default InfoModal;
