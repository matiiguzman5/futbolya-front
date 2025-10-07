import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "../assets/styles/valorarModal.css";

const ValorarModal = ({ reservaId, onClose }) => {
  const [jugadores, setJugadores] = useState([]);
  const [evaluadoId, setEvaluadoId] = useState("");
  const [puntaje, setPuntaje] = useState(0);
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
    if (!evaluadoId || puntaje === 0) {
      alert("Seleccioná un jugador y un puntaje antes de enviar.");
      return;
    }

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
        alert("✅ Valoración enviada correctamente");
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
    <AnimatePresence>
      <div className="modal-overlay" onClick={onClose}>
        <motion.div
          className="modal-card"
          onClick={(e) => e.stopPropagation()}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <h2>⚽ Valorar Jugador</h2>

          <div className="modal-body">
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
            <div className="stars">
              {[1, 2, 3, 4, 5].map((n) => (
                <span
                  key={n}
                  className={`star ${n <= puntaje ? "active" : ""}`}
                  onClick={() => setPuntaje(n)}
                  onMouseEnter={() => setPuntaje(n)}
                >
                  ★
                </span>
              ))}
            </div>

            <label>Comentario</label>
            <textarea
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              placeholder="Escribí tu comentario sobre el desempeño..."
            />

            <div className="modal-actions">
              <button className="btn-enviar" onClick={enviarValoracion}>
                Enviar valoración
              </button>
              <button className="btn-cancelar" onClick={onClose}>
                Cancelar
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ValorarModal;
