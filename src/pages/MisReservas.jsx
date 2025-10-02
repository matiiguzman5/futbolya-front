import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../assets/styles/misReservas.css';
import ValorarModal from '../components/ValorarModal';

const MisReservas = () => {
  const [reservasActivas, setReservasActivas] = useState([]);
  const [reservasPasadas, setReservasPasadas] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [reservaSeleccionada, setReservaSeleccionada] = useState(null);

  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const obtenerReservas = async () => {
    if (!token) return;
    try {
      const res = await fetch('https://localhost:7055/api/reservas/mis', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        console.error("Error al obtener reservas:", res.status);
        return;
      }
      const data = await res.json();
      const ahora = new Date();
      const activas = data.filter(r => new Date(r.fecha) > ahora);
      const pasadas = data.filter(r => new Date(r.fecha) <= ahora);

      setReservasActivas(activas);
      setReservasPasadas(pasadas);
    } catch (error) {
      console.error("Error en obtenerReservas:", error);
    }
  };

  useEffect(() => {
    obtenerReservas();
  }, []);

  const confirmarAccion = async (accion, reservaId) => {
    const confirm1 = window.confirm(`¿Estás seguro que deseas ${accion} esta reserva?`);
    if (!confirm1) return;
    const confirm2 = window.confirm("Esta acción no se puede deshacer. ¿Confirmás?");
    if (!confirm2) return;

    try {
      const endpoint =
        accion === "salir del partido"
          ? `https://localhost:7055/api/reservas/${reservaId}/salir`
          : `https://localhost:7055/api/reservas/${reservaId}`;

      const response = await fetch(endpoint, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        alert(`Reserva ${reservaId} - ${accion} realizada.`);
        obtenerReservas();
      } else {
        const error = await response.text();
        alert(`Error: ${error}`);
      }
    } catch (error) {
      console.error("Error al realizar acción:", error);
      alert("Hubo un error al procesar la acción.");
    }
  };

  return (
    <div className="mis-reservas-container">
      <h2 className="titulo">Mis Reservas</h2>

      <section>
        <h3>Activas</h3>
        {reservasActivas.length === 0 ? (
          <p>No tenés reservas activas.</p>
        ) : (
          reservasActivas.map((reserva) => (
            <div key={reserva.id} className="reserva-card activa">
              <strong>{reserva.canchaNombre || reserva.cancha}</strong><br />
              Fecha: {new Date(reserva.fechaHora).toLocaleString('es-AR')}<br />
              Cliente: {reserva.clienteNombre}<br />
              Pago: {reserva.estadoPago}<br />
              Observaciones: {reserva.observaciones || "Ninguna"}

              <div className="botones-acciones">
                <button className="btn-salir" onClick={() => confirmarAccion("salir del partido", reserva.id)}>Salir del partido</button>
                <button className="btn-cancelar" onClick={() => confirmarAccion("cancelar la reserva", reserva.id)}>Cancelar reserva</button>
              </div>
            </div>
          ))
        )}
      </section>

      <section>
        <h3>Historial</h3>
        {reservasPasadas.length === 0 ? (
          <p>No hay reservas pasadas.</p>
        ) : (
          reservasPasadas.map((reserva) => (
            <div key={reserva.id} className="reserva-card-pasada">
              <strong>{reserva.canchaNombre || reserva.cancha}</strong><br />
              Fecha: {new Date(reserva.fecha || reserva.fechaHora).toLocaleString('es-AR')}<br />
              Cliente: {reserva.clienteNombre}<br />
              Pago: {reserva.estadoPago}<br />
              Observaciones: {reserva.observaciones || "Ninguna"}

              <div className="botones-acciones">
                <button
                  className="btn-salir"
                  onClick={() => { setReservaSeleccionada(reserva.id); setShowModal(true); }}
                >
                  Valorar Jugadores
                </button>
              </div>
            </div>
          ))
        )}
      </section>

      {showModal && (
        <ValorarModal
          reservaId={reservaSeleccionada}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
};

export default MisReservas;
