import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import '../assets/styles/crearReserva.css';

const CrearReserva = () => {
  const [step, setStep] = useState(1);
  const [establecimientos, setEstablecimientos] = useState([]);
  const [establecimientoId, setEstablecimientoId] = useState('');
  const [canchas, setCanchas] = useState([]);
  const [canchaId, setCanchaId] = useState('');
  const [fechaHora, setFechaHora] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [dias, setDias] = useState([]);
  const [diaSeleccionado, setDiaSeleccionado] = useState('');
  const [horaSeleccionada, setHoraSeleccionada] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvc, setCvc] = useState('');
  const [receiptEmail, setReceiptEmail] = useState('');

  const navigate = useNavigate();
  const token = useMemo(() => localStorage.getItem('token') || '', []);
  const usuario = useMemo(() => {
    const raw = localStorage.getItem('usuario');
    if (!raw) {
      return null;
    }
    try {
      return JSON.parse(raw);
    } catch (error) {
      console.error('Error al leer usuario de localStorage:', error);
      return null;
    }
  }, []);

  useEffect(() => {
    if (!usuario) {
      return;
    }
    setCardHolder(usuario.nombre || '');
    setReceiptEmail(usuario.Correo || '');
  }, [usuario]);

  // Traer establecimientos
  useEffect(() => {
    const fetchEstablecimientos = async () => {
      try {
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await fetch('https://localhost:7055/api/Usuarios/establecimientos', { headers });
        if (!res.ok) {
          throw new Error(`Solicitud fallida: ${res.status}`);
        }
        const data = await res.json();
        setEstablecimientos(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error al obtener establecimientos:', error);
        setEstablecimientos([]);
      }
    };

    fetchEstablecimientos();
  }, [token]);

  // Generar proximos 5 dias
  useEffect(() => {
    const hoy = new Date();
    const opciones = [];
    for (let i = 0; i < 5; i++) {
      const d = new Date(hoy);
      d.setDate(hoy.getDate() + i);
      opciones.push({
        fecha: d.toISOString().split('T')[0],
        label: i === 0 ? 'Hoy' : i === 1 ? 'Manana' : d.toLocaleDateString('es-ES', { weekday: 'long' })
      });
    }
    setDias(opciones);
  }, []);

  // Generar horas (09:00 a 23:00)
  const generarHoras = () => {
    const horas = [];
    for (let h = 9; h <= 23; h++) {
      horas.push(`${h.toString().padStart(2, '0')}:00`);
    }
    return horas;
  };

  // Traer canchas disponibles
  const fetchCanchasDisponibles = async (id, fecha) => {
    if (!id || !fecha) {
      return;
    }

    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch(
        `https://localhost:7055/api/Canchas/de/${id}/disponibles?fechaHora=${fecha}`,
        { headers }
      );
      if (!res.ok) {
        throw new Error(`Solicitud fallida: ${res.status}`);
      }
      const data = await res.json();
      setCanchas(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error al obtener canchas disponibles:', error);
      setCanchas([]);
    }
  };

  const formatCardNumber = (value) => {
    const digits = value.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  const formatExpiry = (value) => {
    const digits = value.replace(/\D/g, '').slice(0, 4);
    if (digits.length >= 3) {
      return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    }
    return digits;
  };

  const handleCardNumberChange = (event) => {
    setCardNumber(formatCardNumber(event.target.value));
  };

  const handleExpiryChange = (event) => {
    setExpiryDate(formatExpiry(event.target.value));
  };

  const handleCvcChange = (event) => {
    const digits = event.target.value.replace(/\D/g, '').slice(0, 4);
    setCvc(digits);
  };

  const isExpiryValid = (value) => {
    const [month, year] = value.split('/');
    if (!month || !year || value.length !== 5) {
      return false;
    }
    const monthNumber = parseInt(month, 10);
    if (Number.isNaN(monthNumber) || monthNumber < 1 || monthNumber > 12) {
      return false;
    }
    return true;
  };

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const isCardDataValid = () => {
    const digits = cardNumber.replace(/\s/g, '');
    return cardHolder.trim().length >= 3 && digits.length === 16;
  };

  const isSecurityValid = () =>
    isExpiryValid(expiryDate) && (cvc.length === 3 || cvc.length === 4);

  const isReceiptEmailValid = () => emailRegex.test(receiptEmail);

  const isPaymentValid = () =>
    isCardDataValid() && isSecurityValid() && isReceiptEmailValid();

  const normalizarNumero = (valor) => {
    if (valor === null || valor === undefined) {
      return null;
    }
    const numero = typeof valor === 'number' ? valor : Number(valor);
    return Number.isFinite(numero) ? numero : null;
  };

  const obtenerPrecioCancha = (cancha, fechaSeleccionada) => {
    if (!cancha) {
      return null;
    }

    const precioDirecto = normalizarNumero(
      typeof cancha.precioPorHora !== 'undefined' ? cancha.precioPorHora : cancha.precio
    );
    if (precioDirecto !== null) {
      return precioDirecto;
    }

    const precioBase = normalizarNumero(cancha.precioBaseHora);
    const precioFinDeSemana = normalizarNumero(cancha.precioFinDeSemana);

    if (!fechaSeleccionada) {
      return precioBase !== null ? precioBase : precioFinDeSemana;
    }

    const fecha = new Date(fechaSeleccionada);
    const esFechaValida = !Number.isNaN(fecha.getTime());
    const esFinDeSemana = esFechaValida ? fecha.getDay() === 0 || fecha.getDay() === 6 : false;

    if (esFinDeSemana && precioFinDeSemana !== null) {
      return precioFinDeSemana;
    }

    if (precioBase !== null) {
      return precioBase;
    }

    return precioFinDeSemana;
  };

  const formatearPrecio = (valor) => {
    if (valor === null || valor === undefined) {
      return 'No disponible';
    }

    const numero = Number(valor);
    if (!Number.isFinite(numero)) {
      return 'No disponible';
    }

    return `$${numero.toLocaleString('es-ES')}`;
  };

  const handleSubmit = async () => {
    if (!isPaymentValid()) {
      alert('Completa los datos de pago para confirmar la reserva.');
      return;
    }

    if (!token) {
      alert('Debes iniciar sesion para crear una reserva.');
      navigate('/login');
      return;
    }

    if (!usuario) {
      alert('No encontramos los datos del usuario. Inicia sesion nuevamente.');
      navigate('/login');
      return;
    }

    const fechaSeleccionada = new Date(`${diaSeleccionado}T${horaSeleccionada}:00`);

    const payload = {
      canchaId: parseInt(canchaId, 10),
      fechaHora: fechaSeleccionada.toISOString(),
      observaciones,
      clienteNombre: usuario.nombre,
      clienteTelefono: usuario.telefono || 'No informado',
      clienteEmail: usuario.Correo,
      estadoPago: 'pendiente',
      esFrecuente: false
    };

    try {
      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      };
      const res = await fetch('https://localhost:7055/api/Reservas', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const err = await res.text();
        alert(`Error: ${err}`);
        return;
      }

      alert('Reserva creada correctamente');
      navigate('/home');
    } catch (error) {
      console.error('Error al crear reserva:', error);
      alert('No fue posible crear la reserva. Intenta mas tarde.');
    }
  };

  const renderPasoEstablecimiento = () => (
    <div>
      <h3>Elige un establecimiento</h3>
      <div className="cards">
        {establecimientos.map((est) => (
          <div
            key={est.id}
            className="card"
            onClick={() => {
              setEstablecimientoId(est.id);
              setStep(2);
            }}
          >
            <img src={est.fotoPerfil || '/default-club.jpg'} alt="foto" />
            <h4>{est.nombre}</h4>
            <p>{est.correo}</p>
            <p>Canchas: {est.canchas.length}</p>
          </div>
        ))}
      </div>
    </div>
  );

  const renderPasoFechaHora = () => (
    <div>
      <h3>Elige la fecha y hora</h3>
      <div className="nav-buttons">
        {dias.map((d) => (
          <button
            key={d.fecha}
            className={`btn-next ${diaSeleccionado === d.fecha ? 'active' : ''}`}
            onClick={() => {
              setDiaSeleccionado(d.fecha);
              setHoraSeleccionada('');
            }}
          >
            {d.label}
          </button>
        ))}
      </div>
      {diaSeleccionado && (
        <div className="horas-grid">
          {generarHoras().map((hora) => (
            <button
              key={hora}
              className={`hora-btn ${horaSeleccionada === hora ? 'active' : ''}`}
              onClick={() => setHoraSeleccionada(hora)}
            >
              {hora}
            </button>
          ))}
        </div>
      )}
      <div className="nav-buttons">
        <button className="btn-back" onClick={() => setStep(1)}>
          {'<- Atras'}
        </button>
        <button
          className="btn-next"
          onClick={() => {
            const fechaSeleccionada = `${diaSeleccionado}T${horaSeleccionada}`;
            fetchCanchasDisponibles(establecimientoId, fechaSeleccionada);
            setFechaHora(fechaSeleccionada);
            setStep(3);
          }}
          disabled={!diaSeleccionado || !horaSeleccionada}
        >
          Siguiente {'>'}
        </button>
      </div>
    </div>
  );

  const renderPasoCancha = () => (
    <div>
      <h3>Elige la cancha</h3>
      <div className="cards">
        {canchas.map((c) => {
          const precioCalculado = obtenerPrecioCancha(c, fechaHora);
          return (
            <div
              key={c.id}
              className={`card ${parseInt(canchaId, 10) === c.id ? 'selected' : ''}`}
              onClick={() => setCanchaId(String(c.id))}
            >
              <h4>{c.nombre}</h4>
              <p>Tipo: {c.tipo}</p>
              <p>Precio: {formatearPrecio(precioCalculado)}</p>
            </div>
          );
        })}
      </div>
      <div className="nav-buttons">
        <button className="btn-back" onClick={() => setStep(2)}>
          {'<- Atras'}
        </button>
        <button
          className="btn-next"
          onClick={() => setStep(4)}
          disabled={!canchaId}
        >
          Revisar reserva
        </button>
      </div>
    </div>
  );

  const renderPasoConfirmar = () => {
    const establecimientoSeleccionado = establecimientos.find(
      (e) => e.id === parseInt(establecimientoId, 10)
    );
    const canchaSeleccionada = canchas.find((c) => c.id === parseInt(canchaId, 10));
    const precioReserva = obtenerPrecioCancha(canchaSeleccionada, fechaHora);
    const cardDigits = cardNumber.replace(/\s/g, '');
    const maskedCard = cardDigits ? `**** **** **** ${cardDigits.slice(-4)}` : 'Completa la tarjeta';

    return (
      <div>
        <h3>Confirmar reserva</h3>
        <div className="booking-summary">
          <p>
            <b>Establecimiento:</b> {establecimientoSeleccionado?.nombre}
          </p>
          <p>
            <b>Fecha y hora:</b> {fechaHora}
          </p>
          <p>
            <b>Cancha:</b> {canchaSeleccionada?.nombre}
          </p>
          <p>
            <b>Precio:</b> {formatearPrecio(precioReserva)}
          </p>
        </div>

        <textarea
          placeholder="Observaciones"
          value={observaciones}
          onChange={(event) => setObservaciones(event.target.value)}
        />

        <div className="payment-wizard">
          <div className="payment-panel">
            <div className="payment-fields">
              <label>
                Titular de la tarjeta
                <input
                  type="text"
                  className="payment-input"
                  value={cardHolder}
                  onChange={(event) => setCardHolder(event.target.value)}
                  placeholder="Como figura en la tarjeta"
                  autoComplete="cc-name"
                />
              </label>
              <label>
                Numero de tarjeta
                <input
                  type="text"
                  inputMode="numeric"
                  className="payment-input"
                  value={cardNumber}
                  onChange={handleCardNumberChange}
                  placeholder="1234 5678 9012 3456"
                  autoComplete="cc-number"
                  maxLength={19}
                />
              </label>
            </div>

            <div className="payment-fields payment-fields--split">
              <label>
                Vencimiento
                <input
                  type="text"
                  inputMode="numeric"
                  className="payment-input"
                  value={expiryDate}
                  onChange={handleExpiryChange}
                  placeholder="MM/AA"
                  autoComplete="cc-exp"
                  maxLength={5}
                />
              </label>
              <label>
                CVC
                <input
                  type="text"
                  inputMode="numeric"
                  className="payment-input"
                  value={cvc}
                  onChange={handleCvcChange}
                  placeholder="123"
                  autoComplete="cc-csc"
                  maxLength={4}
                />
              </label>
            </div>

            <div className="payment-fields">
              <label>
                Email para comprobante
                <input
                  type="email"
                  className="payment-input"
                  value={receiptEmail}
                  onChange={(event) => setReceiptEmail(event.target.value)}
                  placeholder="nombre@correo.com"
                  autoComplete="email"
                />
              </label>
            </div>

            <div className="payment-summary">
              <p>
                <span>Tarjeta:</span> {maskedCard}
              </p>
              <p>
                <span>Titular:</span> {cardHolder || 'Sin completar'}
              </p>
              <p>
                <span>Vencimiento:</span> {expiryDate || 'Sin completar'}
              </p>
            </div>
          </div>
        </div>

        <div className="payment-actions">
          <button type="button" className="btn-back" onClick={() => setStep(3)}>
            {'<- Atras'}
          </button>
          <button
            type="button"
            className="btn-confirm"
            onClick={handleSubmit}
            disabled={!isPaymentValid()}
          >
            Confirmar pago
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="crear-reserva-container page-shell">
      <h2>Crear Nueva Reserva</h2>
      {step === 1 && renderPasoEstablecimiento()}
      {step === 2 && renderPasoFechaHora()}
      {step === 3 && renderPasoCancha()}
      {step === 4 && renderPasoConfirmar()}
      {/* <button className="btn-volver" onClick={() => navigate('/home')}>
        {'<- Volver al Home'}
      </button> */}
    </div>
  );
};

export default CrearReserva;
