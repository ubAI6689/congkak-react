import React, { useState } from 'react';
import './InfoModal.css';

const InfoModal = ({ isOpen, toggleModal }) => {
    const [language, setLanguage] = useState('EN');
    if (!isOpen) return null;

  // Function to stop event propagation from modal content
  const handleModalContentClick = (e) => {
    e.stopPropagation();
  };

  const toggleLanguage = (e) => {
    e.stopPropagation(); // Prevents modal from closing when toggling language
    setLanguage(language === 'EN' ? 'BM' : 'EN');
  };

  return (
    <div className='modal-overlay' onClick={toggleModal}>
      <div className='modal-content' onClick={handleModalContentClick}>
        <div className='language-toggle' onClick={toggleLanguage}>
          {language === 'EN' ? 'EN | BM' : 'BM | EN'}
        </div>
        
        <h2>{language === 'EN' ? 'Congkak Rules' : 'Peraturan Congkak'}</h2>
        <ul>
          <li>{language === 'EN' ? 'Congkak begins with two rows of 7 holes. Each hole contains 7 seeds. At each left end of the row, there is a bigger hole - House.' : 'Congkak bermula dengan dua baris 7 lubang yang saling menghadap. Setiap lubang mengandungi 7 biji. Di hujung kiri setiap baris ada lubang yang lebih besar iaitu Rumah. '}</li>
          <li>{language === 'EN' ? 'Both players should choose starting hole from their row. Start simultaneously.' : 'Kedua pemain perlu memilih lubang permulaan daripada barisan masing-masing. Mula serentak.'}</li>
          <li>{language === 'EN' ? 'Players move seeds clockwise, dropping one seed at a time to the next hole. Players unable to drop seed in opponent\'s House.' : 'Pemain bergerak mengikut arah jam, menjatuhkan satu biji di setiap lubang. Pemain tidak boleh menjatuhkan biji di Rumah lawan.'}</li>
          <li>{language === 'EN' ? 'Landing the last seed in your House earns you another turn.' : 'Sekiranya pergerakan berakhir di Rumah sendiri, pemain akan diberi pusingan tambahan.'}</li>
          <li>{language === 'EN' ? 'Landing in a non-empty hole lets you continue moving with all seeds from that hole.' : 'Sekiranya pergerakan berakhir di lubang yang berisi, pemain akan meneruskan pergerakan dengan semua biji dari lubang itu.'}</li>
          <li>{language === 'EN' ? 'Landing in an empty hole will end turn.' : 'Mendarat di lubang kosong akan mengakhiri giliran pemain.'}</li>
          <li>{language === 'EN' ? 'Landing in an empty hole in your row will capture all seeds from the opposite hole, with condition that player has passed their own House at least once.' : 'Mendarat di lubang kosong di barisan sendiri membolehkan pemain menikam semua biji di lubang berlawanan, dengan syarat pemain telah melalui Rumah sendiri sekurang-kurangnya sekali.'}</li>
          <li>{language === 'EN' ? 'The game ends if one house reaches at least half + 1 (50) of total seeds. The house with higher seeds wins.' : 'Permainan berakhir jika satu rumah mencapai sekurang-kurangnya setengah + 1 (50) daripada jumlah keseluruhan biji. Rumah dengan biji paling banyak menang.'}</li>
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
