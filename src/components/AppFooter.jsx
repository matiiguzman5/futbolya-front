import React from 'react';

const AppFooter = () => (
  <footer className="home-footer">
    <p>© 2024 FutbolYa</p>
    <div className="footer-links">
      <a href="#">CONTACTO</a>
      <a href="#">AYUDA</a>
      <a href="#">SOBRE NOSOTROS</a>
      <a href="#">MÉTODOS DE PAGO</a>
    </div>
    <div className="footer-icons">
      <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer">
        <img src="/facebook.png" alt="Facebook" style={{ width: '30px', height: '30px' }} />
      </a>
      <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer">
        <img src="/instagram.png" alt="Instagram" style={{ width: '30px', height: '30px' }} />
      </a>
      <a href="https://www.x.com" target="_blank" rel="noopener noreferrer">
        <img src="/twitter.png" alt="X" style={{ width: '30px', height: '30px' }} />
      </a>
    </div>
  </footer>
);

export default AppFooter;
