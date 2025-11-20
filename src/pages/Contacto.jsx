import React, { useState } from "react";
import "../assets/styles/home.css";
import Layout from '../components/Layout';

const Contacto = () => {
  const [form, setForm] = useState({
    nombre: "",
    email: "",
    tipo: "soporte",
    mensaje: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Acá después podés integrar con tu API
    alert("¡Gracias por escribirnos! Nos vamos a contactar a la brevedad.");
    setForm({ nombre: "", email: "", tipo: "soporte", mensaje: "" });
  };

  return (
    <div className="home-wrapper page-shell">


      <div className="home-content">
        <h1 style={{ textAlign: "center" }}>Contacto</h1>
        <p style={{ textAlign: "center", color: "var(--color-muted)" }}>
          Si tenés dudas sobre reservas, canchas o tu cuenta de FutbolYa,
          completá el formulario y te respondemos a la brevedad.
        </p>

        {/* Uso la misma grilla de tarjetas que en Home */}
        <div className="partidos-grid">
          <div className="reserva-card">
            <div className="info">
              <h2 style={{ marginBottom: "4px" }}>Escribinos</h2>

              <form
                onSubmit={handleSubmit}
                style={{ display: "flex", flexDirection: "column", gap: "12px" }}
              >
                <div>
                  <label>Nombre y apellido</label>
                  <input
                    type="text"
                    name="nombre"
                    value={form.nombre}
                    onChange={handleChange}
                    placeholder="Ej: Juan Pérez"
                    style={{
                      width: "100%",
                      marginTop: "4px",
                      padding: "10px 12px",
                      borderRadius: "8px",
                      border: "1px solid rgba(148, 163, 184, 0.8)",
                      background: "var(--color-bg)",
                      color: "var(--color-text)",
                    }}
                    required
                  />
                </div>

                <div>
                  <label>Correo electrónico</label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="tu@mail.com"
                    style={{
                      width: "100%",
                      marginTop: "4px",
                      padding: "10px 12px",
                      borderRadius: "8px",
                      border: "1px solid rgba(148, 163, 184, 0.8)",
                      background: "var(--color-bg)",
                      color: "var(--color-text)",
                    }}
                    required
                  />
                </div>

                <div>
                  <label>Tipo de consulta</label>
                  <select
                    name="tipo"
                    value={form.tipo}
                    onChange={handleChange}
                    style={{
                      width: "100%",
                      marginTop: "4px",
                      padding: "10px 12px",
                      borderRadius: "8px",
                      border: "1px solid rgba(148, 163, 184, 0.8)",
                      background: "var(--color-bg)",
                      color: "var(--color-text)",
                    }}
                  >
                    <option value="soporte">Soporte técnico</option>
                    <option value="reservas">Reservas y canchas</option>
                    <option value="pagos">Pagos y facturación</option>
                    <option value="otros">Otros</option>
                  </select>
                </div>

                <div>
                  <label>Mensaje</label>
                  <textarea
                    name="mensaje"
                    rows={5}
                    value={form.mensaje}
                    onChange={handleChange}
                    placeholder="Contanos en qué te podemos ayudar…"
                    style={{
                      width: "100%",
                      marginTop: "4px",
                      padding: "10px 12px",
                      borderRadius: "8px",
                      border: "1px solid rgba(148, 163, 184, 0.8)",
                      background: "var(--color-bg)",
                      color: "var(--color-text)",
                      resize: "vertical",
                    }}
                    required
                  />
                </div>

                <button type="submit" className="btn-crear-reserva">
                  Enviar mensaje
                </button>
              </form>
            </div>
          </div>

          <div className="reserva-card">
            <div className="info">
              <h2>Otras vías de contacto</h2>
              <p>
                <strong>Email soporte:</strong> soporte@futbolya.com
              </p>
              <p>
                <strong>WhatsApp:</strong> +54 11 0000-0000
              </p>
              <p>
                <strong>Horarios de atención:</strong> Lunes a viernes de 9 a
                20 hs.
              </p>
              <p>
                <strong>Respuesta promedio:</strong> dentro de las 24 hs hábiles.
              </p>
            </div>
          </div>
        </div>
      </div>

     
    </div>
  );
};

export default Contacto;
