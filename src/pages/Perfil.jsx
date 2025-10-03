import React, { useEffect, useState } from 'react';
import '../assets/styles/perfil.css';

const Perfil = () => {
  const [usuario, setUsuario] = useState(null);
  const [valoraciones, setValoraciones] = useState([]);
  const [estadisticas, setEstadisticas] = useState({ partidosJugados: 0, promedioValoraciones: 0 });
  const [fotoCargando, setFotoCargando] = useState(false);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [form, setForm] = useState({ nombre: '', telefono: '', posicion: '', contraseña: '' });

  // --- Cargar datos del usuario
  useEffect(() => {
    const fetchUsuario = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('https://localhost:7055/api/usuarios/yo', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setUsuario(data);
        setForm({ nombre: data.nombre, telefono: data.telefono || '', posicion: data.posicion || '', contraseña: '' });
      } catch (err) {
        console.error("Error al cargar perfil:", err);
      }
    };
    fetchUsuario();
  }, []);

  // --- Cargar valoraciones
  useEffect(() => {
    const fetchValoraciones = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('https://localhost:7055/api/calificaciones/mias', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setValoraciones(data);
        }
      } catch (err) {
        console.error("Error al obtener valoraciones:", err);
      }
    };
    fetchValoraciones();
  }, []);

  // --- Cargar estadísticas (partidos jugados + promedio)
  useEffect(() => {
    const fetchEstadisticas = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('https://localhost:7055/api/usuarios/estadisticas', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setEstadisticas(data);
        }
      } catch (err) {
        console.error("Error al obtener estadísticas:", err);
      }
    };
    fetchEstadisticas();
  }, []);

  // --- Subir foto
  const handleFotoChange = async (e) => {
    const archivo = e.target.files[0];
    if (!archivo) return;
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
      const data = await res.json();
      setUsuario((prev) => ({ ...prev, fotoPerfil: data.ruta }));
    } catch {
      alert("Error al subir la foto");
    } finally {
      setFotoCargando(false);
    }
  };

  // --- Guardar edición
const handleGuardar = async () => {
  try {
    const token = localStorage.getItem('token');
    const payload = {
      nombre: form.nombre,
      telefono: form.telefono,
      posicion: form.posicion,
      contraseña: form.contraseña
    };

    const res = await fetch(`https://localhost:7055/api/usuarios/editar-perfil`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      alert("Perfil actualizado correctamente");
      setUsuario({ ...usuario, ...form });
      setModalAbierto(false);
    } else {
      const err = await res.text();
      alert(`Error: ${err}`);
    }
  } catch {
    alert("Error al actualizar perfil");
  }
};


  if (!usuario) return <div className="perfil-container">Cargando...</div>;

  const imagenPerfil = usuario.fotoPerfil
    ? `https://localhost:7055${usuario.fotoPerfil}`
    : '/default-profile.png';

  return (
    <div className="perfil-container">
      <h2 className="perfil-nombre">{usuario.nombre.toUpperCase()}</h2>
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
            <p>{Number(estadisticas.promedioValoraciones || 0).toFixed(1)}</p>
          </div>
        </div>
      </div>

      <button className="btn-editar" onClick={() => setModalAbierto(true)}>Editar perfil</button>

      {/* Modal de edición */}
      {modalAbierto && (
        <div className="modal">
          <div className="modal-contenido">
            <h3>Editar Perfil</h3>
            <input type="text" placeholder="Nombre"
              value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
            <input type="text" placeholder="Teléfono"
              value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} />
            <input type="text" placeholder="Posición"
              value={form.posicion} onChange={(e) => setForm({ ...form, posicion: e.target.value })} />
            <input type="password" placeholder="Nueva contraseña (opcional)"
              value={form.contraseña} onChange={(e) => setForm({ ...form, contraseña: e.target.value })} />

            <div className="modal-botones">
              <button className="btn-guardar" onClick={handleGuardar}>Guardar</button>
              <button className="btn-cancelar" onClick={() => setModalAbierto(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      <h3 className="subtitulo">Mis valoraciones</h3>
      {valoraciones.length === 0 ? (
        <p className="sin-valoraciones">Todavía no recibiste valoraciones.</p>
      ) : (
        valoraciones.map((v, i) => (
          <div key={i} className="valoracion-card">
            <p><strong>{v.puntaje}/5</strong> - {v.comentario}</p>
            <small>De {v.evaluador.nombre} el {new Date(v.fecha).toLocaleDateString('es-AR')}</small>
          </div>
        ))
      )}

      <footer className="footer-perfil">© 2025 FútbolYa</footer>
    </div>
  );
};

export default Perfil;
