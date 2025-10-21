import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../assets/styles/crearReserva.css';
import '../assets/styles/home.css';

const CrearReserva = () => {
  const [step, setStep] = useState(1);

  const [establecimientos, setEstablecimientos] = useState([]);
  const [establecimientoId, setEstablecimientoId] = useState('');
  const [canchas, setCanchas] = useState([]);
  const [canchaId, setCanchaId] = useState('');
  const [fechaHora, setFechaHora] = useState('');
  const [observaciones, setObservaciones] = useState('');

  const [dias, setDias] = useState([]);
  const [diaSeleccionado, setDiaSeleccionado] = useState('');
  const [horaSeleccionada, setHoraSeleccionada] = useState('');

  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const usuario = JSON.parse(localStorage.getItem('usuario'));

  // Traer establecimientos
  useEffect(() => {
    const fetchEstablecimientos = async () => {
      try {
        const res = await fetch('https://localhost:7055/api/Usuarios/establecimientos');
        const data = await res.json();
        setEstablecimientos(data || []);
      } catch (error) {
        console.error('Error al obtener establecimientos:', error);
      }
    };
    fetchEstablecimientos();
  }, []);

  // Generar proximos 5 dias
  useEffect(() => {
    const hoy = new Date();
    const opciones = [];
    for (let i = 0; i < 5; i++) {
      const d = new Date(hoy);
      d.setDate(hoy.getDate() + i);
      opciones.push({
        fecha: d.toISOString().split('T')[0],
        label: i === 0 ? 'Hoy' : i === 1 ? 'Manana' : d.toLocaleDateString('es-ES', { weekday: 'long' }),
      });
    }
    setDias(opciones);
  }, []);

  // Generar horas (09:00 a 23:00)
  const generarHoras = () => {
    const horas = [];
    for (let h = 9; h <= 23; h++) {
      horas.push(`${h.toString().padStart(2, '0')}:00`);
    }
    return horas;
  };

  // Traer canchas disponibles
  const fetchCanchasDisponibles = async (id, fechaHoraSeleccionada) => {
    try {
      const res = await fetch(
        `https://localhost:7055/api/Canchas/de/${id}/disponibles?fechaHora=${fechaHoraSeleccionada}`
      );
      const data = await res.json();
      setCanchas(data || []); // Solo se muestran las canchas libres
    } catch (error) {
      console.error('Error al obtener canchas disponibles:', error);
    }
  };

  const formatPrecio = (valor) => {
    if (valor === undefined || valor === null) {
      return 'No informado';
    }

    const numero = Number(valor);
    if (Number.isNaN(numero)) {
      return valor;
    }

    return `$${numero.toLocaleString('es-AR')}`;
  };


  // Confirmar reserva
  const handleSubmit = async () => {
    const fechaSeleccionada = new Date(`${diaSeleccionado}T${horaSeleccionada}:00`);

    const payload = {
      canchaId: parseInt(canchaId, 10),
      fechaHora: fechaSeleccionada.toISOString(),
      observaciones,
      clienteNombre: usuario.nombre,
      clienteTelefono: usuario.telefono || 'No informado',
      clienteEmail: usuario.Correo,
      estadoPago: 'pendiente',
      esFrecuente: false,
    };

    try {
      const res = await fetch('https://localhost:7055/api/Reservas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.text();
        alert(`Error: ${err}`);
        return;
      }

      alert('Reserva creada correctamente');
      navigate('/home');
    } catch (error) {
      console.error('Error al crear reserva:', error);
    }
  };

  // Paso 1: Establecimiento
  const PasoEstablecimiento = () => (
    <div>
      <h3>Elige un establecimiento</h3>
      {establecimientos.length === 0 ? (
        <p style={{ textAlign: 'center', marginTop: '20px' }}>
          No hay establecimientos disponibles.
        </p>
      ) : (
        <div className="partidos-grid crear-reserva-establecimientos">
          {establecimientos.map((est) => (
            <div
              key={est.id}
              className="reserva-card"
              role="button"
              tabIndex={0}
              onClick={() => {
                setEstablecimientoId(est.id);
                setStep(2);
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  setEstablecimientoId(est.id);
                  setStep(2);
                }
              }}
            >
              <img
                src={est.fotoPerfil || '/default-club.jpg'}
                alt={`Foto de ${est.nombre}`}
              />
              <div className="info">
                <strong>{est.nombre}</strong>
                <p>Correo: {est.correo}</p>
                <p>Ubicacion: {est.ubicacion || 'No informada'}</p>
                <p>Canchas registradas: {Array.isArray(est.canchas) ? est.canchas.length : 0}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
// Paso 2: Fecha y hora
  const PasoFechaHora = () => (
    <div>
      <h3>Elige la fecha y hora</h3>

      {/* Botones de dias */}
      <div className="nav-buttons">
        {dias.map((d) => (
          <button
            key={d.fecha}
            className={`btn-next ${diaSeleccionado === d.fecha ? 'active' : ''}`}
            onClick={() => {
              setDiaSeleccionado(d.fecha);
              setHoraSeleccionada('');
            }}
          >
            {d.label}
          </button>
        ))}
      </div>

      {/* Botones de horas */}
      {diaSeleccionado && (
        <div className="horas-grid">
          {generarHoras().map((hora) => (
            <button
              key={hora}
              className={`hora-btn ${horaSeleccionada === hora ? 'active' : ''}`}
              onClick={() => setHoraSeleccionada(hora)}
            >
              {hora}
            </button>
          ))}
        </div>
      )}

      {/* Navegacion */}
      <div className="nav-buttons">
        <button className="btn-back" onClick={() => setStep(1)}>Atras</button>
        <button
          className="btn-next"
          onClick={() => {
            const fechaSeleccionada = `${diaSeleccionado}T${horaSeleccionada}`;
            fetchCanchasDisponibles(establecimientoId, fechaSeleccionada); // Pedimos solo canchas disponibles
            setFechaHora(fechaSeleccionada);
            setStep(3);
          }}
          disabled={!diaSeleccionado || !horaSeleccionada}
        >
          Siguiente
        </button>
      </div>
    </div>
  );

  // Paso 3: Cancha
  const PasoCancha = () => (
    <div>
      <h3>Elige la cancha</h3>
      {canchas.length === 0 ? (
        <p style={{ textAlign: 'center', marginTop: '20px' }}>
          No hay canchas disponibles para el horario seleccionado.
        </p>
      ) : (
        <div className="partidos-grid crear-reserva-canchas">
          {canchas.map((c) => {
            const esSeleccionada = String(canchaId) === String(c.id);

            return (
              <div
                key={c.id}
                className={`reserva-card ${esSeleccionada ? 'reserva-card--selected' : ''}`}
                role="button"
                tabIndex={0}
                onClick={() => {
                  setCanchaId(c.id);
                  setStep(4);
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    setCanchaId(c.id);
                    setStep(4);
                  }
                }}
              >
                <div className="info">
                  <strong>{c.nombre}</strong>
                  <p>Tipo: {c.tipo || 'No informado'}</p>
                  <p>Superficie: {c.superficie || 'No informada'}</p>
                  <p>Precio: {formatPrecio(c.precio)}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
      <div className="nav-buttons">
        <button className="btn-back" onClick={() => setStep(2)}>Atras</button>
      </div>
    </div>
  );
// Paso 4: Confirmar
  const PasoConfirmar = () => (
    <div>
      <h3>Confirmar reserva</h3>
      <p><b>Establecimiento:</b> {establecimientos.find((e) => e.id === parseInt(establecimientoId, 10))?.nombre}</p>
      <p><b>Fecha y hora:</b> {fechaHora}</p>
      <p><b>Cancha:</b> {canchas.find((c) => c.id === parseInt(canchaId, 10))?.nombre}</p>
      <textarea
        placeholder="Observaciones"
        value={observaciones}
        onChange={(event) => setObservaciones(event.target.value)}
      />
      <div className="nav-buttons">
        <button className="btn-back" onClick={() => setStep(3)}>Atras</button>
        <button className="btn-confirm" onClick={handleSubmit}>Confirmar</button>
      </div>
    </div>
  );

  return (
    <div className="home-wrapper page-shell crear-reserva-page">
      <div className="home-content">
        <h2>Crear Nueva Reserva</h2>
        {step === 1 ? (
          <PasoEstablecimiento />
        ) : (
          <div className="crear-reserva-container">
            {step === 2 && <PasoFechaHora />}
            {step === 3 && <PasoCancha />}
            {step === 4 && <PasoConfirmar />}
          </div>
        )}
      </div>
    </div>
  );
};

export default CrearReserva;
