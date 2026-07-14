// pages/Eventos.jsx
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useSesiones } from '../../context/SesionesContext';
import '../../styles/Eventos.css';

const etiquetaTipo = (tipo) => (
  <span className="eventosCardType">
    {tipo === 'privado' ? '🔒 Privado' : '🌐 Público'}
  </span>
);

function TarjetaUnirse({ sesion, index, onJoinSuccess, yaUnido }) {
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState({ texto: '', tipo: '' });
  const [loading, setLoading] = useState(false);
  const [unido, setUnido] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const mostrarComoUnido = unido || yaUnido;

  const handleUnirse = async () => {
    setLoading(true);
    setMsg({ texto: '', tipo: '' });
    try {
      const data = await api.sesiones.unirse(sesion.code, sesion.tipo === 'privado' ? password : undefined);
      setMsg({ texto: data.message || '¡Te uniste al evento!', tipo: 'ok' });
      setUnido(true);

      if (onJoinSuccess) {
        onJoinSuccess(sesion.id);
      }
    } catch (err) {
      setMsg({ texto: err.message, tipo: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`eventosCard ${isHovered ? 'eventosCardHovered' : ''}`}
      style={{
        animation: `slideUp 0.6s ease ${index * 0.1}s both`,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="eventosCardHeader">
        <span className="eventosCardCode">Código: {sesion.code || '—'}</span>
        {etiquetaTipo(sesion.tipo)}
      </div>

      <h3 className="eventosCardTitle">{sesion.titulo}</h3>
      <p className="eventosCardDescription">{sesion.detalles || 'Sin descripción.'}</p>

      <div className="eventosCardDetails">
        <div className="eventosDetailItem">
          <span className="eventosDetailIcon">📍</span>
          <span><strong>Sala:</strong> {sesion.sala || '—'}</span>
        </div>
        <div className="eventosDetailItem">
          <span className="eventosDetailIcon">📅</span>
          <span><strong>Fecha:</strong> {sesion.fecha || '—'}</span>
        </div>
        <div className="eventosDetailItem">
          <span className="eventosDetailIcon">⏰</span>
          <span><strong>Horario:</strong> {sesion.hora_inicio} - {sesion.hora_fin}</span>
        </div>
        <div className="eventosDetailItem">
          <span className="eventosDetailIcon">👥</span>
          <span><strong>Capacidad:</strong> {sesion.capacidad ? `${sesion.capacidad} personas` : '—'}</span>
        </div>
        <div className="eventosDetailItem">
          <span className="eventosDetailIcon">👤</span>
          <span><strong>Organizador:</strong> {sesion.organizador || '—'}</span>
        </div>
      </div>

      {msg.texto && (
        <div className={`eventosMessage eventosMessage${msg.tipo === 'ok' ? 'Ok' : 'Error'}`}>
          {msg.tipo === 'ok' ? '✅' : '❌'} {msg.texto}
        </div>
      )}

      {mostrarComoUnido ? (
        <div className="eventosMessage eventosMessageOk">
          ✅ Ya estás registrado en este evento
        </div>
      ) : (
        sesion.tipo === 'privado' ? (
          <div className="eventosPrivateJoin">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Contraseña del evento"
              className="eventosPasswordInput"
              disabled={loading}
            />
            <button
              onClick={handleUnirse}
              disabled={loading || !password.trim()}
              className={`eventosJoinButton eventosJoinButtonPrivate ${(loading || !password.trim()) ? 'eventosButtonDisabled' : ''}`}
            >
              {loading ? (
                <span className="eventosLoadingSpinner">
                  <span className="eventosSmallSpinner"></span>
                </span>
              ) : (
                '🔑 Unirse'
              )}
            </button>
          </div>
        ) : (
          <button
            onClick={handleUnirse}
            disabled={loading}
            className={`eventosJoinButton eventosJoinButtonPublic ${loading ? 'eventosButtonDisabled' : ''}`}
          >
            {loading ? (
              <span className="eventosLoadingSpinner">
                <span className="eventosSmallSpinner"></span>
                Procesando...
              </span>
            ) : (
              '✅ Unirse al evento'
            )}
          </button>
        )
      )}
    </div>
  );
}

function TarjetaAdmin({ sesion, onEditar, onEliminar, index }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`eventosCard ${isHovered ? 'eventosCardHovered' : ''}`}
      style={{
        animation: `slideUp 0.6s ease ${index * 0.1}s both`,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="eventosCardHeader">
        <span className="eventosCardCode">Código: {sesion.code || '—'}</span>
        {etiquetaTipo(sesion.tipo)}
      </div>

      <h3 className="eventosCardTitle">{sesion.titulo}</h3>
      <p className="eventosCardDescription">{sesion.detalles || 'Sin descripción.'}</p>

      <div className="eventosCardDetails">
        <div className="eventosDetailItem">
          <span className="eventosDetailIcon">📍</span>
          <span><strong>Sala:</strong> {sesion.sala || '—'}</span>
        </div>
        <div className="eventosDetailItem">
          <span className="eventosDetailIcon">📅</span>
          <span><strong>Fecha:</strong> {sesion.fecha || '—'}</span>
        </div>
        <div className="eventosDetailItem">
          <span className="eventosDetailIcon">⏰</span>
          <span><strong>Horario:</strong> {sesion.hora_inicio} - {sesion.hora_fin}</span>
        </div>
        <div className="eventosDetailItem">
          <span className="eventosDetailIcon">👥</span>
          <span><strong>Capacidad:</strong> {sesion.capacidad ? `${sesion.capacidad} personas` : '—'}</span>
        </div>
        <div className="eventosDetailItem">
          <span className="eventosDetailIcon">👤</span>
          <span><strong>Organizador:</strong> {sesion.organizador || '—'}</span>
        </div>
      </div>

      {(onEditar || onEliminar) && (
        <div className="eventosAdminActions">
          {onEditar && (
            <button onClick={onEditar} className="eventosEditButton">
              ✏️ Editar
            </button>
          )}
          {onEliminar && (
            <button onClick={onEliminar} className="eventosDeleteButton">
              🗑️ Eliminar
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function Eventos() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { sesiones, loading, error, conectado, setSesiones, recargar } = useSesiones();

  const [busqueda, setBusqueda] = useState('');
  const [joiningId, setJoiningId] = useState(null);

  const handleJoinSuccess = (id) => {
    setJoiningId(id);
    recargar();

    setTimeout(() => {
      setJoiningId(null);
      navigate('/home');
    }, 1200);
  };

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este evento?')) return;
    try {
      await api.sesiones.eliminar(id);
      setSesiones((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  const filtradas = useMemo(() => {
    if (!sesiones.length) return [];

    if (!busqueda.trim()) return sesiones;

    const term = busqueda.toLowerCase().trim();
    return sesiones.filter((s) =>
      s.organizador?.toLowerCase().includes(term) ||
      s.code?.toLowerCase().includes(term) ||
      s.sala?.toLowerCase().includes(term) ||
      s.titulo?.toLowerCase().includes(term) ||
      s.detalles?.toLowerCase().includes(term)
    );
  }, [sesiones, busqueda]);

  const isUserJoined = (sesion) => {
    if (!user) return false;
    return sesion.asistentes?.some(a => a.username === user.username) ||
           sesion.organizador === user.username;
  };

  return (
    <div className="eventosContainer">
      <div className="eventosHeader">
        <div className="eventosHeaderContent">
          <div>
            <h1 className="eventosTitle">Eventos</h1>
            <p className="eventosSubtitle">
              {user?.role === 'admin' ? 'Administra los eventos del congreso' : 'Explora y únete a los eventos disponibles'}
            </p>
          </div>
          <div className="eventosHeaderActions">
            <div className="eventosSearchWrapper">
              <svg className="eventosSearchIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar por código, sala, anfitrión..."
                className="eventosSearchInput"
              />
            </div>
            <span className={`eventosConnectionStatus ${conectado ? 'connected' : 'disconnected'}`}>
              {conectado ? '🟢 En vivo' : '🔴 Desconectado'}
            </span>
          </div>
        </div>
      </div>

      {loading && (
        <div className="eventosLoading">
          <div className="eventosSpinner"></div>
          <p className="eventosLoadingText">Cargando eventos...</p>
        </div>
      )}

      {error && (
        <div className="eventosError">
          <svg className="eventosErrorIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>{error}</span>
          <button onClick={recargar} className="eventosRetryButton">
            Reintentar
          </button>
        </div>
      )}

      {!loading && !error && (
        filtradas.length === 0 ? (
          <div className="eventosEmpty">
            <svg className="eventosEmptyIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <h3 className="eventosEmptyTitle">
              {busqueda ? `No hay resultados para "${busqueda}"` : 'No hay eventos disponibles'}
            </h3>
            <p className="eventosEmptyText">
              {busqueda
                ? 'Intenta con otros términos de búsqueda'
                : user?.role === 'admin'
                ? 'Crea tu primer evento para comenzar'
                : 'Vuelve más tarde para ver nuevos eventos'}
            </p>
          </div>
        ) : (
          <div className="eventosGrid">
            {filtradas.map((s, index) => {
              const esOrganizador = s.organizador === user?.username;

              return esOrganizador ? (
                <TarjetaAdmin
                  key={s.id}
                  sesion={s}
                  index={index}
                  onEditar={() => navigate(`/sesiones/editar/${s.id}`)}
                  onEliminar={() => handleEliminar(s.id)}
                />
              ) : (
                <TarjetaUnirse
                  key={s.id}
                  sesion={s}
                  index={index}
                  onJoinSuccess={handleJoinSuccess}
                  yaUnido={isUserJoined(s)}
                />
              );
            })}
          </div>
        )
      )}
    </div>
  );
}