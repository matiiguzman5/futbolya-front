import React, { useEffect, useState } from 'react';
import '../assets/styles/home.css';
import { Link } from 'react-router-dom';

const Home = () => {
  const [reservas, setReservas] = useState([]);
  const [paginaActual, setPaginaActual] = useState(1);
  const [busqueda, setBusqueda] = useState('');
  const reservasPorPagina = 4;

  const usuario = JSON.parse(localStorage.getItem('usuario'));
  const esAdmin = usuario?.rol === 'administrador';
  const esEstablecimiento = usuario?.rol === 'establecimiento';

  useEffect(() => {
    const fetchReservas = async () => {
      const token = localStorage.getItem('token');
      const res = await fetch('https://localhost:7055/api/reservas/disponibles', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setReservas(data);
    };

    fetchReservas();
  }, []);

  const reservasFiltradas = reservas.filter(reserva =>
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

      alert('¡Te uniste a la reserva!');
      window.location.reload();
    } catch (error) {
      alert('Hubo un error al unirse');
    }
  };

const cerrarSesion = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('usuario');
  window.location.href = '/login';
};


  return (
    <div className="home-wrapper">
      <div className="home-content">
        <header className="home-header">
  <div className="header-left">
  <Link to="/Home">
    <img src="/IconoFYa.jpeg" alt="Logo" className="logo" />
  </Link>
</div>
  <nav className="header-center">
    <a href="#">Cambiar</a>
    <a href="#">Sedes</a>
    <Link to="/perfil">Perfil</Link>
    {esAdmin && <Link to="/admin-usuarios">Administrar</Link>}
    {esEstablecimiento && <Link to="/abm-canchas">Administrar Canchas</Link>}
    {usuario?.rol !== 'establecimiento' && <Link to="/mis-reservas">Mis Reservas</Link>}
  </nav>
  <div className="header-right">
    <button className="btnlogout" onClick={cerrarSesion}>Cerrar sesión</button>
  </div>
</header>



        <div className="home-search">
          <div className="search-container">
            <input
              type="text"
              placeholder="Buscar por nombre o ubicación..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
        </div>


        <div className="crear-reserva-container">
          <Link to="/crear-reserva" className="btn-crear-reserva">
            Crear Reserva
          </Link>
        </div>

        

        <h3 style={{ textAlign: 'center' }}>Reservas Disponibles</h3>

        <div className="partidos-grid">
          {reservasPaginadas.length === 0 ? (
            <p style={{ textAlign: 'center', marginTop: '20px' }}>No hay reservas disponibles.</p>
          ) : (
            reservasPaginadas.map((reserva) => (
              <div key={reserva.id} className="reserva-card">
                <img src="/cancha.jpg" alt="Cancha" />
                <div className="info">
                  <strong>{reserva.nombreCancha} ({reserva.tipo})</strong>
                  <p>Ubicación: {reserva.ubicacion}</p>
                  <p>Fecha: {new Date(reserva.fechaHora).toLocaleString('es-AR')}</p>
                  <p>Jugadores: {reserva.anotados} / {reserva.capacidad}</p>
                  <p>Observaciones: {reserva.observaciones || 'Ninguna'}</p>
                  <p>Estado de Pago: {reserva.estadoPago}</p>

                  {usuario?.rol === 'jugador' && reserva.anotados < reserva.capacidad && (
                    <button onClick={() => manejarUnirse(reserva.id)} className="btn-crear-reserva" style={{ marginTop: '10px' }}>
                      Unirse
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

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

      <footer className="home-footer">
        <p>© 2024 FutbolYa</p>
        <div className="footer-links">
          <a href="#">CONTACTO</a>
          <a href="#">AYUDA</a>
          <a href="#">SOBRE NOSOTROS</a>
          <a href="#">MÉTODOS DE PAGO</a>
        </div>
        <div className="footer-icons">
          <span>📘</span>
          <span>🐦</span>
          <span>📸</span>
        </div>
      </footer>
    </div>
  );
};

export default Home;
