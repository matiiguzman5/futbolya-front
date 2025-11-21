import React from "react";
import "../assets/styles/header.css";

const Header = () => {
  return (
    <header className="home-header">
      <div className="home-header__inner">
        <h1 className="brand-title">FutbolYa</h1>
        <a className="login-button" href="/login">
          Login
        </a>
      </div>
    </header>
  );
};

export default Header;
