import React, { useState, useEffect } from 'react';
import { register } from '../api/auth';
import { useNavigate } from 'react-router-dom';
import '../assets/styles/login.css';

const Register = () => {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [mostrarConfirmPassword, setMostrarConfirmPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Registrate en FutbolYa';
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert('Las contraseñas no coinciden.');
      return;
    }

    try {
      await register({
        nombre,
        correo: email,
        contrasena: password,
        confirmarContrasena: confirmPassword,
      });

      alert('Registro exitoso. Revisá tu correo para confirmar la cuenta.');
      navigate('/login');
    } catch (error) {
      console.error(error);

      let msg = 'Error al registrarse. Verificá los datos.';

      if (error?.response) {
        const { status, data } = error.response;
        const serverMessage =
          typeof data === 'string'
            ? data
            : data?.mensaje || data?.message || data?.title || data?.detail;

        msg = `Error ${status}: ${serverMessage || 'No se pudo completar el registro.'}`;
      }

      alert(msg);
    }
  };

  return (
    <div className="login-background">
      <div className="login-box">
        <div className="login-header">
          <img src="/IconoFYa.jpeg" alt="Logo FútbolYa" />
          <h2>REGISTRO</h2>
        </div>
        <form onSubmit={handleRegister}>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Nombre"
            required
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Correo"
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

          <div className="password-container">
            <input
              type={mostrarConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirmar contraseña"
              required
            />
            <span
              className="toggle-password"
              onClick={() => setMostrarConfirmPassword(!mostrarConfirmPassword)}
            >
              {mostrarConfirmPassword ? '🙈' : '👁️'}
            </span>
          </div>

          <button type="submit">Registrarme</button>
        </form>

        <button className="buttonC" onClick={() => navigate('/login')}>
          Volver al Login
        </button>
      </div>
    </div>
  );
};

export default Register;
