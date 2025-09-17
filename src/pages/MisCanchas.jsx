import React, { useEffect, useState } from 'react';
import '../assets/styles/MisCanchas.css';

const MisCanchas = () => {
  const [canchas, setCanchas] = useState([]);
  const [form, setForm] = useState(initialFormState());
  const [editandoId, setEditandoId] = useState(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    obtenerCanchas();
  }, []);

  function initialFormState() {
    return {
      nombre: '', tipo: '', superficie: '', estado: '',
      horarioApertura: '08:00', horarioCierre: '23:00',
      bloquesMantenimiento: '', diasNoDisponibles: '',
      logReparaciones: '', estadoEquipamiento: '',
      notasEspeciales: '', proximoMantenimiento: ''
    };
  }

  const obtenerCanchas = async () => {
    const res = await fetch('https://localhost:7055/api/Canchas/mis-canchas', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    setCanchas(data);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const stringToTicks = (timeStr) => {
    const [h, m] = timeStr.split(':').map(Number);
    return ((h * 60 + m) * 60 * 10000000);
  };

  const ticksToTime = (ticks) => {
    const totalMinutes = Math.floor(ticks / 600000000);
    const hours = String(Math.floor(totalMinutes / 60)).padStart(2, '0');
    const minutes = String(totalMinutes % 60).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = editandoId ? 'PUT' : 'POST';
    const url = editandoId
      ? `https://localhost:7055/api/Canchas/${editandoId}`
      : 'https://localhost:7055/api/Canchas';

    const payload = {
  ...form,
  horarioApertura: form.horarioApertura + ":00",
  horarioCierre: form.horarioCierre + ":00",
  proximoMantenimiento: form.proximoMantenimiento || null
};

    await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    setForm(initialFormState());
    setEditandoId(null);
    obtenerCanchas();
  };

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Eliminar esta cancha?')) return;
    await fetch(`https://localhost:7055/api/Canchas/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    obtenerCanchas();
  };

  const handleEditar = (cancha) => {
    setForm({
      ...cancha,
      horarioApertura: ticksToTime(cancha.horarioApertura.ticks),
      horarioCierre: ticksToTime(cancha.horarioCierre.ticks)
    });
    setEditandoId(cancha.id);
  };

  return (
    <div className="mis-canchas-container">
      <button className="volver-btn" onClick={() => window.location.href = '/home'}>
        ⬅ Volver al Home
      </button>

      <h2>Mis Canchas</h2>
{/* PASA UN ERROR QUE TIRA DE JSON OTRO DIA SE MIRA, MATI SI ESTAS LEYENDO FIJATE VOS Q SABES MAS DEL TEMA */}
      <form className="form-canchas" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="nombre">Nombre</label>
          <input
            id="nombre"
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="tipo">Tipo</label>
          <select
            id="tipo"
            name="tipo"
            value={form.tipo}
            onChange={handleChange}
            required
          >
            <option value="">-- Selecciona un tipo --</option>
            <option value="F5">Fútbol 5</option>
            <option value="F7">Fútbol 7</option>
            <option value="F11">Fútbol 11</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="superficie">Superficie</label>
          <select
            id="superficie"
            name="superficie"
            value={form.superficie}
            onChange={handleChange}
            required
          >
            <option value="">-- Selecciona una superficie --</option>
            <option value="Sintetico">Sintetico</option>
            <option value="Cesped">Cesped</option>
          </select>
        </div>
        {/* <input name="estado" value={form.estado} onChange={handleChange} placeholder="Estado" /> */}
     <div className="form-group">
        <label htmlFor="horarioApertura">Horario de apertura</label>
        <input
          type="time"
          id="horarioApertura"
          name="horarioApertura"
          value={form.horarioApertura}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="horarioCierre">Horario de cierre</label>
        <input
          type="time"
          id="horarioCierre"
          name="horarioCierre"
          value={form.horarioCierre}
          onChange={handleChange}
          required
        />
      </div>
        {/* <input type="date" name="proximoMantenimiento" value={form.proximoMantenimiento} onChange={handleChange} /> */}
        <div className="form-group">
          <label htmlFor="notasEspeciales">Notas especiales</label>
          <textarea
            id="notasEspeciales"
            name="notasEspeciales"
            value={form.notasEspeciales}
            onChange={handleChange}
           
          />
        </div>

        <div className="btns-form">
          <button type="submit" className="btn btn-crear">{editandoId ? 'Actualizar' : 'Crear'} cancha</button>
          {editandoId && (
            <button type="button" className="btn btn-cancelar" onClick={() => { setEditandoId(null); setForm(initialFormState()); }}>
              Cancelar
            </button>
          )}
        </div>
      </form>

      <div className="lista-canchas">
        {canchas.map(c => (
          <div key={c.id} className="cancha-card">
            <div>
              <strong>{c.nombre}</strong> | Tipo: {c.tipo} | Superficie: {c.superficie}<br />
              Estado: {c.estado} |  Apertura: {c.horarioApertura?.slice(0,5)} | Cierre: {c.horarioCierre?.slice(0,5)}<br />
              Próximo Mantenimiento: {c.proximoMantenimiento?.split('T')[0] || 'N/A'}<br />
              Notas: {c.notasEspeciales || 'Ninguna'}
            </div>
            <div className="acciones">
              <button className="btn btn-editar" onClick={() => handleEditar(c)}>Editar</button>
              <button className="btn btn-eliminar" onClick={() => handleEliminar(c.id)}>Eliminar</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MisCanchas;
