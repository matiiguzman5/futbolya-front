import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../assets/styles/crearReserva.css';

const CrearReserva = () => {
  const [canchas, setCanchas] = useState([]);
  const [canchaId, setCanchaId] = useState('');
  const [fechaHora, setFechaHora] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const navigate = useNavigate();

  const token = localStorage.getItem('token');
  const usuario = JSON.parse(localStorage.getItem('usuario'));

  useEffect(() => {
    const fetchCanchas = async () => {
      try {
        const res = await fetch('https://localhost:7055/api/Canchas/disponibles', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setCanchas(data || []);
      } catch (error) {
        console.error('Error al obtener canchas:', error);
      }
    };

    fetchCanchas();
  }, []);

  const filtrarCanchas = () => {
    return canchas.filter(c =>
      (c.nombre?.toLowerCase() ?? '').includes(busqueda.toLowerCase()) ||
      (c.ubicacion?.toLowerCase() ?? '').includes(busqueda.toLowerCase()) ||
      (c.estado?.toLowerCase() ?? '').includes(busqueda.toLowerCase())
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      canchaId: parseInt(canchaId),
      fechaHora: fechaHora,
      observaciones,
      clienteNombre: usuario.nombre,
      clienteTelefono: usuario.telefono || "No informado",
      clienteEmail: usuario.Correo,
      estadoPago: "pendiente",
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

      alert("Reserva creada correctamente");
      setCanchaId('');
      setFechaHora('');
      setObservaciones('');
    } catch (error) {
      console.error('Error al crear reserva:', error);
    }
  };

const manejarFecha = (e) => {
  const valor = e.target.value; // Ej: "2025-09-16T03:15"
  const [fecha, hora] = valor.split("T");
  let [horas, minutos] = hora.split(":").map(Number);

  if (minutos < 30 && minutos > 0) {
    minutos = 30;
  } else if (minutos){
    horas += 1;
    minutos = 0;
  }
  

  const horasStr = String(horas).padStart(2, "0");
  const minutosStr = String(minutos).padStart(2, "0");

  const nuevaFecha = `${fecha}T${horasStr}:${minutosStr}`;
  setFechaHora(nuevaFecha);
};


  return (
    <div className="crear-reserva-container">
      <h2>Crear Nueva Reserva</h2>

      <input
        className="buscador"
        type="text"
        placeholder="Buscar cancha por nombre, ubicación o estado"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
      />

      <form className="crear-reserva-form" onSubmit={handleSubmit}>
        <label>Cancha:</label>
        <select value={canchaId} onChange={(e) => setCanchaId(e.target.value)} required>
          <option value="">Seleccione una cancha</option>
          {filtrarCanchas().map((cancha) => (
            <option key={cancha.id} value={cancha.id}>
              {cancha.nombre} - {cancha.tipo} - {cancha.superficie}
            </option>
          ))}
        </select>

        <label>Fecha y hora:</label>
        <input
          type="datetime-local"
          value={fechaHora}
          onChange={manejarFecha}
          required
        />

        <label>Observaciones:</label>
        <textarea
          value={observaciones}
          onChange={(e) => setObservaciones(e.target.value)}
          placeholder="Opcional"
        />

        <button type="submit">Reservar</button>
        <button className="btn-volver" onClick={() => navigate('/home')}>← Volver al Home</button>
      </form>
    </div>
  );
};

export default CrearReserva;
