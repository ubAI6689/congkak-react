import React from "react";
import "./Cursos.css"

const Cursor = ({ top, left, visible, seedCount }) => {
  return (
    <div
      className="hand-cursor"
      style={{ top, left, opacity: visible? 1 : 0, backgroundImage: `url('/assets/images/handcursor.png')` }}
    >
      <span className="seeds-count">{seedCount}</span>
    </div>
  );
};

export default Cursor;