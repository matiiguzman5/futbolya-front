import React from "react";
import "../assets/styles/home.css";
import Layout from '../components/Layout';

const Ayuda = () => {
  return (
    <div className="home-wrapper page-shell">
      

      <div className="home-content">
        <h1 style={{ textAlign: "center" }}>Ayuda</h1>
        <p style={{ textAlign: "center", color: "var(--color-muted)" }}>
          Preguntas frecuentes para usar FutbolYa sin complicarte.
        </p>

        <div className="partidos-grid">
          <div className="reserva-card">
            <div className="info">
              <h2>¿Qué es FutbolYa?</h2>
              <p>
                Es una plataforma para organizar y participar en partidos de
                fútbol amateur. Podés buscar reservas disponibles, sumarte a
                una, o administrar tus canchas si sos establecimiento.
              </p>
            </div>
          </div>

          <div className="reserva-card">
            <div className="info">
              <h2>¿Cómo creo mi cuenta?</h2>
              <p>
                Desde el botón <strong>&quot;Registrarme&quot;</strong> elegís
                si sos <strong>Jugador</strong> o{" "}
                <strong>Establecimiento</strong>, completás tus datos básicos y
                confirmás tu correo. Después ya podés iniciar sesión.
              </p>
            </div>
          </div>

          <div className="reserva-card">
            <div className="info">
              <h2>¿Cómo reservo una cancha?</h2>
              <p>
                En el Home vas a ver las reservas disponibles. Filtrás por
                horario, zona o tipo de cancha y seguís los pasos para unirte o
                crear una nueva reserva.
              </p>
            </div>
          </div>

          <div className="reserva-card">
            <div className="info">
              <h2>¿Puedo cancelar una reserva?</h2>
              <p>
                Sí. Desde <strong>Mis Reservas</strong> podés cancelar (si sos
                el creador) o salir de la reserva (si sos jugador), respetando
                las condiciones del establecimiento.
              </p>
            </div>
          </div>

          <div className="reserva-card">
            <div className="info">
              <h2>No me llega el mail de confirmación</h2>
              <p>
                Revisá spam o correo no deseado. Si no aparece, escribinos desde
                la página de <strong>Contacto</strong> con el correo que
                usaste para registrarte.
              </p>
            </div>
          </div>

          <div className="reserva-card">
            <div className="info">
              <h2>Problemas con pagos</h2>
              <p>
                Guardá el comprobante y escribinos desde{" "}
                <strong>Contacto</strong> indicando el ID de la reserva y el
                método de pago utilizado. Te ayudamos a revisar el caso.
              </p>
            </div>
          </div>
        </div>
      </div>

      
    </div>
  );
};

export default Ayuda;
