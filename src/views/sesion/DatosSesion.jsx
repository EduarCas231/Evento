// src/views/sesion/DatosEvento.jsx
import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useSesiones } from '../../context/SesionesContext';
import { 
  FiLock, FiGlobe, FiClock, FiCalendar, FiMapPin, 
  FiUser, FiUsers, FiEdit2, FiTrash2, FiEye,
  FiPlay, FiSquare, FiCamera, FiPlus, FiCheckCircle,
  FiAlertCircle, FiRefreshCw, FiBookOpen, FiAward,
  FiMail, FiUserCheck, FiUserX, FiActivity
} from 'react-icons/fi';
import { MdLocationOn, MdAccessTime, MdDateRange, MdPeople, MdEvent, MdOutlineQrCodeScanner } from 'react-icons/md';
import '../../styles/DatosSesion.css';

const EtiquetaTipo = ({ tipo }) => (
  <span className={`datosSesionEtiqueta ${tipo === 'privado' ? 'datosSesionEtiquetaPrivado' : 'datosSesionEtiquetaPublico'}`}>
    {tipo === 'privado' ? <FiLock className="datosSesionEtiquetaIcon" /> : <FiGlobe className="datosSesionEtiquetaIcon" />}
    {tipo === 'privado' ? ' Privado' : ' Público'}
  </span>
);

const EtiquetaEstado = ({ estado }) => {
  const config = {
    pendiente: { 
      texto: 'Pendiente', 
      clase: 'datosSesionEstadoPendiente',
      icon: FiClock
    },
    en_curso: { 
      texto: 'En curso', 
      clase: 'datosSesionEstadoEnCurso',
      icon: FiActivity
    },
    finalizado: { 
      texto: 'Finalizado', 
      clase: 'datosSesionEstadoFinalizado',
      icon: FiCheckCircle
    },
  };
  const { texto, clase, icon: Icon } = config[estado] || config.pendiente;
  return (
    <span className={`datosSesionEtiquetaEstado ${clase}`}>
      <Icon className="datosSesionEstadoIcon" />
      {texto}
    </span>
  );
};

const BarraAsistencia = ({ ocupados, capacidad, etiqueta }) => {
  const total = parseInt(capacidad) || 0;
  const disponibles = total > 0 ? total - ocupados : null;
  const porcentaje = total > 0 ? Math.min((ocupados / total) * 100, 100) : 0;
  const color = porcentaje >= 90 ? '#dc3545' : porcentaje >= 60 ? '#fd7e14' : '#28a745';

  return (
    <div className="datosSesionBarraContainer">
      <div className="datosSesionBarraHeader">
        <div className="datosSesionBarraInfo">
          <FiUsers className="datosSesionBarraIcon" />
          <span>
            <strong>{ocupados}</strong> {etiqueta}
          </span>
        </div>
        {disponibles !== null && (
          <span className={`datosSesionBarraDisponibles ${disponibles === 0 ? 'datosSesionBarraLleno' : 'datosSesionBarraDisponible'}`}>
            {disponibles === 0 ? (
              <>
                <FiUserX className="datosSesionBarraStatusIcon" />
                Sin lugares
              </>
            ) : (
              <>
                <FiUserCheck className="datosSesionBarraStatusIcon" />
                {disponibles} lugares disponibles
              </>
            )}
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
  }, [evento.id, evento.capacidad]);

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
      style={{ 
        animation: `slideUp 0.6s cubic-bezier(0.22, 1, 0.36, 1) ${index * 0.1}s both` 
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="datosSesionPanelAccent" />
      
      <div className="datosSesionPanelHeader">
        <div className="datosSesionPanelHeaderLeft">
          <div className="datosSesionPanelCode">
            <FiBookOpen className="datosSesionCodeIcon" />
            {evento.code || '—'}
          </div>
          <EtiquetaTipo tipo={evento.tipo} />
          <EtiquetaEstado estado={evento.estado} />
        </div>
        <div className="datosSesionPanelActions">
          {evento.estado === 'pendiente' && (
            <button 
              onClick={handleIniciar} 
              disabled={cambiandoEstado} 
              className="datosSesionStartButton"
            >
              <FiPlay className="datosSesionActionIcon" />
              Iniciar
            </button>
          )}
          {evento.estado === 'en_curso' && (
            <button 
              onClick={handleFinalizar} 
              disabled={cambiandoEstado} 
              className="datosSesionEndButton"
            >
              <FiSquare className="datosSesionActionIcon" />
              Finalizar
            </button>
          )}
          {evento.estado === 'finalizado' && (
            <button
              onClick={() => navigate(`/sesiones/resumen/${evento.id}`)}
              className="datosSesionResumenButton"
            >
              <FiActivity className="datosSesionActionIcon" />
              Resumen
            </button>
          )}
          <button
            onClick={() => navigate(`/sesiones/escanear/${evento.id}`)}
            className={`datosSesionScanButton ${evento.estado !== 'en_curso' ? 'disabled' : ''}`}
            disabled={evento.estado !== 'en_curso'}
            title={evento.estado !== 'en_curso' ? 'El evento debe estar en curso para escanear' : 'Ir al escáner'}
          >
            <MdOutlineQrCodeScanner className="datosSesionActionIcon" />
            Escanear
          </button>
          <button onClick={onEditar} className="datosSesionEditButton">
            <FiEdit2 className="datosSesionActionIcon" />
            Editar
          </button>
          <button onClick={onEliminarSesion} className="datosSesionDeleteButton">
            <FiTrash2 className="datosSesionActionIcon" />
            Eliminar
          </button>
        </div>
      </div>

      <div className="datosSesionPanelBody">
        <h3 className="datosSesionPanelTitle">{evento.titulo}</h3>
        <p className="datosSesionPanelDescription">{evento.detalles || 'Sin descripción disponible.'}</p>

        <div className="datosSesionInfoGrid">
          <div className="datosSesionInfoItem">
            <MdLocationOn className="datosSesionInfoIcon" />
            <span><strong>Sala:</strong> {evento.sala || 'No asignada'}</span>
          </div>
          <div className="datosSesionInfoItem">
            <FiMapPin className="datosSesionInfoIcon" />
            <span><strong>Ubicación:</strong> {evento.zona || 'No especificada'}</span>
          </div>
          <div className="datosSesionInfoItem">
            <MdDateRange className="datosSesionInfoIcon" />
            <span><strong>Fecha:</strong> {evento.fecha || 'No especificada'}</span>
          </div>
          <div className="datosSesionInfoItem">
            <MdAccessTime className="datosSesionInfoIcon" />
            <span><strong>Horario:</strong> {evento.hora_inicio} - {evento.hora_fin || '...'}</span>
          </div>
          <div className="datosSesionInfoItem">
            <MdPeople className="datosSesionInfoIcon" />
            <span><strong>Capacidad:</strong> {evento.capacidad ? `${evento.capacidad} personas` : 'Ilimitada'}</span>
          </div>
          <div className="datosSesionInfoItem">
            <FiUser className="datosSesionInfoIcon" />
            <span><strong>Organizador:</strong> {evento.organizador || 'No especificado'}</span>
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
              <FiUsers className="datosSesionParticipantesIcon" />
              {evento.estado === 'pendiente' ? 'Participantes' : 'Asistencia'}
            </h4>
            <span className="datosSesionParticipantesCount">
              {datos?.asistentes?.length || 0} {datos?.asistentes?.length === 1 ? 'participante' : 'participantes'}
            </span>
          </div>

          {loading ? (
            <p className="datosSesionParticipantesLoading">Cargando participantes...</p>
          ) : !datos?.asistentes?.length ? (
            <div className="datosSesionParticipantesEmpty">
              <FiUsers className="datosSesionEmptyIconSmall" />
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
                      <td className="datosSesionTableCell">
                        <span className="datosSesionParticipantName">
                          {a.nombre || a.username}
                        </span>
                      </td>
                      <td className="datosSesionTableCell datosSesionTableCellEmail">
                        <FiMail className="datosSesionEmailIcon" />
                        {a.email}
                      </td>
                      <td className="datosSesionTableCell datosSesionTableCellFecha">
                        <FiClock className="datosSesionFechaIcon" />
                        {a.hora_ingreso || a.fecha_registro || '—'}
                      </td>
                      <td className="datosSesionTableCell">
                        {a.presente ? (
                          <span className="datosSesionPresente" title={a.check_in_hora || ''}>
                            <FiCheckCircle className="datosSesionPresenteIcon" />
                            Presente
                          </span>
                        ) : (
                          <span className="datosSesionAusente">
                            <FiClock className="datosSesionAusenteIcon" />
                            Sin escanear
                          </span>
                        )}
                      </td>
                      <td className="datosSesionTableCell datosSesionTableCellRight">
                        <button
                          onClick={() => handleEliminarAsistente(a.id, a.nombre || a.username)}
                          className="datosSesionRemoveButton"
                        >
                          <FiUserX className="datosSesionRemoveIcon" />
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

  const stats = useMemo(() => {
    const pendientes = misEventos.filter(s => s.estado === 'pendiente').length;
    const enCurso = misEventos.filter(s => s.estado === 'en_curso').length;
    const finalizados = misEventos.filter(s => s.estado === 'finalizado').length;
    return { pendientes, enCurso, finalizados };
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
    await recargar();
  };

  const handleFinalizarEvento = async (id) => {
    await api.sesiones.finalizar(id);
    await recargar();
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
          <div className="datosSesionHeaderLeft">
            <h1 className="datosSesionTitle">
              Mis Eventos
            </h1>
            <p className="datosSesionSubtitle">
              {misEventos.length} evento{misEventos.length !== 1 ? 's' : ''} creado{misEventos.length !== 1 ? 's' : ''}
              {conectado && <span className="datosSesionLiveIndicator">● En vivo</span>}
            </p>
          </div>
          <div className="datosSesionHeaderRight">
            <div className="datosSesionStats">
              <div className="datosSesionStatItem">
                <span className="datosSesionStatNumber">{stats.pendientes}</span>
                <span className="datosSesionStatLabel">Pendientes</span>
              </div>
              <div className="datosSesionStatDivider" />
              <div className="datosSesionStatItem">
                <span className="datosSesionStatNumber active">{stats.enCurso}</span>
                <span className="datosSesionStatLabel">En curso</span>
              </div>
              <div className="datosSesionStatDivider" />
              <div className="datosSesionStatItem">
                <span className="datosSesionStatNumber completed">{stats.finalizados}</span>
                <span className="datosSesionStatLabel">Finalizados</span>
              </div>
              <div className="datosSesionStatDivider" />
              <div className="datosSesionStatItem">
                <span className="datosSesionStatNumber capacity">{capacidadTotal}</span>
                <span className="datosSesionStatLabel">Capacidad</span>
              </div>
            </div>
            <div className="datosSesionConnectionStatus">
              <span className="datosSesionConnectionDot"></span>
              <span className="datosSesionConnectionText">
                {conectado ? 'En vivo' : 'Sin conexión'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="datosSesionError">
          <FiAlertCircle className="datosSesionErrorIcon" />
          <span>{error}</span>
          <button onClick={recargar} className="datosSesionRetryButton">
            <FiRefreshCw className="datosSesionRetryIcon" />
            Reintentar
          </button>
        </div>
      )}

      {misEventos.length === 0 ? (
        <div className="datosSesionEmpty">
          <div className="datosSesionEmptyIconContainer">
            <MdEvent className="datosSesionEmptyIcon" />
          </div>
          <h3 className="datosSesionEmptyTitle">Aún no has creado eventos</h3>
          <p className="datosSesionEmptyText">
            Comienza creando tu primer evento para ver los datos de asistencia
          </p>
          <button
            onClick={() => navigate('/sesiones/nueva')}
            className="datosSesionEmptyButton"
          >
            <FiPlus className="datosSesionEmptyButtonIcon" />
            Crear Evento
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