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
