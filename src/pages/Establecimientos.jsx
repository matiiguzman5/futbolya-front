import React, { useEffect, useState } from "react";
import "../assets/styles/home.css";

const formatCurrency = (value) => {
  if (value === null || value === undefined) {
    return "No especificado";
  }
  const number = Number(value);
  if (!Number.isFinite(number)) {
    return "No especificado";
  }
  return `$${number.toLocaleString('es-AR')}`;
};

const Establecimientos = () => {
  const [establecimientos, setEstablecimientos] = useState([]);
  const [selectedEstablecimiento, setSelectedEstablecimiento] = useState(null);

  useEffect(() => {
    const fetchEstablecimientos = async () => {
      try {
        const res = await fetch('https://localhost:7055/api/usuarios/establecimientos');

        if (!res.ok) {
          console.error('Error al cargar los establecimientos', res.status);
          return;
        }

        const data = await res.json();
        setEstablecimientos(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error de red al cargar establecimientos:', error);
      }
    };

    fetchEstablecimientos();
  }, []);

  useEffect(() => {
    if (!selectedEstablecimiento) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setSelectedEstablecimiento(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedEstablecimiento]);

  const contarPorTipo = (canchas = [], tipo) =>
    canchas.filter((cancha) => cancha.tipo === tipo).length;

  const handleOpenModal = (establecimiento) => {
    setSelectedEstablecimiento(establecimiento);
  };

  const handleCloseModal = () => {
    setSelectedEstablecimiento(null);
  };

  return (
    <div className="home-wrapper page-shell">
      <div className="home-content">
        <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>
          Establecimientos disponibles
        </h2>

        <div className="partidos-grid">
          {establecimientos.length === 0 ? (
            <p style={{ textAlign: 'center', marginTop: '20px' }}>
              No hay establecimientos disponibles.
            </p>
          ) : (
            establecimientos.map((establecimiento) => (
              <div key={establecimiento.id} className="reserva-card">
                <img
                  src={establecimiento.fotoPerfil || '/cancha.jpg'}
                  alt="Establecimiento"
                />
                <div className="info">
                  <strong>{establecimiento.nombre}</strong>
                  <p>Correo: {establecimiento.correo}</p>
                  <p>Teléfono: {establecimiento.telefono || "No informado"}</p>
                  <p>Ubicación: {establecimiento.ubicacion || "No informada"}</p>


                  <p>
                    Canchas:
                    <span style={{ marginLeft: '5px' }}>
                      F5: {contarPorTipo(establecimiento.canchas, 'F5')}
                    </span>
                    <span style={{ marginLeft: '10px' }}>
                      F7: {contarPorTipo(establecimiento.canchas, 'F7')}
                    </span>
                    <span style={{ marginLeft: '10px' }}>
                      F11: {contarPorTipo(establecimiento.canchas, 'F11')}
                    </span>
                  </p>

                  <button
                    type="button"
                    className="btn-crear-reserva"
                    style={{ marginTop: '10px', display: 'inline-block' }}
                    onClick={() => handleOpenModal(establecimiento)}
                    aria-haspopup="dialog"
                  >
                    Ver más
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {selectedEstablecimiento && (
        <div className="est-modal-overlay" onClick={handleCloseModal}>
          <div
            className="est-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="establecimiento-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="est-modal__header">
              <h3 id="establecimiento-modal-title">{selectedEstablecimiento.nombre}</h3>
              <button
                type="button"
                className="est-modal__close"
                onClick={handleCloseModal}
                aria-label="Cerrar detalle"
              >
                &times;
              </button>
            </div>
            <p className="est-modal__description">
              {selectedEstablecimiento.descripcion || 'Sin descripcion general disponible.'}
            </p>
            <div className="est-modal__contact">
              <span>Correo: {selectedEstablecimiento.correo}</span>
              <span>Telefono: {selectedEstablecimiento.telefono || 'No informado'}</span>
            </div>
            <div className="est-modal__canchas">
              <h4>Canchas disponibles</h4>
              {Array.isArray(selectedEstablecimiento.canchas) && selectedEstablecimiento.canchas.length > 0 ? (
                <ul className="est-modal__cancha-list">
                  {selectedEstablecimiento.canchas.map((cancha) => (
                    <li key={cancha.id || cancha.nombre} className="est-modal__cancha">
                      <div className="est-modal__cancha-header">
                        <span className="est-modal__cancha-name">{cancha.nombre}</span>
                        {cancha.tipo ? (
                          <span className="est-modal__badge">{cancha.tipo}</span>
                        ) : null}
                      </div>
                      <p className="est-modal__cancha-description">
                        {cancha.descripcion || 'Sin descripcion disponible.'}
                      </p>
                      <div className="est-modal__cancha-meta">
                        <span>Superficie: {cancha.superficie || 'No informada'}</span>
                        <span>Estado: {cancha.estado || 'No informado'}</span>
                      </div>
                      <div className="est-modal__cancha-meta">
                        <span>Precio base: {formatCurrency(cancha.precioBaseHora)}</span>
                        <span>Fin de semana: {formatCurrency(cancha.precioFinDeSemana)}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="est-modal__empty">
                  Todavia no se registran canchas para este establecimiento.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Establecimientos;

