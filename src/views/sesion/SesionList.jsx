import React, { useEffect, useState } from 'react';
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

function BarraAsistencia({ asistentes, capacidad }) {
  const total = parseInt(capacidad) || 0;
  const ocupados = asistentes || 0;
  const disponibles = total > 0 ? total - ocupados : null;
  const porcentaje = total > 0 ? Math.min((ocupados / total) * 100, 100) : 0;
  const color = porcentaje >= 90 ? '#dc3545' : porcentaje >= 60 ? '#ffc107' : '#28a745';

  return (
    <div style={{ marginTop: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
        <span>👥 <strong>{ocupados}</strong> asistentes registrados</span>
        {disponibles !== null && (
          <span style={{ color: disponibles === 0 ? '#dc3545' : '#28a745', fontWeight: 'bold' }}>
            {disponibles === 0 ? '🚫 Sin lugares' : `✅ ${disponibles} lugares disponibles`}
          </span>
        )}
      </div>
      {total > 0 && (
        <div style={{ backgroundColor: '#e9ecef', borderRadius: '4px', height: '8px', overflow: 'hidden' }}>
          <div style={{ width: `${porcentaje}%`, backgroundColor: color, height: '100%', borderRadius: '4px', transition: 'width 0.3s' }} />
        </div>
      )}
    </div>
  );
}

function TarjetaDetalle({ sesion, onEditar, onEliminar }) {
  const [asistentes, setAsistentes] = useState(null);
  const [loadingA, setLoadingA] = useState(true);

  useEffect(() => {
    api.sesiones.asistentes(sesion.id)
      .then((data) => setAsistentes(data.ocupados ?? 0))
      .catch(() => setAsistentes(0))
      .finally(() => setLoadingA(false));
  }, [sesion.id]);

  return (
    <div style={{ border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#fff', boxShadow: '0 2px 6px rgba(0,0,0,0.07)', overflow: 'hidden' }}>
      {/* Header tarjeta */}
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
          <button onClick={onEliminar} style={{ padding: '5px 14px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}>
            Eliminar
          </button>
        </div>
      </div>

      {/* Cuerpo */}
      <div style={{ padding: '20px' }}>
        <h3 style={{ margin: '0 0 8px', color: '#007bff' }}>{sesion.titulo}</h3>
        <p style={{ color: '#555', fontSize: '14px', margin: '0 0 16px' }}>{sesion.detalles || 'Sin descripción.'}</p>

        {/* Grid de datos */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '13px', color: '#555' }}>
          <div>📍 <strong>Sala:</strong> {sesion.sala || '—'}</div>
          <div>🗺️ <strong>Zona:</strong> {sesion.zona || '—'}</div>
          <div>📅 <strong>Fecha:</strong> {sesion.fecha || '—'}</div>
          <div>⏰ <strong>Horario:</strong> {sesion.hora_inicio} - {sesion.hora_fin}</div>
          <div>🎯 <strong>Capacidad:</strong> {sesion.capacidad ? `${sesion.capacidad} personas` : '—'}</div>
          <div>👤 <strong>Organizador:</strong> {sesion.organizador || '—'}</div>
        </div>

        {/* Barra de asistencia */}
        {loadingA ? (
          <p style={{ fontSize: '13px', color: '#888', marginTop: '12px' }}>Cargando asistencia...</p>
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
        // Filtrar solo los eventos del admin logueado
        const propios = data.filter((s) => s.organizador === user?.username);
        setSesiones(propios);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [user]);

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Eliminar esta sesión?')) return;
    try {
      await api.sesiones.eliminar(id);
      setSesiones((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Cargando sesiones...</div>;

  return (
    <div style={{ padding: '30px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ margin: 0 }}>Mis Sesiones</h2>
          <p style={{ margin: '4px 0 0', color: '#666', fontSize: '14px' }}>{sesiones.length} evento{sesiones.length !== 1 ? 's' : ''} creado{sesiones.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => navigate('/sesiones/nueva')}
          style={{ padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          + Nueva Sesión
        </button>
      </div>

      {error && <div style={{ padding: '12px', backgroundColor: '#ffe6e6', color: 'red', borderRadius: '4px', marginBottom: '16px' }}>{error}</div>}

      {sesiones.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#666', padding: '40px', border: '1px dashed #ccc', borderRadius: '8px' }}>
          Aún no has creado ninguna sesión.
        </p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '24px' }}>
          {sesiones.map((s) => (
            <TarjetaDetalle
              key={s.id}
              sesion={s}
              onEditar={() => navigate(`/sesiones/editar/${s.id}`)}
              onEliminar={() => handleEliminar(s.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
