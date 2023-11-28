import './sidebar.css'

const Sidebar = ({ isOpen, onToggle }) => {
    return (
      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        <button onClick={onToggle}>{isOpen ? 'CLOSE' : 'SHOW INFO'}</button>
        <div className='paragraph'>
            <h3>Basic Rules of Congkak:</h3>
                <ul>
                  <li>Start simultaneously.</li>
                  <li>Players move seeds clockwise, one hole at a time, from their row.</li>
                  <li>Landing the last seed in your house (bigger hole on the left-most) earns you another turn.</li>
                  <li>Landing in a non-empty hole lets you continue moving with all seeds from that hole.</li>
                  <li>Landing in an empty hole will end turn.</li>
                  <li>Capture all seeds opposite an empty hole in your row (must have passed house once) - end turn.</li>
                  <li>The game ends when both rows are empty. The most seeds in a house wins.</li>
                </ul>
        </div>
      </div>
    );
  };

  export default Sidebar;
  