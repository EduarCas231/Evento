import React, { useEffect, useRef, useState } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useNotificaciones } from '../../hooks/useNotificaciones';

const etiquetaTipo = (tipo) => (
  <span style={{
    fontSize: '11px', fontWeight: 'bold', padding: '3px 10px', borderRadius: '20px',
    backgroundColor: tipo === 'privado' ? '#fff3cd' : '#d1ecf1',
    color: tipo === 'privado' ? '#856404' : '#0c5460',
    border: `1px solid ${tipo === 'privado' ? '#ffc107' : '#bee5eb'}`,
  }}>
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

// Recibe ocupados/capacidad como props — actualizados por el polling del padre
function TarjetaSesion({ sesion }) {
  const [countdown, setCountdown] = useState(() => calcularRestante(sesion.fecha, sesion.hora_inicio));
  const notif5Ref = useRef(false);

  useEffect(() => {
    const timer = setInterval(() => {
      const inicio = new Date(`${sesion.fecha}T${sesion.hora_inicio}`);
      const diff = inicio - Date.now();

      if (diff > 240000 && diff <= 300000 && !notif5Ref.current) {
        if (Notification.permission === 'granted') {
          new Notification(`⏰ Empieza en 5 min — ${sesion.titulo}`, {
            body: `Inicia a las ${sesion.hora_inicio} en ${sesion.sala || 'su sala'}.`,
            icon: '/favicon.ico',
          });
        }
        notif5Ref.current = true;
      }

      setCountdown(calcularRestante(sesion.fecha, sesion.hora_inicio));
    }, 1000);
    return () => clearInterval(timer);
  }, [sesion.fecha, sesion.hora_inicio, sesion.titulo, sesion.sala]);

  const ocupados = sesion.ocupados ?? 0;
  const capacidad = sesion.capacidad;
  const porcentaje = capacidad ? Math.round((ocupados / capacidad) * 100) : 0;
  const barColor = porcentaje >= 90 ? '#dc3545' : porcentaje >= 60 ? '#fd7e14' : '#28a745';

  return (
    <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', backgroundColor: '#fff' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <span style={{ fontSize: '12px', background: '#e9ecef', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold', color: '#495057' }}>
          Código: {sesion.code || '—'}
        </span>
        {etiquetaTipo(sesion.tipo)}
      </div>

      <h3 style={{ margin: '6px 0', color: '#007bff' }}>{sesion.titulo}</h3>
      <p style={{ color: '#555', fontSize: '14px', margin: '0 0 12px 0' }}>{sesion.detalles || 'Sin descripción.'}</p>

      <div style={{ fontSize: '13px', color: '#666', lineHeight: '1.8' }}>
        📍 <strong>Sala:</strong> {sesion.sala || '—'}<br />
        📅 <strong>Fecha:</strong> {sesion.fecha || '—'}<br />
        ⏰ <strong>Horario:</strong> {sesion.hora_inicio} - {sesion.hora_fin}<br />
        👤 <strong>Organizador:</strong> {sesion.organizador || '—'}
      </div>

      {capacidad ? (
        <div style={{ marginTop: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#555', marginBottom: '4px' }}>
            <span>👥 Asistentes: <strong>{ocupados}</strong> / {capacidad}</span>
            <span style={{ color: barColor, fontWeight: 'bold' }}>{porcentaje}%</span>
          </div>
          <div style={{ background: '#e9ecef', borderRadius: '4px', height: '8px', overflow: 'hidden' }}>
            <div style={{ width: `${porcentaje}%`, height: '100%', backgroundColor: barColor, transition: 'width 0.4s' }} />
          </div>
        </div>
      ) : (
        <div style={{ marginTop: '14px', fontSize: '13px', color: '#666' }}>
          👥 Asistentes: <strong>{ocupados}</strong>
        </div>
      )}

      <div style={{ marginTop: '12px', textAlign: 'center', padding: '8px', borderRadius: '6px', backgroundColor: countdown ? '#f0f7ff' : '#f8f9fa', border: `1px solid ${countdown ? '#b8daff' : '#dee2e6'}` }}>
        {countdown ? (
          <>
            <div style={{ fontSize: '11px', color: '#6c757d', marginBottom: '2px' }}>⏳ Comienza en</div>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#0056b3', fontFamily: 'monospace' }}>{countdown}</div>
          </>
        ) : (
          <div style={{ fontSize: '13px', color: '#6c757d' }}>🟢 Evento en curso o finalizado</div>
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

  useNotificaciones(registrados, setRegistrados);

  useEffect(() => {
    const cargar = async () => {
      try {
        const data = await api.sesiones.misRegistros();
        const enriquecidos = await Promise.all(
          data.map(async s => {
            try {
              const info = await api.sesiones.asistentes(s.id);
              return { ...s, ocupados: info.ocupados, capacidad: info.capacidad ?? s.capacidad };
            } catch { return s; }
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
    <div style={{ padding: '30px', fontFamily: 'Arial, sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ margin: 0, color: '#333' }}>Mis Eventos</h1>
        <p style={{ margin: '4px 0 0', color: '#666' }}>Bienvenido, <strong>{user?.username}</strong></p>
      </div>

      {loading && <div style={{ textAlign: 'center', padding: '40px' }}>Cargando...</div>}
      {error && <div style={{ padding: '12px', backgroundColor: '#ffe6e6', color: 'red', borderRadius: '4px', marginBottom: '20px' }}>{error}</div>}

      {!loading && !error && (
        registrados.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#888', padding: '40px', border: '1px dashed #ccc', borderRadius: '8px' }}>
            Aún no estás registrado en ningún evento. Ve a <strong>Eventos</strong> para unirte.
          </p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
            {registrados.map((s) => <TarjetaSesion key={s.id} sesion={s} />)}
          </div>
        )
      )}
    </div>
  );
}
