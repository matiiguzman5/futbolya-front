import React from "react";
import { Link } from "react-router-dom";
import "../assets/styles/header.css";

const Header = () => {
  const rawUsuario = localStorage.getItem("usuario");
  let usuario = null;

  try {
    usuario = rawUsuario ? JSON.parse(rawUsuario) : null;
  } catch (error) {
    console.error("No se pudo parsear el usuario de la sesion:", error);
  }

  const esAdmin = usuario?.rol === "administrador";
  const esEstablecimiento = usuario?.rol === "establecimiento";

  const cerrarSesion = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    window.location.href = "/login";
  };

  return (
    <header className="home-header">
      <div className="home-header__inner">
        <div className="header-left">
          <Link to="/home" className="header-logo">
            <img src="/IconoFYa.jpeg" alt="Logo" className="logo" />
            <span className="brand-text">FutbolYa</span>
          </Link>
          <div className="user-info">
            <span className="user-nombre">{usuario?.nombre || "Usuario"}</span>
            <span className="user-rol">{usuario?.rol || "Rol"}</span>
          </div>
        </div>

        <nav className="header-center" aria-label="Menu principal">
          <Link to="/home">Inicio</Link>
          <Link to="/establecimientos">Establecimientos</Link>
          {usuario?.rol !== "establecimiento" && <Link to="/perfil">Perfil</Link>}
          {usuario?.rol !== "establecimiento" && <Link to="/mis-reservas">Mis Reservas</Link>}
          {esEstablecimiento && (
            <>
              <Link to="/abm-canchas">Administrar Canchas</Link>
              <Link to="/agendaCanchas">Agenda</Link>
            </>
          )}
          {esAdmin && <Link to="/admin-usuarios">Administrar Usuarios</Link>}
        </nav>

        <div className="header-right">
          <button className="btnlogout" onClick={cerrarSesion}>
            Cerrar sesion
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
