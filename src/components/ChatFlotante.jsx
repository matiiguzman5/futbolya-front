import React, { useEffect, useState, useRef } from "react";
import { HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
import "../assets/styles/chatflotante.css";
import { API_URL, SIGNALR_URL } from "../config";

const ChatFlotante = ({ reservaId, onClose }) => {
  const [connection, setConnection] = useState(null);
  const [mensajes, setMensajes] = useState([]);
  const [nuevoMensaje, setNuevoMensaje] = useState("");
  const [puedeChatear, setPuedeChatear] = useState(false);

  const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");
  const token = localStorage.getItem("token");
  const chatRef = useRef(null);

  // 1) Verificar si el usuario está inscripto en la reserva
  useEffect(() => {
    const verificarInscripcion = async () => {
      if (!token || !reservaId) return;

      try {
        const res = await fetch(
          `${API_URL}/reservas/${reservaId}/esta-inscripto`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!res.ok) {
          setPuedeChatear(false);
          return;
        }

        const data = await res.json();
        setPuedeChatear(data === true);
      } catch (err) {
        console.error("Error verificando inscripción:", err);
        setPuedeChatear(false);
      }
    };

    verificarInscripcion();
  }, [reservaId, token]);

  // 2) Traer mensajes previos de la reserva
  useEffect(() => {
    const fetchMensajesPrevios = async () => {
      if (!token || !reservaId) return;

      try {
        const res = await fetch(
          `${API_URL}/mensajes/reserva/${reservaId}`,
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

  // 3) Conectar con SignalR, unirse al grupo y escuchar mensajes nuevos
  useEffect(() => {
    if (!puedeChatear || !token || !reservaId) return;

    let conn; // importante: usar variable local para el cleanup

    const connect = async () => {
      try {
        conn = new HubConnectionBuilder()
          .withUrl(SIGNALR_URL, {
            accessTokenFactory: () => token,
          })
          .configureLogging(LogLevel.Information)
          .withAutomaticReconnect()
          .build();

        // Cuando llega un mensaje desde el servidor
        conn.on("RecibirMensaje", (usuarioNombre, contenido, fecha) => {
          console.log("📥 Recibido:", usuarioNombre, contenido);
          setMensajes((prev) => [
            ...prev,
            {
              usuario: { nombre: usuarioNombre },
              contenido,
              fecha: fecha || new Date().toISOString(),
            },
          ]);
        });

        // Si se reconecta, nos volvemos a unir al grupo de esta reserva
        conn.onreconnected(async () => {
          console.log("🔁 Reconectado. Volviendo a unirse al grupo...");
          try {
            await conn.invoke("UnirseAReserva", reservaId.toString());
          } catch (err) {
            console.error("Error al re-unirse al grupo:", err);
          }
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

    // Cleanup: salir del grupo y cerrar conexión
    return () => {
      if (conn) {
        conn
          .invoke("SalirDeReserva", reservaId.toString())
          .catch(() => {});
        conn.stop().catch(() => {});
      }
    };
  }, [reservaId, puedeChatear, token]);

  // 4) Enviar mensaje por SignalR
  const enviarMensaje = async () => {
    const texto = nuevoMensaje.trim();
    if (!texto) return;

    if (!connection) {
      console.error("❌ No hay conexión activa con SignalR");
      return;
    }

    try {
      console.log("📤 Enviando mensaje:", texto);

      // IMPORTANTE: estos parámetros deben coincidir con la firma del Hub:
      // public async Task EnviarMensaje(string reservaId, string usuarioNombre, string contenido)
      await connection.invoke(
        "EnviarMensaje",
        reservaId.toString(),
        usuario.nombre || "",
        texto
      );

      setNuevoMensaje("");
      console.log("✅ Mensaje enviado al hub correctamente");
    } catch (err) {
      console.error("Error al enviar mensaje con SignalR:", err);
      alert("No se pudo enviar el mensaje. El servidor devolvió un error.");
    }
  };

  // 5) Auto scroll hacia el último mensaje
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
          onKeyDown={(e) =>
            e.key === "Enter" && puedeChatear && enviarMensaje()
          }
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
