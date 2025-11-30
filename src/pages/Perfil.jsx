import React, { useState, useEffect } from 'react';
import '../assets/styles/perfil.css';
import { API_URL, BACKEND_URL } from "../config";

const Perfil = () => {
  const [usuario, setUsuario] = useState(null);
  const [valoraciones, setValoraciones] = useState([]);
  const [estadisticas, setEstadisticas] = useState({
    partidosJugados: 0,
    promedioValoraciones: 0
  });

  const [fotoCargando, setFotoCargando] = useState(false);
  const [modalAbierto, setModalAbierto] = useState(false);

  const [form, setForm] = useState({
    nombre: '',
    correo: '',
    telefono: '',
    posicion: '',
    ubicacion: '',
    contrasena: ''
  });

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

        if (!res.ok) throw new Error("No se pudo obtener el perfil");

        const data = await res.json();

        setUsuario(data);

        setForm({
          nombre: data.nombre || '',
          correo: data.correo || '',
          telefono: data.telefono || '',
          posicion: data.posicion || '',
          ubicacion: data.ubicacion || '',
          contrasena: ''
        });

      } catch (error) {
        console.error("Error al cargar perfil:", error);
      }
    };

    fetchUsuario();
  }, []);

  useEffect(() => {
    if (!usuario || usuario.rol?.toLowerCase() !== 'jugador') return;

    const fetchValoraciones = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/calificaciones/mias`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) return;

        const data = await res.json();
        setValoraciones(Array.isArray(data) ? data : []);

      } catch (error) {
        console.error("Error obteniendo valoraciones:", error);
      }
    };

    fetchValoraciones();
  }, [usuario]);

  useEffect(() => {
    const fetchEstadisticas = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/usuarios/estadisticas`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) return;

        const data = await res.json();

        setEstadisticas({
          partidosJugados: Number(data.partidosJugados) || 0,
          promedioValoraciones:
            Number(data.promedioValoraciones ??
                   data.valoracionPromedio ??
                   0)
        });

      } catch (error) {
        console.error("Error obteniendo estadísticas:", error);
      }
    };

    fetchEstadisticas();
  }, []);

  const handleFotoChange = async (event) => {
    const archivo = event.target.files?.[0];
    if (!archivo) return;

    const formData = new FormData();
    formData.append('archivo', archivo);
    setFotoCargando(true);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/usuarios/subir-foto`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      if (!res.ok) throw new Error(await res.text());

      const data = await res.json();
      setUsuario(prev => ({ ...prev, fotoPerfil: data.ruta }));

    } catch (error) {
      alert("Error al subir la foto");
      console.error(error);

    } finally {
      setFotoCargando(false);
    }
  };

  const handleGuardar = async () => {
    try {
      const token = localStorage.getItem('token');

      const payload = {
        nombre: form.nombre,
        correo: form.correo,
        telefono: form.telefono,
        posicion: form.posicion,
        ubicacion: form.ubicacion,
        contrasena: form.contrasena,
      };

      const res = await fetch(`${API_URL}/usuarios/editar-perfil`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error(await res.text());

      alert("Perfil actualizado");

      setUsuario(prev => ({ ...prev, ...form }));
      setModalAbierto(false);

      setForm(prev => ({ ...prev, contrasena: '' }));

    } catch (error) {
      alert("Error actualizando el perfil");
      console.error(error);
    }
  };

  if (!usuario) return <div className="perfil-container">Cargando...</div>;

  const esEstablecimiento = usuario.rol?.toLowerCase() === "establecimiento";

  const imagenPerfil =
    usuario.fotoPerfil
      ? `${BACKEND_URL}${usuario.fotoPerfil}`
      : "/default-profile.png";

  return (
    <div className="perfil-container">

      <h2 className="perfil-nombre">
        {usuario.nombre?.toUpperCase?.() || usuario.nombre}
      </h2>

      <img src={imagenPerfil} className="perfil-foto" alt="Foto perfil" />

      <div className="perfil-subir-foto">
        <label className="btn-subir-foto">
          Cambiar foto
          <input type="file" accept="image/*" hidden onChange={handleFotoChange} />
        </label>

        {fotoCargando && <p>Subiendo imagen...</p>}
      </div>

      <div className="perfil-info">
        <p><strong>Correo:</strong> {usuario.correo}</p>
        <p><strong>Teléfono:</strong> {usuario.telefono || "No informado"}</p>

        {esEstablecimiento && (
          <p><strong>Ubicación:</strong> {usuario.ubicacion || "No informada"}</p>
        )}

        {!esEstablecimiento && (
          <p><strong>Posición:</strong> {usuario.posicion || "No informada"}</p>
        )}
      </div>

      {!esEstablecimiento && (
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
          </div>
        </div>
      )}

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
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            />

            <input
              type="email"
              placeholder="Correo"
              value={form.correo}
              onChange={(e) => setForm({ ...form, correo: e.target.value })}
            />

            <input
              type="text"
              placeholder="Teléfono"
              value={form.telefono}
              onChange={(e) => setForm({ ...form, telefono: e.target.value })}
            />

            {esEstablecimiento ? (
              <input
                type="text"
                placeholder="Ubicación"
                value={form.ubicacion}
                onChange={(e) => setForm({ ...form, ubicacion: e.target.value })}
              />
            ) : (
              <input
                type="text"
                placeholder="Posición"
                value={form.posicion}
                onChange={(e) => setForm({ ...form, posicion: e.target.value })}
              />
            )}

            <input
              type="password"
              placeholder="Nueva contraseña (opcional)"
              value={form.contrasena}
              onChange={(e) => setForm({ ...form, contrasena: e.target.value })}
            />

            <div className="modal-botones">
              <button className="btn-guardar" onClick={handleGuardar}>Guardar</button>
              <button className="btn-cancelar" onClick={() => setModalAbierto(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {!esEstablecimiento && (
        <>
          <h3 className="subtitulo">Mis valoraciones</h3>

          {valoraciones.length === 0 ? (
            <p className="sin-valoraciones">Todavía no recibiste valoraciones.</p>
          ) : (
            valoraciones.map((v, i) => (
              <div key={i} className="valoracion-card">
                <p><strong>{v.puntaje}/5</strong> – {v.comentario}</p>

                <small>
                  De {v.evaluador?.nombre || "Desconocido"} —{" "}
                  {v.reservaInfo || "Reserva desconocida"} —{" "}
                  {v.fecha ? new Date(v.fecha).toLocaleDateString("es-AR") : ""}
                </small>
              </div>
            ))
          )}
        </>
      )}

      <footer className="footer-perfil">© 2025 FútbolYa</footer>
    </div>
  );
};

export default Perfil;
