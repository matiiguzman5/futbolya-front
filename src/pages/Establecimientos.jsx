import React, { useEffect, useState } from "react";
import "../assets/styles/home.css"; // reutilizamos estilos
import { Link } from "react-router-dom";

const Establecimientos = () => {
  const [establecimientos, setEstablecimientos] = useState([]);

  useEffect(() => {
    const fetchEstablecimientos = async () => {
      try {
        const res = await fetch("https://localhost:7055/api/usuarios/establecimientos"); 
        // 👆 nuevo endpoint del backend
        if (!res.ok) {
          console.error("Error al cargar los establecimientos");
          return;
        }
        const data = await res.json();
        setEstablecimientos(data);
      } catch (error) {
        console.error("Error de red:", error);
      }
    };

    fetchEstablecimientos();
  }, []);

  // Función auxiliar para contar canchas por tipo
  const contarPorTipo = (canchas, tipo) => {
    return canchas.filter(c => c.tipo === tipo).length;
  };

  return (
    <div className="home-wrapper">
      <div className="home-content">
        <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
          Establecimientos Disponibles
        </h2>

        <div className="partidos-grid">
          {establecimientos.length === 0 ? (
            <p style={{ textAlign: "center", marginTop: "20px" }}>
              No hay establecimientos disponibles.
            </p>
          ) : (
            establecimientos.map((e) => (
              <div key={e.id} className="reserva-card">
                <img
                  src={e.fotoPerfil || "/cancha.jpg"}
                  alt="Establecimiento"
                />
                <div className="info">
                  <strong>{e.nombre}</strong>
                  <p>Correo: {e.correo}</p>
                  <p>Teléfono: {e.telefono || "No informado"}</p>

                  {/* Totales por tipo */}
                  <p>
                    Canchas:  
                    <span style={{ marginLeft: "5px" }}>F5: {contarPorTipo(e.canchas, "F5")}</span> |  
                    <span style={{ marginLeft: "5px" }}>F7: {contarPorTipo(e.canchas, "F7")}</span> |  
                    <span style={{ marginLeft: "5px" }}>F11: {contarPorTipo(e.canchas, "F11")}</span>
                  </p>

                  <Link
                    to={`/establecimientos/${e.id}`}
                    className="btn-crear-reserva"
                    style={{ marginTop: "10px", display: "inline-block" }}
                  >
                    Ver más
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
