// pages/Home.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSesiones } from '../../context/SesionesContext';
import '../../styles/Home.css';

// Importar íconos (usando React Icons o SVG inline)
import { 
  FiLock, FiGlobe, FiClock, 
  FiUser, FiUsers, FiAlertCircle, FiCheckCircle,
  FiActivity, FiAward, FiBookOpen, FiMapPin
} from 'react-icons/fi';
import { MdLocationOn, MdAccessTime, MdDateRange } from 'react-icons/md';

const etiquetaTipo = (tipo) => (
  <span className={`homeCardType ${tipo === 'privado' ? 'homeCardTypePrivado' : 'homeCardTypePublico'}`}>
    {tipo === 'privado' ? <FiLock className="homeCardTypeIcon" /> : <FiGlobe className="homeCardTypeIcon" />}
    {tipo === 'privado' ? ' Privado' : ' Público'}
  </span>
);

function obtenerEstadoInfo(estado) {
  const config = {
    pendiente: { 
      texto: 'Por comenzar', 
      clase: 'homeCardStatePendiente', 
      label: 'Comienza en',
      icon: FiClock
    },
    en_curso: { 
      texto: 'En progreso', 
      clase: 'homeCardStateEnCurso', 
      label: 'Finaliza en',
      icon: FiActivity
    },
    finalizado: { 
      texto: 'Completado', 
      clase: 'homeCardStateFinalizado', 
      label: 'Evento finalizado',
      icon: FiCheckCircle
    },
  };
  return config[estado] || { 
    texto: 'Disponible', 
    clase: 'homeCardStateDefault', 
    label: 'Estado',
    icon: FiBookOpen
  };
}

function calcularTemporizador(evento) {
  if (!evento?.fecha || !evento?.hora_inicio) return null;
  const ahora = Date.now();
  const inicio = new Date(`${evento.fecha}T${evento.hora_inicio}`);
  const fin = evento.hora_fin ? new Date(`${evento.fecha}T${evento.hora_fin}`) : null;

  let diff = null;
  if (evento.estado === 'pendiente') {
    diff = inicio - ahora;
  } else if (evento.estado === 'en_curso' && fin) {
    diff = fin - ahora;
  }

  if (!diff || diff <= 0) return null;

  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  
  if (h >= 24) {
    const days = Math.floor(h / 24);
    return `${days}d ${h % 24}h ${m}m`;
  }
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function TarjetaEvento({ evento, index }) {
  const estadoInfo = obtenerEstadoInfo(evento.estado);
  const [countdown, setCountdown] = useState(() => calcularTemporizador(evento));
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(calcularTemporizador(evento));
    }, 1000);
    return () => clearInterval(timer);
  }, [evento]);

  const ocupados = evento.ocupados ?? 0;
  const zona= evento.zona || 'No especificada';
  const capacidad = evento.capacidad;
  const porcentaje = capacidad ? Math.round((ocupados / capacidad) * 100) : 0;
  const barColor = porcentaje >= 90 ? '#dc3545' : porcentaje >= 60 ? '#fd7e14' : '#28a745';

  const StateIcon = estadoInfo.icon;

  return (
    <div
      className={`homeCard ${isHovered ? 'homeCardHovered' : ''}`}
      style={{
        animation: `slideUp 0.6s cubic-bezier(0.22, 1, 0.36, 1) ${index * 0.1}s both`,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Borde superior decorativo */}
      <div className="homeCardAccent" />
      
      <div className="homeCardHeader">
        <div className="homeCardCode">
          <FiBookOpen className="homeCardCodeIcon" />
          {evento.code || '---'}
        </div>
        <div className="homeCardHeaderRight">
          {etiquetaTipo(evento.tipo)}
          <span className={`homeCardState ${estadoInfo.clase}`}>
            <StateIcon className="homeCardStateIcon" />
            {estadoInfo.texto}
          </span>
        </div>
      </div>

      <h3 className="homeCardTitle">{evento.titulo}</h3>
      <p className="homeCardDescription">{evento.detalles || 'Sin descripción disponible.'}</p>

      <div className="homeCardDetails">
        <div className="homeDetailItem">
          <MdLocationOn className="homeDetailIcon" />
          <span><strong>Sala:</strong> {evento.sala || 'No asignada'}</span>
        </div>
        <div className="homeDetailItem">
          <FiMapPin className="homeDetailIcon" />
          <span><strong>Ubicación:</strong> {zona}</span>
        </div>
        <div className="homeDetailItem">
          <MdDateRange className="homeDetailIcon" />
          <span><strong>Fecha:</strong> {evento.fecha || 'No especificada'}</span>
        </div>
        <div className="homeDetailItem">
          <MdAccessTime className="homeDetailIcon" />
          <span><strong>Horario:</strong> {evento.hora_inicio} - {evento.hora_fin || '...'}</span>
        </div>
        <div className="homeDetailItem">
          <FiUser className="homeDetailIcon" />
          <span><strong>Organizador:</strong> {evento.organizador || 'No especificado'}</span>
        </div>
      </div>

      {capacidad ? (
        <div className="homeProgressContainer">
          <div className="homeProgressHeader">
            <div className="homeProgressLabel">
              <FiUsers className="homeProgressIcon" />
              <span>Asistentes: <strong>{ocupados}</strong> / {capacidad}</span>
            </div>
            <span className="homeProgressPercent" style={{ color: barColor }}>
              {porcentaje}%
            </span>
          </div>
          <div className="homeProgressBar">
            <div
              className="homeProgressFill"
              style={{
                width: `${porcentaje}%`,
                backgroundColor: barColor,
                transition: 'width 0.8s cubic-bezier(0.22, 1, 0.36, 1)',
              }}
            />
          </div>
        </div>
      ) : (
        <div className="homeAttendeesSimple">
          <FiUsers className="homeAttendeesIcon" />
          <span>Asistentes: <strong>{ocupados}</strong></span>
        </div>
      )}

      <div className={`homeCountdownContainer ${countdown ? 'homeCountdownActive' : 'homeCountdownInactive'}`}>
        {evento.estado === 'finalizado' ? (
          <div className="homeCountdownFinished">
            <FiCheckCircle className="homeCountdownIcon" />
            Evento completado
          </div>
        ) : countdown ? (
          <>
            <div className="homeCountdownLabel">
              <FiClock className="homeCountdownLabelIcon" />
              {estadoInfo.label}
            </div>
            <div className="homeCountdownValue">{countdown}</div>
          </>
        ) : (
          <div className="homeCountdownFinished">
            <FiActivity className="homeCountdownIcon" />
            {evento.estado === 'en_curso' ? 'En progreso' : 'Inicia pronto'}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Home() {
  const { user } = useAuth();
  const { sesiones, misUnionesIds, loading, error, conectado } = useSesiones();
  
  const registrados = useMemo(() => {
    if (!user || !sesiones.length) return [];
    
    return sesiones.filter(sesion => 
      sesion.organizador === user.username || misUnionesIds.has(sesion.id)
    );
  }, [sesiones, user, misUnionesIds]);

  useEffect(() => {
    if (!loading && registrados.length > 0) {
      console.log(`Home: ${registrados.length} eventos registrados, SSE: ${conectado ? 'conectado' : 'desconectado'}`);
    }
  }, [registrados, conectado, loading]);

  return (
    <div className="homeContainer">
      <div className="homeHeader">
        <div className="homeHeaderContent">
          <div className="homeHeaderLeft">
            <h1 className="homeTitle">
              Mis Eventos
            </h1>
            <p className="homeSubtitle">
              Bienvenido, <strong className="homeUsername">{user?.username}</strong>
            </p>
          </div>
          <div className="homeHeaderRight">
            <div className="homeBadge">
              <span className="homeBadgeNumber">{registrados.length}</span>
              <span className="homeBadgeLabel">
                {registrados.length === 1 ? 'Evento' : 'Eventos'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {loading && (
        <div className="homeLoading">
          <div className="homeSpinner"></div>
          <p className="homeLoadingText">Cargando tus eventos...</p>
        </div>
      )}

      {error && (
        <div className="homeError">
          <FiAlertCircle className="homeErrorIcon" />
          <span>{error}</span>
        </div>
      )}

      {!loading && !error && (
        registrados.length === 0 ? (
          <div className="homeEmpty">
            <div className="homeEmptyIconContainer">
              <FiBookOpen className="homeEmptyIcon" />
            </div>
            <h3 className="homeEmptyTitle">Aún no estás registrado</h3>
            <p className="homeEmptyText">
              Explora la sección <strong>Eventos</strong> para encontrar y unirte a eventos disponibles.
            </p>
          </div>
        ) : (
          <div className="homeGrid">
            {registrados.map((sesion, index) => (
              <TarjetaEvento 
                key={sesion.id} 
                evento={sesion} 
                index={index} 
              /> 
            ))}
          </div>
        )
      )}
    </div>
  );
}