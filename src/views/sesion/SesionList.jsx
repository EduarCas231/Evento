import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import '../../styles/SesionList.css';

const etiquetaTipo = (tipo) => (
  <span className={`sesionListCardType ${tipo === 'privado' ? 'sesionListCardTypePrivado' : 'sesionListCardTypePublico'}`}>
    {tipo === 'privado' ? '🔒 Privado' : '🌐 Público'}
  </span>
);

function BarraAsistencia({ asistentes, capacidad }) {
  const total = parseInt(capacidad) || 0;
  const ocupados = asistentes || 0;
  const disponibles = total > 0 ? total - ocupados : null;
  const porcentaje = total > 0 ? Math.min((ocupados / total) * 100, 100) : 0;
  const color = porcentaje >= 90 ? '#dc3545' : porcentaje >= 60 ? '#fd7e14' : '#28a745';

  return (
    <div className="sesionListBarraContainer">
      <div className="sesionListBarraHeader">
        <span>👥 <strong>{ocupados}</strong> asistentes registrados</span>
        {disponibles !== null && (
          <span className={`sesionListBarraStatus ${disponibles === 0 ? 'sesionListBarraStatusFull' : 'sesionListBarraStatusAvailable'}`}>
            {disponibles === 0 ? '🚫 Sin lugares' : `✅ ${disponibles} lugares disponibles`}
          </span>
        )}
      </div>
      {total > 0 && (
        <div className="sesionListBarraBackground">
          <div 
            className="sesionListBarraFill"
            style={{
              width: `${porcentaje}%`,
              backgroundColor: color,
            }}
          />
        </div>
      )}
    </div>
  );
}

function TarjetaDetalle({ sesion, onEditar, onEliminar, index }) {
  const [asistentes, setAsistentes] = useState(null);
  const [loadingA, setLoadingA] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    api.sesiones.asistentes(sesion.id)
      .then((data) => setAsistentes(data.ocupados ?? 0))
      .catch(() => setAsistentes(0))
      .finally(() => setLoadingA(false));
  }, [sesion.id]);

  return (
    <div
      className={`sesionListCard ${isHovered ? 'sesionListCardHovered' : ''}`}
      style={{
        animation: `slideUp 0.6s ease ${index * 0.1}s both`,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="sesionListCardHeader">
        <div className="sesionListCardHeaderLeft">
          <span className="sesionListCardCode">{sesion.code || '—'}</span>
          {etiquetaTipo(sesion.tipo)}
        </div>
        <div className="sesionListCardActions">
          <button onClick={onEditar} className="sesionListEditButton">
            ✏️ Editar
          </button>
          <button onClick={onEliminar} className="sesionListDeleteButton">
            🗑️ Eliminar
          </button>
        </div>
      </div>

      <div className="sesionListCardBody">
        <h3 className="sesionListCardTitle">{sesion.titulo}</h3>
        <p className="sesionListCardDescription">{sesion.detalles || 'Sin descripción.'}</p>

        <div className="sesionListInfoGrid">
          <div className="sesionListInfoItem">
            <span className="sesionListInfoIcon">📍</span>
            <span><strong>Sala:</strong> {sesion.sala || '—'}</span>
          </div>
          <div className="sesionListInfoItem">
            <span className="sesionListInfoIcon">🗺️</span>
            <span><strong>Zona:</strong> {sesion.zona || '—'}</span>
          </div>
          <div className="sesionListInfoItem">
            <span className="sesionListInfoIcon">📅</span>
            <span><strong>Fecha:</strong> {sesion.fecha || '—'}</span>
          </div>
          <div className="sesionListInfoItem">
            <span className="sesionListInfoIcon">⏰</span>
            <span><strong>Horario:</strong> {sesion.hora_inicio} - {sesion.hora_fin}</span>
          </div>
          <div className="sesionListInfoItem">
            <span className="sesionListInfoIcon">🎯</span>
            <span><strong>Capacidad:</strong> {sesion.capacidad ? `${sesion.capacidad} personas` : '—'}</span>
          </div>
          <div className="sesionListInfoItem">
            <span className="sesionListInfoIcon">👤</span>
            <span><strong>Organizador:</strong> {sesion.organizador || '—'}</span>
          </div>
        </div>

        {loadingA ? (
          <div className="sesionListLoadingAsistencia">
            <span className="sesionListSmallSpinner"></span>
            <span>Cargando asistencia...</span>
          </div>
        ) : (
          <BarraAsistencia asistentes={asistentes} capacidad={sesion.capacidad} />
        )}
      </div>
    </div>
  );
}

export default function SesionList() {
  const [sesiones, setSesiones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    api.sesiones.listar()
      .then((data) => {
        const propios = data.filter((s) => s.organizador === user?.username);
        setSesiones(propios);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [user]);

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar esta sesión?')) return;
    try {
      await api.sesiones.eliminar(id);
      setSesiones((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="sesionListLoadingContainer">
        <div className="sesionListSpinner"></div>
        <p className="sesionListLoadingText">Cargando tus sesiones...</p>
      </div>
    );
  }

  return (
    <div className="sesionListContainer">
      <div className="sesionListHeader">
        <div className="sesionListHeaderContent">
          <div>
            <h1 className="sesionListTitle">Mis Sesiones</h1>
            <p className="sesionListSubtitle">
              {sesiones.length} evento{sesiones.length !== 1 ? 's' : ''} creado{sesiones.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={() => navigate('/sesiones/nueva')}
            className="sesionListCreateButton"
          >
            <svg className="sesionListCreateIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Nueva Sesión
          </button>
        </div>
      </div>

      {error && (
        <div className="sesionListError">
          <svg className="sesionListErrorIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {sesiones.length === 0 ? (
        <div className="sesionListEmpty">
          <svg className="sesionListEmptyIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <h3 className="sesionListEmptyTitle">Aún no has creado sesiones</h3>
          <p className="sesionListEmptyText">
            Comienza creando tu primera sesión para el congreso
          </p>
        </div>
      ) : (
        <div className="sesionListGrid">
          {sesiones.map((s, index) => (
            <TarjetaDetalle
              key={s.id}
              sesion={s}
              index={index}
              onEditar={() => navigate(`/sesiones/editar/${s.id}`)}
              onEliminar={() => handleEliminar(s.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}