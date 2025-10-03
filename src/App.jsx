// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Perfil from './pages/Perfil';
import AdminUsuarios from './pages/AdminUsuarios';
import MisCanchas from './pages/MisCanchas';
import CrearReserva from './pages/CrearReserva';
import MisReservas from './pages/MisReservas';
import ProteccionRuta from './ProteccionRuta';
import './assets/styles/global.css';
import AgendaReservas from './pages/AgendaReservas';



const App = () => (
  <Router>
    <Routes>
      {/* Públicas */}
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Privadas para cualquier logueado */}
      <Route path="/home" element={
        <ProteccionRuta>
          <Home />
        </ProteccionRuta>
      } />
      <Route path="/perfil" element={
        <ProteccionRuta>
          <Perfil />
        </ProteccionRuta>
      } />
      <Route path="/crear-reserva" element={
        <ProteccionRuta>
          <CrearReserva />
        </ProteccionRuta>
      } />
      <Route path="/mis-reservas" element={
        <ProteccionRuta>
          <MisReservas />
        </ProteccionRuta>
      } />
      <Route path="/abm-canchas" element={
        <ProteccionRuta rolesPermitidos={['establecimiento']}>
          <MisCanchas />
        </ProteccionRuta>
      } />
      <Route path="/establecimiento" element={
        <ProteccionRuta rolesPermitidos={['establecimiento']}>
          <MisCanchas />
        </ProteccionRuta>
      } />
      
      <Route path="/agendaCanchas" element={
        <ProteccionRuta rolesPermitidos={['establecimiento']}>
          <AgendaReservas />
        </ProteccionRuta>
      } />
      {/* Privada para administrador */}
      <Route path="/admin-usuarios" element={
        <ProteccionRuta rolesPermitidos={['administrador']}>
          <AdminUsuarios />
        </ProteccionRuta>
      } />
    </Routes>
  </Router>
);

export default App;