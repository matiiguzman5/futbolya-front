import React, { useEffect, useState } from "react";
import usePWAInstall from "../hooks/usePWAInstall";
import { esIOS, estaInstaladaIOS } from "../utils/detectarIOS";
import "../assets/styles/instalar.css";

export default function InstalarApp() {
  const { instalar, puedeInstalar } = usePWAInstall();
  const [visible, setVisible] = useState(true);

  const mostrarIOS = esIOS() && !estaInstaladaIOS();
  const mostrarAndroid = puedeInstalar;

  // ❗useEffect SIEMPRE al tope del componente
  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 8000);
    return () => clearTimeout(timer);
  }, []);

  // ❗NO retornamos null antes del hook, solo escondemos visualmente
  const deberiaMostrar = visible && (mostrarIOS || mostrarAndroid);

  if (!deberiaMostrar) return null;

  return (
    <div className="instalar-popup">
      <button className="cerrar-btn" onClick={() => setVisible(false)}>✕</button>

      {mostrarAndroid && (
        <>
          <p>
            Instalá <strong>FutbolYa</strong> y usala como una aplicación.
          </p>
          <button className="btn-instalar" onClick={instalar}>
            Instalar
          </button>
        </>
      )}

      {mostrarIOS && (
        <>
          <p>Para instalar <strong>FutbolYa</strong>:</p>
          <p>Tocá <strong>Compartir</strong> → <strong>Agregar a inicio</strong></p>
        </>
      )}
    </div>
  );
}
