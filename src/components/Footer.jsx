import React from "react";
import "../assets/styles/footer.css";

const Footer = () => (
  <footer className="home-footer">
    <p>&copy; 2025 FutbolYa</p>
    <div className="footer-links">
      <a href="#">CONTACTO</a>
      <a href="#">AYUDA</a>
      <a href="#">SOBRE NOSOTROS</a>
      <a href="#">METODOS DE PAGO</a>
    </div>
    <div className="footer-icons">
      <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer">
        <img src="/facebook.png" alt="Facebook" style={{ width: "30px", height: "30px" }} />
      </a>
      <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer">
        <img src="/instagram.png" alt="Instagram" style={{ width: "30px", height: "30px" }} />
      </a>
      <a href="https://www.x.com" target="_blank" rel="noopener noreferrer">
        <img src="/twitter.png" alt="Twitter" style={{ width: "30px", height: "30px" }} />
      </a>
    </div>
  </footer>
);

export default Footer;
