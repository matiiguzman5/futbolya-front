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

  // === Cargar datos del usuario ===
  useEffect(() => {
    const fetchUsuario = async () => {
  const token = localStorage.getItem('token');

  try {
    const res = await fetch('https://localhost:7055/api/usuarios/yo', {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Error en la respuesta:", errorText);
      alert("❌ Error al cargar datos del usuario");
      return;
    }

    const data = await res.json();
    setUsuario(data);
    setForm({
      nombre: data.nombre || '',
      correo: data.correo || '',
      telefono: data.telefono || '',
      posicion: data.rol === 'establecimiento' ? '' : data.posicion || '',
      ubicacion: data.rol === 'establecimiento' ? data.ubicacion || '' : '',
      contraseña: ''
    });

  } catch (error) {
    console.error("Error de red o parseo JSON:", error);
    alert("❌ Error de conexión al cargar perfil");
  }
};
    fetchUsuario();
  }, []);

  // === Jugador: valoraciones y estadísticas ===
  useEffect(() => {
    if (usuario?.rol === 'Jugador') {
      const fetchValoraciones = async () => {
        const token = localStorage.getItem('token');
        const res = await fetch('https://localhost:7055/api/calificaciones/mias', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) setValoraciones(await res.json());
      };
      const fetchEstadisticas = async () => {
        const token = localStorage.getItem('token');
        const res = await fetch('https://localhost:7055/api/usuarios/estadisticas', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) setEstadisticas(await res.json());
      };
      fetchValoraciones();
      fetchEstadisticas();
    }
  }, [usuario]);

  // === Subir foto de perfil ===
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

      if (!res.ok) throw new Error('Error al subir la imagen');
      const data = await res.json();
      setUsuario((prev) => ({ ...prev, fotoPerfil: data.ruta }));
    } catch {
      alert('❌ Error al subir la foto');
    } finally {
      setFotoCargando(false);
    }
  };

  // === Guardar perfil editado ===
  const handleGuardar = async () => {
    const token = localStorage.getItem('token');

    // Estructura dinámica según rol
    const payload =
      usuario.rol === 'establecimiento'
        ? {
            nombre: form.nombre,
            correo: form.correo,
            telefono: form.telefono,
            ubicacion: form.ubicacion,
            contraseña: form.contraseña,
          }
        : {
            nombre: form.nombre,
            correo: form.correo,
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

    if (res.ok) {
      alert('✅ Perfil actualizado correctamente');
      setUsuario((prev) => ({
        ...prev,
        nombre: form.nombre || prev.nombre,
        correo: form.correo || prev.correo,
        telefono: form.telefono || prev.telefono,
        posicion: form.posicion || prev.posicion,
        ubicacion: form.ubicacion || prev.ubicacion,
      }));
      setModalAbierto(false);
    } else {
      const err = await res.text();
      alert(`❌ Error: ${err}`);
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
        {usuario.rol === 'establecimiento' && (
          <p><strong>Ubicación:</strong> {usuario.ubicacion || 'No informada'}</p>
        )}
      </div>

      {/* === Mostrar estadísticas y valoraciones solo si es jugador === */}
      {usuario.rol === 'Jugador' && (
        <>
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

          <h3 className="subtitulo">Mis valoraciones</h3>
          {valoraciones.length === 0 ? (
            <p className="sin-valoraciones">Todavía no recibiste valoraciones.</p>
          ) : (
            valoraciones.map((v, i) => (
              <div key={i} className="valoracion-card">
                <p><strong>{v.puntaje}/5</strong> - {v.comentario}</p>
                <small>
                  De {v.evaluador.nombre} el {new Date(v.fecha).toLocaleDateString('es-AR')}
                </small>
              </div>
            ))
          )}
        </>
      )}

      <button className="btn-editar" onClick={() => setModalAbierto(true)}>
        Editar perfil
      </button>

      {/* === Modal de edición === */}
      {modalAbierto && (
        <div className="modal">
          <div className="modal-contenido">
            <h3>Editar Perfil</h3>

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
    </div>
  );
};

export default Perfil;
