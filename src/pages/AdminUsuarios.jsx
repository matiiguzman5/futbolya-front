<<<<<<< HEAD
import React, { useEffect, useState } from 'react';
import '../assets/styles/adminUsuarios.css';
import { useNavigate } from 'react-router-dom';

const AdminUsuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [nuevoUsuario, setNuevoUsuario] = useState({ nombre: '', correo: '', contraseña: '', rol: 'jugador' });
  const [editandoId, setEditandoId] = useState(null);
  const navigate = useNavigate();

  const token = localStorage.getItem('token');

  const cargarUsuarios = async () => {
    const res = await fetch('https://localhost:7055/api/usuarios', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    setUsuarios(data);
  };

  const crearUsuario = async () => {
    const { nombre, correo, contraseña } = nuevoUsuario;
    if (!nombre || !correo || !contraseña) return alert("Completa todos los campos");

    await fetch('https://localhost:7055/api/usuarios', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(nuevoUsuario)
    });

    setNuevoUsuario({ nombre: '', correo: '', contraseña: '', rol: 'jugador' });
    cargarUsuarios();
  };

  const eliminarUsuario = async (id) => {
    await fetch(`https://localhost:7055/api/usuarios/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    cargarUsuarios();
  };

  const iniciarEdicion = (usuario) => {
    setEditandoId(usuario.id);
    setNuevoUsuario({ nombre: usuario.nombre, correo: usuario.correo, contraseña: '', rol: usuario.rol });
  };

  const guardarEdicion = async () => {
    await fetch(`https://localhost:7055/api/usuarios/${editandoId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(nuevoUsuario)
    });
    setEditandoId(null);
    setNuevoUsuario({ nombre: '', correo: '', contraseña: '', rol: 'jugador' });
    cargarUsuarios();
  };

  useEffect(() => {
    cargarUsuarios();
  }, []);

  return (
    <div className="admin-usuarios-container">
      <h2>Gestión de Usuarios</h2>

      <div className="form-usuario">
        <input placeholder="Nombre" value={nuevoUsuario.nombre} onChange={e => setNuevoUsuario({ ...nuevoUsuario, nombre: e.target.value })} />
        <input placeholder="Correo" value={nuevoUsuario.correo} onChange={e => setNuevoUsuario({ ...nuevoUsuario, correo: e.target.value })} />
        <input placeholder="Contraseña" type="password" value={nuevoUsuario.contraseña} onChange={e => setNuevoUsuario({ ...nuevoUsuario, contraseña: e.target.value })} />
        <select value={nuevoUsuario.rol} onChange={e => setNuevoUsuario({ ...nuevoUsuario, rol: e.target.value })}>
          <option value="jugador">Jugador</option>
          <option value="establecimiento">Establecimiento</option>
          <option value="administrador">Administrador</option>
        </select>
        <button className="btn-volver" style={{ maxWidth: '40%' }} onClick={editandoId ? guardarEdicion : crearUsuario}>
          {editandoId ? 'Guardar' : 'Crear'}
        </button>
        <button className="btn-volver" style={{ maxWidth: '40%' }} onClick={() => navigate('/home')}>Volver</button>
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
            {usuarios.map(u => (
              <tr key={u.id}>
                <td>{u.nombre}</td>
                <td>{u.correo}</td>
                <td>{u.rol}</td>
                <td>
                  <button className="btn-editar" onClick={() => iniciarEdicion(u)}>Editar</button>
                  <button className="btn-eliminar" onClick={() => eliminarUsuario(u.id)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUsuarios;
=======
import React, { useEffect, useState, useCallback } from 'react';
import '../assets/styles/adminUsuarios.css';
import { useNavigate } from 'react-router-dom';

const API_BASE = 'https://localhost:7055/api';
const PASSWORD_FIELD = 'contrase\u00f1a';

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
  const [nuevoUsuario, setNuevoUsuario] = useState(estadoInicialUsuario);
  const [editandoId, setEditandoId] = useState(null);
  const navigate = useNavigate();

  const token = localStorage.getItem('token');

  const cargarUsuarios = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/usuarios`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        throw new Error('No se pudo obtener la lista de usuarios');
      }
      const data = await res.json();
      setUsuarios(data);
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
    }
  }, [token]);

  useEffect(() => {
    cargarUsuarios();
  }, [cargarUsuarios]);

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

      if (!tokenEstablecimiento) {
        console.warn('El inicio de sesion del establecimiento no devolvio un token.');
        return false;
      }

      const canchas = [crearPayloadCancha(nombre, 1), crearPayloadCancha(nombre, 2)];

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

      // Puede que la API no devuelva cuerpo; lo ignoramos si falla la conversion.
      try {
        await res.json();
      } catch (error) {
        // Sin cuerpo, no es problema.
      }

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
          className="btn-crear"
          style={{ maxWidth: '40%' }}
          onClick={editandoId ? guardarEdicion : crearUsuario}
        >
          {editandoId ? 'Guardar' : 'Crear'}
        </button>
        <button
          className="btn-volver"
          style={{ maxWidth: '40%' }}
          onClick={() => navigate('/home')}
        >
          Volver
        </button>
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
            {usuarios.map((u) => (
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
      </div>
    </div>
  );
};

export default AdminUsuarios;

>>>>>>> fork/main
