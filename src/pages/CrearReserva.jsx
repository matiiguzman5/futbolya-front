import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../assets/styles/crearReserva.css';

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

  // 🔹 Traer establecimientos
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

  // 🔹 Generar próximos 5 días
  useEffect(() => {
    const hoy = new Date();
    const opciones = [];
    for (let i = 0; i < 5; i++) {
      const d = new Date(hoy);
      d.setDate(hoy.getDate() + i);
      opciones.push({
        fecha: d.toISOString().split("T")[0], // YYYY-MM-DD
        label: i === 0 ? "Hoy" : i === 1 ? "Mañana" : d.toLocaleDateString('es-ES', { weekday: 'long' })
      });
    }
    setDias(opciones);
  }, []);

  // 🔹 Generar horas (09:00 a 23:00)
  const generarHoras = () => {
    const horas = [];
    for (let h = 9; h <= 23; h++) {
      horas.push(`${h.toString().padStart(2, '0')}:00`);
    }
    return horas;
  };

  // 🔹 Traer canchas disponibles
  const fetchCanchasDisponibles = async (id, fechaHora) => {
    try {
      const res = await fetch(
        `https://localhost:7055/api/Canchas/de/${id}/disponibles?fechaHora=${fechaHora}`
      );
      const data = await res.json();
      setCanchas(data || []); // solo las libres entran acá
    } catch (error) {
      console.error('Error al obtener canchas disponibles:', error);
    }
  };


  // 🔹 Confirmar reserva
const handleSubmit = async () => {
  // Convertir la fecha/hora seleccionada a objeto Date
  const fechaSeleccionada = new Date(`${diaSeleccionado}T${horaSeleccionada}:00`);

  const payload = {
    canchaId: parseInt(canchaId),
    fechaHora: fechaSeleccionada.toISOString(),
    observaciones,
    clienteNombre: usuario.nombre,
    clienteTelefono: usuario.telefono || 'No informado',
    clienteEmail: usuario.Correo,
    estadoPago: 'pendiente',
    esFrecuente: false
  };

  try {
    const res = await fetch('https://localhost:7055/api/Reservas', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
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
      <h3>Elegí un establecimiento</h3>
      <div className="cards">
        {establecimientos.map((est) => (
          <div
            key={est.id}
            className="card"
            onClick={() => {
              setEstablecimientoId(est.id);
              setStep(2);
            }}
          >
            <img src={est.fotoPerfil || '/default-club.jpg'} alt="foto" />
            <h4>{est.nombre}</h4>
            <p>{est.correo}</p>
            <p>Ubicación: {est.ubicacion || "No informada"}</p>
            <p>Canchas: {est.canchas.length}</p>
          </div>
        ))}
      </div>
    </div>
  );

  // Paso 2: Fecha y hora
  const PasoFechaHora = () => (
    <div>
      <h3>Elegí la fecha y hora</h3>

      {/* Botones de días */}
      <div className="nav-buttons">
        {dias.map((d) => (
          <button
            key={d.fecha}
            className={`btn-next ${diaSeleccionado === d.fecha ? "active" : ""}`}
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
              className={`hora-btn ${horaSeleccionada === hora ? "active" : ""}`}
              onClick={() => setHoraSeleccionada(hora)}
            >
              {hora}
            </button>
          ))}
        </div>
      )}

      {/* Navegación */}
      <div className="nav-buttons">
        <button className="btn-back" onClick={() => setStep(1)}>← Atrás</button>
        <button
          className="btn-next"
          onClick={() => {
            const fechaHora = `${diaSeleccionado}T${horaSeleccionada}`;
            fetchCanchasDisponibles(establecimientoId, fechaHora); // 👈 acá pedís solo libres
            setFechaHora(fechaHora);
            setStep(3);
          }}
          disabled={!diaSeleccionado || !horaSeleccionada}
        >
          Siguiente →
        </button>
      </div>
    </div>
  );

  // Paso 3: Cancha
  const PasoCancha = () => (
    <div>
      <h3>Elegí la cancha</h3>
      <div className="cards">
        {canchas.map((c) => (
          <div
            key={c.id}
            className="card"
            onClick={() => {
              setCanchaId(c.id);
              setStep(4);
            }}
          >
            <h4>{c.nombre}</h4>
            <p>{c.tipo} - {c.superficie}</p>
            <p>Precio: ${c.precio}</p>
          </div>
        ))}
      </div>
      <div className="nav-buttons">
        <button className="btn-back" onClick={() => setStep(2)}>← Atrás</button>
      </div>
    </div>
  );

  // Paso 4: Confirmar
  const PasoConfirmar = () => (
    <div>
      <h3>Confirmar reserva</h3>
      <p><b>Establecimiento:</b> {establecimientos.find(e => e.id === parseInt(establecimientoId))?.nombre}</p>
      <p><b>Fecha y hora:</b> {fechaHora}</p>
      <p><b>Cancha:</b> {canchas.find(c => c.id === parseInt(canchaId))?.nombre}</p>
      <textarea
        placeholder="Observaciones"
        value={observaciones}
        onChange={(e) => setObservaciones(e.target.value)}
      />
      <div className="nav-buttons">
        <button className="btn-back" onClick={() => setStep(3)}>← Atrás</button>
        <button className="btn-confirm" onClick={handleSubmit}>Confirmar ✅</button>
      </div>
    </div>
  );

  return (
    <div className="crear-reserva-container">
      <h2>Crear Nueva Reserva</h2>
      {step === 1 && <PasoEstablecimiento />}
      {step === 2 && <PasoFechaHora />}
      {step === 3 && <PasoCancha />}
      {step === 4 && <PasoConfirmar />}
      {/*<button className="btn-volver" onClick={() => navigate('/home')}>
        ← Volver al Home
      </button>*/}
    </div>
  );
};

export default CrearReserva;
