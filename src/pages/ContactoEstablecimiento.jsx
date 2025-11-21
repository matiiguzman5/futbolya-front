import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../assets/styles/contactoestablecimiento.css';
import { API_URL } from "../config";


const ContactoEstablecimiento = () => {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [enviando, setEnviando] = useState(false);
  const API = process.env.REACT_APP_API_URL;


  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Sumá tu establecimiento - FutbolYa';
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!nombre.trim() || !email.trim()) {
      alert('Nombre y correo son obligatorios.');
      return;
    }

    setEnviando(true);

    try {
      const res = await fetch(`${API_URL}/contacto/establecimiento`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          nombre,
          email,
          telefono,
          mensaje
        })
      });

      if (res.ok) {
        alert('¡Gracias! Te vamos a contactar a la brevedad.');
        navigate('/login');
      } else {
        const error = await res.text();
        alert(`No se pudo enviar el mensaje: ${error}`);
      }
    } catch (error) {
      console.error('Error al enviar contacto:', error);
      alert('Hubo un error al enviar el formulario. Intentá de nuevo más tarde.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="contacto-page">
      <div className="contacto-card">
        <h2>Sumá tu establecimiento a FutbolYa</h2>
        <p className="contacto-subtitle">
          Dejanos tus datos y nos vamos a poner en contacto para ayudarte a gestionar tus canchas y reservas.
        </p>

        <form className="contacto-form" onSubmit={handleSubmit}>
          <label>
            <span>Nombre del establecimiento *</span>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Club Atlético Barrio Norte"
              required
            />
          </label>

          <label>
            <span>Correo de contacto *</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nombre@club.com"
              required
            />
          </label>

          <label>
            <span>Teléfono</span>
            <input
              type="tel"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              placeholder="+54 9 11 1234 5678"
            />
          </label>

          <label>
            <span>Contanos un poco sobre tu establecimiento</span>
            <textarea
              rows={4}
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
              placeholder="Cantidad de canchas, tipos (F5, F7, F11), horarios, etc."
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
              {enviando ? 'Enviando...' : 'Enviar formulario'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContactoEstablecimiento;
