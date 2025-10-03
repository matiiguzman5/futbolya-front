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
      } catch (error) {
        console.error("Error al obtener jugadores:", error);
      }
    };

    if (reservaId) {
      fetchJugadores();
    }
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
          partidoId: reservaId,
          evaluadoId: Number(evaluadoId),
          puntaje,
          comentario
        })
      });

      if (res.ok) {
        alert("Valoracion enviada.");
        onClose();
      } else {
        const error = await res.text();
        alert(`Error: ${error}`);
      }
    } catch (error) {
      alert("No se pudo enviar la valoracion.");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Valorar jugador</h3>

        <label>Jugador</label>
        <select value={evaluadoId} onChange={(event) => setEvaluadoId(event.target.value)}>
          <option value="">-- Selecciona un jugador --</option>
          {jugadores.map((jugador) => (
            <option key={jugador.id} value={jugador.id}>
              {jugador.nombre} {jugador.esCreador ? "(Creador)" : ""}
            </option>
          ))}
        </select>

        <label>Puntaje</label>
        <select value={puntaje} onChange={(event) => setPuntaje(Number(event.target.value))}>
          {[1, 2, 3, 4, 5].map((valor) => (
            <option key={valor} value={valor}>
              {valor}
            </option>
          ))}
        </select>

        <label>Comentario</label>
        <textarea
          value={comentario}
          onChange={(event) => setComentario(event.target.value)}
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
