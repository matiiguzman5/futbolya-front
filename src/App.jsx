// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Páginas públicas
import Login from './pages/Login';
import Register from './pages/Register';
import OlvideContrasena from './pages/OlvideContrasena';
import RestablecerPassword from './pages/RestablecerPassword';
import ContactoEstablecimiento from './pages/ContactoEstablecimiento';

// Páginas privadas con Layout
import Home from './pages/Home';
import Perfil from './pages/Perfil';
import AdminUsuarios from './pages/AdminUsuarios';
import MisCanchas from './pages/MisCanchas';
import CrearReserva from './pages/CrearReserva';
import MisReservas from './pages/MisReservas';
import AgendaReservas from './pages/AgendaReservas';
import Establecimientos from './pages/Establecimientos';
import ChatPartidoPage from "./pages/ChatPartidoPage";

// Páginas informativas
import Contacto from './pages/Contacto';
import Ayuda from './pages/Ayuda';
import SobreNosotros from './pages/SobreNosotros';
import MetodosDePago from './pages/MetodosDePago';

import ProteccionRuta from './ProteccionRuta';
import Layout from './components/Layout';
import ScrollToTop from './components/ScrollToTop';
import './assets/styles/global.css';

const App = () => (
  <Router>
    <ScrollToTop />

    <Routes>

      {/* Redirigir "/" al login */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Rutas públicas sin layout */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/olvide-mi-contrasena" element={<OlvideContrasena />} />
      <Route path="/restablecer-password" element={<RestablecerPassword />} />
      <Route path="/contacto-establecimiento" element={<ContactoEstablecimiento />} />

      {/* Rutas que muestran el layout principal */}
      <Route element={<Layout />}>
        {/* Publicas con header/footer */}
        <Route path="/contacto" element={<Contacto />} />
        <Route path="/ayuda" element={<Ayuda />} />
        <Route path="/sobre-nosotros" element={<SobreNosotros />} />
        <Route path="/metodos-de-pago" element={<MetodosDePago />} />

        {/* Privadas */}
        <Route
          path="/home"
          element={
            <ProteccionRuta>
              <Home />
            </ProteccionRuta>
          } 
        />

        <Route 
          path="/perfil" 
          element={
            <ProteccionRuta>
              <Perfil />
            </ProteccionRuta>
          } 
        />

        <Route 
          path="/crear-reserva" 
          element={
            <ProteccionRuta>
              <CrearReserva />
            </ProteccionRuta>
          } 
        />

        <Route 
          path="/mis-reservas" 
          element={
            <ProteccionRuta>
              <MisReservas />
            </ProteccionRuta>
          } 
        />

        <Route 
          path="/establecimientos" 
          element={
            <ProteccionRuta>
              <Establecimientos />
            </ProteccionRuta>
          } 
        />

        <Route 
          path="/abm-canchas" 
          element={
            <ProteccionRuta rolesPermitidos={['establecimiento']}>
              <MisCanchas />
            </ProteccionRuta>
          }
        />

        <Route
          path="/agendaCanchas"
          element={
            <ProteccionRuta rolesPermitidos={['establecimiento']}>
              <AgendaReservas />
            </ProteccionRuta>
          }
        />

        <Route 
          path="/admin-usuarios" 
          element={
            <ProteccionRuta rolesPermitidos={['administrador']}>
              <AdminUsuarios />
            </ProteccionRuta>
          }
        />

        <Route 
          path="/chat/:id" 
          element={
            <ProteccionRuta>
              <ChatPartidoPage />
            </ProteccionRuta>
          } 
        />

      </Route>
    </Routes>
  </Router>
);

export default App;
