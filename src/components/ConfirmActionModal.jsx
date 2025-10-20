import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import '../assets/styles/confirmActionModal.css';

const ConfirmActionModal = ({
  open,
  title,
  description,
  details = [],
  confirmLabel,
  cancelLabel = 'Cancelar',
  onConfirm,
  onCancel,
  isProcessing = false,
  tone = 'danger'
}) => {
  useEffect(() => {
    if (!open || isProcessing) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onCancel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, isProcessing, onCancel]);

  const handleOverlayClick = () => {
    if (!isProcessing) {
      onCancel();
    }
  };

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="confirm-modal-overlay"
          onClick={handleOverlayClick}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
        >
          <motion.div
            className="confirm-modal-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-modal-title"
            onClick={(event) => event.stopPropagation()}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            <div className={`confirm-modal-icon confirm-modal-icon--${tone}`}>
              <span aria-hidden="true">!</span>
            </div>
            <h3 id="confirm-modal-title" className="confirm-modal-title">
              {title}
            </h3>
            <p className="confirm-modal-description">{description}</p>

            {details.length > 0 ? (
              <ul className="confirm-modal-details">
                {details.map((item) => (
                  <li key={item.label} className="confirm-modal-detail-item">
                    <span className="confirm-modal-detail-label">{item.label}</span>
                    <span className="confirm-modal-detail-value">{item.value}</span>
                  </li>
                ))}
              </ul>
            ) : null}

            <div className="confirm-modal-actions">
              <button
                type="button"
                className="confirm-modal-button confirm-modal-button--secondary"
                onClick={onCancel}
                disabled={isProcessing}
              >
                {cancelLabel}
              </button>
              <button
                type="button"
                className={`confirm-modal-button confirm-modal-button--${tone}`}
                onClick={onConfirm}
                disabled={isProcessing}
              >
                {isProcessing ? 'Procesando...' : confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};

export default ConfirmActionModal;
