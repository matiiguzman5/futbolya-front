import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../assets/styles/contactoestablecimiento.css';
import { API_URL } from "../config";

const OlvideContrasena = () => {
  const [correo, setCorreo] = useState('');
  const [enviando, setEnviando] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Recuperar contraseña - FutbolYa';
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!correo.trim()) {
      alert('Ingresá tu correo.');
      return;
    }

    setEnviando(true);

    try {
      const res = await fetch(`${API_URL}/auth/olvide-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo })
      });

      if (res.ok) {
        alert('Si el correo está registrado, te enviamos un mail para restablecer la contraseña.');
        navigate('/login');
      } else {
        const error = await res.text();
        console.error(error);
        alert('Hubo un problema al procesar la solicitud.');
      }
    } catch (error) {
      console.error('Error al enviar petición de reset:', error);
      alert('No se pudo enviar la solicitud. Probá de nuevo más tarde.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="contacto-page">
      <div className="contacto-card">
        <h2>¿Olvidaste tu contraseña?</h2>
        <p className="contacto-subtitle">
          Ingresá el correo con el que te registraste y te vamos a enviar un enlace para que elijas una nueva contraseña.
        </p>

        <form className="contacto-form" onSubmit={handleSubmit}>
          <label>
            <span>Correo electrónico</span>
            <input
              type="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              placeholder="nombre@correo.com"
              required
            />
          </label>

          <div className="contacto-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => navigate('/login')}
            >
              Volver al login
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={enviando}
            >
              {enviando ? 'Enviando...' : 'Enviar enlace'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OlvideContrasena;
