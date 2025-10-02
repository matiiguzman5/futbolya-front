// src/components/ValorarModal.jsx
import React, { useState, useEffect } from "react";

const ValorarModal = ({ reservaId, onClose }) => {
  const [jugadores, setJugadores] = useState([]);
  const [evaluadoId, setEvaluadoId] = useState("");
  const [puntaje, setPuntaje] = useState(5);
  const [comentario, setComentario] = useState("");
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchJugadores = async () => {
      try {
        const res = await fetch(`https://localhost:7055/api/reservas/${reservaId}/jugadores`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setJugadores(data.jugadores || []);
        }
      } catch (err) {
        console.error("Error al obtener jugadores:", err);
      }
    };
    if (reservaId) fetchJugadores();
  }, [reservaId, token]);

  const enviarValoracion = async () => {
    try {
      const res = await fetch("https://localhost:7055/api/calificaciones", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          partidoId: reservaId, // se usa el id de la reserva como partidoId
          evaluadoId: Number(evaluadoId),
          puntaje,
          comentario
        })
      });

      if (res.ok) {
        alert("✅ Valoración enviada");
        onClose();
      } else {
        const error = await res.text();
        alert("❌ Error: " + error);
      }
    } catch (error) {
      alert("❌ No se pudo enviar la valoración");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Valorar Jugador</h3>

        <label>Jugador</label>
        <select value={evaluadoId} onChange={(e) => setEvaluadoId(e.target.value)}>
          <option value="">-- Selecciona un jugador --</option>
          {jugadores.map((j) => (
            <option key={j.id} value={j.id}>
              {j.nombre} {j.esCreador ? "(Creador)" : ""}
            </option>
          ))}
        </select>

        <label>Puntaje</label>
        <select value={puntaje} onChange={(e) => setPuntaje(Number(e.target.value))}>
          {[1, 2, 3, 4, 5].map((n) => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>

        <label>Comentario</label>
        <textarea
          value={comentario}
          onChange={(e) => setComentario(e.target.value)}
          placeholder="Escribe tu comentario..."
        />

        <div className="modal-actions">
          <button onClick={enviarValoracion}>Enviar</button>
          <button onClick={onClose}>Cancelar</button>
        </div>
      </div>
    </div>
  );
};

export default ValorarModal;
