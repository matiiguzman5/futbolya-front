import React, { useEffect, useState, useRef } from 'react';
import '../assets/styles/home.css';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import ChatFlotante from "../components/ChatFlotante";



const BASE_URL = 'https://localhost:7055';
const DEFAULT_CENTER = { lat: -34.6037, lng: -58.3816 };
const MAP_STYLE = { width: '100%', height: '320px' };
const GEOCODE_CACHE_KEY = 'geocodeCache_v1';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const defaultMarkerIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const loadGeocodeCache = () => {
  try { return JSON.parse(localStorage.getItem(GEOCODE_CACHE_KEY) || '{}'); } catch { return {}; }
};
const saveGeocodeCache = (cache) => { try { localStorage.setItem(GEOCODE_CACHE_KEY, JSON.stringify(cache)); } catch {} };

const Home = () => {
  const [reservas, setReservas] = useState([]);
  const [reservasConCoords, setReservasConCoords] = useState([]);
  const [establecimientos, setEstablecimientos] = useState([]);
  const [paginaActual, setPaginaActual] = useState(1);
  const [busqueda, setBusqueda] = useState('');
  const [chatReservaId, setChatReservaId] = useState(null);
  const reservasPorPagina = 4;
  const usuario = JSON.parse(localStorage.getItem('usuario') || 'null');
  const mapRef = useRef(null);
  const cache = loadGeocodeCache();

  const obtenerCoordenadas = async (direccion) => {
    if (!direccion) return null;
    const normalizeKey = (s) => s.trim().toLowerCase();
    const key = normalizeKey(direccion);

    // if cached and looks good, return
    if (cache[key]) return cache[key];

    // helper para parsear componentes básicos de la dirección
    const parseAddress = (addr) => {
      const parts = addr.split(',').map(p => p.trim()).filter(Boolean);
      const street = parts[0] || addr;
      const postalMatch = addr.match(/\b[A-Za-z]\d{4}[A-Za-z]{0,3}\b/i) || addr.match(/\b\d{4}\b/);
      const postalcode = postalMatch ? postalMatch[0] : '';
      const cityPart = parts.find(p => /buenos|caba|ciudad|baires/i.test(p)) || '';
      const city = cityPart || 'Ciudad Autónoma de Buenos Aires';
      return { street, city, postalcode };
    };

    const parsed = parseAddress(direccion);

    try {
      // 1) Intento: búsqueda estructurada restringida a Argentina
      const paramsStruct = new URLSearchParams({
        format: 'json',
        street: parsed.street,
        city: parsed.city,
        country: 'Argentina',
        limit: '1',
        addressdetails: '1'
      });
      if (parsed.postalcode) paramsStruct.set('postalcode', parsed.postalcode);

      const urlStruct = `https://nominatim.openstreetmap.org/search?${paramsStruct.toString()}`;
      console.debug('Nominatim structured url:', urlStruct);
      const resStruct = await fetch(urlStruct, { headers: { 'User-Agent': 'FutbolYa-WebApp' } });
      const dataStruct = await resStruct.json();
      if (dataStruct && dataStruct.length) {
        const coords = { lat: Number(dataStruct[0].lat), lon: Number(dataStruct[0].lon) };
        cache[key] = coords; saveGeocodeCache(cache);
        return coords;
      }

      // 2) Fallback: búsqueda libre pero forzando Argentina y añadiendo "Argentina" al query
      // Antes de reintentar, borrar cache para esta clave por si estaba mal
      try { delete cache[key]; saveGeocodeCache(cache); } catch (e) {}

      const q = `${direccion}${direccion.toLowerCase().includes('argentina') ? '' : ', Argentina'}`;
      const paramsFree = new URLSearchParams({
        format: 'json',
        q,
        countrycodes: 'ar',
        limit: '1',
        addressdetails: '1'
      });
      const urlFree = `https://nominatim.openstreetmap.org/search?${paramsFree.toString()}`;
      console.debug('Nominatim fallback url:', urlFree);
      const resFree = await fetch(urlFree, { headers: { 'User-Agent': 'FutbolYa-WebApp' } });
      const dataFree = await resFree.json();
      if (dataFree && dataFree.length) {
        const coords = { lat: Number(dataFree[0].lat), lon: Number(dataFree[0].lon) };
        cache[key] = coords; saveGeocodeCache(cache);
        return coords;
      }

    } catch (e) {
      console.error('Geocode error', e);
    }
    return null;
  };

  const extractCoordsFromObject = (obj) => {
    if (!obj) return null;
    const lat = obj.latitud ?? obj.lat ?? obj.latitude ?? obj.coords?.lat ?? obj.coordenadas?.lat;
    const lng = obj.longitud ?? obj.lng ?? obj.lon ?? obj.longitude ?? obj.coords?.lng ?? obj.coordenadas?.lng;
    if (lat == null || lng == null) return null;
    const nlat = Number(lat), nlng = Number(lng);
    return Number.isFinite(nlat) && Number.isFinite(nlng) ? { lat: nlat, lon: nlng } : null;
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const fetchAll = async () => {
      try {
        const resEst = await fetch('https://localhost:7055/api/Usuarios/establecimientos', { headers: { Authorization: `Bearer ${token}` } });
        const estList = resEst.ok ? await resEst.json() : [];
        setEstablecimientos(estList);

        const res = await fetch('https://localhost:7055/api/reservas/disponibles', { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) { console.error('Error reservas', res.status); return; }
        const data = await res.json();
        setReservas(data);

        const canchaToEstMap = new Map();
        estList.forEach(est => {
          const canchas = est.canchas || est.listaCanchas || [];
          if (Array.isArray(canchas)) canchas.forEach(c => {
            const cid = c.id ?? c.canchaId; if (cid != null) canchaToEstMap.set(String(cid), est);
          });
        });

        const dataConCoords = await Promise.all(data.map(async (reserva) => {
          let coords = extractCoordsFromObject(reserva) || extractCoordsFromObject(reserva.cancha) || extractCoordsFromObject(reserva.establecimiento);

          let ubic = reserva.ubicacion || reserva.establecimiento?.ubicacion || reserva.cancha?.establecimiento?.ubicacion || null;

          if (!coords) {
            const estId = reserva.establecimientoId ?? reserva.establecimiento?.id ?? reserva.estId ?? reserva.establishmentId ?? reserva.usuarioId ?? null;
            let est = estId ? estList.find(e => String(e.id) === String(estId)) : null;
            if (!est) {
              const canchaId = reserva.canchaId ?? reserva.cancha?.id ?? null;
              if (canchaId != null) est = canchaToEstMap.get(String(canchaId)) || null;
            }
            if (est) {
              const ec = extractCoordsFromObject(est);
              if (ec) coords = ec;
              if (!ubic && est.ubicacion) ubic = est.ubicacion;
            }
          }

          if (!coords && ubic) {
            const g = await obtenerCoordenadas(ubic);
            if (g) coords = g;
          }

          return {
            ...reserva,
            latitud: coords?.lat ?? null,
            longitud: coords?.lon ?? null,
            resolvedUbicacion: ubic ?? null
          };
        }));

        setReservasConCoords(dataConCoords);
      } catch (err) { console.error('fetchAll error', err); }
    };
    fetchAll();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    const pts = reservasConCoords.filter(r => r.latitud != null && r.longitud != null).map(r => [Number(r.latitud), Number(r.longitud)]);
    const map = mapRef.current;
    if (!map) return;
    try {
      if (pts.length === 0) { map.setView([DEFAULT_CENTER.lat, DEFAULT_CENTER.lng], 11); return; }
      if (pts.length === 1) { map.setView(pts[0], 13); return; }
      const bounds = L.latLngBounds(pts);
      map.fitBounds(bounds.pad ? bounds.pad(0.2) : bounds, { padding: [50,50] });
    } catch (e) { console.error('bounds error', e); }
  }, [reservasConCoords]);

  // Use reservasConCoords for filtering and pagination so cards display resolvedUbicacion
  const reservasFiltradas = reservasConCoords.filter(
    (reserva) =>
      reserva.nombreCancha?.toLowerCase().includes(busqueda.toLowerCase()) ||
      (reserva.resolvedUbicacion || reserva.establecimiento?.ubicacion || reserva.ubicacion || '').toLowerCase().includes(busqueda.toLowerCase())
  );

  const totalPaginas = Math.ceil(reservasFiltradas.length / reservasPorPagina);
  const indexInicio = (paginaActual - 1) * reservasPorPagina;
  const reservasPaginadas = reservasFiltradas.slice(indexInicio, indexInicio + reservasPorPagina);

  const manejarUnirse = async (reservaId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`https://localhost:7055/api/reservas/${reservaId}/unirse`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const err = await res.text();
        alert(`Error: ${err}`);
        return;
      }
      alert('Te uniste a la reserva.');
      window.location.reload();
    } catch {
      alert('Hubo un error al unirse.');
    }
  };

  return (
    <div className="home-wrapper page-shell">
      <div className="home-content">
        <div className="home-search">
          <div className="search-container">
            <input
              type="text"
              placeholder="Buscar por nombre o ubicación..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
        </div>

        <div className="map-wrapper">
          <MapContainer
            center={[DEFAULT_CENTER.lat, DEFAULT_CENTER.lng]}
            zoom={11}
            style={MAP_STYLE}
            whenCreated={(mapInstance) => {
              mapRef.current = mapInstance;
              setTimeout(() => mapInstance.invalidateSize?.(), 200);
            }}
          >
            <TileLayer
              attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/** Agrupar reservas por latitud/longitud como clave */}
            {Object.entries(
              reservasConCoords.reduce((acc, reserva) => {
                if (reserva.latitud != null && reserva.longitud != null) {
                  const key = `${reserva.latitud},${reserva.longitud}`;
                  if (!acc[key]) acc[key] = [];
                  acc[key].push(reserva);
                }
                return acc;
              }, {})
            ).map(([coordStr, reservas]) => {
              const [lat, lng] = coordStr.split(',').map(Number);
              return (
                <Marker key={coordStr} position={[lat, lng]} icon={defaultMarkerIcon}>
                  <Popup maxWidth={300}>
                    {reservas.map((reserva) => (
                      <div key={reserva.id} style={{ marginBottom: '10px', borderBottom: '1px solid #ccc', paddingBottom: '5px' }}>
                        <strong>{reserva.nombreCancha}</strong><br />
                        {reserva.resolvedUbicacion || reserva.ubicacion || 'Ubicación sin resolver'}<br />
                        Fecha:{' '}
                        {reserva.fechaHora
                          ? new Date(reserva.fechaHora).toLocaleString('es-AR', {
                              hour12: false,
                              year: 'numeric',
                              month: '2-digit',
                              day: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : '-'}
                        <br />
                        Jugadores: {reserva.anotados} / {reserva.capacidad}<br />
                        Observaciones: {reserva.observaciones || 'Ninguna'}<br />

                        {usuario?.rol === 'jugador' ? (
                          reserva.yaEstoyUnido ? (
                            <span style={{ color: 'green' }}>✅ Ya estás unido</span>
                          ) : reserva.anotados < reserva.capacidad ? (
                            <button
                              onClick={() => manejarUnirse(reserva.id)}
                              style={{
                                marginTop: '5px',
                                backgroundColor: '#28a745',
                                color: '#fff',
                                border: 'none',
                                padding: '5px 10px',
                                borderRadius: '5px',
                                cursor: 'pointer',
                              }}
                            >
                              Unirse
                            </button>
                          ) : (
                            <span style={{ color: 'red' }}>Cupo completo</span>
                          )
                        ) : null}
                      </div>
                    ))}
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </div>


        {localStorage.getItem('rol') !== 'establecimiento' ? (
          <div className="crear-reserva-container">
            <Link to="/crear-reserva" className="btn-crear-reserva">Crear Reserva</Link>
          </div>
        ) : (
          <div className="crear-reserva-container">
            <Link to="/abm-canchas" className="btn-crear-reserva">Administrar Canchas</Link>
          </div>
        )}

        <h3 style={{ textAlign: 'center' }}>Reservas Disponibles</h3>

        <div className="partidos-grid">
          {reservasPaginadas.length === 0 ? (
            <p style={{ textAlign: 'center', marginTop: '20px' }}>No hay reservas disponibles.</p>
          ) : (
            reservasPaginadas.map((reserva) => (
              <div key={reserva.id} className="reserva-card">
                <img
                  src={
                    reserva.fotoEstablecimiento
                      ? `${BASE_URL}${reserva.fotoEstablecimiento}`
                      : "/imagenes/cancha_default.jpg"
                  }
                  alt="Establecimiento"
                  className="rounded-md w-full h-48 object-cover"
                  onError={(e) => { e.target.src = "/imagenes/cancha_default.jpg"; }}
                />
                <div className="info">
                  <strong>{reserva.nombreCancha} ({reserva.tipo})</strong>
                  <p>Ubicación: {reserva.resolvedUbicacion || reserva.ubicacion || 'No informada'}</p>
                  <p>
                    Fecha: {reserva.fechaHora 
                      ? new Date(reserva.fechaHora).toLocaleString('es-AR', {
                          hour12: false,
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        }) 
                      : '-'}
                  </p>
                  <p>Jugadores: {reserva.anotados} / {reserva.capacidad}</p>
                  <p>Observaciones: {reserva.observaciones || 'Ninguna'}</p>
                  <p>Estado de Pago: {reserva.estadoPago}</p>

                  {usuario?.rol === 'jugador' && (reserva.yaEstoyUnido ? (
                    <p style={{ color: 'green', marginTop: '10px' }}>✅ Ya estás unido a esta reserva</p>
                  ) : (
                    reserva.anotados < reserva.capacidad && (
                      <button onClick={() => manejarUnirse(reserva.id)} className="btn-crear-reserva" style={{ marginTop: '10px' }}>Unirse</button>
                    )
                  ))}
                  {reserva.yaEstoyUnido && (
                    <button
                      className="btn-chat"
                      onClick={() => setChatReservaId(reserva.id)}
                    >
                      💬 Ir al chat
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="paginacion">
          {[...Array(totalPaginas)].map((_, i) => (
            <button key={i} className={paginaActual === i + 1 ? 'activo' : ''} onClick={() => setPaginaActual(i + 1)}>
              {i + 1}
            </button>
          ))}
        </div>
      </div>
      {chatReservaId && (
  <ChatFlotante
    reservaId={chatReservaId}
    onClose={() => setChatReservaId(null)}
  />
)}

    </div>
  );
};

export default Home;
