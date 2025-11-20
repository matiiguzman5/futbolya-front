import React from "react";
import "../assets/styles/home.css";
import Layout from '../components/Layout';

const MetodosDePago = () => {
  return (
    <div className="home-wrapper page-shell">


      <div className="home-content">
        <h1 style={{ textAlign: "center" }}>Métodos de pago</h1>
        <p style={{ textAlign: "center", color: "var(--color-muted)" }}>
          Estos son los medios habilitados para pagar tus reservas en FutbolYa.
          La disponibilidad puede variar según cada establecimiento.
        </p>

        <div className="partidos-grid">
          <div className="reserva-card">
            <div className="info">
              <h2>Billeteras virtuales</h2>
              <p>
                Podés pagar con billeteras virtuales (por ejemplo, Mercado
                Pago u otras) vinculadas a tu cuenta bancaria o tarjeta.
              </p>
              <p>
                Al confirmar la reserva vas a ver si el establecimiento acepta
                este medio de pago.
              </p>
            </div>
          </div>

          <div className="reserva-card">
            <div className="info">
              <h2>Transferencia bancaria</h2>
              <p>
                Algunos establecimientos permiten abonar por transferencia.
                Los datos de la cuenta se muestran al momento de confirmar la
                reserva.
              </p>
              <p>
                Es importante enviar y/o subir el comprobante para que el pago
                quede registrado.
              </p>
            </div>
          </div>

          <div className="reserva-card">
            <div className="info">
              <h2>Efectivo en el lugar</h2>
              <p>
                En ciertos casos podés pagar en efectivo directamente en la
                cancha antes de empezar el partido.
              </p>
              <p>
                Te recomendamos llegar con tiempo para no demorar el inicio del
                juego.
              </p>
            </div>
          </div>

          <div className="reserva-card">
            <div className="info">
              <h2>Política de reembolsos</h2>
              <p>
                Las devoluciones dependen de cada establecimiento y del estado
                de la reserva (si fue cancelada a tiempo, condiciones
                climáticas, etc.).
              </p>
              <p>
                Si tenés un problema con un cobro, contactanos desde{" "}
                <strong>Contacto</strong> con el número de reserva y el
                comprobante de pago.
              </p>
            </div>
          </div>
        </div>
      </div>


    </div>
  );
};

export default MetodosDePago;
