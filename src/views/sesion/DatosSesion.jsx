// src/views/sesion/DatosEvento.jsx
import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useSesiones } from '../../context/SesionesContext';
import '../../styles/DatosSesion.css';

const EtiquetaTipo = ({ tipo }) => (
  <span className={`datosSesionEtiqueta ${tipo === 'privado' ? 'datosSesionEtiquetaPrivado' : 'datosSesionEtiquetaPublico'}`}>
    {tipo === 'privado' ? '🔒 Privado' : '🌐 Público'}
  </span>
);

const EtiquetaEstado = ({ estado }) => {
  const config = {
    pendiente: { texto: '⏳ Pendiente', clase: 'datosSesionEstadoPendiente' },
    en_curso: { texto: '🟢 En curso', clase: 'datosSesionEstadoEnCurso' },
    finalizado: { texto: '🏁 Finalizado', clase: 'datosSesionEstadoFinalizado' },
  };
  const { texto, clase } = config[estado] || config.pendiente;
  return <span className={`datosSesionEtiquetaEstado ${clase}`}>{texto}</span>;
};

const BarraAsistencia = ({ ocupados, capacidad, etiqueta }) => {
  const total = parseInt(capacidad) || 0;
  const disponibles = total > 0 ? total - ocupados : null;
  const porcentaje = total > 0 ? Math.min((ocupados / total) * 100, 100) : 0;
  const color = porcentaje >= 90 ? '#dc3545' : porcentaje >= 60 ? '#fd7e14' : '#28a745';

  return (
    <div className="datosSesionBarraContainer">
      <div className="datosSesionBarraHeader">
        <span>👥 <strong>{ocupados}</strong> {etiqueta}</span>
        {disponibles !== null && (
          <span className={`datosSesionBarraDisponibles ${disponibles === 0 ? 'datosSesionBarraLleno' : 'datosSesionBarraDisponible'}`}>
            {disponibles === 0 ? '🚫 Sin lugares' : `✅ ${disponibles} lugares disponibles`}
          </span>
        )}
      </div>
      {total > 0 && (
        <div className="datosSesionBarraBackground">
          <div 
            className="datosSesionBarraFill" 
            style={{ 
              width: `${porcentaje}%`, 
              backgroundColor: color 
            }} 
          />
        </div>
      )}
    </div>
  );
};

const PanelEvento = ({ evento, onEditar, onEliminarSesion, onIniciar, onFinalizar, index }) => {
  const navigate = useNavigate();
  const [datos, setDatos] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [isHovered, setIsHovered] = React.useState(false);
  const [cambiandoEstado, setCambiandoEstado] = React.useState(false);

  const cargarAsistentes = React.useCallback(() => {
    setLoading(true);
    api.sesiones.asistentes(evento.id)
      .then(setDatos)
      .catch(() => setDatos({ ocupados: 0, capacidad: evento.capacidad, asistentes: [] }))
      .finally(() => setLoading(false));
  }, [evento.id]);

  React.useEffect(() => {
    cargarAsistentes();
  }, [evento.id, evento.ocupados, cargarAsistentes]);

  const handleEliminarAsistente = async (idAsistencia, nombre) => {
    if (!window.confirm(`¿Eliminar a ${nombre} del evento?`)) return;
    try {
      await api.sesiones.eliminarAsistente(idAsistencia);
      cargarAsistentes();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleIniciar = async () => {
    if (!window.confirm('¿Iniciar este evento ahora? Se notificará a todos los inscritos.')) return;
    setCambiandoEstado(true);
    try {
      await onIniciar(evento.id);
    } catch (err) {
      alert(err.message);
    } finally {
      setCambiandoEstado(false);
    }
  };

  const handleFinalizar = async () => {
    if (!window.confirm('¿Finalizar este evento ahora?')) return;
    setCambiandoEstado(true);
    try {
      await onFinalizar(evento.id);
    } catch (err) {
      alert(err.message);
    } finally {
      setCambiandoEstado(false);
    }
  };

  const etiquetaAsistencia = evento.estado === 'pendiente' ? 'registrados' : 'con pase generado';

  return (
    <div 
      className={`datosSesionPanel ${isHovered ? 'datosSesionPanelHovered' : ''}`}
      style={{ animationDelay: `${index * 0.1}s` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="datosSesionPanelHeader">
        <div className="datosSesionPanelHeaderLeft">
          <span className="datosSesionPanelCode">{evento.code || '—'}</span>
          <EtiquetaTipo tipo={evento.tipo} />
          <EtiquetaEstado estado={evento.estado} />
        </div>
        <div className="datosSesionPanelActions">
          {evento.estado === 'pendiente' && (
            <button onClick={handleIniciar} disabled={cambiandoEstado} className="datosSesionStartButton">
              ▶️ Iniciar evento
            </button>
          )}
          {evento.estado === 'en_curso' && (
            <button onClick={handleFinalizar} disabled={cambiandoEstado} className="datosSesionEndButton">
              ⏹️ Finalizar evento
            </button>
          )}
          <button
            onClick={() => navigate(`/sesiones/escanear/${evento.id}`)}
            className="datosSesionScanButton"
            disabled={evento.estado !== 'en_curso'}
            title={evento.estado !== 'en_curso' ? 'El evento debe estar en curso para escanear' : 'Ir al escáner'}
          >
            📷 Escanear
          </button>
          <button onClick={onEditar} className="datosSesionEditButton">
            ✏️ Editar
          </button>
          <button onClick={onEliminarSesion} className="datosSesionDeleteButton">
            🗑️ Eliminar
          </button>
        </div>
      </div>

      <div className="datosSesionPanelBody">
        <h3 className="datosSesionPanelTitle">{evento.titulo}</h3>
        <p className="datosSesionPanelDescription">{evento.detalles || 'Sin descripción.'}</p>

        <div className="datosSesionInfoGrid">
          <div className="datosSesionInfoItem">
            <span className="datosSesionInfoIcon">📍</span>
            <span><strong>Sala:</strong> {evento.sala || '—'}</span>
          </div>
          <div className="datosSesionInfoItem">
            <span className="datosSesionInfoIcon">🗺️</span>
            <span><strong>Zona:</strong> {evento.zona || '—'}</span>
          </div>
          <div className="datosSesionInfoItem">
            <span className="datosSesionInfoIcon">📅</span>
            <span><strong>Fecha:</strong> {evento.fecha || '—'}</span>
          </div>
          <div className="datosSesionInfoItem">
            <span className="datosSesionInfoIcon">⏰</span>
            <span><strong>Horario:</strong> {evento.hora_inicio} - {evento.hora_fin}</span>
          </div>
          <div className="datosSesionInfoItem">
            <span className="datosSesionInfoIcon">🎯</span>
            <span><strong>Capacidad:</strong> {evento.capacidad ? `${evento.capacidad} personas` : '—'}</span>
          </div>
          <div className="datosSesionInfoItem">
            <span className="datosSesionInfoIcon">👤</span>
            <span><strong>Organizador:</strong> {evento.organizador || '—'}</span>
          </div>
        </div>

        {loading ? (
          <div className="datosSesionLoadingAsistencia">
            <span className="datosSesionSmallSpinner"></span>
            <span>Cargando asistencia...</span>
          </div>
        ) : (
          <BarraAsistencia ocupados={datos?.ocupados ?? 0} capacidad={evento.capacidad} etiqueta={etiquetaAsistencia} />
        )}

        <div className="datosSesionParticipantesContainer">
          <div className="datosSesionParticipantesHeader">
            <h4 className="datosSesionParticipantesTitle">
              {evento.estado === 'pendiente' ? '👥 Participantes' : '✅ Asistencia'}
            </h4>
            <span className="datosSesionParticipantesCount">
              {datos?.asistentes?.length || 0} {datos?.asistentes?.length === 1 ? 'participante' : 'participantes'}
            </span>
          </div>

          {loading ? (
            <p className="datosSesionParticipantesLoading">Cargando participantes...</p>
          ) : !datos?.asistentes?.length ? (
            <div className="datosSesionParticipantesEmpty">
              <svg className="datosSesionEmptyIconSmall" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 00-3-3.87" />
                <path d="M16 3.13a4 4 0 010 7.75" />
              </svg>
              <span>Sin participantes registrados</span>
            </div>
          ) : (
            <div className="datosSesionTableWrapper">
              <table className="datosSesionTable">
                <thead>
                  <tr className="datosSesionTableHeader">
                    <th className="datosSesionTableCell">Nombre</th>
                    <th className="datosSesionTableCell">Email</th>
                    <th className="datosSesionTableCell">Registro</th>
                    <th className="datosSesionTableCell">Asistencia</th>
                    <th className="datosSesionTableCell datosSesionTableCellRight">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {datos.asistentes.map((a, idx) => (
                    <tr key={a.id} className="datosSesionTableRow" style={{ animationDelay: `${idx * 0.05}s` }}>
                      <td className="datosSesionTableCell">{a.nombre || a.username}</td>
                      <td className="datosSesionTableCell datosSesionTableCellEmail">{a.email}</td>
                      <td className="datosSesionTableCell datosSesionTableCellFecha">
                        {a.hora_ingreso || a.fecha_registro || '—'}
                      </td>
                      <td className="datosSesionTableCell">
                        {a.presente ? (
                          <span title={a.check_in_hora || ''}>✅ Presente</span>
                        ) : (
                          <span>⏳ Sin escanear</span>
                        )}
                      </td>
                      <td className="datosSesionTableCell datosSesionTableCellRight">
                        <button
                          onClick={() => handleEliminarAsistente(a.id, a.nombre || a.username)}
                          className="datosSesionRemoveButton"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function DatosEvento() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const { sesiones, loading, error, setSesiones, conectado, recargar } = useSesiones();

  const misEventos = useMemo(() => {
    if (!user || !sesiones.length) return [];
    return sesiones.filter(s => s.organizador === user.username);
  }, [sesiones, user]);

  const capacidadTotal = useMemo(() => {
    return misEventos.reduce((acc, s) => acc + (s.capacidad || 0), 0);
  }, [misEventos]);

  const handleEliminarEvento = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este evento?')) return;
    try {
      await api.sesiones.eliminar(id);
      setSesiones((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleIniciarEvento = async (id) => {
    await api.sesiones.iniciar(id);
  };

  const handleFinalizarEvento = async (id) => {
    await api.sesiones.finalizar(id);
  };

  if (loading) {
    return (
      <div className="datosSesionLoadingContainer">
        <div className="datosSesionSpinner"></div>
        <p className="datosSesionLoadingText">Cargando tus eventos...</p>
      </div>
    );
  }

  return (
    <div className="datosSesionContainer">
      <div className="datosSesionHeader">
        <div className="datosSesionHeaderContent">
          <div>
            <h1 className="datosSesionTitle">Datos de Mis Eventos</h1>
            <p className="datosSesionSubtitle">
              {misEventos.length} evento{misEventos.length !== 1 ? 's' : ''} creado{misEventos.length !== 1 ? 's' : ''}
              {conectado && <span className="datosSesionLiveIndicator">🟢 En vivo</span>}
            </p>
          </div>
          <div className="datosSesionBadge">
            <span className="datosSesionBadgeText">
              📊 {capacidadTotal} capacidad total
            </span>
          </div>
        </div>
      </div>

      {error && (
        <div className="datosSesionError">
          <svg className="datosSesionErrorIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>{error}</span>
          <button onClick={recargar} className="datosSesionRetryButton">
            Reintentar
          </button>
        </div>
      )}

      {misEventos.length === 0 ? (
        <div className="datosSesionEmpty">
          <svg className="datosSesionEmptyIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <h3 className="datosSesionEmptyTitle">Aún no has creado eventos</h3>
          <p className="datosSesionEmptyText">
            Comienza creando tu primer evento para ver los datos de asistencia
          </p>
          <button
            onClick={() => navigate('/sesiones/nueva')}
            className="datosSesionEmptyButton"
          >
            + Crear Evento
          </button>
        </div>
      ) : (
        <div className="datosSesionPanelsContainer">
          {misEventos.map((s, index) => (
            <PanelEvento
              key={s.id}
              evento={s}
              index={index}
              onEditar={() => navigate(`/sesiones/editar/${s.id}`)}
              onEliminarSesion={() => handleEliminarEvento(s.id)}
              onIniciar={handleIniciarEvento}
              onFinalizar={handleFinalizarEvento}
            />
          ))}
        </div>
      )}
    </div>
  );
}