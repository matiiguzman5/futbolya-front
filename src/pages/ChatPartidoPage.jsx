import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../assets/styles/chat.css";
import { API_URL } from "../config";

const ChatPartidoPage = () => {
  const { id } = useParams();
  const [mensajes, setMensajes] = useState([]);
  const [nuevoMensaje, setNuevoMensaje] = useState("");
  const token = localStorage.getItem("token");
  const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");
  const navigate = useNavigate();
  const chatRef = useRef(null);

  useEffect(() => {
    if (!id) return;

    const fetchMensajes = async () => {
      try {
        const res = await fetch(`${API_URL}/mensajes/partido/${id}`, {
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
    const intervalo = setInterval(fetchMensajes, 5000);
    return () => clearInterval(intervalo);
  }, [id, token]);

  const enviarMensaje = async () => {
    if (!nuevoMensaje.trim()) return;
    try {
      const res = await fetch(`${API_URL}/mensajes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          partidoId: Number(id),
          contenido: nuevoMensaje
        })
      });

      if (res.ok) {
        const data = await res.json();
        setMensajes((prev) => [...prev, data]);
        setNuevoMensaje("");
      } else {
        const err = await res.text();
        alert("Error al enviar mensaje: " + err);
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
    <div className="chat-page">
      <div className="chat-card">
        <div className="chat-header">
          <div>
            <p className="eyebrow">Conversacion</p>
            <h2>Chat del partido #{id}</h2>
          </div>
          <button className="btn-chip" onClick={() => navigate(-1)}>
            ← Volver
          </button>
        </div>

        <div className="chat-mensajes" ref={chatRef}>
          {mensajes.length === 0 ? (
            <p className="chat-vacio">Aun no hay mensajes.</p>
          ) : (
            mensajes.map((m) => (
              <div
                key={m.id}
                className={`chat-mensaje ${
                  m.usuarioId === usuario.id ? "mio" : "otro"
                }`}
              >
                <div className="chat-mensaje__autor">{m.usuario?.nombre || "Jugador"}</div>
                <div className="chat-mensaje__texto">{m.contenido}</div>
              </div>
            ))
          )}
        </div>

        <div className="chat-input">
          <input
            type="text"
            value={nuevoMensaje}
            onChange={(e) => setNuevoMensaje(e.target.value)}
            placeholder="Escribe tu mensaje..."
            onKeyDown={(e) => e.key === "Enter" && enviarMensaje()}
          />
          <button onClick={enviarMensaje}>Enviar</button>
        </div>
      </div>
    </div>
  );
};

export default ChatPartidoPage;
