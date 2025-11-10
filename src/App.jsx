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
import AgendaReservas from './pages/AgendaReservas';
import Establecimientos from './pages/Establecimientos';
import ProteccionRuta from './ProteccionRuta';
import Layout from './components/Layout';
import './assets/styles/global.css';
import ChatPartidoPage from "./pages/ChatPartidoPage";


const App = () => (
  <Router>
    <Routes>
      {/* Publicas */}
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Privadas con layout compartido */}
      <Route element={<ProteccionRuta><Layout /></ProteccionRuta>}>
        <Route path="/home" element={<Home />} />
        <Route path="/perfil" element={<Perfil />} />
        <Route path="/crear-reserva" element={<CrearReserva />} />
        <Route path="/mis-reservas" element={<MisReservas />} />
        <Route path="/establecimientos" element={<Establecimientos />} />
        <Route
          path="/abm-canchas"
          element={(
            <ProteccionRuta rolesPermitidos={['establecimiento']}>
              <MisCanchas />
            </ProteccionRuta>
          )}
        />
        <Route path="/chat/:id" element={<ChatPartidoPage />} />
        <Route
          path="/establecimiento"
          element={(
            <ProteccionRuta rolesPermitidos={['establecimiento']}>
              <MisCanchas />
            </ProteccionRuta>
          )}
        />
        <Route
          path="/agendaCanchas"
          element={(
            <ProteccionRuta rolesPermitidos={['establecimiento']}>
              <AgendaReservas />
            </ProteccionRuta>
          )}
        />
        <Route
          path="/admin-usuarios"
          element={(
            <ProteccionRuta rolesPermitidos={['administrador']}>
              <AdminUsuarios />
            </ProteccionRuta>
          )}
        />
      </Route>
    </Routes>
  </Router>
);

export default App;
