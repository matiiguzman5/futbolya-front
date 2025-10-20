import React, { useEffect, useMemo, useRef, useState } from 'react';

const ShareIcon = () => (
  <svg aria-hidden="true" focusable="false" width="18" height="18" viewBox="0 0 24 24" className="share-icon">
    <path
      fill="currentColor"
      d="M12 3a1 1 0 0 1 .78.37l4 5a1 1 0 0 1-1.56 1.26L13 7.76V16a1 1 0 0 1-2 0V7.76L8.78 9.63A1 1 0 1 1 7.22 8.37l4-5A1 1 0 0 1 12 3Z"
    />
    <path
      fill="currentColor"
      d="M5 13a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-4a1 1 0 1 1 2 0v4a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3v-4a1 1 0 0 1 1-1Z"
    />
  </svg>
);

const ChevronIcon = () => (
  <svg aria-hidden="true" focusable="false" width="16" height="16" viewBox="0 0 24 24" className="share-icon">
    <path fill="currentColor" d="M6.3 9.3a1 1 0 0 1 1.4 0L12 13.59l4.3-4.3a1 1 0 0 1 1.4 1.42l-5 5a1 1 0 0 1-1.4 0l-5-5a1 1 0 0 1 0-1.42Z" />
  </svg>
);

const CopyIcon = () => (
  <svg aria-hidden="true" focusable="false" width="16" height="16" viewBox="0 0 24 24" className="share-icon">
    <path
      fill="currentColor"
      d="M8 7a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3h-6a3 3 0 0 1-3-3V7Zm3-1a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1h-6Z"
    />
    <path
      fill="currentColor"
      d="M5 9a2 2 0 0 1 2-2 1 1 0 1 0 0-2 4 4 0 0 0-4 4v7a4 4 0 0 0 4 4h5a1 1 0 1 0 0-2H7a2 2 0 0 1-2-2V9Z"
    />
  </svg>
);

const WhatsAppIcon = () => (
  <svg
    aria-hidden="true"
    focusable="false"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    className="share-icon"
  >
    <path
      fill="currentColor"
      d="M12 2a10 10 0 0 0-8.66 15l-1.16 4.33 4.33-1.16A10 10 0 1 0 12 2Zm0 18a8 8 0 0 1-4.27-1.24l-.3-.19-2.53.68.68-2.53-.19-.3A8 8 0 1 1 20 12a8 8 0 0 1-8 8Zm3.87-5.06c-.21-.1-1.23-.6-1.42-.67s-.33-.1-.46.1-.53.67-.65.8-.24.16-.46.06a6.78 6.78 0 0 1-2.1-1.27 7.75 7.75 0 0 1-1.45-1.8c-.15-.26 0-.4.11-.5s.24-.26.35-.39a1.62 1.62 0 0 0 .23-.39.45.45 0 0 0 0-.4c0-.12-.47-1.14-.65-1.55s-.35-.35-.47-.35h-.4a.8.8 0 0 0-.58.28 2.4 2.4 0 0 0-.78 1.78 4.17 4.17 0 0 0 .85 2.2A9.47 9.47 0 0 0 11 16.6a12.16 12.16 0 0 0 1.22.45 2.93 2.93 0 0 0 1.32.09 2.16 2.16 0 0 0 1.42-1 1.77 1.77 0 0 0 .13-1c-.05-.1-.2-.17-.42-.27Z"
    />
  </svg>
);

const InstagramIcon = () => (
  <svg
    aria-hidden="true"
    focusable="false"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    className="share-icon"
  >
    <path
      fill="currentColor"
      d="M17.5 3h-11A3.5 3.5 0 0 0 3 6.5v11A3.5 3.5 0 0 0 6.5 21h11a3.5 3.5 0 0 0 3.5-3.5v-11A3.5 3.5 0 0 0 17.5 3Zm2.2 14.5a2.2 2.2 0 0 1-2.2 2.2h-11a2.2 2.2 0 0 1-2.2-2.2v-11a2.2 2.2 0 0 1 2.2-2.2h11a2.2 2.2 0 0 1 2.2 2.2Z"
    />
    <path
      fill="currentColor"
      d="M12 7.3A4.7 4.7 0 1 0 16.7 12 4.71 4.71 0 0 0 12 7.3Zm0 7.6A2.9 2.9 0 1 1 14.9 12 2.9 2.9 0 0 1 12 14.9Z"
    />
    <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" />
  </svg>
);

const ShareReserva = ({ reserva }) => {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const card = wrapperRef.current ? wrapperRef.current.closest('.reserva-card') : null;

    if (!card) {
      return undefined;
    }

    if (menuAbierto) {
      card.classList.add('reserva-card--sharing');
    } else {
      card.classList.remove('reserva-card--sharing');
    }

    return () => {
      card.classList.remove('reserva-card--sharing');
    };
  }, [menuAbierto]);

  const shareUrl = useMemo(
    () => `${window.location.origin}/mis-reservas?reserva=${reserva.id}`,
    [reserva.id]
  );

  const mensajeBase = useMemo(() => {
    const fecha = reserva.fechaHora || reserva.fecha;
    const fechaLegible = fecha ? new Date(fecha).toLocaleString('es-AR') : '';
    return `Te comparto mi reserva en ${reserva.canchaNombre || reserva.cancha || 'la cancha'} para el ${fechaLegible}. Podes verla aca: ${shareUrl}`;
  }, [reserva.canchaNombre, reserva.cancha, reserva.fechaHora, reserva.fecha, shareUrl]);

  const copiarLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
      setMenuAbierto(false);
    } catch (error) {
      console.error('No se pudo copiar el link:', error);
      alert('No se pudo copiar el link. Intenta manualmente.');
    }
  };

  const compartirWhatsApp = () => {
    const texto = encodeURIComponent(mensajeBase);
    window.open(`https://wa.me/?text=${texto}`, '_blank');
    setMenuAbierto(false);
  };

  const compartirInstagram = () => {
    const texto = encodeURIComponent(mensajeBase);
    window.open(`https://www.instagram.com/direct/new/?text=${texto}`, '_blank');
    setMenuAbierto(false);
  };

  return (
    <div ref={wrapperRef} className={`share-reserva${menuAbierto ? ' is-open' : ''}`}>
      <button
        type="button"
        className="btn-compartir"
        onClick={() => setMenuAbierto((prev) => !prev)}
        aria-haspopup="menu"
        aria-expanded={menuAbierto}
      >
        <span className="btn-compartir-icon">
          <ShareIcon />
        </span>
        <span className="btn-compartir-texto">Compartir reserva</span>
        <span className="btn-compartir-chevron">
          <ChevronIcon />
        </span>
      </button>
      {menuAbierto && (
        <div className="share-opciones" role="menu">
          <button
            type="button"
            className="share-opcion share-opcion--copy"
            onClick={copiarLink}
            role="menuitem"
          >
            <span className="share-opcion-icon">
              <CopyIcon />
            </span>
            <span className="share-opcion-texto">Copiar link</span>
          </button>
          <button
            type="button"
            className="share-opcion share-opcion--whatsapp"
            onClick={compartirWhatsApp}
            role="menuitem"
          >
            <span className="share-opcion-icon">
              <WhatsAppIcon />
            </span>
            <span className="share-opcion-texto">WhatsApp</span>
          </button>
          <button
            type="button"
            className="share-opcion share-opcion--instagram"
            onClick={compartirInstagram}
            role="menuitem"
          >
            <span className="share-opcion-icon">
              <InstagramIcon />
            </span>
            <span className="share-opcion-texto">Instagram</span>
          </button>
          {copiado && <span className="share-feedback">Link copiado</span>}
        </div>
      )}
    </div>
  );
};

export default ShareReserva;