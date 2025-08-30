import React from 'react';
import { Navigate } from 'react-router-dom';

const ProteccionRuta = ({ children, rolesPermitidos }) => {
  const token = localStorage.getItem('token');
  const rol = localStorage.getItem('rol');

  if (!token) return <Navigate to="/login" />;

  if (rolesPermitidos && !rolesPermitidos.includes(rol)) {
    return <Navigate to="/home" />;
  }

  return children;
};

export default ProteccionRuta;
