
import React, { useEffect, useState, useCallback } from 'react';
import '../assets/styles/home.css';
import '../assets/styles/misReservas.css';
import ShareReserva from '../components/ShareReserva';
import ValorarModal from '../components/ValorarModal';
import ConfirmActionModal from '../components/ConfirmActionModal';
import { API_URL } from "../config";

const ACCION_RESERVA_CONFIG = {
  salir: {
    title: 'Salir del partido?',
    description: 'Vas a abandonar el partido y liberar tu lugar. Esta accion no se puede deshacer.',
    confirmLabel: 'Si, salir',
    successMessage: 'Saliste del partido correctamente.',
    tone: 'warning'
  },
  cancelar: {
    title: 'Cancelar la reserva?',
    description: 'Se liberara el turno y avisaremos al establecimiento. Esta accion no se puede deshacer.',
    confirmLabel: 'Si, cancelar',
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
  const [filtroTexto, setFiltroTexto] = useState('');
  const [filtroFecha, setFiltroFecha] = useState('');

  const token = localStorage.getItem('token');
  const usuario = JSON.parse(localStorage.getItem('usuario') || 'null');

  const esDuenioReserva = (reserva) => {
    if (!usuario || !reserva) return false;

    const emailReserva = reserva.clienteEmail?.trim().toLowerCase();
    const emailUsuario = usuario.correo?.trim().toLowerCase();
    return emailReserva && emailUsuario && emailReserva === emailUsuario;
  };

  const obtenerFecha = (reserva) => {
    const valor = reserva.fechaHora || reserva.fecha;
    if (!valor) return null;

    const fecha = new Date(valor);
    return Number.isNaN(fecha.getTime()) ? null : fecha;
  };

  const obtenerReservas = useCallback(async () => {
    if (!token) return;

    try {
      const res = await fetch(`${API_URL}/reservas/mis`, {
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
    if (!procesandoAccion) setConfirmacion(null);
  };

  const ejecutarAccionConfirmada = async () => {
    if (!confirmacion) return;

    const configuracion = ACCION_RESERVA_CONFIG[confirmacion.tipo];
    const reservaId = confirmacion.reserva?.id;

    if (!configuracion || !reservaId) {
      return;
    }

    setProcesandoAccion(true);

    try {
      const endpoint =
        confirmacion.tipo === 'salir'
          ? `${API_URL}/reservas/${reservaId}/salir`
          : `${API_URL}/reservas/${reservaId}`;

      const response = await fetch(endpoint, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
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
    if (!fecha) return 'Sin fecha';

    try {
      return fecha.toLocaleString('es-AR', {
        dateStyle: 'full',
        timeStyle: 'short'
      });
    } catch {
      return fecha.toLocaleString('es-AR');
    }
  };

  const abrirModalValoracion = (reservaId) => {
    setReservaSeleccionada(reservaId);
    setShowModal(true);
  };

  const pasaFiltros = (reserva) => {
    const texto = filtroTexto.trim().toLowerCase();
    if (texto) {
      const campos = [
        reserva.canchaNombre,
        reserva.cancha,
        reserva.ubicacion,
        reserva.establecimiento,
        reserva.clienteNombre,
        reserva.observaciones,
      ]
        .filter(Boolean)
        .map((v) => String(v).toLowerCase());

      const coincideTexto = campos.some((campo) => campo.includes(texto));
      if (!coincideTexto) return false;
    }

    if (filtroFecha) {
      const fecha = obtenerFecha(reserva);
      const iso = fecha ? fecha.toISOString().slice(0, 10) : null;
      if (iso !== filtroFecha) return false;
    }

    return true;
  };

  const renderReservaCard = (reserva, tipo) => {
    const esActiva = tipo === 'activa';
    const estadoPago = reserva.estadoPago || 'Sin datos';
    const observaciones = reserva.observaciones || 'Ninguna';
    const etiquetaEstado = esActiva ? 'Proxima' : 'Historial';
    const cancha = reserva.canchaNombre || reserva.cancha || 'Cancha sin nombre';
    const ubicacion = reserva.ubicacion || reserva.establecimiento || 'Ubicacion a confirmar';
    const jugadoresFaltantes = reserva.playersNeeded || reserva.jugadoresFaltantes;
    const jugadoresTotales = reserva.totalPlayers || reserva.capacidad || null;
    const nivel = reserva.level || reserva.nivel || 'General';
    const precio = reserva.price || reserva.precio || null;
    const organizador = reserva.organizer || reserva.organizador || reserva.clienteNombre || 'Organizador no informado';
    const textoCupo =
      jugadoresFaltantes != null
        ? `${jugadoresFaltantes} lugares libres${jugadoresTotales ? ` de ${jugadoresTotales}` : ''}`
        : jugadoresTotales
        ? `Cupo total: ${jugadoresTotales}`
        : 'Cupo no informado';

    return (
      <article
        key={reserva.id}
        className={`booking-row ${esActiva ? 'booking-row--active' : 'booking-row--past'}`}
      >
        <div className="booking-row__info">
          <div className="booking-row__head">
            <h4 className="booking-row__title">{cancha}</h4>
            <span className={`pill ${esActiva ? 'pill--active' : 'pill--muted'}`}>{etiquetaEstado}</span>
          </div>

          <div className="info-line">
            <span className="info-item">
              <span className="info-icon" aria-hidden="true">📍</span>
              {ubicacion}
            </span>
            <span className="info-item">
              <span className="info-icon" aria-hidden="true">📅</span>
              {formatearFecha(reserva)}
            </span>
          </div>

          <div className="info-line">
            <span className="info-item">
              <span className="info-icon" aria-hidden="true">👥</span>
              {textoCupo}
            </span>
          </div>

          <div className="booking-row__organizer">Organizado por {organizador}</div>
          {observaciones && <p className="booking-row__notes">Obs: {observaciones}</p>}
        </div>

        <div className="booking-row__actions">
          <span className="pill pill--level">{nivel}</span>
          <div className="price-block">
            <div className="price-main">{precio ? `$${precio}` : '--'}</div>
            <div className="price-sub">por persona</div>
          </div>
          <button className="btn-join" type="button">Unirse al Partido</button>

          <div className="booking-row__extra">
            {esActiva ? (
              <>
                <button className="btn-link" onClick={() => abrirConfirmacionAccion('salir', reserva)}>
                  Salir
                </button>
                {esDuenioReserva(reserva) && (
                  <button className="btn-link btn-link--danger" onClick={() => abrirConfirmacionAccion('cancelar', reserva)}>
                    Cancelar
                  </button>
                )}
                <ShareReserva reserva={reserva} />
              </>
            ) : (
              <button className="btn-link" onClick={() => abrirModalValoracion(reserva.id)}>
                Valorar
              </button>
            )}
          </div>
        </div>
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
            value: confirmacion.reserva.canchaNombre || confirmacion.reserva.cancha || 'Sin datos'
          },
          { label: 'Fecha', value: formatearFecha(confirmacion.reserva) }
        ]
      : [];

  const proximaReserva = reservasActivas
    .slice()
    .sort((a, b) => {
      const aFecha = obtenerFecha(a) || 0;
      const bFecha = obtenerFecha(b) || 0;
      return aFecha - bFecha;
    })[0];

  const reservasActivasFiltradas = reservasActivas.filter(pasaFiltros);
  const reservasPasadasFiltradas = reservasPasadas.filter(pasaFiltros);
  const proximaFiltrada = reservasActivasFiltradas
    .slice()
    .sort((a, b) => {
      const aFecha = obtenerFecha(a) || 0;
      const bFecha = obtenerFecha(b) || 0;
      return aFecha - bFecha;
    })[0];

  return (
    <div className="home-wrapper page-shell">
      <div className="bookings-page">
        <header className="bookings-hero">
          <div className="bookings-hero__text">
            <p className="eyebrow">Tu agenda futbolera</p>
            <h2>Mis reservas</h2>
            <p className="hero-subtitle">
              Gestiona los partidos que tenes por jugar y revisa el historial de encuentros.
            </p>
            <div className="hero-pills">
              <span className="pill pill--active">{reservasActivasFiltradas.length} proximas</span>
              <span className="pill pill--muted">{reservasPasadasFiltradas.length} en historial</span>
            </div>
          </div>
          <div className="bookings-hero__card">
            <p className="eyebrow">Proxima parada</p>
            {proximaFiltrada ? (
              <>
                <h4>{proximaFiltrada.canchaNombre || proximaFiltrada.cancha || 'Cancha sin nombre'}</h4>
                <p className="hero-meta">{formatearFecha(proximaFiltrada)}</p>
                <p className="hero-meta hero-meta--muted">
                  {proximaFiltrada.ubicacion || proximaFiltrada.establecimiento || 'Ubicacion a confirmar'}
                </p>
              </>
            ) : (
              <p className="hero-meta hero-meta--muted">No tenes partidos agendados.</p>
            )}
          </div>
        </header>

        <section className="bookings-filters">
          <div className="filters-grid">
            <div className="filter-item">
              <label className="filter-label">Buscar</label>
              <input
                className="filter-input"
                placeholder="Por ubicacion o nombre"
                value={filtroTexto}
                onChange={(e) => setFiltroTexto(e.target.value)}
              />
            </div>
            <div className="filter-item">
              <label className="filter-label">Fecha</label>
              <input
                type="date"
                className="filter-input"
                value={filtroFecha}
                onChange={(e) => setFiltroFecha(e.target.value)}
              />
            </div>
            <div className="filter-item filter-item--button">
              <button
                className="btn-ghost"
                onClick={() => {
                  setFiltroTexto('');
                  setFiltroFecha('');
                }}
              >
                Limpiar filtros
              </button>
            </div>
          </div>
        </section>

        <section className="bookings-section">
          <div className="section-header">
            <div>
              <p className="eyebrow">En agenda</p>
              <h3>Proximas reservas</h3>
            </div>
            <span className="pill pill--count">{reservasActivasFiltradas.length}</span>
          </div>
          {reservasActivasFiltradas.length === 0 ? (
            <p className="reserva-vacia">No tenes reservas activas.</p>
          ) : (
            <div className="booking-grid">{reservasActivasFiltradas.map((r) => renderReservaCard(r, 'activa'))}</div>
          )}
        </section>

        <section className="bookings-section">
          <div className="section-header">
            <div>
              <p className="eyebrow">Jugados</p>
              <h3>Historial</h3>
            </div>
            <span className="pill pill--count">{reservasPasadasFiltradas.length}</span>
          </div>
          {reservasPasadasFiltradas.length === 0 ? (
            <p className="reserva-vacia">No hay reservas pasadas.</p>
          ) : (
            <div className="booking-grid">{reservasPasadasFiltradas.map((r) => renderReservaCard(r, 'pasada'))}</div>
          )}
        </section>
      </div>

      {showModal && (
        <ValorarModal reservaId={reservaSeleccionada} onClose={() => setShowModal(false)} />
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
