import React, { useState, useEffect } from 'react';
import { login } from '../api/auth';
import { useNavigate, useLocation } from 'react-router-dom';
import '../assets/styles/login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [mensajeConfirmacion, setMensajeConfirmacion] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  // 👉 de dónde venía el usuario antes de que ProteccionRuta lo mande al login
  const from = location.state?.from || null;

  useEffect(() => {
    document.title = 'Iniciar sesión - FutbolYa';
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('confirmado') === '1') {
      setMensajeConfirmacion(
        'Tu correo fue confirmado correctamente. Ya podés iniciar sesión 😊'
      );
    }
  }, [location.search]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await login(email, password);
      const { token, usuario } = response.data;

      if (token) {
        // Guardar token y usuario en localStorage
        localStorage.setItem('token', token);
        localStorage.setItem(
          'usuario',
          JSON.stringify({
            ...usuario,
            correo: email, // aseguramos que tenga el correo
          })
        );
        localStorage.setItem('rol', usuario.rol);

        // 🔥 LÓGICA DE REDIRECCIÓN INTELIGENTE
        // Si venimos redirigidos desde ProteccionRuta (por ejemplo /mis-reservas?reserva=7),
        // volvemos exactamente ahí. Si no, vamos al /home como siempre.
        if (from && typeof from === 'object') {
          const destino = `${from.pathname}${from.search || ''}`;
          navigate(destino, { replace: true });
        } else {
          navigate('/home', { replace: true });
        }
      } else {
        alert('Inicio de sesión sin token recibido.');
      }
    } catch (error) {
      let alertMessage = 'Error al iniciar sesión. Verificá tus datos.';

      if (error?.response) {
        const { status, data } = error.response;
        console.error('Login falló con respuesta del servidor:', status, data);
        const serverMessage =
          typeof data === 'string'
            ? data
            : data?.mensaje || data?.message || data?.title || data?.detail;
        alertMessage = `Error ${status}: ${
          serverMessage || 'Credenciales inválidas.'
        }`;
      } else if (error?.request) {
        console.error(
          'Login envió solicitud pero no obtuvo respuesta:',
          error.request
        );
        alertMessage =
          'No hubo respuesta del servidor. Verificá que la API esté ejecutándose y acepte solicitudes desde este origen.';
      } else {
        console.error('Login falló antes de enviar la solicitud:', error);
        alertMessage = `Error inesperado: ${
          error?.message || 'Revisá la consola para más detalles.'
        }`;
      }

      alert(alertMessage);
    }
  };

  const irARegistro = () => {
    navigate('/register');
  };

  const irAContactoEstablecimiento = () => {
    navigate('/contacto-establecimiento');
  };

  return (
    <div className="login-background">
      <div className="login-box">
        <div className="login-header">
          <img src="/IconoFYa.jpeg" alt="Logo FútbolYa" />
          <h2>LOGIN</h2>
        </div>

        {mensajeConfirmacion && (
          <div className="alert success">
            {mensajeConfirmacion}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Usuario"
            required
          />
          <div className="password-container">
            <input
              type={mostrarPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Contraseña"
              required
            />
            <span
              className="toggle-password"
              onClick={() => setMostrarPassword(!mostrarPassword)}
            >
              {mostrarPassword ? '🙈' : '👁️'}
            </span>
          </div>
          <button type="submit">Iniciar Sesión</button>
        </form>

        <button className="buttonC" onClick={irARegistro}>
          Crear Cuenta
        </button>

        {/* CTA para establecimientos */}
        <div className="establecimiento-cta">
          <div className="forgot-password">
            <button
              type="button"
              className="forgot-password-link"
              onClick={() => navigate('/olvide-mi-contrasena')}
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>
          <span
            className="establecimiento-link"
            onClick={irAContactoEstablecimiento}
          >
            ¿Tenés un establecimiento y te querés sumar?
          </span>
        </div>
      </div>
    </div>
  );
};

export default Login;
