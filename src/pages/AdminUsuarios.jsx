import React, { useEffect, useState, useCallback } from 'react';
import '../assets/styles/adminUsuarios.css';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../config';

const API_BASE = API_URL;
const PASSWORD_FIELD = 'Contrasena';

const estadoInicialUsuario = {
  nombre: '',
  correo: '',
  [PASSWORD_FIELD]: '',
  rol: 'jugador'
};

const crearPayloadCancha = (nombreEstablecimiento, indice) => ({
  nombre: `${nombreEstablecimiento} - Cancha ${indice}`,
  tipo: indice === 1 ? 'F5' : 'F7',
  superficie: 'Sintetico',
  estado: 'Disponible',
  horarioApertura: '08:00:00',
  horarioCierre: '23:00:00',
  bloquesMantenimiento: '',
  diasNoDisponibles: '',
  logReparaciones: '',
  estadoEquipamiento: 'Completo',
  notasEspeciales: 'Generada automaticamente.',
  proximoMantenimiento: null
});

const AdminUsuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [filtro, setFiltro] = useState('');

  const [paginaActual, setPaginaActual] = useState(1);
  const usuariosPorPagina = 10;

  const [nuevoUsuario, setNuevoUsuario] = useState(estadoInicialUsuario);
  const [editandoId, setEditandoId] = useState(null);
  const navigate = useNavigate();

  const token = localStorage.getItem('token');

  const cargarUsuarios = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/usuarios`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('No se pudo obtener la lista de usuarios');
      
      const data = await res.json();
      setUsuarios(data);

    } catch (error) {
      console.error('Error al cargar usuarios:', error);
    }
  }, [token]);

  useEffect(() => {
    cargarUsuarios();
  }, [cargarUsuarios]);

  const usuariosFiltrados = usuarios.filter(u =>
    u.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
    u.correo.toLowerCase().includes(filtro.toLowerCase())
  );

  const indiceInicio = (paginaActual - 1) * usuariosPorPagina;
  const indiceFin = indiceInicio + usuariosPorPagina;

  const usuariosPaginados = usuariosFiltrados.slice(indiceInicio, indiceFin);
  const totalPaginas = Math.ceil(usuariosFiltrados.length / usuariosPorPagina);

  const crearCanchasPredeterminadas = async ({ nombre, correo, passwordPlano }) => {
    try {
      const loginRes = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo, [PASSWORD_FIELD]: passwordPlano })
      });

      if (!loginRes.ok) {
        console.warn('No se pudo autenticar al nuevo establecimiento para generar canchas.');
        return false;
      }

      const loginData = await loginRes.json();
      const tokenEstablecimiento = loginData?.token;

      if (!tokenEstablecimiento) return false;

      const canchas = [
        crearPayloadCancha(nombre, 1),
        crearPayloadCancha(nombre, 2)
      ];

      for (const cancha of canchas) {
        const canchaRes = await fetch(`${API_BASE}/Canchas`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${tokenEstablecimiento}`
          },
          body: JSON.stringify(cancha)
        });

        if (!canchaRes.ok) {
          const detalle = await canchaRes.text();
          throw new Error(detalle || 'Fallo al crear una cancha predeterminada');
        }
      }

      return true;

    } catch (error) {
      console.error('Error al crear canchas predeterminadas:', error);
      return false;
    }
  };

  const crearUsuario = async () => {
    const { nombre, correo, rol } = nuevoUsuario;
    const passwordPlano = nuevoUsuario[PASSWORD_FIELD];

    if (!nombre || !correo || !passwordPlano) {
      alert('Completa todos los campos');
      return;
    }

    const payload = {
      nombre,
      correo,
      [PASSWORD_FIELD]: passwordPlano,
      rol
    };

    try {
      const res = await fetch(`${API_BASE}/usuarios`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const detalle = await res.text();
        throw new Error(detalle || 'Error al crear usuario');
      }

      try { await res.json(); } catch {}

      let mensaje = 'Usuario creado correctamente.';

      if (rol === 'establecimiento') {
        const canchasOk = await crearCanchasPredeterminadas({ nombre, correo, passwordPlano });
        mensaje = canchasOk
          ? 'Establecimiento creado con dos canchas predeterminadas.'
          : 'Establecimiento creado. No se pudieron generar las canchas automaticamente.';
      }

      alert(mensaje);
      setNuevoUsuario(estadoInicialUsuario);
      setEditandoId(null);
      cargarUsuarios();

    } catch (error) {
      console.error('Error al crear usuario:', error);
      alert(`Error al crear usuario: ${error.message}`);
    }
  };

  const eliminarUsuario = async (id) => {
    const confirmar = window.confirm("¿Estás seguro que deseas eliminar este usuario?");
    if (!confirmar) return;

    try {
      await fetch(`${API_BASE}/usuarios/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      cargarUsuarios();
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
    }
  };

  const iniciarEdicion = (usuario) => {
    setEditandoId(usuario.id);
    setNuevoUsuario({
      nombre: usuario?.nombre || '',
      correo: usuario?.correo || '',
      [PASSWORD_FIELD]: '',
      rol: usuario?.rol || 'jugador'
    });
  };

  const guardarEdicion = async () => {
    const confirmado = window.confirm('¿Estás seguro que deseas guardar los cambios de este usuario?');
    if (!confirmado) return;

    try {
      const res = await fetch(`${API_BASE}/usuarios/${editandoId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(nuevoUsuario)
      });

      if (!res.ok) {
        const detalle = await res.text();
        throw new Error(detalle || 'Error al guardar usuario');
      }

      setEditandoId(null);
      setNuevoUsuario(estadoInicialUsuario);
      cargarUsuarios();

    } catch (error) {
      console.error('Error al guardar usuario:', error);
      alert(`Error al guardar usuario: ${error.message}`);
    }
  };

  return (
    <div className="admin-usuarios-container page-shell">
      <h2>Gestion de Usuarios</h2>

      <div className="form-usuario">
        <input
          placeholder="Nombre"
          value={nuevoUsuario.nombre}
          onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, nombre: e.target.value })}
        />

        <input
          placeholder="Correo"
          value={nuevoUsuario.correo}
          onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, correo: e.target.value })}
        />

        <input
          placeholder="Contrasena"
          type="password"
          value={nuevoUsuario[PASSWORD_FIELD]}
          onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, [PASSWORD_FIELD]: e.target.value })}
        />

        <select
          value={nuevoUsuario.rol}
          onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, rol: e.target.value })}
        >
          <option value="jugador">Jugador</option>
          <option value="establecimiento">Establecimiento</option>
          <option value="administrador">Administrador</option>
        </select>

        <button
          className="btn-volver"
          style={{ maxWidth: '40%' }}
          onClick={editandoId ? guardarEdicion : crearUsuario}
        >
          {editandoId ? 'Guardar' : 'Crear'}
        </button>

        <button className="btn-volver" style={{ maxWidth: '40%' }} onClick={() => navigate('/home')}>
          Volver
        </button>
      </div>

      <div style={{ width: "100%", display: "flex", justifyContent: "center", marginBottom: "15px" }}>
        <input
          type="text"
          placeholder="Buscar por nombre o correo..."
          value={filtro}
          onChange={(e) => {
            setPaginaActual(1); 
            setFiltro(e.target.value);
          }}
          style={{
            width: "100%",
            maxWidth: "400px",
            padding: "10px",
            borderRadius: "8px"
          }}
        />
      </div>

      <div className="tabla-responsive">
        <table className="tabla-usuarios">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Correo</th>
              <th>Rol</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {usuariosPaginados.map((u) => (
              <tr key={u.id}>
                <td>{u.nombre}</td>
                <td>{u.correo}</td>
                <td>{u.rol}</td>

                <td>
                  <button className="btn-editar" onClick={() => iniciarEdicion(u)}>
                    Editar
                  </button>

                  <button className="btn-eliminar" onClick={() => eliminarUsuario(u.id)}>
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{
          marginTop: "20px",
          display: "flex",
          justifyContent: "center",
          gap: "10px"
        }}>
          {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(num => (
            <button
              key={num}
              onClick={() => setPaginaActual(num)}
              style={{
                width: "60px",            
                height: "30px",           
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 0,
                borderRadius: "6px",
                border: "1px solid #ccc",
                backgroundColor: num === paginaActual ? "#4e73df" : "#fff",
                color: num === paginaActual ? "white" : "black",
                cursor: "pointer",
                fontWeight: num === paginaActual ? "bold" : "normal",
                fontSize: "0.9rem"
              }}
              >
              {num}
            </button>

          ))}
        </div>

      </div>
    </div>
  );
};

export default AdminUsuarios;
