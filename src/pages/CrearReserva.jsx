import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../assets/styles/crearReserva.css';
import '../assets/styles/home.css';
import { API_URL } from "../config";


const safeParse = (value) => {
  if (!value) {
    return null;
  }
  try {
    return JSON.parse(value);
  } catch (error) {
    console.error('No se pudo parsear el usuario almacenado:', error);
    return null;
  }
};


const defaultPaymentForm = {
  cardHolder: '',
  cardNumber: '',
  expiryMonth: '',
  expiryYear: '',
  cvc: '',
  receiptEmail: '',
  installmentPlan: '1',
  documentType: 'DNI',
  documentNumber: '',
  billingStreet: '',
  billingNumber: '',
  billingCity: '',
  billingZip: '',
  saveCard: false,
};

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

  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [usuario] = useState(() => safeParse(localStorage.getItem('usuario')));
  const [paymentForm, setPaymentForm] = useState(() => {
    const initial = { ...defaultPaymentForm };
    if (usuario?.nombre || usuario?.name) {
      initial.cardHolder = usuario.nombre || usuario.name || '';
    }
    if (usuario?.Correo || usuario?.email) {
      initial.receiptEmail = usuario.Correo || usuario.email || '';
    }
    return initial;
  });
  const hasHydrated = useRef(false);
  const toLocalISODate = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`; // ej: 2025-11-20
  };


  useEffect(() => {
    document.title = 'Creá tu reserva';
    if (hasHydrated.current) {
      return;
    }
    hasHydrated.current = true;
    const latestUsuario = safeParse(localStorage.getItem('usuario'));
    if (!latestUsuario) {
      return;
    }
    setPaymentForm((prev) => ({
      ...prev,
      cardHolder: prev.cardHolder || latestUsuario?.nombre || latestUsuario?.name || '',
      receiptEmail: prev.receiptEmail || latestUsuario?.Correo || latestUsuario?.email || '',
    }));
  }, []);
  const {
    cardHolder,
    cardNumber,
    expiryMonth,
    expiryYear,
    cvc,
    receiptEmail,
    installmentPlan,
    documentType,
    documentNumber,
    billingStreet,
    billingNumber,
    billingCity,
    billingZip,
    saveCard,
  } = paymentForm;

  const updatePaymentFormField = (field, value) => {
    setPaymentForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  useEffect(() => {
    const fetchEstablecimientos = async () => {
      try {
        const res = await fetch(`${API_URL}/establecimientos`);
        const data = await res.json();
        setEstablecimientos(data || []);
      } catch (error) {
        console.error('Error al obtener establecimientos:', error);
      }
    };
    fetchEstablecimientos();
  }, []);

  useEffect(() => {
    const hoy = new Date();
    const opciones = [];

    for (let i = 0; i < 5; i++) {
      const d = new Date(hoy);
      d.setDate(hoy.getDate() + i);

      opciones.push({
        fecha: toLocalISODate(d),
        label:
          i === 0
            ? 'Hoy'
            : i === 1
            ? 'Manana'
            : d.toLocaleDateString('es-ES', { weekday: 'long' }),
      });
    }

    setDias(opciones);
  }, []);

  const generarHoras = () => {
    const horas = [];
    const ahora = new Date();
    const hoyISO = toLocalISODate(new Date());

    for (let h = 9; h <= 23; h++) {
      const horaStr = `${h.toString().padStart(2, '0')}:00`;

      if (diaSeleccionado === hoyISO) {
        const slot = new Date(`${diaSeleccionado}T${horaStr}:00`);

        if (slot <= ahora) {
          continue; 
        }
      }

      horas.push(horaStr);
    }

    return horas;
  };

  const fetchCanchasDisponibles = async (id, fechaHoraSeleccionada) => {
    try {
      const res = await fetch(
        `${API_URL}/Canchas/de/${id}/disponibles?fechaHora=${fechaHoraSeleccionada}`
      );
      const data = await res.json();
      setCanchas(data || []);
    } catch (error) {
      console.error('Error al obtener canchas disponibles:', error);
    }
  };

  const formatCardNumber = (value) => {
    const digitsOnly = value.replace(/\D/g, '').slice(0, 19);
    return digitsOnly.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  const maskCardNumber = (value) => {
    const digitsOnly = value.replace(/\D/g, '');
    if (digitsOnly.length >= 4) {
      const lastFour = digitsOnly.slice(-4);
      return `**** **** **** ${lastFour}`;
    }
    return 'Sin completar';
  };

  const formatExpiryDisplay = (month, year) => {
    if (!month || !year) {
      return '';
    }
    const monthPadded = month.padStart(2, '0');
    const yearShort = year.slice(-2);
    return `${monthPadded}/${yearShort}`;
  };

  const handleCardNumberChange = (event) => {
    updatePaymentFormField('cardNumber', formatCardNumber(event.target.value));
  };

  const handleExpiryMonthChange = (event) => {
    updatePaymentFormField('expiryMonth', event.target.value);
  };

  const handleExpiryYearChange = (event) => {
    updatePaymentFormField('expiryYear', event.target.value);
  };

  const handleCvcChange = (event) => {
    const digits = event.target.value.replace(/\D/g, '').slice(0, 4);
    updatePaymentFormField('cvc', digits);
  };

  const isExpiryValid = () => {
    const monthNumber = parseInt(expiryMonth, 10);
    const yearNumber = parseInt(expiryYear, 10);
    if (Number.isNaN(monthNumber) || Number.isNaN(yearNumber)) {
      return false;
    }
    if (monthNumber < 1 || monthNumber > 12) {
      return false;
    }
    const reference = new Date();
    const firstDayOfCurrentMonth = new Date(reference.getFullYear(), reference.getMonth(), 1);
    const firstDayOfExpiryMonth = new Date(yearNumber, monthNumber - 1, 1);
    return firstDayOfExpiryMonth >= firstDayOfCurrentMonth;
  };

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const isCardDataValid = () => {
    const digitsOnly = cardNumber.replace(/\s/g, '');
    return (
      cardHolder.trim().length >= 3 &&
      digitsOnly.length >= 13 &&
      digitsOnly.length <= 19
    );
  };

  const isSecurityValid = () => isExpiryValid() && (cvc.length === 3 || cvc.length === 4);

  const isReceiptEmailValid = () => {
    if (!receiptEmail || receiptEmail.trim() === '') return true;
    return emailRegex.test(receiptEmail);
  };

  const isDocumentValid = () => {
    if (!documentNumber || documentNumber.trim() === '') return true;
    return documentNumber.trim().length >= 6;
  };

  const isBillingValid = () => {
    const fields = [billingStreet, billingNumber, billingCity, billingZip];
    const hasData = fields.some((value) => value && value.trim().length > 0);
    if (!hasData) {
      return true;
    }
    return (
      billingStreet.trim().length >= 3 &&
      billingNumber.trim().length > 0 &&
      billingCity.trim().length >= 3 &&
      billingZip.trim().length >= 4
    );
  };

  const isPaymentValid = () =>
    isCardDataValid() &&
    isSecurityValid() &&
    isReceiptEmailValid() &&
    isDocumentValid() &&
    isBillingValid();

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

  // Simula tokenización de tarjeta (genera token determinista a partir de datos)
  const simulateTokenization = (cardNumberValue, expiryMonthValue, expiryYearValue) => {
    const normalized = [
      (cardNumberValue || '').replace(/\s/g, ''),
      expiryMonthValue || '',
      expiryYearValue || ''
    ].join('|');
    let hash = 0;
    for (let i = 0; i < normalized.length; i += 1) {
      hash = (hash * 31 + normalized.charCodeAt(i)) % 1000000007;
    }
    return `tok_${hash.toString(16)}`;
  };

  const handleSubmit = async () => {
    console.log('handleSubmit called', { isPaymentValid: isPaymentValid(), paymentForm });
    if (!isPaymentValid()) {
      const razones = getValidationErrors();
      console.warn('Validación de pago falló:', razones);
      alert('No se pueden enviar los datos. Revisa los campos requeridos: \n' + razones.join('\n'));
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

    const maskedCard = maskCardNumber(cardNumber);
    const cardToken = simulateTokenization(cardNumber, expiryMonth, expiryYear);
    const sanitizedCardNumber = cardNumber.replace(/\D/g, '');
    const sanitizedCvv = cvc.replace(/\D/g, '');
    const expiryMonthPadded = String(expiryMonth || '').padStart(2, '0');
    const expiryYearPadded = String(expiryYear || '').padStart(2, '0');
    const formattedExpiration = `${expiryMonthPadded}/${expiryYearPadded}`;
    const payload = {
      canchaId: parseInt(canchaId, 10),
      fechaHora: fechaSeleccionada.toISOString(),
      observaciones,
      clienteNombre: usuario?.nombre || usuario?.name || cardHolder,
      clienteTelefono: usuario?.telefono || 'No informado',
      clienteEmail: usuario?.Correo || usuario?.email || receiptEmail,
      estadoPago: 'Pagado',
      esFrecuente: false,
      metodoPago: 'Tarjeta',
      emailComprobante: receiptEmail,
      pago: {
        token: cardToken,
        tarjetaEnmascarada: maskedCard,
        cuotas: installmentPlan,
        documento: documentNumber
          ? { tipo: documentType, numero: documentNumber }
          : null,
        domicilio: billingStreet
          ? {
              calle: billingStreet,
              numero: billingNumber,
              ciudad: billingCity,
              codigoPostal: billingZip,
            }
          : null,
        guardarTarjeta: saveCard,
      },
    };

    if (montoTotal !== null) {
      payload.monto = montoTotal;
    }

    try {
      const reservaResponse = await fetch(`${API_URL}/Reservas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!reservaResponse.ok) {
        const err = await reservaResponse.text();
        alert(`Error: ${err}`);
        return;
      }

      const rawReservaResponse = await reservaResponse.text();
      const textPayload = rawReservaResponse ? rawReservaResponse.trim() : '';
      let parsedReserva = null;
      if (textPayload) {
        try {
          parsedReserva = JSON.parse(textPayload);
        } catch (parseError) {
          console.warn('No se pudo parsear la respuesta de creacion de reserva como JSON:', parseError);
        }
      }

      let reservaId = parsedReserva?.id
        ?? parsedReserva?.Id
        ?? parsedReserva?.reservaId
        ?? parsedReserva?.reserva?.id
        ?? parsedReserva?.reserva?.Id
        ?? null;

      if (!reservaId) {
        const locationHeader = reservaResponse.headers.get('location');
        if (locationHeader) {
          const match = locationHeader.match(/\/reservas\/(\d+)/i);
          if (match) {
            reservaId = Number.parseInt(match[1], 10);
          }
        }
      }

      if (!reservaId) {
        alert('La reserva se creo pero no pudimos confirmar el pago automaticamente. Por favor revisa el estado en Mis Reservas.');
        navigate('/home');
        return;
      }

      const confirmarPagoPayload = {
        estadoPago: 'Pagado',
        metodoPago: 'Tarjeta',
        token: cardToken,
        tokenPago: cardToken,
        numeroTarjeta: sanitizedCardNumber,
        numero: sanitizedCardNumber,
        nombreTitular: cardHolder.trim(),
        fechaExpiracion: formattedExpiration,
        codigoSeguridad: sanitizedCvv,
        cvv: sanitizedCvv,
        fechaPago: new Date().toISOString(),
      };

      const pagoResponse = await fetch(`${API_URL}/reservas/pagar/${reservaId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(confirmarPagoPayload),
      });

      if (!pagoResponse.ok) {
        const pagoError = await pagoResponse.text();
        alert(`Reserva creada, pero no se pudo confirmar el pago: ${pagoError}`);
        return;
      }

      alert('Pago registrado y reserva creada correctamente.');
      navigate('/home');
    } catch (error) {
      console.error('Error al crear reserva o confirmar el pago:', error);
      alert('No pudimos registrar el pago. Intenta nuevamente.');
    }
  };

  const getValidationErrors = () => {
    const errores = [];
    if (!isCardDataValid()) {
      errores.push('Nombre del titular (>=3 chars) o número de tarjeta (13-19 dígitos) incompletos');
    }
    if (!isSecurityValid()) {
      errores.push('Fecha de expiración o CVC inválidos');
    }
    if (!isReceiptEmailValid()) {
      errores.push('Correo de comprobante inválido');
    }
    if (!isDocumentValid()) {
      errores.push('Documento inválido (mín 6 dígitos si se completa)');
    }
    if (!isBillingValid()) {
      errores.push('Domicilio incompleto (si completás algún campo, completá todos los obligatorios)');
    }
    return errores;
  };

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

  const PasoFechaHora = () => (
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
                  <p>Precio: {formatPrecio(getPrecioBase(c))}</p>
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

  const maskedCard = maskCardNumber(cardNumber);

  const monthOptions = Array.from({ length: 12 }, (_, index) => {
    const value = String(index + 1).padStart(2, '0');
    return { value, label: value };
  });
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 12 }, (_, index) => {
    const yearValue = String(currentYear + index);
    return { value: yearValue, label: yearValue };
  });
  const installmentOptions = [
    { value: '1', label: 'Pago unico (sin interes)' },
    { value: '3', label: '3 cuotas fijas' },
    { value: '6', label: '6 cuotas sin interes' },
    { value: '12', label: '12 cuotas bancarias' },
  ];
  const documentTypeOptions = ['DNI', 'CUIT', 'Pasaporte'];
  const formattedExpiry = formatExpiryDisplay(expiryMonth, expiryYear);

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

        <div className="payment-checkout">
          <div className="payment-checkout__form">
            <section className="payment-section">
              <div className="payment-section__header">
                <h4>Datos de la tarjeta</h4>
                <p>Usamos encriptacion segura para proteger tu informacion.</p>
              </div>
              <div className="payment-grid payment-grid--single">
                <label className="payment-field payment-field--full">
                  <span>Nombre del titular</span>
                  <input
                    type="text"
                    className="payment-input"
                    value={cardHolder}
                    onChange={(event) => updatePaymentFormField('cardHolder', event.target.value)}
                    placeholder="Como figura en la tarjeta"
                    autoComplete="cc-name"
                  />
                </label>
                <label className="payment-field payment-field--full">
                  <span>Numero de tarjeta</span>
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
                <div className="payment-grid payment-grid--three">
                  <label className="payment-field">
                    <span>Mes</span>
                    <select
                      className="payment-input payment-input--select"
                      value={expiryMonth}
                      onChange={handleExpiryMonthChange}
                    >
                      <option value="">MM</option>
                      {monthOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="payment-field">
                    <span>Ano</span>
                    <select
                      className="payment-input payment-input--select"
                      value={expiryYear}
                      onChange={handleExpiryYearChange}
                    >
                      <option value="">AAAA</option>
                      {yearOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="payment-field">
                    <span>CVC</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      className="payment-input"
                      value={cvc}
                      onChange={handleCvcChange}
                      placeholder="123"
                      autoComplete="cc-csc"
                      maxLength={3}
                    />
                  </label>
                </div>
              </div>
            </section>

            <section className="payment-section">
              <div className="payment-section__header">
                <h4>Contacto y comprobante</h4>
                <p>Te enviaremos el comprobante y las novedades del turno.</p>
              </div>
              <div className="payment-grid payment-grid--two">
                <label className="payment-field">
                  <span>Correo electronico</span>
                  <input
                    type="email"
                    className="payment-input"
                    value={receiptEmail}
                    onChange={(event) => updatePaymentFormField('receiptEmail', event.target.value)}
                    placeholder="nombre@correo.com"
                    autoComplete="email"
                  />
                </label>
                <label className="payment-field">
                  <span>Tipo de documento</span>
                  <select
                    className="payment-input payment-input--select"
                    value={documentType}
                    onChange={(event) => updatePaymentFormField('documentType', event.target.value)}
                  >
                    {documentTypeOptions.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="payment-field">
                  <span>Numero de documento</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    className="payment-input"
                    value={documentNumber}
                    maxLength={8}
                    onChange={(event) => {
                      const digitsOnly = event.target.value.replace(/[^0-9]/g, '');
                      updatePaymentFormField('documentNumber', digitsOnly);
                    }}
                    placeholder="12345678"
                  />
                </label>
                <label className="payment-field">
                  <span>Plan de pago</span>
                  <select
                    className="payment-input payment-input--select"
                    value={installmentPlan}
                    onChange={(event) => updatePaymentFormField('installmentPlan', event.target.value)}
                  >
                    {installmentOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="payment-field payment-field--checkbox">
                  <input
                    type="checkbox"
                    checked={saveCard}
                    onChange={(event) => updatePaymentFormField('saveCard', event.target.checked)}
                  />
                  <span>Guardar tarjeta para proximas reservas</span>
                </label>
              </div>
            </section>

            <section className="payment-section">
              <div className="payment-section__header">
                <h4>Domicilio de facturacion (opcional)</h4>
                <p>Completalo si necesitas que el comprobante tenga tus datos.</p>
              </div>
              <div className="payment-grid payment-grid--two">
                <label className="payment-field payment-field--full">
                  <span>Calle</span>
                  <input
                    type="text"
                    className="payment-input"
                    value={billingStreet}
                    onChange={(event) => updatePaymentFormField('billingStreet', event.target.value)}
                    placeholder="Ej: Av. Siempre Viva"
                  />
                </label>
                <label className="payment-field">
                  <span>Numero</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    className="payment-input"
                    value={billingNumber}
                    maxLength={4}
                    onChange={(event) => {
                      const digitsOnly = event.target.value.replace(/[^0-9]/g, '');
                      updatePaymentFormField('billingNumber', digitsOnly);
                    }}
                    placeholder="1234"
                  />
                </label>
                <label className="payment-field">
                  <span>Ciudad</span>
                  <input
                    type="text"
                    className="payment-input"
                    value={billingCity}
                    onChange={(event) => updatePaymentFormField('billingCity', event.target.value)}
                    placeholder="Ciudad"
                  />
                </label>
                <label className="payment-field">
                  <span>Codigo postal</span>
                  <input
                    type="text"
                    className="payment-input"
                    value={billingZip}
                    onChange={(event) => {
                      const sanitized = event.target.value.replace(/[^0-9A-Za-z]/g, '').toUpperCase();
                      updatePaymentFormField('billingZip', sanitized);
                    }}
                    placeholder="CP"
                  />
                </label>
              </div>
            </section>

            <section className="payment-section">
              <div className="payment-section__header">
                <h4>Notas para el establecimiento</h4>
              </div>
              <label className="payment-field payment-field--full">
                <span>Observaciones (opcional)</span>
                <textarea
                  className="payment-input payment-input--textarea"
                  rows={3}
                  value={observaciones}
                  onChange={(event) => setObservaciones(event.target.value)}
                  placeholder="Agrega un mensaje para el establecimiento"
                />
              </label>
            </section>
          </div>

          <aside className="payment-checkout__summary">
            <div className="summary-card">
              <h4>Resumen de tu reserva</h4>
              <ul className="summary-list">
                <li>
                  <span className="summary-label">Establecimiento</span>
                  <span className="summary-value">{establecimientoSeleccionado?.nombre || 'Sin seleccionar'}</span>
                </li>
                <li>
                  <span className="summary-label">Cancha</span>
                  <span className="summary-value">{canchaSeleccionada?.nombre || 'Sin seleccionar'}</span>
                </li>
                <li>
                  <span className="summary-label">Fecha y hora</span>
                  <span className="summary-value">{fechaSeleccionada ? fechaSeleccionada.toLocaleString('es-AR') : 'Sin definir'}</span>
                </li>
                <li>
                  <span className="summary-label">Tarifa base</span>
                  <span className="summary-value">{formatPrecio(precioBase)}</span>
                </li>
                {esFinDeSemana ? (
                  <li>
                    <span className="summary-label">Tarifa fin de semana</span>
                    <span className="summary-value">{formatPrecio(precioFinDeSemana)}</span>
                  </li>
                ) : null}
                <li>
                  <span className="summary-label">Plan de pago</span>
                  <span className="summary-value">{installmentPlan === '1' ? 'Pago unico' : `${installmentPlan} cuotas`}</span>
                </li>
                {documentNumber ? (
                  <li>
                    <span className="summary-label">Documento</span>
                    <span className="summary-value">{`${documentType} ${documentNumber}`}</span>
                  </li>
                ) : null}
                {billingStreet ? (
                  <li>
                    <span className="summary-label">Facturacion</span>
                    <span className="summary-value">
                      {`${billingStreet} ${billingNumber || ''}${billingCity ? `, ${billingCity}` : ''}${billingZip ? ` (${billingZip})` : ''}`.trim()}
                    </span>
                  </li>
                ) : null}
              </ul>
              <div className="summary-divider" />
              <div className="summary-total">
                <span>Total a pagar</span>
                <strong>{formatPrecio(montoTotal)}</strong>
              </div>
              <div className="summary-card__payment">
                <div className="summary-card__payment-row">
                  <span>{maskedCard}</span>
                  <span>{formattedExpiry || 'MM/AA'}</span>
                </div>
                <small>Titular: {cardHolder || 'Sin completar'}</small>
                <small>Comprobante: {receiptEmail || 'Sin completar'}</small>
                <small>{installmentPlan === '1' ? 'Pago unico' : `${installmentPlan} cuotas seleccionadas`}</small>
                {saveCard ? <small>Guardaremos esta tarjeta para tu proxima visita.</small> : null}
              </div>
            </div>
          </aside>
        </div>

        <div className="payment-actions">
          {(() => {
            const errores = getValidationErrors();
            if (errores.length === 0) return null;
            return (
              <div className="payment-errors" style={{ color: '#b00', marginBottom: 8 }}>
                <strong>Faltan campos:</strong>
                <ul style={{ margin: '6px 0 0 18px' }}>
                  {errores.map((e, i) => (
                    <li key={i}>{e}</li>
                  ))}
                </ul>
              </div>
            );
          })()}

          <button className="btn-back" onClick={() => setStep(3)}>Atras</button>
          <button
            className="btn-confirm"
            onClick={handleSubmit}
            disabled={!isPaymentValid()}
            title={!isPaymentValid() ? getValidationErrors().join(' · ') : 'Confirmar pago'}
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
          PasoEstablecimiento()
        ) : (
          <div className="crear-reserva-container">
            {step === 2 && PasoFechaHora()}
            {step === 3 && PasoCancha()}
            {step === 4 && PasoConfirmar()}
          </div>
        )}
      </div>
    </div>
  );
};

export default CrearReserva;
