import React, { useState } from 'react';
import { login } from '../api/auth';
import { useNavigate } from 'react-router-dom';
import '../assets/styles/login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await login(email, password);
      const { token, usuario } = response.data;

      if (token) {
        localStorage.setItem('token', token);
        localStorage.setItem('usuario', JSON.stringify(usuario));
        localStorage.setItem('rol', usuario.rol);
        navigate('/home');
      } else {
        alert('Inicio de sesión sin token recibido.');
      }
    } catch (error) {
      let alertMessage = 'Error al iniciar sesion. Verifica tus datos.';

      if (error?.response) {
        const { status, data } = error.response;
        console.error('Login fallo con respuesta del servidor:', status, data);
        const serverMessage = typeof data === 'string' ? data :
          data?.mensaje || data?.message || data?.title || data?.detail;
        alertMessage = `Error ${status}: ${serverMessage || 'Credenciales invalidas.'}`;
      } else if (error?.request) {
        console.error('Login envio solicitud pero no obtuvo respuesta:', error.request);
        alertMessage = 'No hubo respuesta del servidor. Verifica que la API este ejecutandose y acepte solicitudes desde este origen.';
      } else {
        console.error('Login fallo antes de enviar la solicitud:', error);
        alertMessage = `Error inesperado: ${error?.message || 'Revisa la consola para mas detalles.'}`;
      }

      alert(alertMessage);
    }
  };

  const irARegistro = () => {
    navigate('/register');
  };

  return (
    <div className="login-background">
      <div className="login-box">
        <div className="login-header">
          <img src="/IconoFYa.jpeg" alt="Logo FútbolYa" />
          <h2>LOGIN</h2>
        </div>
        <form onSubmit={handleLogin}>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Usuario"
            required
          />
          <div className="password-container">
            <input
              type={mostrarPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
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
          <div className="forgot-password">
            <a href="#">¿Olvidaste tu contraseña?</a>
          </div>
          <button type="submit">Iniciar Sesión</button>
        </form>
        <button className="buttonC" onClick={irARegistro}>
          Crear Cuenta
        </button>
      </div>
    </div>
  );
};

export default Login;
