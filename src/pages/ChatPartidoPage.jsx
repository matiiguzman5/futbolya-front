import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../assets/styles/chat.css";

const ChatPartidoPage = () => {
  const { id } = useParams(); // id del partido en la URL
  const [mensajes, setMensajes] = useState([]);
  const [nuevoMensaje, setNuevoMensaje] = useState("");
  const token = localStorage.getItem("token");
  const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");
  const navigate = useNavigate();
  const chatRef = useRef(null);

  // === Cargar mensajes y refrescar cada 10 segundos ===
  useEffect(() => {
    if (!id) return;

    const fetchMensajes = async () => {
      try {
        const res = await fetch(`https://localhost:7055/api/mensajes/partido/${id}`, {
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
  }, [id, token]);

const enviarMensaje = async () => {
  if (!nuevoMensaje.trim()) return;
  try {
    const res = await fetch("https://localhost:7055/api/mensajes", {
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


  // === Auto-scroll al último mensaje ===
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [mensajes]);

  return (
    <div className="chat-page">
      <div className="chat-header">
        <button className="btn-volver" onClick={() => navigate(-1)}>
          ← Volver
        </button>
        <h2>💬 Chat del partido #{id}</h2>
      </div>

      <div className="chat-mensajes" ref={chatRef}>
        {mensajes.length === 0 ? (
          <p className="chat-vacio">Aún no hay mensajes.</p>
        ) : (
          mensajes.map((m) => (
            <div
              key={m.id}
              className={`chat-mensaje ${
                m.usuarioId === usuario.id ? "mio" : "otro"
              }`}
            >
              <strong>{m.usuario?.nombre || "Jugador"}:</strong> {m.contenido}
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
          onKeyDown={(e) => e.key === "Enter" && enviarMensaje()}
        />
        <button onClick={enviarMensaje}>Enviar</button>
      </div>
    </div>
  );
};

export default ChatPartidoPage;
