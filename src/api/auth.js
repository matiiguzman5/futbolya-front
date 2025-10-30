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

const buildLoginPayload = (email, password) => ({
  correo: email,
  contraseña: password,
  contrasena: password,
  password
});

export const login = async (email, password) => {
  return axios.post(`${API_URL}/auth/login`, buildLoginPayload(email, password));
};

export const register = async (nombre, email, password) => {
  return axios.post(`${API_URL}/auth/registro`, {
    nombre,
    correo: email,
    contraseña: password,
    contrasena: password,
    password
  });
};
