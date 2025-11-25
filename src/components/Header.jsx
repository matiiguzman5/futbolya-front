import React, { useState } from "react";
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

  const [menuAbierto, setMenuAbierto] = useState(false);

  const nombreUsuario = usuario?.nombre?.trim() || "Usuario";
  const rolUsuario = usuario?.rol?.trim() || "Rol";
  const userInitials = (
    nombreUsuario
      .split(/\s+/)
      .filter(Boolean)
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase()
  ) || "U";
  const rolCapitalizado =
    rolUsuario.charAt(0).toUpperCase() + rolUsuario.slice(1);

  const cerrarSesion = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    window.location.href = "/login";
  };

  const enlacesMenu = [
    { to: "/home", label: "Inicio" },
    { to: "/establecimientos", label: "Establecimientos" },
    { to: "/perfil", label: "Perfil" },
  ];

  if (usuario?.rol !== "establecimiento") {
    enlacesMenu.push({ to: "/mis-reservas", label: "Mis Reservas" });
  }

  if (esEstablecimiento) {
    enlacesMenu.push(
      { to: "/abm-canchas", label: "Administrar Canchas" },
      { to: "/agendaCanchas", label: "Agenda" }
    );
  }

  if (esAdmin) {
    enlacesMenu.push({ to: "/admin-usuarios", label: "Administrar Usuarios" });
  }

  const toggleMenu = () => setMenuAbierto((prev) => !prev);
  const handleLinkClick = () => setMenuAbierto(false);
  const handleCerrarSesion = () => {
    setMenuAbierto(false);
    cerrarSesion();
  };

  return (
    <header className={`home-header ${menuAbierto ? "menu-open" : ""}`}>
      <div className="home-header__inner">
        <div className="header-left">
          <Link to="/home" className="header-logo">
            <img src="/IconoFYa.jpeg" alt="Logo" className="logo" />
            <span className="brand-text">FutbolYa</span>
          </Link>

          <div className="user-card">
            <div className="user-avatar" aria-hidden="true">
              {userInitials}
            </div>
            <div className="user-meta">
              <span className="user-nombre">{nombreUsuario}</span>
              <span className="user-rol">{rolCapitalizado}</span>
            </div>
          </div>
        </div>

        <button
          type="button"
          className={`menu-toggle ${menuAbierto ? "is-open" : ""}`}
          aria-label={menuAbierto ? "Cerrar menu" : "Abrir menu"}
          aria-expanded={menuAbierto}
          aria-controls="menu-principal"
          onClick={toggleMenu}
        >
          <img src="/hamburguesa.png" alt="" aria-hidden="true" />
        </button>

        <nav
          id="menu-principal"
          className="header-center"
          aria-label="Menu principal"
        >
          {enlacesMenu.map((link) => (
            <Link key={link.to} to={link.to} onClick={handleLinkClick}>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="header-right">
          <button className="btnlogout" onClick={handleCerrarSesion}>
            Cerrar sesion
          </button>
        </div>
      </div>

      <div className={`mobile-menu ${menuAbierto ? "open" : ""}`}>
        <nav aria-label="Menu principal mobile">
          {enlacesMenu.map((link) => (
            <Link key={`mobile-${link.to}`} to={link.to} onClick={handleLinkClick}>
              {link.label}
            </Link>
          ))}
          <button className="btnlogout" onClick={handleCerrarSesion}>
            Cerrar sesion
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Header;

