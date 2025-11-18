import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import '../assets/styles/home.css';
import '../assets/styles/misReservas.css';
import ShareReserva from '../components/ShareReserva';
import ValorarModal from '../components/ValorarModal';
import ConfirmActionModal from '../components/ConfirmActionModal';

const ACCION_RESERVA_CONFIG = {
  salir: {
    title: '¿Salir del partido?',
    description: 'Vas a abandonar el partido y liberar tu lugar. Esta acción no se puede deshacer.',
    confirmLabel: 'Sí, salir',
    successMessage: 'Saliste del partido correctamente.',
    tone: 'warning'
  },
  cancelar: {
    title: '¿Cancelar la reserva?',
    description: 'Se libero el turno y avisaremos al establecimiento. Esta acción no se puede deshacer.',
    confirmLabel: 'Sí, cancelar',
    successMessage: 'Reserva cancelada correctamente.',
    tone: 'danger'
  }
};


const MisReservas = () => {
  const [reservasActivas, setReservasActivas] = useState([]);
  const [reservasPasadas, setReservasPasadas] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [reservaSeleccionada, setReservaSeleccionada] = useState(null);
  const [confirmacion, setConfirmacion] = useState(null);
  const [procesandoAccion, setProcesandoAccion] = useState(false);

  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const obtenerFecha = (reserva) => {
    const valor = reserva.fechaHora || reserva.fecha;
    if (!valor) {
      return null;
    }

    const fecha = new Date(valor);
    return Number.isNaN(fecha.getTime()) ? null : fecha;
  };

  const obtenerReservas = useCallback(async () => {
    if (!token) {
      return;
    }

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

      const activas = data.filter((reserva) => {
        const fecha = obtenerFecha(reserva);
        return fecha ? fecha > ahora : false;
      });

      const pasadas = data.filter((reserva) => {
        const fecha = obtenerFecha(reserva);
        return fecha ? fecha <= ahora : false;
      });


      setReservasActivas(activas);
      setReservasPasadas(pasadas);
    } catch (error) {
      console.error('Error en obtenerReservas:', error);
    }
  }, [token]);

  useEffect(() => {
    obtenerReservas();
    document.title = 'Mis Reservas';
  }, [obtenerReservas]);

  const abrirConfirmacionAccion = (tipo, reserva) => {
    setConfirmacion({ tipo, reserva });
  };

  const cerrarConfirmacionAccion = () => {
    if (!procesandoAccion) {
      setConfirmacion(null);
    }
  };

  const ejecutarAccionConfirmada = async () => {
    if (!confirmacion) {
      return;
    }

    const configuracion = ACCION_RESERVA_CONFIG[confirmacion.tipo];
    const reservaId = confirmacion.reserva?.id;

    if (!configuracion || !reservaId) {
      return;
    }

    setProcesandoAccion(true);

    try {
      const endpoint =
        confirmacion.tipo === 'salir'
          ? `https://localhost:7055/api/reservas/${reservaId}/salir`
          : `https://localhost:7055/api/reservas/${reservaId}`;

      const response = await fetch(endpoint, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.ok) {
        alert(configuracion.successMessage);
        setConfirmacion(null);
        await obtenerReservas();
      } else {
        const error = await response.text();
        alert(`Error: ${error}`);
      }
    } catch (error) {
      console.error('Error al realizar accion:', error);
      alert('Hubo un error al procesar la accion.');
    } finally {
      setProcesandoAccion(false);
    }
  };

  const formatearFecha = (reserva) => {
    const fecha = obtenerFecha(reserva);
    if (!fecha) {
      return 'Sin fecha';
    }

    try {
      return fecha.toLocaleString('es-AR', {
        dateStyle: 'full',
        timeStyle: 'short'
      });
    } catch (error) {
      return fecha.toLocaleString('es-AR');
    }
  };

  const abrirModalValoracion = (reservaId) => {
    setReservaSeleccionada(reservaId);
    setShowModal(true);
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

        <footer className="reserva-card-footer">
          <div className="botones-acciones">
            {esActiva ? (
              <>
                <button
                  className="btn-salir"
                  onClick={() => abrirConfirmacionAccion('salir', reserva)}
                >
                  Salir del partido
                </button>
                <button
                  className="btn-cancelar"
                  onClick={() => abrirConfirmacionAccion('cancelar', reserva)}
                >
                  Cancelar reserva
                </button>
                <ShareReserva reserva={reserva} />
              </>
            ) : (
              <button
                className="btn-salir"
                onClick={() => abrirModalValoracion(reserva.id)}
              >
                Valorar jugadores
              </button>
            )}
          </div>
        </footer>
      </article>
    );
  };

  const accionActual = confirmacion ? ACCION_RESERVA_CONFIG[confirmacion.tipo] : null;

  const detallesModal =
    confirmacion && confirmacion.reserva
      ? [
          { label: 'Reserva', value: `#${confirmacion.reserva.id}` },
          {
            label: 'Cancha',
            value:
              confirmacion.reserva.canchaNombre ||
              confirmacion.reserva.cancha ||
              'Sin datos'
          },
          {
            label: 'Fecha',
            value: formatearFecha(confirmacion.reserva)
          }
        ].filter((item) => item.value && item.value !== '')
      : [];

  return (
    <div className="home-wrapper page-shell">
      <div className="home-content">
        <div className="mis-reservas-container">
          

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

      {showModal && (
        <ValorarModal
          reservaId={reservaSeleccionada}
          onClose={() => setShowModal(false)}
        />
      )}

      {confirmacion && accionActual && (
        <ConfirmActionModal
          open
          title={accionActual.title}
          description={accionActual.description}
          details={detallesModal}
          confirmLabel={accionActual.confirmLabel}
          cancelLabel="No, volver"
          onCancel={cerrarConfirmacionAccion}
          onConfirm={ejecutarAccionConfirmada}
          isProcessing={procesandoAccion}
          tone={accionActual.tone}
        />
      )}
    </div>
  );
};

export default MisReservas;

