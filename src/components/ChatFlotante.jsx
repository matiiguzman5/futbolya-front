import React, { useEffect, useState, useRef } from "react";
import "../assets/styles/chatflotante.css";

const ChatFlotante = ({ reservaId, onClose }) => {
  const [mensajes, setMensajes] = useState([]);
  const [nuevoMensaje, setNuevoMensaje] = useState("");
  const token = localStorage.getItem("token");
  const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");
  const chatRef = useRef(null);

  useEffect(() => {
    if (!reservaId) return;
    const fetchMensajes = async () => {
      try {
        const res = await fetch(`https://localhost:7055/api/mensajes/reserva/${reservaId}`, {
          headers: { Authorization: `Bearer ${token}` },
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
  }, [reservaId, token]);

  const enviarMensaje = async () => {
    if (!nuevoMensaje.trim()) return;
    try {
      const res = await fetch("https://localhost:7055/api/mensajes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reservaId, contenido: nuevoMensaje }),
      });

      if (res.ok) {
        const data = await res.json();
        setMensajes((prev) => [...prev, data]);
        setNuevoMensaje("");
      }
    } catch (err) {
      console.error("Error al enviar mensaje:", err);
    }
  };

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [mensajes]);

  return (
    <div className="chat-popup">
      <div className="chat-header">
        <h4>Chat de la reserva #{reservaId}</h4>
        <button className="cerrar" onClick={onClose}>✕</button>
      </div>

      <div className="chat-mensajes" ref={chatRef}>
        {mensajes.length === 0 ? (
          <p className="chat-vacio">Aún no hay mensajes.</p>
        ) : (
          mensajes.map((m) => (
            <div key={m.id} className={`mensaje ${m.usuarioId === usuario.id ? "mio" : "otro"}`}>
              <div className="mensaje-header">
                <span className="nombre">{m.usuario?.nombre || "Jugador"}</span>
                <span className="hora">
                  {new Date(m.fecha).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
              <p>{m.contenido}</p>
            </div>
          ))
        )}
      </div>

      <div className="chat-input">
        <input
          type="text"
          value={nuevoMensaje}
          onChange={(e) => setNuevoMensaje(e.target.value)}
          placeholder="Escribí un mensaje..."
          onKeyDown={(e) => e.key === "Enter" && enviarMensaje()}
        />
        <button className="btn-enviar" onClick={enviarMensaje}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="white"
            viewBox="0 0 24 24"
            width="22"
            height="22"
          >
            <path d="M2 21l21-9L2 3v7l15 2-15 2z" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ChatFlotante;
