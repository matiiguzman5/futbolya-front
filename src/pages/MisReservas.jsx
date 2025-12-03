import React, {
  useEffect,
  useState,
  useCallback,
  useRef
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../assets/styles/home.css";
import "../assets/styles/misReservas.css";
import ShareReserva from "../components/ShareReserva";
import ValorarModal from "../components/ValorarModal";
import ConfirmActionModal from "../components/ConfirmActionModal";
import { API_URL } from "../config";

const ACCION_RESERVA_CONFIG = {
  salir: {
    title: "¿Salir del partido?",
    description:
      "Vas a abandonar el partido y liberar tu lugar. Esta acción no se puede deshacer.",
    confirmLabel: "Sí, salir",
    successMessage: "Saliste del partido correctamente.",
    tone: "warning"
  },
  cancelar: {
    title: "¿Cancelar la reserva?",
    description:
      "Se liberará el turno y avisaremos al establecimiento. Esta acción no se puede deshacer.",
    confirmLabel: "Sí, cancelar",
    successMessage: "Reserva cancelada correctamente.",
    tone: "danger"
  }
};

const MisReservas = () => {
  const [reservasActivas, setReservasActivas] = useState([]);
  const [reservasPasadas, setReservasPasadas] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [reservaSeleccionada, setReservaSeleccionada] = useState(null);
  const [confirmacion, setConfirmacion] = useState(null);
  const [procesandoAccion, setProcesandoAccion] = useState(false);

  const [procesandoCompartida, setProcesandoCompartida] = useState(false);

  const token = localStorage.getItem("token");
  const usuario = JSON.parse(localStorage.getItem("usuario") || "null");

  const location = useLocation();
  const navigate = useNavigate();
  const yaProcesoInvitacionRef = useRef(false); 

  const searchParams = new URLSearchParams(location.search);
  const reservaCompartidaId = searchParams.get("reserva");

  const esDuenioReserva = (reserva) => {
    if (!usuario || !reserva) return false;

    const emailReserva = reserva.clienteEmail?.trim().toLowerCase();
    const emailUsuario = usuario.correo?.trim().toLowerCase();

    return (
      !!emailReserva &&
      !!emailUsuario &&
      emailReserva === emailUsuario
    );
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
        console.error("Error al obtener reservas:", res.status);
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
      console.error("Error en obtenerReservas:", error);
    }
  }, [token]);

  useEffect(() => {
    obtenerReservas();
    document.title = "Mis Reservas";
  }, [obtenerReservas]);

  useEffect(() => {
    if (!token) return;                     
    if (!reservaCompartidaId) return;       
    if (yaProcesoInvitacionRef.current) return; 

    yaProcesoInvitacionRef.current = true;

    const unirseAReservaCompartida = async () => {
      try {
        setProcesandoCompartida(true);

        const res = await fetch(
          `${API_URL}/reservas/${reservaCompartidaId}/unirse`,
          {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        if (res.ok) {
          alert("Te uniste a la reserva que te compartieron 👍");
          await obtenerReservas();
        } else {
          const errorText = await res.text();
          alert(
            errorText ||
              "No se pudo unir a la reserva compartida (cupo completo, horario o permisos)."
          );
        }
      } catch (err) {
        console.error("Error al unirse a reserva compartida:", err);
        alert(
          "Hubo un error al intentar unirte a la reserva compartida."
        );
      } finally {
        setProcesandoCompartida(false);
        navigate("/mis-reservas", { replace: true });
      }
    };

    unirseAReservaCompartida();
  }, [reservaCompartidaId, token, obtenerReservas, navigate]);

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

    if (!configuracion || !reservaId) return;

    setProcesandoAccion(true);

    try {
      const endpoint =
        confirmacion.tipo === "salir"
          ? `${API_URL}/reservas/${reservaId}/salir`
          : `${API_URL}/reservas/${reservaId}`;

      const response = await fetch(endpoint, {
        method: "DELETE",
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
      console.error("Error al realizar acción:", error);
      alert("Hubo un error al procesar la acción.");
    } finally {
      setProcesandoAccion(false);
    }
  };

  const formatearFecha = (reserva) => {
    const fecha = obtenerFecha(reserva);
    if (!fecha) return "Sin fecha";

    try {
      return fecha.toLocaleString("es-AR", {
        dateStyle: "full",
        timeStyle: "short"
      });
    } catch {
      return fecha.toLocaleString("es-AR");
    }
  };

  const abrirModalValoracion = (reservaId) => {
    setReservaSeleccionada(reservaId);
    setShowModal(true);
  };

  const renderReservaCard = (reserva, tipo) => {
    const esActiva = tipo === "activa";
    const estadoPago = reserva.estadoPago || "Sin datos";
    const observaciones = reserva.observaciones || "Ninguna";
    const etiquetaEstado = esActiva ? "Proxima" : "Historial";

    return (
      <article
        key={reserva.id}
        className={`reserva-card ${
          esActiva ? "reserva-card--activa" : "reserva-card--pasada"
        }`}
      >
        <header className="reserva-card-header">
          <div>
            <h4 className="reserva-card-cancha">
              {reserva.canchaNombre || reserva.cancha}
            </h4>
            <p className="reserva-card-meta">Reserva #{reserva.id}</p>
          </div>
          <span
            className={`reserva-estado ${
              esActiva ? "reserva-estado--activa" : "reserva-estado--pasada"
            }`}
          >
            {etiquetaEstado}
          </span>
        </header>

        <div className="reserva-card-body">
          <dl className="reserva-info-grid">
            <div className="reserva-info-item">
              <dt className="reserva-info-label">Fecha y hora</dt>
              <dd className="reserva-info-value">
                {formatearFecha(reserva)}
              </dd>
            </div>
            <div className="reserva-info-item">
              <dt className="reserva-info-label">Cliente</dt>
              <dd className="reserva-info-value">
                {reserva.clienteNombre}
              </dd>
            </div>
            <div className="reserva-info-item">
              <dt className="reserva-info-label">Estado de pago</dt>
              <dd className="reserva-info-value">
                <span
                  className={`reserva-chip ${
                    estadoPago === "Pagado" ? "reserva-chip--ok" : ""
                  }`}
                >
                  {estadoPago}
                </span>
              </dd>
            </div>
          </dl>

          <div className="reserva-observaciones">
            <span className="reserva-info-label">Observaciones</span>
            <p className="reserva-observaciones-texto">
              {observaciones}
            </p>
          </div>
        </div>

        <footer className="reserva-card-footer">
          <div className="botones-acciones">
            {esActiva ? (
              <>
                <button
                  className="btn-salir"
                  onClick={() =>
                    abrirConfirmacionAccion("salir", reserva)
                  }
                >
                  Salir del partido
                </button>

                {esDuenioReserva(reserva) && (
                  <button
                    className="btn-cancelar"
                    onClick={() =>
                      abrirConfirmacionAccion("cancelar", reserva)
                    }
                  >
                    Cancelar reserva
                  </button>
                )}

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

  const accionActual = confirmacion
    ? ACCION_RESERVA_CONFIG[confirmacion.tipo]
    : null;

  const detallesModal =
    confirmacion && confirmacion.reserva
      ? [
          { label: "Reserva", value: `#${confirmacion.reserva.id}` },
          {
            label: "Cancha",
            value:
              confirmacion.reserva.canchaNombre ||
              confirmacion.reserva.cancha ||
              "Sin datos"
          },
          { label: "Fecha", value: formatearFecha(confirmacion.reserva) }
        ]
      : [];

  return (
    <div className="home-wrapper page-shell">
      <div className="home-content">
        <div className="mis-reservas-container">
          <section className="reserva-seccion">
            <div className="reserva-seccion-header">
              <h3>Próximas reservas</h3>
              <span className="reserva-cantidad">
                {reservasActivas.length}
              </span>
            </div>
            {reservasActivas.length === 0 ? (
              <p className="reserva-vacia">No tenés reservas activas.</p>
            ) : (
              <div className="reserva-lista">
                {reservasActivas.map((r) =>
                  renderReservaCard(r, "activa")
                )}
              </div>
            )}
          </section>

          <section className="reserva-seccion">
            <div className="reserva-seccion-header">
              <h3>Historial</h3>
              <span className="reserva-cantidad">
                {reservasPasadas.length}
              </span>
            </div>
            {reservasPasadas.length === 0 ? (
              <p className="reserva-vacia">No hay reservas pasadas.</p>
            ) : (
              <div className="reserva-lista">
                {reservasPasadas.map((r) =>
                  renderReservaCard(r, "pasada")
                )}
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
