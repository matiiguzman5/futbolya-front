import React, { useState, useEffect } from 'react';
import '../assets/styles/perfil.css';

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
    contraseña: ''
  });

  // Cargar datos del usuario
  useEffect(() => {
    const fetchUsuario = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('https://localhost:7055/api/usuarios/yo', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          throw new Error('No se pudo obtener el perfil');
        }
        const data = await res.json();
        setUsuario(data);
        setForm({ nombre: data.nombre || '', telefono: data.telefono || '', posicion: data.posicion || '', contraseña: '' });
      } catch (error) {
        console.error('Error al cargar perfil:', error);
      }
    };

    fetchUsuario();
  }, []);

  // Cargar valoraciones recibidas
  useEffect(() => {
    if (usuario?.rol === 'Jugador') {
      const fetchValoraciones = async () => {
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
  }, []);

  // Cargar estadísticas (partidos jugados + promedio)
  useEffect(() => {
    const fetchEstadisticas = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('https://localhost:7055/api/usuarios/estadisticas', {
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
        console.error('Error al obtener estadísticas:', error);
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
      const res = await fetch('https://localhost:7055/api/usuarios/subir-foto', {
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
      const token = localStorage.getItem('token');
      const payload = {
        nombre: form.nombre,
        telefono: form.telefono,
        posicion: form.posicion,
        contraseña: form.contraseña,
      };

      const res = await fetch('https://localhost:7055/api/usuarios/editar-perfil', {
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
      setUsuario((prev) => (prev ? { ...prev, ...form } : prev));
      setModalAbierto(false);
      setForm((prev) => ({ ...prev, contraseña: '' }));
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      alert(`Error al actualizar perfil: ${error.message}`);
    }
  };

  if (!usuario) {
    return <div className="perfil-container">Cargando...</div>;
  }

  const imagenPerfil = usuario.fotoPerfil
    ? `https://localhost:7055${usuario.fotoPerfil}`
    : '/default-profile.png';

  return (
    <div className="perfil-container">
      <h2 className="perfil-nombre">{usuario.nombre?.toUpperCase?.() || usuario.nombre}</h2>
      <img src={imagenPerfil} alt="Foto perfil" className="perfil-foto" />

      <div className="perfil-subir-foto">
        <label className="btn-subir-foto">
          Cambiar foto
          <input type="file" accept=".jpg,.jpeg,.png" hidden onChange={handleFotoChange} />
        </label>
        {fotoCargando && <p>Subiendo imagen...</p>}
      </div>

      <div className="perfil-info">
        <p><strong>Correo:</strong> {usuario.correo}</p>
        <p><strong>Teléfono:</strong> {usuario.telefono || 'No informado'}</p>
        <p><strong>Posición:</strong> {usuario.posicion || 'No informada'}</p>
      </div>

      <div className="perfil-estadisticas">
        <div className="stat-card">
          <img src="/pelotaIco.ico" alt="Partidos" />
          <div>
            <strong>Partidos jugados</strong>
            <p>{estadisticas.partidosJugados}</p>
          </div>
        </div>
        <div className="stat-card">
          <img src="/valoracion.ico" alt="Valoración" />
          <div>
            <strong>Valoración promedio</strong>
              <p>{estadisticas.promedioValoraciones.toFixed(1)}</p>
          </div>

      <button className="btn-editar" onClick={() => setModalAbierto(true)}>
        Editar perfil
      </button>

      {modalAbierto && (
        <div className="modal">
          <div className="modal-contenido">
            <h3>Editar Perfil</h3>
            <input
              type="text"
              placeholder="Nombre"
              value={form.nombre}
              onChange={(event) => setForm({ ...form, nombre: event.target.value })}
            />
            <input
              type="text"
              placeholder="Teléfono"
              value={form.telefono}
              onChange={(event) => setForm({ ...form, telefono: event.target.value })}
            />
            <input
              type="text"
              placeholder="Posición"
              value={form.posicion}
              onChange={(event) => setForm({ ...form, posicion: event.target.value })}
            />
            <input
              type="password"
              placeholder="Nueva contraseña (opcional)"
              value={form.contraseña}
              onChange={(event) => setForm({ ...form, contraseña: event.target.value })}
            />

            {usuario.rol === 'establecimiento' ? (
              <>
                <input
                  type="text"
                  placeholder="Nombre"
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                />
                <input
                  type="email"
                  placeholder="Correo electrónico"
                  value={form.correo}
                  onChange={(e) => setForm({ ...form, correo: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Teléfono"
                  value={form.telefono}
                  onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Ubicación"
                  value={form.ubicacion}
                  onChange={(e) => setForm({ ...form, ubicacion: e.target.value })}
                />
                <input
                  type="password"
                  placeholder="Nueva contraseña (opcional)"
                  value={form.contraseña}
                  onChange={(e) => setForm({ ...form, contraseña: e.target.value })}
                />
              </>
            ) : (
              <>
                <input
                  type="text"
                  placeholder="Nombre"
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                />
                <input
                  type="email"
                  placeholder="Correo electrónico"
                  value={form.correo}
                  onChange={(e) => setForm({ ...form, correo: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Teléfono"
                  value={form.telefono}
                  onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                />
                
                <input
                  type="password"
                  placeholder="Nueva contraseña (opcional)"
                  value={form.contraseña}
                  onChange={(e) => setForm({ ...form, contraseña: e.target.value })}
                />
              </>
            )}

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

      <h3 className="subtitulo">Mis valoraciones</h3>
      {valoraciones.length === 0 ? (
        <p className="sin-valoraciones">Todavía no recibiste valoraciones.</p>
      ) : (
        valoraciones.map((valoracion, index) => (
          <div key={index} className="valoracion-card">
            <p>
              <strong>{valoracion.puntaje}/5</strong> - {valoracion.comentario}
            </p>
            <small>
              De {valoracion.evaluador?.nombre || 'Desconocido'} el{' '}
              {valoracion.fecha ? new Date(valoracion.fecha).toLocaleDateString('es-AR') : 'sin fecha'}
            </small>
          </div>
        ))
      )}

      <footer className="footer-perfil">© 2025 FútbolYa</footer>
    </div>
  );
};

export default Perfil;
