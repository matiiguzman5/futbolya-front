// ProteccionRuta.jsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const ProteccionRuta = ({ children, rolesPermitidos }) => {
  const token = localStorage.getItem('token');
  const rol = localStorage.getItem('rol');
  const location = useLocation();

  // No logueado: mandamos al login guardando la URL original
  if (!token) {
    return (
      <Navigate
        to="/login"
        state={{ from: location }}  // acá viaja pathname + search
        replace
      />
    );
  }

  if (rolesPermitidos && !rolesPermitidos.includes(rol)) {
    return <Navigate to="/home" replace />;
  }

  return children;
};

export default ProteccionRuta;
