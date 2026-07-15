import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { api } from '../../services/api';
import { 
  FiCamera, FiArrowLeft, FiPause, FiPlay, FiCheckCircle, 
  FiAlertTriangle, FiXCircle, FiUser, FiMail, FiClock,
  FiInfo, FiRefreshCw, FiVolume2, FiVolumeX
} from 'react-icons/fi';
import '../../styles/EscanearQR.css';

export default function EscanearQR() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [historial, setHistorial] = useState([]);
  const [escaneando, setEscaneando] = useState(true);
  const [evento, setEvento] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sonidoHabilitado, setSonidoHabilitado] = useState(true);
  const [mostrarNotificacion, setMostrarNotificacion] = useState(null);
  const scannerRef = useRef(null);
  const procesandoRef = useRef(false);
  const ultimoTokenRef = useRef(null);
  const ultimoTiempoRef = useRef(0);
  const audioContextRef = useRef(null);

  // Cargar evento
  useEffect(() => {
    setLoading(true);
    api.sesiones.obtener(id)
      .then(setEvento)
      .catch(() => setError('No se pudo cargar la información del evento'))
      .finally(() => setLoading(false));
  }, [id]);

  // Reproducir sonido
  const reproducirSonido = useCallback((tipo) => {
    if (!sonidoHabilitado) return;
    
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      
      const ctx = audioContextRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      if (tipo === 'ok') {
        osc.frequency.value = 880;
        gain.gain.value = 0.3;
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.15);
        
        // Segundo tono más agudo
        setTimeout(() => {
          const osc2 = ctx.createOscillator();
          const gain2 = ctx.createGain();
          osc2.connect(gain2);
          gain2.connect(ctx.destination);
          osc2.frequency.value = 1100;
          gain2.gain.value = 0.2;
          osc2.start(ctx.currentTime);
          osc2.stop(ctx.currentTime + 0.15);
        }, 150);
      } else if (tipo === 'repetido') {
        osc.frequency.value = 660;
        gain.gain.value = 0.3;
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.2);
      } else {
        osc.frequency.value = 440;
        gain.gain.value = 0.3;
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.3);
      }
    } catch (e) {
      // Silenciar errores de audio
    }
  }, [sonidoHabilitado]);

  // Mostrar notificación temporal
  const mostrarNotificacionTemporal = useCallback((mensaje, tipo) => {
    setMostrarNotificacion({ mensaje, tipo });
    setTimeout(() => setMostrarNotificacion(null), 3000);
  }, []);

  // Procesar código QR
  const procesarCodigo = useCallback(async (qrToken) => {
    const ahora = Date.now();
    
    // Evitar escaneos duplicados en corto tiempo
    if (qrToken === ultimoTokenRef.current && ahora - ultimoTiempoRef.current < 3000) {
      return;
    }
    if (procesandoRef.current) return;

    procesandoRef.current = true;
    ultimoTokenRef.current = qrToken;
    ultimoTiempoRef.current = ahora;

    try {
      const data = await api.qr.escanear(qrToken);
      
      const entry = {
        id: `${qrToken}-${ahora}`,
        nombre: data.nombre || 'Usuario',
        email: data.email || '—',
        mensaje: data.message || 'Registro exitoso',
        tipo: data.ya_registrado ? 'repetido' : 'ok',
        hora: new Date().toLocaleTimeString(),
        timestamp: ahora,
      };

      setHistorial((prev) => [entry, ...prev]);
      
      // Feedback visual y sonoro
      if (data.ya_registrado) {
        reproducirSonido('repetido');
        mostrarNotificacionTemporal('⚠️ Pase ya registrado', 'warning');
      } else {
        reproducirSonido('ok');
        mostrarNotificacionTemporal('✅ Registro exitoso', 'success');
      }

    } catch (err) {
      const errorMsg = err.message || 'Error al procesar el código';
      
      setHistorial((prev) => [
        {
          id: `error-${ahora}`,
          nombre: '—',
          email: '—',
          mensaje: errorMsg,
          tipo: 'error',
          hora: new Date().toLocaleTimeString(),
          timestamp: ahora,
        },
        ...prev,
      ]);
      
      reproducirSonido('error');
      mostrarNotificacionTemporal(`❌ ${errorMsg}`, 'error');
      
    } finally {
      procesandoRef.current = false;
    }
  }, [reproducirSonido, mostrarNotificacionTemporal]);

  // Inicializar scanner
  useEffect(() => {
    if (!escaneando || loading) return;

    const scanner = new Html5QrcodeScanner(
      'lector-qr',
      { 
        fps: 10, 
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
        formatsToSupport: [ 'QR_CODE' ]
      },
      false
    );

    scanner.render(
      (decodedText) => procesarCodigo(decodedText),
      (error) => {
        // Silenciar errores de renderizado
      }
    );

    scannerRef.current = scanner;

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {});
      }
    };
  }, [escaneando, procesarCodigo, loading]);

  // Limpiar historial
  const limpiarHistorial = () => {
    if (window.confirm('¿Deseas limpiar el historial de escaneos?')) {
      setHistorial([]);
    }
  };

  // Formatear tiempo para mostrar
  const formatearTiempo = (timestamp) => {
    const diff = Date.now() - timestamp;
    if (diff < 60000) return 'ahora';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
    return new Date(timestamp).toLocaleTimeString();
  };

  if (loading) {
    return (
      <div className="escanearContainer">
        <div className="escanearLoading">
          <div className="escanearSpinner"></div>
          <p>Cargando información del evento...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="escanearContainer">
        <div className="escanearError">
          <FiAlertTriangle className="escanearErrorIcon" />
          <p>{error}</p>
          <button onClick={() => navigate('/datos-sesion')} className="escanearVolverButton">
            <FiArrowLeft /> Volver
          </button>
        </div>
      </div>
    );
  }

  const eventoActivo = evento?.estado === 'en_curso';

  return (
    <div className="escanearContainer">
      {/* Notificación flotante */}
      {mostrarNotificacion && (
        <div className={`escanearNotificacion escanearNotificacion--${mostrarNotificacion.tipo}`}>
          <span className="escanearNotificacionIcon">
            {mostrarNotificacion.tipo === 'success' && <FiCheckCircle />}
            {mostrarNotificacion.tipo === 'warning' && <FiAlertTriangle />}
            {mostrarNotificacion.tipo === 'error' && <FiXCircle />}
          </span>
          <span>{mostrarNotificacion.mensaje}</span>
        </div>
      )}

      {/* Header */}
      <div className="escanearHeader">
        <div className="escanearHeaderLeft">
          <h1 className="escanearTitle">
            <FiCamera className="escanearTitleIcon" />
            Escáner QR
          </h1>
          <div className="escanearEventoInfo">
            <span className="escanearEventoNombre">{evento?.titulo}</span>
            <span className={`escanearEventoEstado ${eventoActivo ? 'activo' : 'inactivo'}`}>
              {eventoActivo ? '● Activo' : '● Inactivo'}
            </span>
          </div>
        </div>
        <div className="escanearHeaderActions">
          <button
            onClick={() => setSonidoHabilitado(!sonidoHabilitado)}
            className="escanearSonidoButton"
            title={sonidoHabilitado ? 'Desactivar sonido' : 'Activar sonido'}
          >
            {sonidoHabilitado ? <FiVolume2 /> : <FiVolumeX />}
          </button>
          <button onClick={() => navigate('/datos-sesion')} className="escanearVolverButton">
            <FiArrowLeft className="escanearVolverIcon" />
            Volver
          </button>
        </div>
      </div>

      {/* Estado del evento */}
      {!eventoActivo && (
        <div className="escanearAdvertencia">
          <FiAlertTriangle className="escanearAdvertenciaIcon" />
          <div>
            <strong>Evento no activo</strong>
            <p>El evento debe estar en curso para poder escanear entradas.</p>
          </div>
        </div>
      )}

      <p className="escanearSubtitle">
        Apunta la cámara al código QR del pase de cada asistente para registrar su entrada.
        {eventoActivo && ' El evento está activo y listo para escanear.'}
      </p>

      {/* Lector QR */}
      <div className="escanearLectorWrapper">
        {escaneando ? (
          <div id="lector-qr" className="escanearLector" />
        ) : (
          <div className="escanearPausado">
            <FiCamera className="escanearPausadoIcon" />
            <p>Cámara en pausa</p>
            <button
              onClick={() => setEscaneando(true)}
              className="escanearReanudarButton"
            >
              <FiPlay /> Reanudar
            </button>
          </div>
        )}
        
        {/* Controles del escáner */}
        <div className="escanearControles">
          <button
            onClick={() => setEscaneando((prev) => !prev)}
            className={`escanearPausarButton ${!escaneando ? 'escanearPausarButtonActivo' : ''}`}
          >
            {escaneando ? (
              <>
                <FiPause className="escanearPausarIcon" />
                Pausar
              </>
            ) : (
              <>
                <FiPlay className="escanearPausarIcon" />
                Reanudar
              </>
            )}
          </button>
          
          <button
            onClick={limpiarHistorial}
            className="escanearLimpiarButton"
            disabled={historial.length === 0}
          >
            <FiRefreshCw className="escanearLimpiarIcon" />
            Limpiar historial
          </button>
        </div>
      </div>

      {/* Estadísticas */}
      {historial.length > 0 && (
        <div className="escanearEstadisticas">
          <div className="escanearEstadistica">
            <span className="escanearEstadisticaNumero">{historial.filter(h => h.tipo === 'ok').length}</span>
            <span className="escanearEstadisticaLabel">Registros exitosos</span>
          </div>
          <div className="escanearEstadisticaDivider" />
          <div className="escanearEstadistica">
            <span className="escanearEstadisticaNumero warning">{historial.filter(h => h.tipo === 'repetido').length}</span>
            <span className="escanearEstadisticaLabel">Duplicados</span>
          </div>
          <div className="escanearEstadisticaDivider" />
          <div className="escanearEstadistica">
            <span className="escanearEstadisticaNumero error">{historial.filter(h => h.tipo === 'error').length}</span>
            <span className="escanearEstadisticaLabel">Errores</span>
          </div>
          <div className="escanearEstadisticaDivider" />
          <div className="escanearEstadistica">
            <span className="escanearEstadisticaNumero">{historial.length}</span>
            <span className="escanearEstadisticaLabel">Total</span>
          </div>
        </div>
      )}

      {/* Historial */}
      <div className="escanearHistorial">
        <div className="escanearHistorialHeader">
          <h3 className="escanearHistorialTitle">
            <FiClock className="escanearHistorialIcon" />
            Últimos escaneos
          </h3>
          <span className="escanearHistorialCount">{historial.length}</span>
        </div>
        
        {historial.length === 0 ? (
          <div className="escanearHistorialVacio">
            <FiInfo className="escanearHistorialVacioIcon" />
            <p>Aún no has escaneado ningún pase.</p>
            <p className="escanearHistorialVacioSub">Escanea un código QR para comenzar</p>
          </div>
        ) : (
          <ul className="escanearHistorialLista">
            {historial.slice(0, 20).map((item) => (
              <li 
                key={item.id} 
                className={`escanearHistorialItem escanearHistorialItem--${item.tipo}`}
                style={{
                  animation: `slideIn 0.4s cubic-bezier(0.22, 1, 0.36, 1) both`
                }}
              >
                <div className="escanearHistorialIcono">
                  {item.tipo === 'ok' ? (
                    <FiCheckCircle className="escanearHistorialIconoOk" />
                  ) : item.tipo === 'repetido' ? (
                    <FiAlertTriangle className="escanearHistorialIconoWarning" />
                  ) : (
                    <FiXCircle className="escanearHistorialIconoError" />
                  )}
                </div>
                
                <div className="escanearHistorialContenido">
                  <div className="escanearHistorialHeaderInfo">
                    <strong className="escanearHistorialNombre">{item.nombre}</strong>
                    <span className="escanearHistorialMensaje">{item.mensaje}</span>
                  </div>
                  {item.email !== '—' && (
                    <div className="escanearHistorialEmail">
                      <FiMail className="escanearHistorialEmailIcon" />
                      {item.email}
                    </div>
                  )}
                </div>
                
                <div className="escanearHistorialMeta">
                  <span className="escanearHistorialHora">
                    {formatearTiempo(item.timestamp)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
        
        {historial.length > 20 && (
          <div className="escanearHistorialFooter">
            <span>Mostrando los últimos 20 escaneos</span>
          </div>
        )}
      </div>
    </div>
  );
}