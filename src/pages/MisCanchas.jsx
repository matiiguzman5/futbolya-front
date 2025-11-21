import React, { useEffect, useState } from 'react';
import '../assets/styles/MisCanchas.css';
import { API_URL } from "../config";

const MisCanchas = () => {
  const [canchas, setCanchas] = useState([]);
  const [form, setForm] = useState(initialFormState());
  const [editandoId, setEditandoId] = useState(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    obtenerCanchas();
    document.title = 'Mis canchas ';
  }, []);

  function initialFormState() {
    return {
      nombre: '', tipo: '', superficie: '', estado: '',
      horarioApertura: '08:00', horarioCierre: '23:00',
      bloquesMantenimiento: '', diasNoDisponibles: '',
      logReparaciones: '', estadoEquipamiento: '',
      notasEspeciales: '', proximoMantenimiento: '',
      precio: ''
    };
  }

  const obtenerCanchas = async () => {
    const res = await fetch(`${API_URL}/canchas/mias`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    setCanchas(data);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "horarioCierre" && value === "00:00") {
      setForm(prev => ({ ...prev, [name]: "23:59" }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
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

  const normalizeTime = (raw, fallback = '08:00') => {
    if (!raw) return fallback;

    if (typeof raw === 'object' && raw !== null && 'ticks' in raw) {
      const hhmm = ticksToTime(raw.ticks);
      return hhmm === '00:00' ? '23:59' : hhmm;
    }

    if (typeof raw === 'number') {
      const hhmm = ticksToTime(raw);
      return hhmm === '00:00' ? '23:59' : hhmm;
    }

    if (typeof raw === 'string') {
      const m = raw.match(/(\d{2}):(\d{2})/);
      if (m) {
        const hhmm = `${m[1]}:${m[2]}`;
        return hhmm === '00:00' ? '23:59' : hhmm;
      }
    }

    return fallback;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const method = editandoId ? 'PUT' : 'POST';

    const url = editandoId
      ? `${API_URL}/Canchas/${editandoId}`
      : `${API_URL}/Canchas`;

    const payload = {
      ...form,
      estado: editandoId ? form.estado : "Disponible",
      precio: Number(form.precio)
    };

    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      alert(
        editandoId
          ? `✅ La cancha "${form.nombre}" fue actualizada correctamente.`
          : `✅ La cancha "${form.nombre}" fue creada correctamente.`
      );
    } else {
      alert("❌ Hubo un error al guardar la cancha.");
    }

    setForm(initialFormState());
    setEditandoId(null);
    obtenerCanchas();
  };

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Eliminar esta cancha?')) return;

    await fetch(`${API_URL}/canchas/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });

    obtenerCanchas();
  };

  const handleEditar = (cancha) => {
    setForm({
      ...cancha,
      horarioApertura: normalizeTime(cancha.horarioApertura, '08:00'),
      horarioCierre: normalizeTime(cancha.horarioCierre, '23:00'),
    });
    setEditandoId(cancha.id);
  };

  return (
    <div className="mis-canchas-container">
      <h2>Mis Canchas</h2>

      <form className="form-canchas" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="nombre">Nombre</label>
          <input id="nombre" name="nombre" value={form.nombre} onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label htmlFor="tipo">Tipo</label>
          <select id="tipo" name="tipo" value={form.tipo} onChange={handleChange} required>
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

        {editandoId && (
          <div className="form-group">
            <label htmlFor="estado">Estado</label>
            <select
              id="estado"
              name="estado"
              value={form.estado}
              onChange={handleChange}
              required
            >
              <option value="">-- Selecciona un estado --</option>
              <option value="Disponible">Disponible</option>
              <option value="No disponible">No disponible</option>
            </select>
          </div>
        )}

        <div className="form-group">
          <label htmlFor="precio">Precio</label>
          <input
            type="number"
            id="precio"
            name="precio"
            value={form.precio}
            onChange={handleChange}
            required
          />
        </div>

        <div className="btns-form">
          <button type="submit" className="btn btn-crear">
            {editandoId ? 'Actualizar' : 'Crear'} cancha
          </button>
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
              Estado: {c.estado} | Precio: ${c.precio}
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
