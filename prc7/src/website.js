import React, { useState } from "react";
import { Link } from "react-router-dom";
import './website.css';

function Website() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="container">
      <button className="menu-btn" onClick={toggleSidebar}>
        &#9776;
      </button>

      {isOpen && (
        <div className="sidebar">
          <Link to="/home" className="sidebar-btn" onClick={() => setIsOpen(false)}>
            Home
          </Link>
          <Link to="/about" className="sidebar-btn" onClick={() => setIsOpen(false)}>
            About
          </Link>
          <Link to="/contact" className="sidebar-btn" onClick={() => setIsOpen(false)}>
            Contact
          </Link>
        </div>
      )}

      <div className="content">
        <h1>Welcome to My Website</h1>
        <p>This is the main content of the webpage.</p>
      </div>
    </div>
  );
}

export default Website;