// src/api/auth.js
import axios from 'axios';

const stripTrailingSlash = (value = '') => value.replace(/\/$/, '');

const resolveApiUrl = () => {
  const fromEnv = process.env.REACT_APP_API_URL;
  if (fromEnv && fromEnv.trim()) {
    return stripTrailingSlash(fromEnv.trim());
  }
  return 'https://localhost:7055/api';
};

const API_URL = resolveApiUrl();

// ---------- LOGIN ----------

const buildLoginPayload = (email, password) => ({
  correo: email,
  // mandamos varias claves por compatibilidad con el back
  contraseña: password,
  contrasena: password,
  password,
});

export const login = async (email, password) => {
  return axios.post(`${API_URL}/auth/login`, buildLoginPayload(email, password));
};

// ---------- REGISTRO ----------

const buildRegisterPayload = ({
  nombre,
  correo,
  contrasena,
  confirmarContrasena,
}) => ({
  nombre,
  correo,
  // password
  contraseña: contrasena,
  contrasena,
  password: contrasena,
  // confirmación
  confirmarContrasena,
  confirmarContraseña: confirmarContrasena,
});

export const register = async ({
  nombre,
  correo,
  contrasena,
  confirmarContrasena,
}) => {
  return axios.post(
    `${API_URL}/auth/registro`,
    buildRegisterPayload({ nombre, correo, contrasena, confirmarContrasena })
  );
};
