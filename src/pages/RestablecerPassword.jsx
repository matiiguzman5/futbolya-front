import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../assets/styles/contactoestablecimiento.css';

const RestablecerPassword = () => {
  const [nueva, setNueva] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [enviando, setEnviando] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const params = new URLSearchParams(location.search);
  const token = params.get('token');

  useEffect(() => {
    document.title = 'Restablecer contraseña - FutbolYa';
  }, []);

  if (!token) {
    return (
      <div className="contacto-page">
        <div className="contacto-card">
          <h2>Enlace inválido</h2>
          <p className="contacto-subtitle">
            El enlace para restablecer la contraseña es inválido o está incompleto.
          </p>
          <div className="contacto-actions">
            <button
              type="button"
              className="btn-primary"
              onClick={() => navigate('/olvide-mi-contrasena')}
            >
              Pedir un nuevo enlace
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!nueva.trim() || !confirmar.trim()) {
      alert('Completá ambas contraseñas.');
      return;
    }

    if (nueva !== confirmar) {
      alert('Las contraseñas no coinciden.');
      return;
    }

    setEnviando(true);

    try {
      const res = await fetch('https://localhost:7055/api/auth/restablecer-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          nuevaContrasena: nueva,
          confirmarContrasena: confirmar
        })
      });

      if (res.ok) {
        alert('Contraseña actualizada. Ya podés iniciar sesión.');
        navigate('/login');
      } else {
        const error = await res.text();
        alert(`No se pudo restablecer la contraseña: ${error}`);
      }
    } catch (error) {
      console.error('Error restableciendo contraseña:', error);
      alert('Hubo un error al restablecer la contraseña.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="contacto-page">
      <div className="contacto-card">
        <h2>Elegí una nueva contraseña</h2>
        <p className="contacto-subtitle">
          Ingresá tu nueva contraseña para continuar.
        </p>

        <form className="contacto-form" onSubmit={handleSubmit}>
          <label>
            <span>Nueva contraseña</span>
            <input
              type="password"
              value={nueva}
              onChange={(e) => setNueva(e.target.value)}
              placeholder="Nueva contraseña"
              required
            />
          </label>

          <label>
            <span>Confirmar contraseña</span>
            <input
              type="password"
              value={confirmar}
              onChange={(e) => setConfirmar(e.target.value)}
              placeholder="Repetí la contraseña"
              required
            />
          </label>

          <div className="contacto-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => navigate('/login')}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={enviando}
            >
              {enviando ? 'Guardando...' : 'Guardar contraseña'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RestablecerPassword;
