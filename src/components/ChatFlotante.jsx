import React, { useEffect, useState, useRef } from "react";
import { HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
import "../assets/styles/chatflotante.css";

const ChatFlotante = ({ reservaId, onClose }) => {
  const [connection, setConnection] = useState(null);
  const [mensajes, setMensajes] = useState([]);
  const [nuevoMensaje, setNuevoMensaje] = useState("");
  const [puedeChatear, setPuedeChatear] = useState(false);
  const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");
  const token = localStorage.getItem("token");
  const chatRef = useRef(null);

  // 🔹 1. Verificar si el usuario está inscripto
  useEffect(() => {
    const verificarInscripcion = async () => {
      try {
        const res = await fetch(
          `https://localhost:7055/api/reservas/${reservaId}/esta-inscripto`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (res.ok) {
          const data = await res.json();
          setPuedeChatear(data === true);
        } else {
          setPuedeChatear(false);
        }
      } catch (err) {
        console.error("Error verificando inscripción:", err);
        setPuedeChatear(false);
      }
    };

    verificarInscripcion();
  }, [reservaId, token]);

  // 🔹 2. Cargar mensajes previos
  useEffect(() => {
    const fetchMensajesPrevios = async () => {
      try {
        const res = await fetch(
          `https://localhost:7055/api/mensajes/reserva/${reservaId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (res.ok) {
          const data = await res.json();
          setMensajes(data);
        }
      } catch (err) {
        console.error("Error al obtener mensajes previos:", err);
      }
    };

    fetchMensajesPrevios();
  }, [reservaId, token]);

  // 🔹 3. Conectar con SignalR (solo si puede chatear)
  useEffect(() => {
    if (!puedeChatear) return;

    const connect = async () => {
      try {
        const conn = new HubConnectionBuilder()
          .withUrl("https://localhost:7055/hubs/chat", {
            accessTokenFactory: () => token,
          })
          .configureLogging(LogLevel.Information)
          .withAutomaticReconnect()
          .build();

        conn.on("RecibirMensaje", (usuarioNombre, contenido, fecha) => {
          setMensajes((prev) => [
            ...prev,
            {
              usuario: { nombre: usuarioNombre },
              contenido,
              fecha: fecha || new Date().toISOString(),
            },
          ]);
        });

        await conn.start();
        await conn.invoke("UnirseAReserva", reservaId.toString());
        setConnection(conn);
        console.log("✅ Conectado al chat de la reserva", reservaId);
      } catch (err) {
        console.error("❌ Error al conectar con SignalR:", err);
      }
    };

    connect();

    return () => {
      if (connection) {
        connection.invoke("SalirDeReserva", reservaId.toString());
        connection.stop();
      }
    };
  }, [reservaId, puedeChatear]);

  // 🔹 4. Enviar mensaje
const enviarMensaje = async () => {
  if (!nuevoMensaje.trim()) return;
  try {
    if (connection) {
      console.log("📤 Enviando mensaje:", nuevoMensaje);
      await connection.invoke(
        "EnviarMensaje",        // 🔹 Debe coincidir con el método del hub
        reservaId.toString(),
        usuario.nombre,
        nuevoMensaje
      );
      setNuevoMensaje("");
    } else {
      console.error("❌ No hay conexión activa con SignalR");
    }
  } catch (err) {
    console.error("Error al enviar mensaje:", err);
  }
};


  // 🔹 5. Auto-scroll al último mensaje
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [mensajes]);

  return (
    <div className="chat-popup">
      <div className="chat-header">
        <h4>Chat de la reserva #{reservaId}</h4>
        <button className="cerrar" onClick={onClose}>
          ✕
        </button>
      </div>

      <div className="chat-mensajes" ref={chatRef}>
        {!puedeChatear ? (
          <p className="chat-vacio">
            No podés usar el chat si no estás inscripto en esta reserva.
          </p>
        ) : mensajes.length === 0 ? (
          <p className="chat-vacio">Aún no hay mensajes.</p>
        ) : (
          mensajes.map((m, i) => (
            <div
              key={i}
              className={`mensaje ${
                m.usuario?.nombre === usuario.nombre ? "mio" : "otro"
              }`}
            >
              <div className="mensaje-header">
                <span className="nombre">{m.usuario?.nombre || "Jugador"}</span>
                <span className="hora">
                  {new Date(m.fecha).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
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
          placeholder={
            puedeChatear
              ? "Escribí un mensaje..."
              : "No podés chatear en esta reserva"
          }
          disabled={!puedeChatear}
          onKeyDown={(e) => e.key === "Enter" && puedeChatear && enviarMensaje()}
        />
        <button
          className="btn-enviar"
          onClick={enviarMensaje}
          disabled={!puedeChatear}
          style={{ opacity: puedeChatear ? 1 : 0.5 }}
        >
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
