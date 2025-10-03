import React, { useEffect, useState } from "react";
import "../assets/styles/home.css";
import { Link } from "react-router-dom";

const Establecimientos = () => {
  const [establecimientos, setEstablecimientos] = useState([]);

  useEffect(() => {
    const fetchEstablecimientos = async () => {
      try {
        const res = await fetch("https://localhost:7055/api/usuarios/establecimientos");

        if (!res.ok) {
          console.error("Error al cargar los establecimientos", res.status);
          return;
        }

        const data = await res.json();
        setEstablecimientos(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error de red al cargar establecimientos:", error);
      }
    };

    fetchEstablecimientos();
  }, []);

  const contarPorTipo = (canchas = [], tipo) =>
    canchas.filter((cancha) => cancha.tipo === tipo).length;

  return (
    <div className="home-wrapper">
      <div className="home-content">
        <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
          Establecimientos disponibles
        </h2>

        <div className="partidos-grid">
          {establecimientos.length === 0 ? (
            <p style={{ textAlign: "center", marginTop: "20px" }}>
              No hay establecimientos disponibles.
            </p>
          ) : (
            establecimientos.map((establecimiento) => (
              <div key={establecimiento.id} className="reserva-card">
                <img
                  src={establecimiento.fotoPerfil || "/cancha.jpg"}
                  alt="Establecimiento"
                />
                <div className="info">
                  <strong>{establecimiento.nombre}</strong>
                  <p>Correo: {establecimiento.correo}</p>
                  <p>Telefono: {establecimiento.telefono || "No informado"}</p>

                  <p>
                    Canchas:
                    <span style={{ marginLeft: "5px" }}>
                      F5: {contarPorTipo(establecimiento.canchas, "F5")}
                    </span>
                    <span style={{ marginLeft: "10px" }}>
                      F7: {contarPorTipo(establecimiento.canchas, "F7")}
                    </span>
                    <span style={{ marginLeft: "10px" }}>
                      F11: {contarPorTipo(establecimiento.canchas, "F11")}
                    </span>
                  </p>

                  <Link
                    to={`/establecimientos/${establecimiento.id}`}
                    className="btn-crear-reserva"
                    style={{ marginTop: "10px", display: "inline-block" }}
                  >
                    Ver mas
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Establecimientos;
