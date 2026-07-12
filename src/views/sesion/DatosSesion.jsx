import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const etiquetaTipo = (tipo) => (
  <span style={{
    fontSize: '11px', fontWeight: 'bold', padding: '2px 8px', borderRadius: '20px',
    backgroundColor: tipo === 'privado' ? '#fff3cd' : '#d1ecf1',
    color: tipo === 'privado' ? '#856404' : '#0c5460',
    border: `1px solid ${tipo === 'privado' ? '#ffc107' : '#bee5eb'}`,
  }}>
    {tipo === 'privado' ? '🔒 Privado' : '🌐 Público'}
  </span>
);

function BarraAsistencia({ ocupados, capacidad }) {
  const total = parseInt(capacidad) || 0;
  const disponibles = total > 0 ? total - ocupados : null;
  const porcentaje = total > 0 ? Math.min((ocupados / total) * 100, 100) : 0;
  const color = porcentaje >= 90 ? '#dc3545' : porcentaje >= 60 ? '#ffc107' : '#28a745';

  return (
    <div style={{ marginBottom: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
        <span>👥 <strong>{ocupados}</strong> asistentes registrados</span>
        {disponibles !== null && (
          <span style={{ color: disponibles === 0 ? '#dc3545' : '#28a745', fontWeight: 'bold' }}>
            {disponibles === 0 ? '🚫 Sin lugares' : `✅ ${disponibles} lugares disponibles`}
          </span>
        )}
      </div>
      {total > 0 && (
        <div style={{ backgroundColor: '#e9ecef', borderRadius: '4px', height: '10px', overflow: 'hidden' }}>
          <div style={{ width: `${porcentaje}%`, backgroundColor: color, height: '100%', borderRadius: '4px', transition: 'width 0.3s' }} />
        </div>
      )}
    </div>
  );
}

function PanelSesion({ sesion, onEditar, onEliminarSesion }) {
  const [datos, setDatos] = useState(null);
  const [loading, setLoading] = useState(true);

  const cargarAsistentes = useCallback(() => {
    setLoading(true);
    api.sesiones.asistentes(sesion.id)
      .then(setDatos)
      .catch(() => setDatos({ ocupados: 0, capacidad: sesion.capacidad, asistentes: [] }))
      .finally(() => setLoading(false));
  }, [sesion.id, sesion.capacidad]);

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
    <div style={{ border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#fff', boxShadow: '0 2px 6px rgba(0,0,0,0.07)', overflow: 'hidden', marginBottom: '24px' }}>
      {/* Header */}
      <div style={{ backgroundColor: '#f8f9fa', padding: '14px 20px', borderBottom: '1px solid #dee2e6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ background: '#e9ecef', padding: '3px 10px', borderRadius: '4px', fontWeight: 'bold', fontSize: '12px', color: '#495057' }}>
            {sesion.code || '—'}
          </span>
          {etiquetaTipo(sesion.tipo)}
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={onEditar} style={{ padding: '5px 14px', backgroundColor: '#ffc107', color: '#212529', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}>
            Editar
          </button>
          <button onClick={onEliminarSesion} style={{ padding: '5px 14px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}>
            Eliminar
          </button>
        </div>
      </div>

      <div style={{ padding: '20px' }}>
        {/* Info del evento */}
        <h3 style={{ margin: '0 0 8px', color: '#007bff' }}>{sesion.titulo}</h3>
        <p style={{ color: '#555', fontSize: '14px', margin: '0 0 16px' }}>{sesion.detalles || 'Sin descripción.'}</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '13px', color: '#555', marginBottom: '16px' }}>
          <div>📍 <strong>Sala:</strong> {sesion.sala || '—'}</div>
          <div>🗺️ <strong>Zona:</strong> {sesion.zona || '—'}</div>
          <div>📅 <strong>Fecha:</strong> {sesion.fecha || '—'}</div>
          <div>⏰ <strong>Horario:</strong> {sesion.hora_inicio} - {sesion.hora_fin}</div>
          <div>🎯 <strong>Capacidad:</strong> {sesion.capacidad ? `${sesion.capacidad} personas` : '—'}</div>
          <div>👤 <strong>Organizador:</strong> {sesion.organizador || '—'}</div>
        </div>

        {/* Barra asistencia */}
        {loading ? (
          <p style={{ fontSize: '13px', color: '#888' }}>Cargando asistencia...</p>
        ) : (
          <BarraAsistencia ocupados={datos?.ocupados ?? 0} capacidad={sesion.capacidad} />
        )}

        {/* Lista de participantes */}
        <div style={{ borderTop: '1px solid #dee2e6', paddingTop: '16px' }}>
          <h4 style={{ margin: '0 0 12px', color: '#444', fontSize: '14px' }}>👥 Participantes</h4>
          {loading ? (
            <p style={{ fontSize: '13px', color: '#888' }}>Cargando...</p>
          ) : !datos?.asistentes?.length ? (
            <p style={{ fontSize: '13px', color: '#888', fontStyle: 'italic' }}>Sin participantes registrados.</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8f9fa' }}>
                  <th style={{ padding: '8px 12px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Nombre</th>
                  <th style={{ padding: '8px 12px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Email</th>
                  <th style={{ padding: '8px 12px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Registro</th>
                  <th style={{ padding: '8px 12px', borderBottom: '1px solid #dee2e6' }}></th>
                </tr>
              </thead>
              <tbody>
                {datos.asistentes.map((a) => (
                  <tr key={a.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td style={{ padding: '8px 12px' }}>{a.nombre || a.username}</td>
                    <td style={{ padding: '8px 12px', color: '#666' }}>{a.email}</td>
                    <td style={{ padding: '8px 12px', color: '#888' }}>{a.hora_ingreso || a.fecha_registro || '—'}</td>
                    <td style={{ padding: '8px 12px', textAlign: 'right' }}>
                      <button
                        onClick={() => handleEliminarAsistente(a.id, a.nombre || a.username)}
                        style={{ padding: '4px 10px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default function DatosSesion() {
  const [sesiones, setSesiones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    api.sesiones.listar()
      .then((data) => setSesiones(data.filter((s) => s.organizador === user?.username)))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [user]);

  const handleEliminarSesion = async (id) => {
    if (!window.confirm('¿Eliminar esta sesión?')) return;
    try {
      await api.sesiones.eliminar(id);
      setSesiones((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Cargando...</div>;

  return (
    <div style={{ padding: '30px', maxWidth: '1100px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ margin: 0 }}>Datos de Mis Sesiones</h2>
        <p style={{ margin: '4px 0 0', color: '#666', fontSize: '14px' }}>{sesiones.length} sesión{sesiones.length !== 1 ? 'es' : ''} creada{sesiones.length !== 1 ? 's' : ''}</p>
      </div>

      {error && <div style={{ padding: '12px', backgroundColor: '#ffe6e6', color: 'red', borderRadius: '4px', marginBottom: '16px' }}>{error}</div>}

      {sesiones.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#666', padding: '40px', border: '1px dashed #ccc', borderRadius: '8px' }}>
          Aún no has creado ninguna sesión.
        </p>
      ) : (
        sesiones.map((s) => (
          <PanelSesion
            key={s.id}
            sesion={s}
            onEditar={() => navigate(`/sesiones/editar/${s.id}`)}
            onEliminarSesion={() => handleEliminarSesion(s.id)}
          />
        ))
      )}
    </div>
  );
}
