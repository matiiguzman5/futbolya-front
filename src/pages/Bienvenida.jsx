import React from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "../assets/styles/bienvenida.css";

const Bienvenida = () => {
  const beneficios = [
    {
      titulo: "Reservas inteligentes",
      descripcion:
        "Visualizá disponibilidad en tiempo real y asegurá tu lugar con unos pocos clics.",
    },
    {
      titulo: "Experiencia colaborativa",
      descripcion:
        "Sumate a partidos abiertos o invitá a tus amigos para completar el equipo ideal.",
    },
    {
      titulo: "Gestión para clubes",
      descripcion:
        "Administrá canchas, horarios y pagos desde un único panel pensado para establecimientos.",
    },
  ];

  const pasos = [
    { numero: "01", titulo: "Creá tu cuenta", detalle: "Registrate en minutos y completá tu perfil de jugador o establecimiento." },
    { numero: "02", titulo: "Descubrí partidos", detalle: "Explorá reservas disponibles, filtrá por zona y encontrá el horario perfecto." },
    { numero: "03", titulo: "Entrá a la cancha", detalle: "Confirmá tu asistencia, compartí reseñas y seguí mejorando tu ranking." },
  ];

  return (
    <div className="welcome-layout">
      <Header />
      <main className="welcome-main">
        <section className="hero">
          <div className="hero-text">
            <span className="hero-badge">Bienvenido a FutbolYa</span>
            <h1>Organizá tu próximo partido en segundos.</h1>
            <p>
              La plataforma donde jugadores y complejos se encuentran. Coordiná reservas, descubrí nuevas canchas y
              mantené el espíritu del fútbol en movimiento.
            </p>
            <div className="hero-actions">
              <Link className="btn-primary" to="/login">
                Iniciar Sesión
              </Link>
              <Link className="btn-secondary" to="/register">
                Crea tu cuenta
              </Link>
            </div>
            <div className="hero-stats">
              <div>
                <strong>+500</strong>
                <span>Partidos organizados</span>
              </div>
              <div>
                <strong>120</strong>
                <span>Establecimientos aliados</span>
              </div>
              <div>
                <strong>24/7</strong>
                <span>Reservas en cualquier momento</span>
              </div>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-card">
              <img src="/celebracion.png" alt="Jugadores celebrando" />
              <div className="hero-card__info">
                <p>Partido confirmado</p>
                <span>Martes 21:00 hs · Palermo</span>
              </div>
            </div>
            <div className="hero-card secondary">
              <p>“Desde que usamos FutbolYa llenamos la agenda sin llamadas interminables.”</p>
              <span>Club Los Amigos</span>
            </div>
          </div>
        </section>

        <section id="beneficios" className="benefits">
          <h2>Todo lo que necesitás para vivir el fútbol sin fricciones.</h2>
          <div className="benefits-grid">
            {beneficios.map((beneficio) => (
              <article key={beneficio.titulo}>
                <h3>{beneficio.titulo}</h3>
                <p>{beneficio.descripcion}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="steps">
          <div className="steps-header">
            <p>Cómo funciona</p>
            <h2>En tres pasos estás listo para salir a la cancha.</h2>
          </div>
          <div className="steps-grid">
            {pasos.map((paso) => (
              <article key={paso.numero}>
                <span className="step-number">{paso.numero}</span>
                <h3>{paso.titulo}</h3>
                <p>{paso.detalle}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="cta">
          <div>
            <h2>¿Listo para reservar? Unite a FutbolYa hoy.</h2>
            <p>Creá tu cuenta y empezá a gestionar partidos, equipos y canchas desde un mismo lugar.</p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Bienvenida;
