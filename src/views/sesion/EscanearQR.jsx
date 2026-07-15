import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { api } from '../../services/api';
import { FiCamera, FiArrowLeft, FiPause, FiPlay, FiCheckCircle, FiAlertTriangle, FiXCircle } from 'react-icons/fi';
import '../../styles/EscanearQR.css';

export default function EscanearQR() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [historial, setHistorial] = useState([]);
  const [escaneando, setEscaneando] = useState(true);
  const [evento, setEvento] = useState(null);
  const scannerRef = useRef(null);
  const procesandoRef = useRef(false);
  const ultimoTokenRef = useRef(null);
  const ultimoTiempoRef = useRef(0);

  useEffect(() => {
    api.sesiones.obtener(id).then(setEvento).catch(() => {});
  }, [id]);

  const procesarCodigo = useCallback(async (qrToken) => {
    const ahora = Date.now();
    if (qrToken === ultimoTokenRef.current && ahora - ultimoTiempoRef.current < 3000) {
      return;
    }
    if (procesandoRef.current) return;

    procesandoRef.current = true;
    ultimoTokenRef.current = qrToken;
    ultimoTiempoRef.current = ahora;

    try {
      const data = await api.qr.escanear(qrToken);
      setHistorial((prev) => [
        {
          id: `${qrToken}-${ahora}`,
          nombre: data.nombre,
          email: data.email,
          mensaje: data.message,
          tipo: data.ya_registrado ? 'repetido' : 'ok',
          hora: new Date().toLocaleTimeString(),
        },
        ...prev,
      ]);
    } catch (err) {
      setHistorial((prev) => [
        {
          id: `error-${ahora}`,
          nombre: '—',
          mensaje: err.message,
          tipo: 'error',
          hora: new Date().toLocaleTimeString(),
        },
        ...prev,
      ]);
    } finally {
      procesandoRef.current = false;
    }
  }, []);

  useEffect(() => {
    if (!escaneando) return;

    const scanner = new Html5QrcodeScanner(
      'lector-qr',
      { fps: 10, qrbox: { width: 250, height: 250 } },
      /* verbose= */ false
    );

    scanner.render(
      (decodedText) => procesarCodigo(decodedText),
      () => {}
    );

    scannerRef.current = scanner;

    return () => {
      scanner.clear().catch(() => {});
    };
  }, [escaneando, procesarCodigo]);

  return (
    <div className="escanearContainer">
      <div className="escanearHeader">
        <h1 className="escanearTitle">
          <FiCamera className="escanearTitleIcon" />
          Escanear entradas
        </h1>
        <button onClick={() => navigate('/datos-sesion')} className="escanearVolverButton">
          <FiArrowLeft className="escanearVolverIcon" />
          Volver
        </button>
      </div>

      {evento && (
        <p className="escanearEventoTitulo">
          Evento: <strong>{evento.titulo}</strong> ({evento.code || '—'})
        </p>
      )}

      <p className="escanearSubtitle">
        Apunta la cámara al código QR del pase de cada asistente. El evento debe estar "en curso" para poder registrar entradas.
      </p>

      <div className="escanearLectorWrapper">
        {escaneando ? (
          <div id="lector-qr" />
        ) : (
          <div className="escanearPausado">
            <p>Cámara en pausa</p>
          </div>
        )}
        <button
          onClick={() => setEscaneando((prev) => !prev)}
          className="escanearPausarButton"
        >
          {escaneando ? (
            <>
              <FiPause className="escanearPausarIcon" />
              Pausar cámara
            </>
          ) : (
            <>
              <FiPlay className="escanearPausarIcon" />
              Reanudar cámara
            </>
          )}
        </button>
      </div>

      <div className="escanearHistorial">
        <h3 className="escanearHistorialTitle">Últimos escaneos</h3>
        {historial.length === 0 ? (
          <p className="escanearHistorialVacio">Aún no has escaneado ningún pase.</p>
        ) : (
          <ul className="escanearHistorialLista">
            {historial.map((item) => (
              <li key={item.id} className={`escanearHistorialItem escanearHistorialItem--${item.tipo}`}>
                <span className="escanearHistorialIcono">
                  {item.tipo === 'ok' ? (
                    <FiCheckCircle />
                  ) : item.tipo === 'repetido' ? (
                    <FiAlertTriangle />
                  ) : (
                    <FiXCircle />
                  )}
                </span>
                <div className="escanearHistorialTexto">
                  <strong>{item.nombre}</strong>
                  <span>{item.mensaje}</span>
                </div>
                <span className="escanearHistorialHora">{item.hora}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}