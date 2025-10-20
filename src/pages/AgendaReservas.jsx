import React, { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useNavigate } from "react-router-dom";
import esLocale from "@fullcalendar/core/locales/es";
import "../assets/styles/agenda.css";

const AgendaReservas = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [canchas, setCanchas] = useState([]);
  const [canchaId, setCanchaId] = useState("");

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [reservaSeleccionada, setReservaSeleccionada] = useState(null);

  // traer canchas del establecimiento
  useEffect(() => {
    const fetchCanchas = async () => {
      const token = localStorage.getItem("token");
      const res = await fetch("https://localhost:7055/api/reservas/mias", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        setCanchas([]);
        return;
      }
      const data = await res.json();
      setCanchas(data || []);
    };
    fetchCanchas();
  }, []);

  // traer reservas filtradas
  useEffect(() => {
    const fetchAgenda = async () => {
      const token = localStorage.getItem("token");
      let url = "https://localhost:7055/api/reservas/agenda?semana=true";
      if (canchaId) url += `&canchaId=${canchaId}`;

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        setEvents([]);
        return;
      }
      const data = await response.json();
      setEvents(data || []);
    };

    fetchAgenda();
  }, [canchaId]);

  return (
    <div className="agenda-container page-shell">
      {/* Botón volver */}
      <button onClick={() => navigate("/home")} className="btn-volver">
        ← Volver
      </button>

      <h2 className="agenda-titulo">Agenda de Reservas</h2>

      {/* Filtro de cancha */}
      <select
        value={canchaId}
        onChange={(e) => setCanchaId(e.target.value)}
        className="select-canchas"
      >
        <option value="">Todas las canchas</option>
        {canchas.map((c) => (
          <option key={c.id} value={c.id}>
            {c.nombre}
          </option>
        ))}
      </select>

      {/* Calendario */}
      <div className="agenda-card">
        <FullCalendar
          plugins={[timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          visibleRange={() => {
            let start = new Date();
            let end = new Date();
            end.setDate(start.getDate() + 7);
            return { start, end };
          }}
          events={events}
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "timeGridWeek,timeGridDay",
          }}
          buttonText={{
            today: "Hoy",
            week: "Semana",
            day: "Día",
          }}
          titleFormat={{
            day: "numeric",
            month: "long",
            year: "numeric",
          }}
          locale={esLocale}
          nowIndicator={true}
          height="auto"
          expandRows={true}
          slotMinTime={
            canchas.find((c) => c.id == canchaId)?.horaApertura || "08:00:00"
          }
          slotMaxTime={
            canchas.find((c) => c.id == canchaId)?.horaCierre || "23:00:00"
          }
          validRange={{
            start: new Date(),
          }}
          eventClassNames={(eventInfo) =>
            eventInfo.event.extendedProps.estado === "Pagado"
              ? "estado-pagado"
              : "estado-pendiente"
          }
          eventClick={(info) => {
            setReservaSeleccionada({
              titulo: info.event.title,
              inicio: info.event.start?.toLocaleString(),
              fin: info.event.end?.toLocaleString(),
              estado: info.event.extendedProps.estado,
              observaciones: info.event.extendedProps.observaciones,
            });
            setModalOpen(true);
          }}
        />
      </div>

      {/* Modal */}
      {modalOpen && reservaSeleccionada && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="modal-title">{reservaSeleccionada.titulo}</h3>
            <p>
              <strong>Inicio:</strong> {reservaSeleccionada.inicio}
            </p>
            <p>
              <strong>Fin:</strong> {reservaSeleccionada.fin}
            </p>
            <p>
              <strong>Estado:</strong> {reservaSeleccionada.estado}
            </p>
            <p>
              <strong>Observaciones:</strong>{" "}
              {reservaSeleccionada.observaciones || "Sin observaciones"}
            </p>

            <button
              className="modal-close"
              onClick={() => setModalOpen(false)}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgendaReservas;

