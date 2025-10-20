import React, { useEffect, useState } from 'react';
import '../assets/styles/home.css';
import { Link } from 'react-router-dom';

const Home = () => {
  const [reservas, setReservas] = useState([]);
  const [paginaActual, setPaginaActual] = useState(1);
  const [busqueda, setBusqueda] = useState('');
  const reservasPorPagina = 4;

  const usuario = JSON.parse(localStorage.getItem('usuario'));

  useEffect(() => {
    const fetchReservas = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await fetch('https://localhost:7055/api/reservas/disponibles', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!res.ok) {
          console.error('Error al obtener reservas:', res.status);
          return;
        }

        const data = await res.json();
        setReservas(data);
      } catch (error) {
        console.error('Error en fetchReservas:', error);
      }
    };

    fetchReservas();
  }, []);

  const reservasFiltradas = reservas.filter((reserva) =>
    reserva.nombreCancha?.toLowerCase().includes(busqueda.toLowerCase()) ||
    reserva.ubicacion?.toLowerCase().includes(busqueda.toLowerCase())
  );

  const totalPaginas = Math.ceil(reservasFiltradas.length / reservasPorPagina);
  const indexInicio = (paginaActual - 1) * reservasPorPagina;
  const indexFin = indexInicio + reservasPorPagina;
  const reservasPaginadas = reservasFiltradas.slice(indexInicio, indexFin);

  const manejarUnirse = async (reservaId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`https://localhost:7055/api/reservas/${reservaId}/unirse`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) {
        const err = await res.text();
        alert(`Error: ${err}`);
        return;
      }

      alert('Te uniste a la reserva.');
      window.location.reload();
    } catch (error) {
      alert('Hubo un error al unirse.');
    }
  };

  return (
    <div className="home-wrapper page-shell">
      <div className="home-content">
        {/* Buscador */}
        <div className="home-search">
          <div className="search-container">
            <input
              type="text"
              placeholder="Buscar por nombre o ubicacion..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
        </div>

<<<<<<< HEAD
        {/* Botón Crear Reserva (solo si el usuario NO es establecimiento) */}
          {localStorage.getItem('rol') !== 'establecimiento' && (
            <div className="crear-reserva-container">
              <Link to="/crear-reserva" className="btn-crear-reserva">
                Crear Reserva
              </Link>
            </div>
        )}

        {/* Botón Adm Canchas (solo si es establecimiento) */}
          {localStorage.getItem('rol') === 'establecimiento' && (
            <div className="crear-reserva-container">
              <Link to="/abm-canchas" className="btn-crear-reserva">
                Administrar Canchas
              </Link>
            </div>
        )}
=======
        {/* Boton Crear Reserva */}
        <div className="crear-reserva-container">
          <Link to="/crear-reserva" className="btn-crear-reserva">
            Crear Reserva
          </Link>
        </div>
>>>>>>> fork/main

        <h3 style={{ textAlign: 'center' }}>Reservas Disponibles</h3>

        {/* Lista de reservas */}
        <div className="partidos-grid">
          {reservasPaginadas.length === 0 ? (
            <p style={{ textAlign: 'center', marginTop: '20px' }}>
              No hay reservas disponibles.
            </p>
          ) : (
            reservasPaginadas.map((reserva) => (
              <div key={reserva.id} className="reserva-card">
                <img src="/cancha.jpg" alt="Cancha" />
                <div className="info">
                  <strong>
                    {reserva.nombreCancha} ({reserva.tipo})
                  </strong>
                  <p>Ubicacion: {reserva.ubicacion}</p>
                  <p>Fecha: {new Date(reserva.fechaHora).toLocaleString('es-AR')}</p>
                  <p>Jugadores: {reserva.anotados} / {reserva.capacidad}</p>
                  <p>Observaciones: {reserva.observaciones || 'Ninguna'}</p>
                  <p>Estado de Pago: {reserva.estadoPago}</p>

                  {usuario?.rol === 'jugador' && (
                    reserva.yaEstoyUnido ? (
                      <p style={{ color: 'green', marginTop: '10px' }}>
                        ✅ Ya estás unido a esta reserva
                      </p>
                    ) : (
                      reserva.anotados < reserva.capacidad && (
                        <button
                          onClick={() => manejarUnirse(reserva.id)}
                          className="btn-crear-reserva"
                          style={{ marginTop: '10px' }}
                        >
                          Unirse
                        </button>
                      )
                    )
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Paginacion */}
        <div className="paginacion">
          {[...Array(totalPaginas)].map((_, i) => (
            <button
              key={i}
              className={paginaActual === i + 1 ? 'activo' : ''}
              onClick={() => setPaginaActual(i + 1)}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;

