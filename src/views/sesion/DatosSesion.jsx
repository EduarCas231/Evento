import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const etiquetaTipo = (tipo) => (
  <span style={{
    fontSize: '11px',
    fontWeight: 'bold',
    padding: '4px 12px',
    borderRadius: '20px',
    backgroundColor: tipo === 'privado' ? 'rgba(255, 193, 7, 0.15)' : 'rgba(64, 110, 155, 0.15)',
    color: tipo === 'privado' ? '#856404' : '#406e9b',
    border: `1px solid ${tipo === 'privado' ? '#ffc107' : '#406e9b'}`,
    animation: 'fadeIn 0.5s ease',
  }}>
    {tipo === 'privado' ? '🔒 Privado' : '🌐 Público'}
  </span>
);

function BarraAsistencia({ ocupados, capacidad }) {
  const total = parseInt(capacidad) || 0;
  const disponibles = total > 0 ? total - ocupados : null;
  const porcentaje = total > 0 ? Math.min((ocupados / total) * 100, 100) : 0;
  const color = porcentaje >= 90 ? '#dc3545' : porcentaje >= 60 ? '#fd7e14' : '#28a745';

  return (
    <div style={styles.barraContainer}>
      <div style={styles.barraHeader}>
        <span>👥 <strong>{ocupados}</strong> asistentes registrados</span>
        {disponibles !== null && (
          <span style={{
            color: disponibles === 0 ? '#dc3545' : '#28a745',
            fontWeight: 'bold',
            fontSize: '13px',
          }}>
            {disponibles === 0 ? '🚫 Sin lugares' : `✅ ${disponibles} lugares disponibles`}
          </span>
        )}
      </div>
      {total > 0 && (
        <div style={styles.barraBackground}>
          <div style={{
            ...styles.barraFill,
            width: `${porcentaje}%`,
            backgroundColor: color,
          }} />
        </div>
      )}
    </div>
  );
}

function PanelEvento({ evento, onEditar, onEliminarSesion, index }) {
  const [datos, setDatos] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  const cargarAsistentes = useCallback(() => {
    setLoading(true);
    api.sesiones.asistentes(evento.id)
      .then(setDatos)
      .catch(() => setDatos({ ocupados: 0, capacidad: evento.capacidad, asistentes: [] }))
      .finally(() => setLoading(false));
  }, [evento.id, evento.capacidad]);

  useEffect(() => { cargarAsistentes(); }, [cargarAsistentes]);

  const handleEliminarAsistente = async (idAsistencia, nombre) => {
    if (!window.confirm(`¿Eliminar a ${nombre} del evento?`)) return;
    try {
      await api.sesiones.eliminarAsistente(idAsistencia);
      cargarAsistentes();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div
      style={{
        ...styles.panel,
        animation: `slideUp 0.6s ease ${index * 0.1}s both`,
        transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: isHovered
          ? '0 12px 40px rgba(64, 110, 155, 0.2), 0 4px 20px rgba(0,0,0,0.06)'
          : '0 4px 20px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04)',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={styles.panelHeader}>
        <div style={styles.panelHeaderLeft}>
          <span style={styles.panelCode}>{evento.code || '—'}</span>
          {etiquetaTipo(evento.tipo)}
        </div>
        <div style={styles.panelActions}>
          <button
            onClick={onEditar}
            style={styles.editButton}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            ✏️ Editar
          </button>
          <button
            onClick={onEliminarSesion}
            style={styles.deleteButton}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            🗑️ Eliminar
          </button>
        </div>
      </div>

      <div style={styles.panelBody}>
        <h3 style={styles.panelTitle}>{evento.titulo}</h3>
        <p style={styles.panelDescription}>{evento.detalles || 'Sin descripción.'}</p>

        <div style={styles.infoGrid}>
          <div style={styles.infoItem}>
            <span style={styles.infoIcon}>📍</span>
            <span><strong>Sala:</strong> {evento.sala || '—'}</span>
          </div>
          <div style={styles.infoItem}>
            <span style={styles.infoIcon}>🗺️</span>
            <span><strong>Zona:</strong> {evento.zona || '—'}</span>
          </div>
          <div style={styles.infoItem}>
            <span style={styles.infoIcon}>📅</span>
            <span><strong>Fecha:</strong> {evento.fecha || '—'}</span>
          </div>
          <div style={styles.infoItem}>
            <span style={styles.infoIcon}>⏰</span>
            <span><strong>Horario:</strong> {evento.hora_inicio} - {evento.hora_fin}</span>
          </div>
          <div style={styles.infoItem}>
            <span style={styles.infoIcon}>🎯</span>
            <span><strong>Capacidad:</strong> {evento.capacidad ? `${evento.capacidad} personas` : '—'}</span>
          </div>
          <div style={styles.infoItem}>
            <span style={styles.infoIcon}>👤</span>
            <span><strong>Organizador:</strong> {evento.organizador || '—'}</span>
          </div>
        </div>

        {loading ? (
          <div style={styles.loadingAsistencia}>
            <span style={styles.smallSpinner}></span>
            <span>Cargando asistencia...</span>
          </div>
        ) : (
          <BarraAsistencia ocupados={datos?.ocupados ?? 0} capacidad={evento.capacidad} />        )}
        <div style={styles.participantesContainer}>
          <div style={styles.participantesHeader}>
            <h4 style={styles.participantesTitle}>👥 Participantes</h4>
            <span style={styles.participantesCount}>
              {datos?.asistentes?.length || 0} {datos?.asistentes?.length === 1 ? 'participante' : 'participantes'}
            </span>
          </div>

          {loading ? (
            <p style={styles.participantesLoading}>Cargando participantes...</p>
          ) : !datos?.asistentes?.length ? (
            <div style={styles.participantesEmpty}>
              <svg style={styles.emptyIconSmall} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 00-3-3.87" />
                <path d="M16 3.13a4 4 0 010 7.75" />
              </svg>
              <span>Sin participantes registrados</span>
            </div>
          ) : (
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tableHeader}>
                    <th style={styles.tableCell}>Nombre</th>
                    <th style={styles.tableCell}>Email</th>
                    <th style={styles.tableCell}>Registro</th>
                    <th style={{ ...styles.tableCell, textAlign: 'right' }}>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {datos.asistentes.map((a, idx) => (
                    <tr key={a.id} style={{
                      ...styles.tableRow,
                      animation: `fadeIn 0.3s ease ${idx * 0.05}s both`,
                    }}>
                      <td style={styles.tableCell}>{a.nombre || a.username}</td>
                      <td style={{ ...styles.tableCell, color: '#6b7280' }}>{a.email}</td>
                      <td style={{ ...styles.tableCell, color: '#9ca3af', fontSize: '12px' }}>
                        {a.hora_ingreso || a.fecha_registro || '—'}
                      </td>
                      <td style={{ ...styles.tableCell, textAlign: 'right' }}>
                        <button
                          onClick={() => handleEliminarAsistente(a.id, a.nombre || a.username)}
                          style={styles.removeButton}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ef4444'}
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
}

export default function DatosEvento() {
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    api.sesiones.listar()
      .then((data) => setEventos(data.filter((s) => s.organizador === user?.username)))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [user]);

  const handleEliminarEvento = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este evento?')) return;
    try {
      await api.sesiones.eliminar(id);
      setEventos((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      alert(err.message);
    }
  }; 

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p style={styles.loadingText}>Cargando tus eventos...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <div>
            <h1 style={styles.title}>Datos de Mis Eventos</h1>
            <p style={styles.subtitle}>
              {eventos.length} evento{eventos.length !== 1 ? 's' : ''} creado{eventos.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div style={styles.headerBadge}>
            <span style={styles.badgeText}>
              📊 {eventos.reduce((acc, s) => acc + (s.capacidad || 0), 0)} capacidad total
            </span>
          </div>
        </div>
      </div>

      {error && (
        <div style={styles.errorContainer}>
          <svg style={styles.errorIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {eventos.length === 0 ? (
        <div style={styles.emptyState}>
          <svg style={styles.emptyIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <h3 style={styles.emptyTitle}>Aún no has creado eventos</h3>
          <p style={styles.emptyText}>
            Comienza creando tu primer evento para ver los datos de asistencia
          </p>
          <button
            onClick={() => navigate('/sesiones/nueva')}
            style={styles.emptyButton}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(64, 110, 155, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(64, 110, 155, 0.3)';
            }}
          >
            + Crear Evento
          </button>
        </div>
      ) : (
        <div style={styles.panelsContainer}>
          {eventos.map((s, index) => (
            <PanelEvento
              key={s.id}
              evento={s}
              index={index}
              onEditar={() => navigate(`/sesiones/editar/${s.id}`)}
              onEliminarSesion={() => handleEliminarEvento(s.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: '30px',
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    maxWidth: '1100px',
    margin: '0 auto',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
  },
  header: {
    marginBottom: '32px',
    padding: '24px 32px',
    background: 'white',
    borderRadius: '16px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.04), 0 1px 4px rgba(0,0,0,0.04)',
    animation: 'slideDown 0.6s ease',
  },
  headerContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '16px',
  },
  title: {
    margin: 0,
    fontSize: '28px',
    fontWeight: '800',
    color: '#1a1a2e',
    letterSpacing: '-0.5px',
    '@media (max-width: 480px)': {
      fontSize: '22px',
    },
  },
  subtitle: {
    margin: '4px 0 0',
    fontSize: '15px',
    color: '#6b7280',
  },
  headerBadge: {
    background: 'linear-gradient(135deg, #406e9b 0%, #355a7a 100%)',
    padding: '8px 20px',
    borderRadius: '20px',
    boxShadow: '0 4px 12px rgba(64, 110, 155, 0.3)',
  },
  badgeText: {
    color: 'white',
    fontWeight: '700',
    fontSize: '14px',
  },
  loadingContainer: {
    textAlign: 'center',
    padding: '60px 20px',
    animation: 'fadeIn 0.5s ease',
  },
  spinner: {
    display: 'inline-block',
    width: '48px',
    height: '48px',
    border: '4px solid #e2e8f0',
    borderTopColor: '#406e9b',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  loadingText: {
    marginTop: '16px',
    color: '#6b7280',
    fontSize: '15px',
  },
  errorContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px 20px',
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '12px',
    color: '#dc2626',
    marginBottom: '24px',
    animation: 'shake 0.5s ease',
  },
  errorIcon: {
    width: '24px',
    height: '24px',
    color: '#ef4444',
    flexShrink: 0,
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
    background: 'white',
    borderRadius: '16px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
    animation: 'fadeIn 0.6s ease',
  },
  emptyIcon: {
    width: '64px',
    height: '64px',
    color: '#9ca3af',
    marginBottom: '16px',
  },
  emptyIconSmall: {
    width: '24px',
    height: '24px',
    color: '#9ca3af',
  },
  emptyTitle: {
    fontSize: '20px',
    color: '#1a1a2e',
    marginBottom: '8px',
  },
  emptyText: {
    fontSize: '15px',
    color: '#6b7280',
    marginBottom: '24px',
  },
  emptyButton: {
    padding: '12px 32px',
    background: 'linear-gradient(135deg, #406e9b 0%, #355a7a 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    fontWeight: '700',
    fontSize: '15px',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(64, 110, 155, 0.3)',
  },
  panelsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  panel: {
    backgroundColor: 'white',
    borderRadius: '16px',
    overflow: 'hidden',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    border: '1px solid #e2e8f0',
  },
  panelHeader: {
    padding: '16px 24px',
    backgroundColor: '#f8fafc',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '12px',
  },
  panelHeaderLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  panelCode: {
    background: '#e2e8f0',
    padding: '4px 12px',
    borderRadius: '6px',
    fontWeight: '600',
    fontSize: '12px',
    color: '#475569',
  },
  panelActions: {
    display: 'flex',
    gap: '8px',
  },
  editButton: {
    padding: '6px 16px',
    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '13px',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)',
  },
  deleteButton: {
    padding: '6px 16px',
    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '13px',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
  },
  panelBody: {
    padding: '24px',
  },
  panelTitle: {
    margin: '0 0 6px 0',
    fontSize: '20px',
    fontWeight: '700',
    color: '#1a1a2e',
  },
  panelDescription: {
    color: '#6b7280',
    fontSize: '14px',
    margin: '0 0 16px 0',
    lineHeight: '1.5',
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '8px',
    fontSize: '13px',
    color: '#475569',
    padding: '12px',
    backgroundColor: '#f8fafc',
    borderRadius: '10px',
    marginBottom: '16px',
    '@media (max-width: 480px)': {
      gridTemplateColumns: '1fr',
    },
  },
  infoItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  infoIcon: {
    width: '20px',
    textAlign: 'center',
  },
  barraContainer: {
    marginBottom: '20px',
  },
  barraHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '13px',
    marginBottom: '6px',
    color: '#475569',
  },
  barraBackground: {
    backgroundColor: '#e2e8f0',
    borderRadius: '6px',
    height: '10px',
    overflow: 'hidden',
  },
  barraFill: {
    height: '100%',
    borderRadius: '6px',
    transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
  },
  loadingAsistencia: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '20px',
    fontSize: '13px',
    color: '#6b7280',
  },
  smallSpinner: {
    display: 'inline-block',
    width: '16px',
    height: '16px',
    border: '2px solid #e2e8f0',
    borderTopColor: '#406e9b',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  participantesContainer: {
    borderTop: '1px solid #e2e8f0',
    paddingTop: '16px',
  },
  participantesHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  },
  participantesTitle: {
    margin: 0,
    color: '#1a1a2e',
    fontSize: '14px',
    fontWeight: '700',
  },
  participantesCount: {
    fontSize: '13px',
    color: '#6b7280',
    fontWeight: '500',
  },
  participantesLoading: {
    fontSize: '13px',
    color: '#9ca3af',
    fontStyle: 'italic',
  },
  participantesEmpty: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '13px',
    color: '#9ca3af',
    fontStyle: 'italic',
    padding: '8px 0',
  },
  tableWrapper: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '13px',
  },
  tableHeader: {
    backgroundColor: '#f8fafc',
  },
  tableRow: {
    borderBottom: '1px solid #f1f5f9',
    transition: 'background-color 0.2s ease',
    ':hover': {
      backgroundColor: '#f8fafc',
    },
  },
  tableCell: {
    padding: '10px 12px',
    textAlign: 'left',
    borderBottom: '1px solid #e2e8f0',
  },
  removeButton: {
    padding: '4px 12px',
    backgroundColor: '#ef4444',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '600',
    transition: 'all 0.2s ease',
  },
};

if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = `
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    
    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    @keyframes slideDown {
      from {
        opacity: 0;
        transform: translateY(-20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-8px); }
      75% { transform: translateX(8px); }
    }
  `;
  document.head.appendChild(styleSheet);
}