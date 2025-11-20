import React from "react";
import { Link } from "react-router-dom";
import "../assets/styles/footer.css";

const Footer = () => (
  <footer className="home-footer">
    <div className="home-footer__inner">
      <p>&copy; 2025 FutbolYa</p>
      <div className="footer-links">
        <Link to="/contacto">CONTACTO</Link>
        <Link to="/ayuda">AYUDA</Link>
        <Link to="/sobre-nosotros">SOBRE NOSOTROS</Link>
        <Link to="/metodos-de-pago">METODOS DE PAGO</Link>
      </div>
      <div className="footer-icons">
        <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer">
          <img src="/facebook.png" alt="Facebook" />
        </a>
        <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer">
          <img src="/instagram.png" alt="Instagram" />
        </a>
        <a href="https://www.x.com" target="_blank" rel="noopener noreferrer">
          <img src="/twitter.png" alt="Twitter" />
        </a>
      </div>
    </div>
  </footer>
);

export default Footer;
