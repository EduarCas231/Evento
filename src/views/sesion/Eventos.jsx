import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

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

// ── Tarjeta con acción unirse (usuarios) ───────────────────────────────────────
function TarjetaUnirse({ sesion }) {
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState({ texto: '', tipo: '' });
  const [loading, setLoading] = useState(false);
  const [unido, setUnido] = useState(false);

  const handleUnirse = async () => {
    setLoading(true);
    setMsg({ texto: '', tipo: '' });
    try {
      const data = await api.sesiones.unirse(sesion.code, sesion.tipo === 'privado' ? password : undefined);
      setMsg({ texto: data.message || '¡Te uniste al evento!', tipo: 'ok' });
      setUnido(true);
    } catch (err) {
      setMsg({ texto: err.message, tipo: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', backgroundColor: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ fontSize: '12px', background: '#e9ecef', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold', color: '#495057' }}>
            Código: {sesion.code || '—'}
          </span>
          {etiquetaTipo(sesion.tipo)}
        </div>
        <h3 style={{ margin: '6px 0', color: '#007bff' }}>{sesion.titulo}</h3>
        <p style={{ color: '#555', fontSize: '14px', margin: '0 0 12px 0' }}>{sesion.detalles || 'Sin descripción.'}</p>
        <div style={{ fontSize: '13px', color: '#666', lineHeight: '1.8', marginBottom: '16px' }}>
          📍 <strong>Sala:</strong> {sesion.sala || '—'}<br />
          📅 <strong>Fecha:</strong> {sesion.fecha || '—'}<br />
          ⏰ <strong>Horario:</strong> {sesion.hora_inicio} - {sesion.hora_fin}<br />
          👥 <strong>Capacidad:</strong> {sesion.capacidad ? `${sesion.capacidad} personas` : '—'}<br />
          👤 <strong>Organizador:</strong> {sesion.organizador || '—'}
        </div>
      </div>
      {msg.texto && (
        <div style={{ padding: '8px 12px', borderRadius: '4px', marginBottom: '12px', fontSize: '13px', backgroundColor: msg.tipo === 'ok' ? '#e6f4ea' : '#ffe6e6', color: msg.tipo === 'ok' ? 'green' : 'red' }}>
          {msg.texto}
        </div>
      )}
      {!unido && (
        sesion.tipo === 'privado' ? (
          <div style={{ display: 'flex', gap: '8px' }}>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="Contraseña del evento"
              style={{ flex: 1, padding: '8px 10px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '13px' }} />
            <button onClick={handleUnirse} disabled={loading || !password.trim()}
              style={{ padding: '8px 16px', backgroundColor: '#6f42c1', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
              {loading ? '...' : '🔑 Unirse'}
            </button>
          </div>
        ) : (
          <button onClick={handleUnirse} disabled={loading}
            style={{ width: '100%', padding: '10px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
            {loading ? 'Procesando...' : '✅ Unirse al evento'}
          </button>
        )
      )}
    </div>
  );
}

// ── Tarjeta admin con editar/eliminar ─────────────────────────────────────────
function TarjetaAdmin({ sesion, onEditar, onEliminar }) {
  return (
    <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', backgroundColor: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div>
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
          👥 <strong>Capacidad:</strong> {sesion.capacidad ? `${sesion.capacidad} personas` : '—'}<br />
          👤 <strong>Organizador:</strong> {sesion.organizador || '—'}
        </div>
      </div>
      {(onEditar || onEliminar) && (
        <div style={{ display: 'flex', gap: '8px', marginTop: '15px' }}>
          {onEditar && <button onClick={onEditar} style={{ flex: 1, padding: '8px', backgroundColor: '#ffc107', color: '#212529', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Editar</button>}
          {onEliminar && <button onClick={onEliminar} style={{ flex: 1, padding: '8px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Eliminar</button>}
        </div>
      )}
    </div>
  );
}

// ── Vista principal ────────────────────────────────────────────────────────────
export default function Eventos() {
  const [sesiones, setSesiones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    api.sesiones.listar()
      .then(setSesiones)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Eliminar este evento?')) return;
    try {
      await api.sesiones.eliminar(id);
      setSesiones((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  const filtradas = busqueda.trim()
    ? sesiones.filter((s) =>
        s.organizador?.toLowerCase().includes(busqueda.toLowerCase()) ||
        s.code?.toLowerCase().includes(busqueda.toLowerCase()) ||
        s.sala?.toLowerCase().includes(busqueda.toLowerCase())
      )
    : sesiones;

  return (
    <div style={{ padding: '30px', fontFamily: 'Arial, sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ margin: 0, color: '#333' }}>Eventos</h1>
          <p style={{ margin: '4px 0 0', color: '#666', fontSize: '14px' }}>
            {user?.role === 'admin' ? 'Busca, crea o edita eventos' : 'Busca y únete a eventos'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="🔍 Buscar por código, sala o anfitrión..."
            style={{ padding: '8px 12px', borderRadius: '4px', border: '1px solid #ccc', width: '300px' }}
          />
          {user?.role === 'admin' && (
            <button onClick={() => navigate('/sesiones/nueva')}
              style={{ padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
              + Crear Evento
            </button>
          )}
        </div>
      </div>

      {loading && <div style={{ textAlign: 'center', padding: '40px' }}>Cargando eventos...</div>}
      {error && <div style={{ padding: '12px', backgroundColor: '#ffe6e6', color: 'red', borderRadius: '4px', marginBottom: '20px' }}>{error}</div>}

      {!loading && !error && (
        filtradas.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#888', padding: '40px', border: '1px dashed #ccc', borderRadius: '8px' }}>
            {busqueda ? `Sin resultados para "${busqueda}".` : 'No hay eventos disponibles.'}
          </p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
            {filtradas.map((s) =>
              user?.role === 'admin' ? (
                <TarjetaAdmin
                  key={s.id}
                  sesion={s}
                  onEditar={s.organizador === user.username ? () => navigate(`/sesiones/editar/${s.id}`) : null}
                  onEliminar={s.organizador === user.username ? () => handleEliminar(s.id) : null}
                />
              ) : (
                <TarjetaUnirse key={s.id} sesion={s} />
              )
            )}
          </div>
        )
      )}
    </div>
  );
}
