import React, { useEffect, useState } from "react";
import { API_URL } from "../config";

const ChatPartido = ({ partidoId }) => {
  const [mensajes, setMensajes] = useState([]);
  const [nuevoMensaje, setNuevoMensaje] = useState("");
  const token = localStorage.getItem("token");
  const API = process.env.REACT_APP_API_URL;

useEffect(() => {
  if (!partidoId) return;

  const fetchMensajes = async () => {
    try {
      const res = await fetch(`${API_URL}/mensajes/partido/${partidoId}`, {
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

  fetchMensajes();
  const intervalo = setInterval(fetchMensajes, 10000);
  return () => clearInterval(intervalo);

}, [partidoId, token]);


  const enviarMensaje = async () => {
    if (!nuevoMensaje.trim()) return;
    try {
      const res = await fetch(`${API_URL}/mensajes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ partidoId, contenido: nuevoMensaje })
      });
      if (res.ok) {
        setNuevoMensaje("");
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
