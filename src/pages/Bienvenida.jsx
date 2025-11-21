import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../assets/styles/bienvenida.css';

const Bienvenida = () => {
  const navigate = useNavigate();
  const irAlLogin = () => navigate('/login');

  return (
    <div className="welcome-page">
      <div className="welcome-content">
        <div className="welcome-top">
          <div className="welcome-title">
            <h1>FutbolYa</h1>
          </div>
          <div className="welcome-action">
            <button className="welcome-cta" onClick={irAlLogin}>login</button>
          </div>
        </div>

        <section className="welcome-hero">
          <p className="welcome-eyebrow">Organizá, jugalo, compartilo</p>
          <p className="welcome-lead">
            Somos una forma innovadora de conectar jugadores con canchas y eventos.
            Descubrí partidos cerca tuyo, armá tu equipo y mantené todo sincronizado en un solo lugar.
          </p>
        </section>

        <section className="welcome-highlights">
          <article>
            <h2>Experiencia simple</h2>
            <p>
              Reservas claras, recordatorios automáticos y chat integrado para coordinar cada detalle.
            </p>
          </article>
          <article>
            <h2>Encontrá jugadores</h2>
            <p>
              Llegá a la comunidad de FutbolYa y completá tu partido en minutos con perfiles verificados.
            </p>
          </article>
          <article>
            <h2>Para establecimientos</h2>
            <p>
              Agenda inteligente, pagos programados y visibilidad para tus canchas en tiempo real.
            </p>
          </article>
        </section>
      </div>
    </div>
  );
};

export default Bienvenida;
