import React, { useState, useEffect } from 'react';
import '../assets/styles/perfil.css';
import { API_URL, BACKEND_URL } from "../config";


const Perfil = () => {
  const [usuario, setUsuario] = useState(null);
  const [valoraciones, setValoraciones] = useState([]);
  const [estadisticas, setEstadisticas] = useState({ partidosJugados: 0, promedioValoraciones: 0 });
  const [fotoCargando, setFotoCargando] = useState(false);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [form, setForm] = useState({
    nombre: '',
    correo: '',
    telefono: '',
    posicion: '',
    ubicacion: '',
    contrasena: '',
  });
  const esEstablecimiento = String(usuario?.rol || '').toLowerCase() === 'establecimiento';

  useEffect(() => {
    document.title = 'Mi perfil';
  }, []);

  useEffect(() => {
    const fetchUsuario = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/usuarios/yo`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          throw new Error('No se pudo obtener el perfil');
        }
        const data = await res.json();
        setUsuario(data);
        setForm({
          nombre: data.nombre || '',
          correo: data.correo || '',
          telefono: data.telefono || '',
          posicion: data.posicion || '',
          ubicacion: data.ubicacion || '',
          contrasena: '',
        });
      } catch (error) {
        console.error('Error al cargar perfil:', error);
      }
    };

    fetchUsuario();
  }, []);

  useEffect(() => {
    if (usuario?.rol !== 'Jugador') {
      return;
    }

    const fetchValoraciones = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('https://localhost:7055/api/calificaciones/mias', {
        headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setValoraciones(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error('Error al obtener valoraciones:', error);
      }
    };

    fetchValoraciones();
  }, [usuario?.rol]);

// Cargar estadisticas (partidos jugados + promedio)
  useEffect(() => {
    const fetchEstadisticas = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/usuarios/estadisticas`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setEstadisticas({
            partidosJugados: Number(data.partidosJugados) || 0,
            promedioValoraciones: Number(data.promedioValoraciones) || 0,
          });
        }
      } catch (error) {
        console.error('Error al obtener estadisticas:', error);
      }
    };

    fetchEstadisticas();
  }, []);

  const handleFotoChange = async (event) => {
    const archivo = event.target.files?.[0];
    if (!archivo) {
      return;
    }

    const formData = new FormData();
    formData.append('archivo', archivo);
    setFotoCargando(true);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/usuarios/subir-foto`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      const data = await res.json();
      setUsuario((prev) => (prev ? { ...prev, fotoPerfil: data.ruta } : prev));
    } catch (error) {
      console.error('Error al subir la foto:', error);
      alert('Error al subir la foto');
    } finally {
      setFotoCargando(false);
    }
  };

  const handleGuardar = async () => {
    try {
      const esEstablecimientoActual = String(usuario?.rol || '').toLowerCase() === 'establecimiento';
      const token = localStorage.getItem('token');
      const payload = {
        nombre: form.nombre,
        correo: form.correo,
        telefono: form.telefono,
        contrasena: form.contrasena,
      };

      if (esEstablecimientoActual) {
        payload.ubicacion = form.ubicacion;
      } else {
        payload.posicion = form.posicion;
      }

      const res = await fetch(`${API_URL}/usuarios/editar-perfil`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      alert('Perfil actualizado correctamente');
      setUsuario((prev) =>
        prev
          ? {
              ...prev,
              nombre: form.nombre,
              correo: form.correo,
              telefono: form.telefono,
              posicion: esEstablecimientoActual ? prev?.posicion : form.posicion,
              ubicacion: esEstablecimientoActual ? form.ubicacion : prev?.ubicacion,
            }
          : prev
      );
      setModalAbierto(false);
      setForm((prev) => ({ ...prev, contrasena: '' }));
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      alert(`Error al actualizar perfil: ${error.message}`);
    }
  };

  if (!usuario) {
    return <div className="perfil-container">Cargando...</div>;
  }

  const imagenPerfil = usuario.fotoPerfil
    ? `${BACKEND_URL}${usuario.fotoPerfil}`
    : '/default-profile.png';

  return (
    <div className="perfil-page">
      <section className="perfil-hero">
        <div className="perfil-hero__main">
          <div className="perfil-avatar-wrap">
            <img src={imagenPerfil} alt="Foto perfil" className="perfil-avatar" />
            <label className="btn-subir-foto">
              Cambiar foto
              <input type="file" accept=".jpg,.jpeg,.png" hidden onChange={handleFotoChange} />
            </label>
            {fotoCargando && <span className="perfil-hint">Subiendo imagen...</span>}
          </div>

          <div className="perfil-meta">
            <span className="perfil-chip">{usuario.rol || 'Usuario'}</span>
            <h1 className="perfil-nombre">{usuario.nombre || 'Mi perfil'}</h1>
            <button className="btn-editar" onClick={() => setModalAbierto(true)}>
              Editar perfil
            </button>
          </div>
        </div>

        <div className="perfil-hero__stats">
          {!esEstablecimiento ? (
            <>
              <div className="stat-tile">
                <p className="stat-label">Partidos jugados</p>
                <p className="stat-value">{estadisticas.partidosJugados}</p>
              </div>
              <div className="stat-tile">
                <p className="stat-label">Valoracion promedio</p>
                <p className="stat-value">{estadisticas.promedioValoraciones.toFixed(1)}</p>
              </div>
            </>
          ) : (
            <>
              <div className="stat-tile">
                <p className="stat-label">Correo</p>
                <p className="stat-value">{usuario.correo}</p>
              </div>
              <div className="stat-tile">
                <p className="stat-label">Telefono</p>
                <p className="stat-value">{usuario.telefono || 'No informado'}</p>
              </div>
            </>
          )}
        </div>
      </section>

      <section className="perfil-grid">
        <div className="perfil-card">
          <div className="perfil-card__header">
            <p className="eyebrow">Datos</p>
            <h3>Informacion basica</h3>
          </div>
          <div className="perfil-list">
            <div className="perfil-list__item">
              <span>Correo</span>
              <strong>{usuario.correo}</strong>
            </div>
            <div className="perfil-list__item">
              <span>Telefono</span>
              <strong>{usuario.telefono || 'No informado'}</strong>
            </div>
            {!esEstablecimiento && (
              <div className="perfil-list__item">
                <span>Posicion</span>
                <strong>{usuario.posicion || 'No informada'}</strong>
              </div>
            )}
            {esEstablecimiento && (
              <div className="perfil-list__item">
                <span>Ubicacion</span>
                <strong>{usuario.ubicacion || 'No informada'}</strong>
              </div>
            )}
          </div>
        </div>

        <div className="perfil-card">
          <div className="perfil-card__header">
            <p className="eyebrow">Actividad</p>
            <h3>Resumen</h3>
          </div>
          <div className="perfil-summary">
            <div>
              <p className="summary-label">Rol</p>
              <p className="summary-value">{usuario.rol || 'Usuario'}</p>
            </div>
            <div>
              <p className="summary-label">Ultima actualizacion</p>
              <p className="summary-value">Hoy</p>
            </div>
          </div>
        </div>
      </section>

      <section className="perfil-card">
        <div className="perfil-card__header">
          <p className="eyebrow">Feedback</p>
          <h3>Mis valoraciones</h3>
        </div>
        {valoraciones.length === 0 ? (
          <p className="sin-valoraciones">Todavia no recibiste valoraciones.</p>
        ) : (
          <div className="valoraciones-grid">
            {valoraciones.map((valoracion, index) => (
              <div key={index} className="valoracion-card">
                <div className="valoracion-score">
                  <span>{valoracion.puntaje}/5</span>
                </div>
                <div className="valoracion-body">
                  <p className="valoracion-texto">{valoracion.comentario}</p>
                  <small>
                    De {valoracion.evaluador?.nombre || 'Desconocido'} el{' '}
                    {valoracion.fecha ? new Date(valoracion.fecha).toLocaleDateString('es-AR') : 'sin fecha'}
                  </small>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {modalAbierto && (
        <div className="modal">
          <div className="modal-contenido">
            <div className="modal-header">
              <h3>Editar Perfil</h3>
              <button className="modal-close" onClick={() => setModalAbierto(false)}>×</button>
            </div>
            <div className="modal-grid">
              <input
                type="text"
                placeholder="Nombre"
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              />
              <input
                type="email"
                placeholder="Correo electronico"
                value={form.correo}
                onChange={(e) => setForm({ ...form, correo: e.target.value })}
              />
              <input
                type="text"
                placeholder="Telefono"
                value={form.telefono}
                onChange={(event) => setForm({ ...form, telefono: event.target.value })}
              />
              {esEstablecimiento ? (
                <input
                  type="text"
                  placeholder="Ubicacion"
                  value={form.ubicacion}
                  onChange={(e) => setForm({ ...form, ubicacion: e.target.value })}
                />
              ) : (
                <input
                  type="text"
                  placeholder="Posicion"
                  value={form.posicion}
                  onChange={(event) => setForm({ ...form, posicion: event.target.value })}
                />
              )}
              <input
                type="password"
                placeholder="Nueva contrasena (opcional)"
                value={form.contrasena}
                onChange={(event) => setForm({ ...form, contrasena: event.target.value })}
              />
            </div>

            <div className="modal-botones">
              <button className="btn-guardar" onClick={handleGuardar}>
                Guardar
              </button>
              <button className="btn-cancelar" onClick={() => setModalAbierto(false)}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Perfil;
