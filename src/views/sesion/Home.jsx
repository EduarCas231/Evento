import React, { useEffect, useRef, useState } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useNotificaciones } from '../../hooks/useNotificaciones';
import { useSSE } from '../../hooks/useSSE';
import '../../styles/Home.css';

const etiquetaTipo = (tipo) => (
  <span className={`homeCardType ${tipo === 'privado' ? 'homeCardTypePrivado' : 'homeCardTypePublico'}`}>
    {tipo === 'privado' ? '🔒 Privado' : '🌐 Público'}
  </span>
);

function calcularRestante(fecha, horaInicio) {
  if (!fecha || !horaInicio) return null;
  const inicio = new Date(`${fecha}T${horaInicio}`);
  const diff = inicio - Date.now();
  if (diff <= 0) return null;
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  if (h >= 24) return `${Math.floor(h / 24)}d ${h % 24}h ${m}m`;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function TarjetaEvento({ evento, index }) {
  const [countdown, setCountdown] = useState(() => calcularRestante(evento.fecha, evento.hora_inicio));
  const [isHovered, setIsHovered] = useState(false);
  const notif5Ref = useRef(false);

  useEffect(() => {
    const timer = setInterval(() => {
      const inicio = new Date(`${evento.fecha}T${evento.hora_inicio}`);
      const diff = inicio - Date.now();

      if (diff > 240000 && diff <= 300000 && !notif5Ref.current) {
        if (Notification.permission === 'granted') {
          new Notification(`⏰ Empieza en 5 min — ${evento.titulo}`, {
            body: `Inicia a las ${evento.hora_inicio} en ${evento.sala || 'su sala'}.`,
            icon: '/favicon.ico',
          });
        }
        notif5Ref.current = true;
      }

      setCountdown(calcularRestante(evento.fecha, evento.hora_inicio));
    }, 1000);
    return () => clearInterval(timer);
  }, [evento.fecha, evento.hora_inicio, evento.titulo, evento.sala]);

  const ocupados = evento.ocupados ?? 0;
  const capacidad = evento.capacidad;
  const porcentaje = capacidad ? Math.round((ocupados / capacidad) * 100) : 0;
  const barColor = porcentaje >= 90 ? '#dc3545' : porcentaje >= 60 ? '#fd7e14' : '#28a745';

  return (
    <div
      className={`homeCard ${isHovered ? 'homeCardHovered' : ''}`}
      style={{
        animation: `slideUp 0.6s ease ${index * 0.1}s both`,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="homeCardHeader">
        <span className="homeCardCode">Código: {evento.code || '—'}</span>
        {etiquetaTipo(evento.tipo)}
      </div>

      <h3 className="homeCardTitle">{evento.titulo}</h3>
      <p className="homeCardDescription">{evento.detalles || 'Sin descripción.'}</p>

      <div className="homeCardDetails">
        <div className="homeDetailItem">
          <span className="homeDetailIcon">📍</span>
          <span><strong>Sala:</strong> {evento.sala || '—'}</span>
        </div>
        <div className="homeDetailItem">
          <span className="homeDetailIcon">📅</span>
          <span><strong>Fecha:</strong> {evento.fecha || '—'}</span>
        </div>
        <div className="homeDetailItem">
          <span className="homeDetailIcon">⏰</span>
          <span><strong>Horario:</strong> {evento.hora_inicio} - {evento.hora_fin}</span>
        </div>
        <div className="homeDetailItem">
          <span className="homeDetailIcon">👤</span>
          <span><strong>Organizador:</strong> {evento.organizador || '—'}</span>
        </div>
      </div>

      {capacidad ? (
        <div className="homeProgressContainer">
          <div className="homeProgressHeader">
            <span>👥 Asistentes: <strong>{ocupados}</strong> / {capacidad}</span>
            <span className="homeProgressPercent" style={{ color: barColor }}>{porcentaje}%</span>
          </div>
          <div className="homeProgressBar">
            <div
              className="homeProgressFill"
              style={{
                width: `${porcentaje}%`,
                backgroundColor: barColor,
              }}
            />
          </div>
        </div>
      ) : (
        <div className="homeAttendeesSimple">
          👥 Asistentes: <strong>{ocupados}</strong>
        </div>
      )}

      <div className={`homeCountdownContainer ${countdown ? 'homeCountdownActive' : 'homeCountdownInactive'}`}>
        {countdown ? (
          <>
            <div className="homeCountdownLabel">⏳ Comienza en</div>
            <div className="homeCountdownValue">{countdown}</div>
          </>
        ) : (
          <div className="homeCountdownFinished">🟢 Evento en curso o finalizado</div>
        )}
      </div>
    </div>
  );
}

export default function Home() {
  const [registrados, setRegistrados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useNotificaciones(registrados);
  useSSE(setRegistrados);

  useEffect(() => {
    const cargar = async () => {
      try {
        const data = await api.sesiones.misRegistros();
        const enriquecidos = await Promise.all(
          data.map(async (s, index) => {
            try {
              const info = await api.sesiones.asistentes(s.id);
              return { ...s, ocupados: info.ocupados, capacidad: info.capacidad ?? s.capacidad, index };
            } catch { return { ...s, index }; }
          })
        );
        setRegistrados(enriquecidos);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, []);

  return (
    <div className="homeContainer">
      <div className="homeHeader">
        <div className="homeHeaderContent">
          <div>
            <h1 className="homeTitle">Mis Eventos</h1>
            <p className="homeSubtitle">
              Bienvenido, <strong className="homeUsername">{user?.username}</strong>
            </p>
          </div>
          <div className="homeBadge">
            <span className="homeBadgeText">
              {registrados.length} {registrados.length === 1 ? 'Evento' : 'Eventos'}
            </span>
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
          <svg className="homeErrorIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {!loading && !error && (
        registrados.length === 0 ? (
          <div className="homeEmpty">
            <svg className="homeEmptyIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <h3 className="homeEmptyTitle">Aún no estás registrado</h3>
            <p className="homeEmptyText">
              Ve a la sección <strong>Eventos</strong> para unirte a eventos disponibles.
            </p>
          </div>
        ) : (
          <div className="homeGrid">
            {registrados.map((s) => (
              <TarjetaEvento key={s.id} evento={s} index={s.index || 0} />
            ))}
          </div>
        )
      )}
    </div>
  );
}