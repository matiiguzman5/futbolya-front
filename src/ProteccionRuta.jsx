import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const ProteccionRuta = ({ children, rolesPermitidos }) => {
  const token = localStorage.getItem('token');
  const rol = localStorage.getItem('rol');
  const location = useLocation();

  if (!token) {
    return (
      <Navigate
        to="/login"
        state={{ from: location }}  
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
