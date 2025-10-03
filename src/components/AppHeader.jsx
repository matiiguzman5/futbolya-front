import React from 'react';
import { Link } from 'react-router-dom';

const AppHeader = ({ usuario, esAdmin, esEstablecimiento, onLogout }) => (
  <header className="home-header">
    <div className="header-left">
      <Link to="/Home">
        <img src="/IconoFYa.jpeg" alt="Logo" className="logo" />
      </Link>
      <div className="user-info">
        <span className="user-nombre">{usuario?.nombre || 'Usuario'}</span>
        <span className="user-rol">{usuario?.rol || 'Rol'}</span>
      </div>
    </div>

    <nav className="header-center">
      <a href="#">Cambiar</a>
      <a href="#">Sedes</a>
      {esEstablecimiento && <Link to="/establecimiento">Establecimiento</Link>}
      {usuario?.rol !== 'establecimiento' && <Link to="/perfil">Perfil</Link>}
      {esAdmin && <Link to="/admin-usuarios">Administrar</Link>}
      {esEstablecimiento && <Link to="/abm-canchas">Administrar Canchas</Link>}
      {esEstablecimiento && <Link to="/agendaCanchas">Agenda Semanal</Link>}
      {usuario?.rol !== 'establecimiento' && (
        <Link to="/mis-reservas">Mis Reservas</Link>
      )}
    </nav>

    <div className="header-right">
      <button className="btnlogout" onClick={onLogout}>
        Cerrar sesión
      </button>
    </div>
  </header>
);

export default AppHeader;
