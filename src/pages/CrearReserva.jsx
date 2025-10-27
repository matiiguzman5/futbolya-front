import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../assets/styles/crearReserva.css';
import '../assets/styles/home.css';

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

  const cardNumberRef = useRef(null);
  const expiryRef = useRef(null);
  const cardNumberCaretRef = useRef(null);
  const expiryCaretRef = useRef(null);

  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const usuario = JSON.parse(localStorage.getItem('usuario'));

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
        const res = await fetch('https://localhost:7055/api/Usuarios/establecimientos');
        const data = await res.json();
        setEstablecimientos(data || []);
      } catch (error) {
        console.error('Error al obtener establecimientos:', error);
      }
    };
    fetchEstablecimientos();
  }, []);

  // Generar proximos 5 dias
  useEffect(() => {
    const hoy = new Date();
    const opciones = [];
    for (let i = 0; i < 5; i++) {
      const d = new Date(hoy);
      d.setDate(hoy.getDate() + i);
      opciones.push({
        fecha: d.toISOString().split('T')[0],
        label: i === 0 ? 'Hoy' : i === 1 ? 'Manana' : d.toLocaleDateString('es-ES', { weekday: 'long' }),
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
  const fetchCanchasDisponibles = async (id, fechaHoraSeleccionada) => {
    try {
      const res = await fetch(
        `https://localhost:7055/api/Canchas/de/${id}/disponibles?fechaHora=${fechaHoraSeleccionada}`
      );
      const data = await res.json();
      setCanchas(data || []); // Solo se muestran las canchas libres
    } catch (error) {
      console.error('Error al obtener canchas disponibles:', error);
    }
  };

  const handleCardNumberChange = (event) => {
    const digits = event.target.value.replace(/\D/g, '').slice(0, 16);
    setCardNumber(digits);
  };

  const handleExpiryChange = (event) => {
    const digits = event.target.value.replace(/\D/g, '').slice(0, 4);
    setExpiryDate(digits);
  };

  const handleCvcChange = (event) => {
    const digits = event.target.value.replace(/\D/g, '').slice(0, 4);
    setCvc(digits);
  };

  const getExpiryDisplay = (value) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length === 0) {
      return '';
    }
    if (digits.length <= 2) {
      return digits;
    }
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  };

  const isExpiryValid = (value) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length !== 4) {
      return false;
    }
    const monthNumber = parseInt(digits.slice(0, 2), 10);
    if (Number.isNaN(monthNumber) || monthNumber < 1 || monthNumber > 12) {
      return false;
    }
    return true;
  };

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const isCardDataValid = () => {
    return cardHolder.trim().length >= 3 && cardNumber.length === 16;
  };

  const isSecurityValid = () =>
    isExpiryValid(expiryDate) && (cvc.length === 3 || cvc.length === 4);

  const isReceiptEmailValid = () => emailRegex.test(receiptEmail);

  const isPaymentValid = () =>
    isCardDataValid() && isSecurityValid() && isReceiptEmailValid();

  const resolvePrecio = (valor) => {
    if (valor === undefined || valor === null) {
      return null;
    }
    const numero = Number(valor);
    if (Number.isNaN(numero)) {
      return null;
    }
    return numero;
  };

  const getPrecioBase = (cancha) => {
    if (!cancha) {
      return null;
    }
    const precioBase = resolvePrecio(cancha.precioBaseHora);
    if (precioBase !== null) {
      return precioBase;
    }
    return resolvePrecio(cancha.precio);
  };

  const getPrecioFinDeSemana = (cancha) => {
    if (!cancha) {
      return null;
    }
    const precioFin = resolvePrecio(cancha.precioFinDeSemana);
    if (precioFin !== null) {
      return precioFin;
    }
    return getPrecioBase(cancha);
  };

  const isWeekend = (isoDate) => {
    if (!isoDate) {
      return false;
    }
    const day = new Date(isoDate).getDay();
    return day === 0 || day === 6;
  };

  const formatPrecio = (valor) => {
    if (valor === undefined || valor === null) {
      return 'No informado';
    }

    const numero = Number(valor);
    if (Number.isNaN(numero)) {
      return valor;
    }

    return `$${numero.toLocaleString('es-AR')}`;
  };


  // Confirmar reserva
  const handleSubmit = async () => {
    if (!isPaymentValid()) {
      alert('Completa los datos de pago antes de confirmar.');
      return;
    }

    const fechaSeleccionada = new Date(`${diaSeleccionado}T${horaSeleccionada}:00`);
    const canchaSeleccionada = canchas.find((c) => String(c.id) === String(canchaId));

    if (!canchaSeleccionada) {
      alert('Selecciona una cancha valida antes de continuar.');
      return;
    }

    const precioBase = getPrecioBase(canchaSeleccionada);
    const precioFinDeSemana = getPrecioFinDeSemana(canchaSeleccionada);
    const totalCalculado = isWeekend(diaSeleccionado) ? precioFinDeSemana : precioBase;
    const montoTotal =
      typeof totalCalculado === 'number' && !Number.isNaN(totalCalculado)
        ? totalCalculado
        : null;

    const payload = {
      canchaId: parseInt(canchaId, 10),
      fechaHora: fechaSeleccionada.toISOString(),
      observaciones,
      clienteNombre: usuario.nombre,
      clienteTelefono: usuario.telefono || 'No informado',
      clienteEmail: usuario.Correo,
      estadoPago: 'Pagado',
      esFrecuente: false,
      metodoPago: 'Tarjeta',
      emailComprobante: receiptEmail,
    };

    if (montoTotal !== null) {
      payload.monto = montoTotal;
    }

    try {
      const res = await fetch('https://localhost:7055/api/Reservas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.text();
        alert(`Error: ${err}`);
        return;
      }

      alert('Pago registrado y reserva creada correctamente.');
      navigate('/home');
    } catch (error) {
      console.error('Error al crear reserva:', error);
      alert('No pudimos registrar el pago. Intenta nuevamente.');
    }
  };

  // Paso 1: Establecimiento
  const PasoEstablecimiento = () => (
    <div>
      <h3>Elige un establecimiento</h3>
      {establecimientos.length === 0 ? (
        <p style={{ textAlign: 'center', marginTop: '20px' }}>
          No hay establecimientos disponibles.
        </p>
      ) : (
        <div className="partidos-grid crear-reserva-establecimientos">
          {establecimientos.map((est) => (
            <div
              key={est.id}
              className="reserva-card"
              role="button"
              tabIndex={0}
              onClick={() => {
                setEstablecimientoId(est.id);
                setStep(2);
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  setEstablecimientoId(est.id);
                  setStep(2);
                }
              }}
            >
              <img
                src={est.fotoPerfil || '/default-club.jpg'}
                alt={`Foto de ${est.nombre}`}
              />
              <div className="info">
                <strong>{est.nombre}</strong>
                <p>Correo: {est.correo}</p>
                <p>Ubicacion: {est.ubicacion || 'No informada'}</p>
                <p>Canchas registradas: {Array.isArray(est.canchas) ? est.canchas.length : 0}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
// Paso 2: Fecha y hora
  const PasoFechaHora = () => (
    <div>
      <h3>Elige la fecha y hora</h3>

      {/* Botones de dias */}
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

      {/* Botones de horas */}
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

      {/* Navegacion */}
      <div className="nav-buttons">
        <button className="btn-back" onClick={() => setStep(1)}>Atras</button>
        <button
          className="btn-next"
          onClick={() => {
            const fechaSeleccionada = `${diaSeleccionado}T${horaSeleccionada}`;
            fetchCanchasDisponibles(establecimientoId, fechaSeleccionada); // Pedimos solo canchas disponibles
            setFechaHora(fechaSeleccionada);
            setStep(3);
          }}
          disabled={!diaSeleccionado || !horaSeleccionada}
        >
          Siguiente
        </button>
      </div>
    </div>
  );

  // Paso 3: Cancha
  const PasoCancha = () => (
    <div>
      <h3>Elige la cancha</h3>
      {canchas.length === 0 ? (
        <p style={{ textAlign: 'center', marginTop: '20px' }}>
          No hay canchas disponibles para el horario seleccionado.
        </p>
      ) : (
        <div className="partidos-grid crear-reserva-canchas">
          {canchas.map((c) => {
            const esSeleccionada = String(canchaId) === String(c.id);

            return (
              <div
                key={c.id}
                className={`reserva-card ${esSeleccionada ? 'reserva-card--selected' : ''}`}
                role="button"
                tabIndex={0}
                onClick={() => {
                  setCanchaId(c.id);
                  setStep(4);
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    setCanchaId(c.id);
                    setStep(4);
                  }
                }}
              >
                <div className="info">
                  <strong>{c.nombre}</strong>
                  <p>Tipo: {c.tipo || 'No informado'}</p>
                  <p>Superficie: {c.superficie || 'No informada'}</p>
                  <p>Precio base: {formatPrecio(getPrecioBase(c))}</p>
                  <p>Fin de semana: {formatPrecio(getPrecioFinDeSemana(c))}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
      <div className="nav-buttons">
        <button className="btn-back" onClick={() => setStep(2)}>Atras</button>
      </div>
    </div>
  );
// Paso 4: Confirmar y pagar
  const PasoConfirmar = () => {
    const establecimientoSeleccionado = establecimientos.find(
      (e) => String(e.id) === String(establecimientoId)
    );
    const canchaSeleccionada = canchas.find((c) => String(c.id) === String(canchaId));
    const fechaSeleccionada = diaSeleccionado && horaSeleccionada
      ? new Date(`${diaSeleccionado}T${horaSeleccionada}:00`)
      : null;
    const esFinDeSemana = isWeekend(diaSeleccionado);
    const precioBase = getPrecioBase(canchaSeleccionada);
    const precioFinDeSemana = getPrecioFinDeSemana(canchaSeleccionada);
    const montoTotal = esFinDeSemana ? precioFinDeSemana : precioBase;

    const maskedCard = (() => {
      const digits = cardNumber.replace(/\s/g, '');
      if (digits.length >= 4) {
        const lastFour = digits.slice(-4);
        return `**** **** **** ${lastFour}`;
      }
      return 'Sin completar';
    })();

    return (
      <div>
        <h3>Revisar y pagar</h3>
        <div className="payment-wizard">
          <div className="payment-progress">
            <div className="payment-progress__item completed">
              <div className="payment-progress__number">1</div>
              <div className="payment-progress__label">
                <span>Seleccion</span>
                <small>Establecimiento y cancha</small>
              </div>
            </div>
            <div className="payment-progress__item completed">
              <div className="payment-progress__number">2</div>
              <div className="payment-progress__label">
                <span>Horario</span>
                <small>{horaSeleccionada || 'Sin definir'}</small>
              </div>
            </div>
            <div className="payment-progress__item active">
              <div className="payment-progress__number">3</div>
              <div className="payment-progress__label">
                <span>Pago</span>
                <small>{formatPrecio(montoTotal)}</small>
              </div>
            </div>
          </div>

          <div className="payment-panel">
            <div className="payment-summary">
              <p>
                <span>Establecimiento:</span> {establecimientoSeleccionado?.nombre || 'Sin seleccionar'}
              </p>
              <p>
                <span>Cancha:</span> {canchaSeleccionada?.nombre || 'Sin seleccionar'}
              </p>
              <p>
                <span>Fecha y hora:</span> {fechaSeleccionada ? fechaSeleccionada.toLocaleString('es-AR') : 'Sin definir'}
              </p>
              <p>
                <span>Tarifa base:</span> {formatPrecio(precioBase)}
              </p>
              <p>
                <span>Tarifa fin de semana:</span> {formatPrecio(precioFinDeSemana)}
              </p>
              <p>
                <span>Total a pagar:</span> {formatPrecio(montoTotal)}
              </p>
              {esFinDeSemana ? (
                <small>Se aplica tarifa de fin de semana.</small>
              ) : null}
            </div>

            <div className="payment-fields">
              <label>
                Observaciones (opcional)
                <textarea
                  className="payment-input"
                  rows={3}
                  value={observaciones}
                  onChange={(event) => setObservaciones(event.target.value)}
                  placeholder="Mensaje para el establecimiento"
                />
              </label>
            </div>

            <div className="payment-fields">
              <label>
                Nombre del titular
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
                  placeholder="1234567890123456"
                  autoComplete="cc-number"
                  maxLength={16}
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
                  placeholder="MMAA"
                  autoComplete="cc-exp"
                  maxLength={4}
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
                <span>Metodo:</span> Tarjeta de credito
              </p>
              <p>
                <span>Tarjeta:</span> {maskedCard}
              </p>
              <p>
                <span>Titular:</span> {cardHolder || 'Sin completar'}
              </p>
              <p>
                <span>Vencimiento:</span> {getExpiryDisplay(expiryDate) || 'Sin completar'}
              </p>
              <p>
                <span>Comprobante:</span> {receiptEmail || 'Sin completar'}
              </p>
            </div>
          </div>

          <div className="payment-actions">
            <button className="btn-back" onClick={() => setStep(3)}>Atras</button>
            <button
              className="btn-confirm"
              onClick={handleSubmit}
              disabled={!isPaymentValid()}
            >
              Confirmar pago
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="home-wrapper page-shell crear-reserva-page">
      <div className="home-content">
        <h2>Crear Nueva Reserva</h2>
        {step === 1 ? (
          <PasoEstablecimiento />
        ) : (
          <div className="crear-reserva-container">
            {step === 2 && <PasoFechaHora />}
            {step === 3 && <PasoCancha />}
            {step === 4 && <PasoConfirmar />}
          </div>
        )}
      </div>
    </div>
  );
};

export default CrearReserva;
