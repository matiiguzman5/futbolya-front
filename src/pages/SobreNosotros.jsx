import React from "react";
import "../assets/styles/home.css";
import Layout from '../components/Layout';

const SobreNosotros = () => {
  return (
    <div className="home-wrapper page-shell">


      <div className="home-content">
        <h1 style={{ textAlign: "center" }}>Sobre nosotros</h1>
        <p style={{ textAlign: "center", color: "var(--color-muted)" }}>
          Conectamos jugadores, equipos y canchas para que organizar un partido
          sea tan simple como mandar un mensaje.
        </p>

        <div className="partidos-grid">
          <div className="reserva-card">
            <div className="info">
              <h2>Nuestra historia</h2>
              <p>
                FutbolYa nace de la experiencia de amigos que todas las semanas
                peleaban con grupos de WhatsApp para conseguir cancha, horario
                y jugadores. Decidimos convertir ese caos en una plataforma.
              </p>
              <p>
                Hoy buscamos que clubes, complejos y jugadores puedan
                organizarse desde un solo lugar, con información clara y
                reservas ordenadas.
              </p>
            </div>
          </div>

          <div className="reserva-card">
            <div className="info">
              <h2>Misión</h2>
              <p>
                Facilitar el acceso al deporte amateur, conectando personas y
                espacios deportivos mediante una experiencia digital simple y
                segura.
              </p>
            </div>
          </div>

          <div className="reserva-card">
            <div className="info">
              <h2>Visión</h2>
              <p>
                Ser la app de referencia para reservar canchas y organizar
                partidos en toda la región, ayudando a que más personas jueguen
                más y mejor.
              </p>
            </div>
          </div>

          <div className="reserva-card">
            <div className="info">
              <h2>Valores</h2>
              <ul style={{ paddingLeft: "18px", margin: 0, color: "var(--color-muted)" }}>
                <li>
                  <strong>Juego limpio:</strong> reglas claras y transparencia
                  en reservas.
                </li>
                <li>
                  <strong>Comunidad:</strong> fomentamos el respeto entre
                  jugadores y establecimientos.
                </li>
                <li>
                  <strong>Simpleza:</strong> flujos pensados para usar sin
                  manual.
                </li>
                <li>
                  <strong>Seguridad:</strong> protección de datos y pagos
                  confiables.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>


    </div>
  );
};

export default SobreNosotros;
