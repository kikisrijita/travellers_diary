import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="navbar bg-dark">
      <h1>
        <i className="fas fa-globe-europe fa-2x" />
        <span className="topic1">Traveller's</span>
        <span className="topic2">Diary</span>
      </h1>
      <ul>
        <li>
          <Link to="/profiles">
            <b> TRAVELLERS</b>
          </Link>
        </li>
        <li>
          <Link to="/about">
            <b>ABOUT</b>
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
