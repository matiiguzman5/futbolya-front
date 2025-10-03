import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import '../assets/styles/misReservas.css';
import '../assets/styles/home.css';
import AppHeader from '../components/AppHeader';
import AppFooter from '../components/AppFooter';
import ShareReserva from '../components/ShareReserva';

const MisReservas = () => {
  const [reservasActivas, setReservasActivas] = useState([]);
  const [reservasPasadas, setReservasPasadas] = useState([]);

  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const usuario = JSON.parse(localStorage.getItem('usuario'));
  const esAdmin = usuario?.rol === 'administrador';
  const esEstablecimiento = usuario?.rol === 'establecimiento';

  const obtenerReservas = useCallback(async () => {
    if (!token) return;

    try {
      const res = await fetch('https://localhost:7055/api/reservas/mis', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) {
        console.error('Error al obtener reservas:', res.status);
        return;
      }

      const data = await res.json();
      const ahora = new Date();

      const activas = data.filter((r) => new Date(r.fecha) > ahora);
      const pasadas = data.filter((r) => new Date(r.fecha) <= ahora);

      setReservasActivas(activas);
      setReservasPasadas(pasadas);
    } catch (error) {
      console.error('Error en obtenerReservas:', error);
    }
  }, [token]);

  useEffect(() => {
    obtenerReservas();
  }, [obtenerReservas]);

  const cerrarSesion = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    window.location.href = '/login';
  };

  const confirmarAccion = async (accion, reservaId) => {
    const confirm1 = window.confirm(`\u00bfEstas seguro que deseas ${accion} esta reserva?`);
    if (!confirm1) return;
    const confirm2 = window.confirm('Esta accion no se puede deshacer. \u00bfConfirmas?');
    if (!confirm2) return;

    try {
      const endpoint =
        accion === 'salir del partido'
          ? `https://localhost:7055/api/reservas/${reservaId}/salir`
          : `https://localhost:7055/api/reservas/${reservaId}`;

      const response = await fetch(endpoint, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.ok) {
        alert(`Reserva ${reservaId} - ${accion} realizada.`);
        obtenerReservas();
      } else {
        const error = await response.text();
        alert(`Error: ${error}`);
      }
    } catch (error) {
      console.error('Error al realizar accion:', error);
      alert('Hubo un error al procesar la accion.');
    }
  };

  const formatearFecha = (reserva) => {
    const fecha = reserva.fechaHora || reserva.fecha;
    if (!fecha) return 'Sin fecha';

    try {
      return new Date(fecha).toLocaleString('es-AR', {
        dateStyle: 'full',
        timeStyle: 'short'
      });
    } catch (error) {
      return new Date(fecha).toLocaleString('es-AR');
    }
  };

  const renderReservaCard = (reserva, tipo) => {
    const esActiva = tipo === 'activa';
    const estadoPago = reserva.estadoPago || 'Sin datos';
    const observaciones = reserva.observaciones || 'Ninguna';
    const etiquetaEstado = esActiva ? 'Proxima' : 'Historial';

    return (
      <article
        key={reserva.id}
        className={`reserva-card ${esActiva ? 'reserva-card--activa' : 'reserva-card--pasada'}`}
      >
        <header className="reserva-card-header">
          <div>
            <h4 className="reserva-card-cancha">{reserva.canchaNombre || reserva.cancha}</h4>
            <p className="reserva-card-meta">Reserva #{reserva.id}</p>
          </div>
          <span className={`reserva-estado ${esActiva ? 'reserva-estado--activa' : 'reserva-estado--pasada'}`}>
            {etiquetaEstado}
          </span>
        </header>

        <div className="reserva-card-body">
          <dl className="reserva-info-grid">
            <div className="reserva-info-item">
              <dt className="reserva-info-label">Fecha y hora</dt>
              <dd className="reserva-info-value">{formatearFecha(reserva)}</dd>
            </div>
            <div className="reserva-info-item">
              <dt className="reserva-info-label">Cliente</dt>
              <dd className="reserva-info-value">{reserva.clienteNombre}</dd>
            </div>
            <div className="reserva-info-item">
              <dt className="reserva-info-label">Estado de pago</dt>
              <dd className="reserva-info-value">
                <span className={`reserva-chip ${estadoPago === 'Pagado' ? 'reserva-chip--ok' : ''}`}>
                  {estadoPago}
                </span>
              </dd>
            </div>
          </dl>

          <div className="reserva-observaciones">
            <span className="reserva-info-label">Observaciones</span>
            <p className="reserva-observaciones-texto">{observaciones}</p>
          </div>
        </div>

        {esActiva && (
          <footer className="reserva-card-footer">
            <div className="botones-acciones">
              <button
                className="btn-salir"
                onClick={() => confirmarAccion('salir del partido', reserva.id)}
              >
                Salir del partido
              </button>
              <button
                className="btn-cancelar"
                onClick={() => confirmarAccion('cancelar la reserva', reserva.id)}
              >
                Cancelar reserva
              </button>
              <ShareReserva reserva={reserva} />
            </div>
          </footer>
        )}
      </article>
    );
  };

  return (
    <div className="home-wrapper">
      <AppHeader
        usuario={usuario}
        esAdmin={esAdmin}
        esEstablecimiento={esEstablecimiento}
        onLogout={cerrarSesion}
      />
      <div className="home-content">
        <div className="mis-reservas-container">
          <header className="mis-reservas-header">
            <div>
              <h2 className="titulo">Mis Reservas</h2>
              <p className="mis-reservas-subtitulo">
                Consulta tus proximas reservas y tu historial en un panel mas claro y ordenado.
              </p>
            </div>
            <button className="btn-volver" onClick={() => navigate('/home')}>
              Volver al Home
            </button>
          </header>

          <section className="reserva-seccion">
            <div className="reserva-seccion-header">
              <h3>Proximas reservas</h3>
              <span className="reserva-cantidad">{reservasActivas.length}</span>
            </div>
            {reservasActivas.length === 0 ? (
              <p className="reserva-vacia">No tenes reservas activas.</p>
            ) : (
              <div className="reserva-lista">
                {reservasActivas.map((reserva) => renderReservaCard(reserva, 'activa'))}
              </div>
            )}
          </section>

          <section className="reserva-seccion">
            <div className="reserva-seccion-header">
              <h3>Historial</h3>
              <span className="reserva-cantidad">{reservasPasadas.length}</span>
            </div>
            {reservasPasadas.length === 0 ? (
              <p className="reserva-vacia">No hay reservas pasadas.</p>
            ) : (
              <div className="reserva-lista">
                {reservasPasadas.map((reserva) => renderReservaCard(reserva, 'pasada'))}
              </div>
            )}
          </section>
        </div>
      </div>
      <AppFooter />
    </div>
  );
};

export default MisReservas;
