import React, { useEffect, useState } from "react";

const ChatPartido = ({ partidoId }) => {
  const [mensajes, setMensajes] = useState([]);
  const [nuevoMensaje, setNuevoMensaje] = useState("");
  const token = localStorage.getItem("token");

  // Cargar mensajes al montar el componente
useEffect(() => {
  if (!partidoId) return;

  const fetchMensajes = async () => {
    try {
      const res = await fetch(`https://localhost:7055/api/mensajes/partido/${partidoId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMensajes(data);
      }
    } catch (err) {
      console.error("Error al obtener mensajes:", err);
    }
  };

  // Llamada inicial
  fetchMensajes();

  // 🕐 Llamar cada 10 segundos
  const intervalo = setInterval(fetchMensajes, 10000);

  // ❌ Limpieza: cuando el componente se desmonta, eliminamos el intervalo
  return () => clearInterval(intervalo);

}, [partidoId, token]);


  const enviarMensaje = async () => {
    if (!nuevoMensaje.trim()) return;
    try {
      const res = await fetch("https://localhost:7055/api/mensajes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ partidoId, contenido: nuevoMensaje })
      });
      if (res.ok) {
        setNuevoMensaje("");
        // Refrescar chat
        const data = await res.json();
        setMensajes((prev) => [...prev, data]);
      }
    } catch (err) {
      console.error("Error al enviar mensaje:", err);
    }
  };

  return (
    <div className="chat-container">
      <h4>💬 Chat del partido</h4>
      <div className="chat-mensajes">
        {mensajes.length === 0 ? (
          <p className="chat-vacio">Aún no hay mensajes.</p>
        ) : (
          mensajes.map((m) => (
            <div key={m.id} className="chat-mensaje">
              <strong>{m.usuario?.nombre || "Jugador"}</strong>: {m.contenido}
            </div>
          ))
        )}
      </div>
      <div className="chat-input">
        <input
          type="text"
          value={nuevoMensaje}
          onChange={(e) => setNuevoMensaje(e.target.value)}
          placeholder="Escribí tu mensaje..."
        />
        <button onClick={enviarMensaje}>Enviar</button>
      </div>
    </div>
  );
};

export default ChatPartido;
