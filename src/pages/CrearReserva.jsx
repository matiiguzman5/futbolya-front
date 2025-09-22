import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../assets/styles/crearReserva.css';

const norm = (s) =>
  (s ?? '')
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

const CrearReserva = () => {
  const [canchas, setCanchas] = useState([]);
  const [canchaId, setCanchaId] = useState('');
  const [fechaHora, setFechaHora] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [busqueda, setBusqueda] = useState('');

  // estados para el panel de sugerencias del BUSCADOR (no del select)
  const [isOpen, setIsOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const suggestRef = useRef(null);

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

  // Sugerencias para el buscador (no afecta las opciones del select)
  const sugerencias = useMemo(() => {
    const q = norm(busqueda);
    if (!q) return [];
    return canchas.filter((c) => {
      const nombre = norm(c?.nombre);
      const ubic   = norm(c?.ubicacion);
      const estado = norm(c?.estado);
      const tipo   = norm(c?.tipo);
      const sup    = norm(c?.superficie);
      return (
        nombre.includes(q) ||
        ubic.includes(q)   ||
        estado.includes(q) ||
        tipo.includes(q)   ||
        sup.includes(q)
      );
    }).slice(0, 12);
  }, [canchas, busqueda]);

  const openSugerencias = () => {
    setIsOpen(true);
    setHighlighted(0);
  };

  const closeSugerencias = () => setIsOpen(false);

  const seleccionarSugerencia = (c) => {
    setBusqueda(c?.nombre ?? '');
    setCanchaId(String(c?.id ?? '')); // autocompleta el SELECT
    closeSugerencias();
  };

  const onKeyDownBusqueda = (e) => {
    if (!isOpen && (e.key === 'ArrowDown' || e.key === 'Enter')) {
      openSugerencias();
      return;
    }
    if (!isOpen) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlighted((h) => Math.min(h + 1, sugerencias.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlighted((h) => Math.max(h - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const c = sugerencias[highlighted];
      if (c) seleccionarSugerencia(c);
    } else if (e.key === 'Escape') {
      closeSugerencias();
    }
  };

  // Cerrar sugerencias si clickeás fuera
  useEffect(() => {
    const handler = (e) => {
      if (suggestRef.current && !suggestRef.current.contains(e.target)) {
        closeSugerencias();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!canchaId) {
      alert('Seleccioná una cancha de la lista.');
      return;
    }

    const canchaSeleccionada = canchas.find(c => String(c.id) === String(canchaId));

    const payload = {
      canchaId: parseInt(canchaId),
      fechaHora: fechaHora,
      observaciones,
      clienteNombre: usuario?.nombre,
      clienteTelefono: usuario?.telefono || "No informado",
      clienteEmail: usuario?.Correo,
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

      alert(`La reserva "${canchaSeleccionada?.nombre || 'desconocida'}" fue creada exitosamente`);
      navigate('/home');
    } catch (error) {
      console.error('Error al crear reserva:', error);
    }
  };

  const manejarFecha = (e) => {
    const valor = e.target.value; // "YYYY-MM-DDTHH:mm"
    const [fecha, hora] = valor.split("T");
    let [horas, minutos] = hora.split(":").map(Number);

    if (minutos < 30 && minutos > 0) {
      minutos = 30;
    } else if (minutos) {
      horas += 1;
      minutos = 0;
    }

    const horasStr = String(horas).padStart(2, "0");
    const minutosStr = String(minutos).padStart(2, "0");
    setFechaHora(`${fecha}T${horasStr}:${minutosStr}`);
  };

  return (
    <div className="crear-reserva-container">
      <h2>Crear Nueva Reserva</h2>

      {/* BUSCADOR con panel de sugerencias */}
      <div className="buscador-wrap" ref={suggestRef}>
        <input
          className="buscador"
          type="text"
          placeholder="Buscar cancha por nombre, ubicación, tipo, superficie o estado"
          value={busqueda}
          onChange={(e) => { setBusqueda(e.target.value); openSugerencias(); }}
          onFocus={openSugerencias}
          onKeyDown={onKeyDownBusqueda}
          aria-autocomplete="list"
          aria-expanded={isOpen}
          aria-controls="sugerencias-canchas"
          aria-activedescendant={isOpen ? `sug-${highlighted}` : undefined}
        />

        {isOpen && (
          <ul id="sugerencias-canchas" className="sug-panel">
            {sugerencias.length === 0 && (
              <li className="sug-empty">No se encontraron canchas</li>
            )}
            {sugerencias.map((c, idx) => (
              <li
                id={`sug-${idx}`}
                key={c.id}
                className={`sug-option ${idx === highlighted ? 'is-active' : ''}`}
                onMouseEnter={() => setHighlighted(idx)}
                onMouseDown={(e) => { e.preventDefault(); seleccionarSugerencia(c); }}
                role="option"
                aria-selected={idx === highlighted}
                title={`${c?.nombre ?? ''} · ${c?.tipo ?? ''} · ${c?.superficie ?? ''}${c?.ubicacion ? ' · ' + c.ubicacion : ''}`}
              >
                <div className="sug-title">{c.nombre}</div>
                <div className="sug-sub">
                  {c.tipo} · {c.superficie}{c.ubicacion ? ` · ${c.ubicacion}` : ''}{c.estado ? ` · ${c.estado}` : ''}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <form className="crear-reserva-form" onSubmit={handleSubmit}>
        <label>Cancha:</label>
        <select
          value={canchaId}
          onChange={(e) => setCanchaId(e.target.value)}
          required
        >
          <option value="">Seleccione una cancha</option>
          {canchas.map((cancha) => (
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
