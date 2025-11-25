import axios from 'axios';
import { API_URL } from '../config';

const buildLoginPayload = (email, password) => ({
  correo: email,
  contraseña: password,
  contrasena: password,
  password,
});

export const login = async (email, password) => {
  return axios.post(`${API_URL}/auth/login`, buildLoginPayload(email, password));
};

const buildRegisterPayload = ({
  nombre,
  correo,
  contrasena,
  confirmarContrasena,
}) => ({
  nombre,
  correo,
  contraseña: contrasena,
  contrasena,
  password: contrasena,
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
