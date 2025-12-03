import React, { useEffect, useState, useRef } from 'react';
import '../assets/styles/home.css';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import ChatFlotante from "../components/ChatFlotante";
import { API_URL, BACKEND_URL } from "../config";

const calcularDistanciaKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};


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
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const userMarkerIcon = L.icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
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
  const [mapReady, setMapReady] = useState(false);
  const [paginaActual, setPaginaActual] = useState(1);
  const [busqueda, setBusqueda] = useState('');
  const [chatReservaId, setChatReservaId] = useState(null);
  const [userPosition, setUserPosition] = useState(null);
  const reservasPorPagina = 4;
  const usuario = JSON.parse(localStorage.getItem('usuario') || 'null');
  const mapRef = useRef(null);
  const cache = loadGeocodeCache();

  const obtenerCoordenadas = async (direccion) => {
    if (!direccion) return null;
    const normalizeKey = (s) => s.trim().toLowerCase();
    const key = normalizeKey(direccion);

    if (cache[key]) return cache[key];

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
        const resEst = await fetch(`${API_URL}/Usuarios/establecimientos`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const estList = resEst.ok ? await resEst.json() : [];
        setEstablecimientos(estList);

        const res = await fetch(`${API_URL}/reservas/disponibles`, { headers: { Authorization: `Bearer ${token}` } });
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
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) {
      setMapReady(true);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };

        setUserPosition(coords);
        setMapReady(true);
      },
      () => {
        console.warn("No se pudo obtener ubicación. Usando default.");
        setMapReady(true);
      },
      { enableHighAccuracy: true, timeout: 6000 }
    );
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;

    if (userPosition) {
      setTimeout(() => {
        map.flyTo([userPosition.lat, userPosition.lng], 15, { duration: 1 });
      }, 300);
      return;
    }

    const pts = reservasConCoords
      .filter(r => r.latitud != null && r.longitud != null)
      .map(r => [Number(r.latitud), Number(r.longitud)]);

    if (pts.length === 0) {
      map.setView([DEFAULT_CENTER.lat, DEFAULT_CENTER.lng], 11);
      return;
    }

    if (pts.length === 1) {
      map.setView(pts[0], 13);
      return;
    }

    const bounds = L.latLngBounds(pts);
    map.fitBounds(bounds.pad(0.2), { padding: [50, 50] });

  }, [userPosition, reservasConCoords, mapReady]);

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
      const res = await fetch(`${API_URL}/reservas/${reservaId}/unirse`, {
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

        {!mapReady && (
          <div style={{
            width: "100%",
            height: "320px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "18px",
            color: "#555",
            background: "#f5f5f5",
            borderRadius: "8px"
          }}>
            📍 Obteniendo tu ubicación...
          </div>
        )}

        {mapReady && (
          <MapContainer
            center={
              userPosition
                ? [userPosition.lat, userPosition.lng]
                : [DEFAULT_CENTER.lat, DEFAULT_CENTER.lng]
            }
            zoom={userPosition ? 14 : 12}
            style={MAP_STYLE}
            whenCreated={(mapInstance) => {
              mapRef.current = mapInstance;
              setTimeout(() => mapInstance.invalidateSize?.(), 200);
            }}
          >

            <TileLayer
              attribution='&copy; OpenStreetMap contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {userPosition && (
              <>
                <Marker
                  position={[userPosition.lat, userPosition.lng]}
                  icon={userMarkerIcon}
                />
                <CircleMarker
                  center={[userPosition.lat, userPosition.lng]}
                  radius={10}
                  pathOptions={{
                    color: "#1E90FF",
                    fillColor: "#1E90FF",
                    fillOpacity: 0.25
                  }}
                />
              </>
            )}

            {Object.entries(
              reservasConCoords.reduce((acc, reserva) => {
                if (reserva.latitud != null && reserva.longitud != null) {
                  const key = `${reserva.latitud},${reserva.longitud}`;
                  if (!acc[key]) acc[key] = [];
                  acc[key].push(reserva);
                }
                return acc;
              }, {})
            ).map(([coordStr, reservasGrupo]) => {
              const [lat, lng] = coordStr.split(",").map(Number);
              return (
                <Marker key={coordStr} position={[lat, lng]} icon={defaultMarkerIcon}>
                  <Popup maxWidth={300}>
                    <div style={{ maxHeight: '260px', overflowY: 'auto', paddingRight: '4px' }}>
                      {reservasGrupo.map((reserva) => {
                        
                        let distancia = null;
                        if (userPosition && reserva.latitud && reserva.longitud) {
                          distancia = calcularDistanciaKm(
                            userPosition.lat,
                            userPosition.lng,
                            reserva.latitud,
                            reserva.longitud
                          ).toFixed(1);
                        }

                        return (
                          <div
                            key={reserva.id}
                            style={{
                              marginBottom: '10px',
                              borderBottom: '1px solid #ccc',
                              paddingBottom: '8px',
                            }}
                          >
                            <strong>{reserva.nombreCancha}</strong><br />

                            {distancia ? (
                              <span style={{ color: '#555', fontSize: '0.9em' }}>
                                📍 A {distancia} km de tu ubicación
                              </span>
                            ) : (
                              <span style={{ color: '#999', fontSize: '0.9em' }}>
                                📍 Distancia no disponible
                              </span>
                            )}
                            <br />

                            {reserva.resolvedUbicacion || reserva.ubicacion || 'Ubicación sin resolver'}
                            <br />

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

                            {usuario?.rol === 'jugador' && (
                              <>
                                {reserva.yaEstoyUnido ? (
                                  <span style={{ color: 'green' }}>✔ Ya estás unido</span>
                                ) : reserva.anotados < reserva.capacidad ? (
                                  <button
                                    onClick={() => manejarUnirse(reserva.id)}
                                    style={{
                                      marginTop: '8px',
                                      width: '100%',
                                      backgroundColor: '#28a745',
                                      color: '#fff',
                                      border: 'none',
                                      padding: '6px 10px',
                                      borderRadius: '5px',
                                      cursor: 'pointer',
                                      fontWeight: 'bold',
                                    }}
                                  >
                                    Unirse
                                  </button>
                                ) : (
                                  <span style={{ color: 'red' }}>Cupo completo</span>
                                )}
                              </>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        )}

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
                      ? `${BACKEND_URL}${reserva.fotoEstablecimiento}`
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
            <button
              key={i}
              className={paginaActual === i + 1 ? 'activo' : ''}
              onClick={() => setPaginaActual(i + 1)}
            >
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
