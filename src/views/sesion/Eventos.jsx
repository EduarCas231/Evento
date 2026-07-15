// pages/Eventos.jsx
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useSesiones } from '../../context/SesionesContext';
import { 
  FiLock, FiGlobe,
  FiUser, FiUsers, FiSearch, FiEdit2, FiTrash2,
  FiCheckCircle, FiAlertCircle, FiRefreshCw, FiBookOpen,
  FiKey, FiLogIn, FiAward, FiPlus
} from 'react-icons/fi';
import { MdLocationOn, MdAccessTime, MdDateRange, MdPeople, MdOutlineQrCode2 } from 'react-icons/md';
import '../../styles/Eventos.css';

const etiquetaTipo = (tipo) => (
  <span className={`eventosCardType ${tipo === 'privado' ? 'eventosCardTypePrivado' : 'eventosCardTypePublico'}`}>
    {tipo === 'privado' ? <FiLock className="eventosCardTypeIcon" /> : <FiGlobe className="eventosCardTypeIcon" />}
    {tipo === 'privado' ? ' Privado' : ' Público'}
  </span>
);

function TarjetaUnirse({ sesion, index, onJoinSuccess, yaUnido }) {
  const { token } = useAuth();
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
      setMsg({ texto: data.message || 'Te has unido al evento exitosamente', tipo: 'ok' });
      setUnido(true);

      if (onJoinSuccess) {
        onJoinSuccess(sesion.id);
      }
    } catch (err) {
      setMsg({ texto: err.message || 'Error al unirse al evento', tipo: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`eventosCard ${isHovered ? 'eventosCardHovered' : ''}`}
      style={{
        animation: `slideUp 0.6s cubic-bezier(0.22, 1, 0.36, 1) ${index * 0.1}s both`,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="eventosCardAccent" />
      
      <div className="eventosCardHeader">
        <div className="eventosCardCode">
          <FiBookOpen className="eventosCardCodeIcon" />
          {sesion.code || '---'}
        </div>
        {etiquetaTipo(sesion.tipo)}
      </div>

      <h3 className="eventosCardTitle">{sesion.titulo}</h3>
      <p className="eventosCardDescription">{sesion.detalles || 'Sin descripción disponible.'}</p>

      <div className="eventosCardDetails">
        <div className="eventosDetailItem">
          <MdLocationOn className="eventosDetailIcon" />
          <span><strong>Sala:</strong> {sesion.sala || 'No asignada'}</span>
        </div>
        <div className="eventosDetailItem">
          <MdDateRange className="eventosDetailIcon" />
          <span><strong>Fecha:</strong> {sesion.fecha || 'No especificada'}</span>
        </div>
        <div className="eventosDetailItem">
          <MdAccessTime className="eventosDetailIcon" />
          <span><strong>Horario:</strong> {sesion.hora_inicio} - {sesion.hora_fin || '...'}</span>
        </div>
        <div className="eventosDetailItem">
          <MdPeople className="eventosDetailIcon" />
          <span><strong>Capacidad:</strong> {sesion.capacidad ? `${sesion.capacidad} personas` : 'Ilimitada'}</span>
        </div>
        <div className="eventosDetailItem">
          <FiUser className="eventosDetailIcon" />
          <span><strong>Organizador:</strong> {sesion.organizador || 'No especificado'}</span>
        </div>
      </div>

      {msg.texto && (
        <div className={`eventosMessage eventosMessage${msg.tipo === 'ok' ? 'Ok' : 'Error'}`}>
          {msg.tipo === 'ok' ? <FiCheckCircle className="eventosMessageIcon" /> : <FiAlertCircle className="eventosMessageIcon" />}
          <span>{msg.texto}</span>
        </div>
      )}

      {mostrarComoUnido ? (
        <div className="eventosPaseContainer">
          <div className="eventosMessage eventosMessageOk">
            <FiCheckCircle className="eventosMessageIcon" />
            <span>Ya estás registrado en este evento</span>
          </div>
          <div className="eventosPaseQr">
            <div className="eventosPaseQrLabel">
              <MdOutlineQrCode2 className="eventosPaseQrLabelIcon" />
              Tu pase de entrada
            </div>
            <img
              src={api.qr.miPaseUrl(sesion.id, token)}
              alt="Código QR de tu pase de entrada"
              className="eventosPaseQrImagen"
            />
            <p className="eventosPaseQrHint">Muestra este código en la entrada del evento.</p>
          </div>
        </div>
      ) : (
        sesion.tipo === 'privado' ? (
          <div className="eventosPrivateJoin">
            <div className="eventosPasswordWrapper">
              <FiKey className="eventosPasswordIcon" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Contraseña del evento"
                className="eventosPasswordInput"
                disabled={loading}
              />
            </div>
            <button
              onClick={handleUnirse}
              disabled={loading || !password.trim()}
              className={`eventosJoinButton eventosJoinButtonPrivate ${(loading || !password.trim()) ? 'eventosButtonDisabled' : ''}`}
            >
              {loading ? (
                <span className="eventosLoadingSpinner">
                  <span className="eventosSmallSpinner"></span>
                  <span>Uniendo...</span>
                </span>
              ) : (
                <>
                  <FiLogIn className="eventosJoinIcon" />
                  Unirse
                </>
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
                <span>Procesando...</span>
              </span>
            ) : (
              <>
                <FiLogIn className="eventosJoinIcon" />
                Unirse al evento
              </>
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
      className={`eventosCard eventosCardAdmin ${isHovered ? 'eventosCardHovered' : ''}`}
      style={{
        animation: `slideUp 0.6s cubic-bezier(0.22, 1, 0.36, 1) ${index * 0.1}s both`,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="eventosCardAccent adminAccent" />
      
      <div className="eventosCardHeader">
        <div className="eventosCardCode">
          <FiBookOpen className="eventosCardCodeIcon" />
          {sesion.code || '---'}
        </div>
        <div className="eventosCardBadges">
          {etiquetaTipo(sesion.tipo)}
          <span className="eventosAdminBadge">
            <FiAward className="eventosAdminBadgeIcon" />
            Admin
          </span>
        </div>
      </div>

      <h3 className="eventosCardTitle">{sesion.titulo}</h3>
      <p className="eventosCardDescription">{sesion.detalles || 'Sin descripción disponible.'}</p>

      <div className="eventosCardDetails">
        <div className="eventosDetailItem">
          <MdLocationOn className="eventosDetailIcon" />
          <span><strong>Sala:</strong> {sesion.sala || 'No asignada'}</span>
        </div>
        <div className="eventosDetailItem">
          <MdDateRange className="eventosDetailIcon" />
          <span><strong>Fecha:</strong> {sesion.fecha || 'No especificada'}</span>
        </div>
        <div className="eventosDetailItem">
          <MdAccessTime className="eventosDetailIcon" />
          <span><strong>Horario:</strong> {sesion.hora_inicio} - {sesion.hora_fin || '...'}</span>
        </div>
        <div className="eventosDetailItem">
          <MdPeople className="eventosDetailIcon" />
          <span><strong>Capacidad:</strong> {sesion.capacidad ? `${sesion.capacidad} personas` : 'Ilimitada'}</span>
        </div>
        <div className="eventosDetailItem">
          <FiUser className="eventosDetailIcon" />
          <span><strong>Organizador:</strong> {sesion.organizador || 'No especificado'}</span>
        </div>
      </div>

      {(onEditar || onEliminar) && (
        <div className="eventosAdminActions">
          {onEditar && (
            <button onClick={onEditar} className="eventosEditButton">
              <FiEdit2 className="eventosActionIcon" />
              Editar
            </button>
          )}
          {onEliminar && (
            <button onClick={onEliminar} className="eventosDeleteButton">
              <FiTrash2 className="eventosActionIcon" />
              Eliminar
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

  const { sesiones, misUnionesIds, loading, error, conectado, setSesiones, recargar } = useSesiones();

  const [busqueda, setBusqueda] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('todos'); // 'todos', 'privado', 'publico'

  const handleJoinSuccess = (id) => {
    recargar();

    setTimeout(() => {
      navigate('/home');
    }, 1200);
  };

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este evento?')) return;
    try {
      await api.sesiones.eliminar(id);
      setSesiones((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      alert(err.message || 'Error al eliminar el evento');
    }
  };

  const filtradas = useMemo(() => {
    if (!sesiones.length) return [];

    let resultado = sesiones;

    // Filtro de búsqueda
    if (busqueda.trim()) {
      const term = busqueda.toLowerCase().trim();
      resultado = resultado.filter((s) =>
        s.organizador?.toLowerCase().includes(term) ||
        s.code?.toLowerCase().includes(term) ||
        s.sala?.toLowerCase().includes(term) ||
        s.titulo?.toLowerCase().includes(term) ||
        s.detalles?.toLowerCase().includes(term)
      );
    }

    // Filtro de tipo
    if (filtroTipo !== 'todos') {
      resultado = resultado.filter((s) => s.tipo === filtroTipo);
    }

    return resultado;
  }, [sesiones, busqueda, filtroTipo]);

  const isUserJoined = (sesion) => {
    if (!user) return false;
    return misUnionesIds.has(sesion.id) || sesion.organizador === user.username;
  };

  // Contar eventos por tipo
  const totalEventos = sesiones.length;
  const publicos = sesiones.filter(s => s.tipo === 'publico').length;
  const privados = sesiones.filter(s => s.tipo === 'privado').length;

  return (
    <div className="eventosContainer">
      <div className="eventosHeader">
        <div className="eventosHeaderContent">
          <div className="eventosHeaderLeft">
            <h1 className="eventosTitle">
              Eventos
            </h1>
            <p className="eventosSubtitle">
              {user?.role === 'admin' 
                ? 'Administra los eventos del congreso' 
                : 'Explora y únete a los eventos disponibles'}
            </p>
          </div>
          <div className="eventosHeaderRight">
            <div className="eventosStats">
              <div className="eventosStatItem">
                <span className="eventosStatNumber">{totalEventos}</span>
                <span className="eventosStatLabel">Total</span>
              </div>
              <div className="eventosStatDivider" />
              <div className="eventosStatItem">
                <span className="eventosStatNumber public">{publicos}</span>
                <span className="eventosStatLabel">Públicos</span>
              </div>
              <div className="eventosStatDivider" />
              <div className="eventosStatItem">
                <span className="eventosStatNumber private">{privados}</span>
                <span className="eventosStatLabel">Privados</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Barra de búsqueda y filtros */}
      <div className="eventosFilters">
        <div className="eventosSearchWrapper">
          <FiSearch className="eventosSearchIcon" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por código, sala, organizador..."
            className="eventosSearchInput"
          />
          {busqueda && (
            <button 
              className="eventosSearchClear"
              onClick={() => setBusqueda('')}
            >
              ×
            </button>
          )}
        </div>
        <div className="eventosFilterButtons">
          <button
            className={`eventosFilterButton ${filtroTipo === 'todos' ? 'active' : ''}`}
            onClick={() => setFiltroTipo('todos')}
          >
            Todos
          </button>
          <button
            className={`eventosFilterButton ${filtroTipo === 'publico' ? 'active' : ''}`}
            onClick={() => setFiltroTipo('publico')}
          >
            <FiGlobe className="eventosFilterIcon" />
            Públicos
          </button>
          <button
            className={`eventosFilterButton ${filtroTipo === 'privado' ? 'active' : ''}`}
            onClick={() => setFiltroTipo('privado')}
          >
            <FiLock className="eventosFilterIcon" />
            Privados
          </button>
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
          <FiAlertCircle className="eventosErrorIcon" />
          <span>{error}</span>
          <button onClick={recargar} className="eventosRetryButton">
            <FiRefreshCw className="eventosRetryIcon" />
            Reintentar
          </button>
        </div>
      )}

      {!loading && !error && (
        filtradas.length === 0 ? (
          <div className="eventosEmpty">
            <div className="eventosEmptyIconContainer">
              <FiBookOpen className="eventosEmptyIcon" />
            </div>
            <h3 className="eventosEmptyTitle">
              {busqueda ? `No hay resultados para "${busqueda}"` : 'No hay eventos disponibles'}
            </h3>
            <p className="eventosEmptyText">
              {busqueda
                ? 'Intenta con otros términos de búsqueda o elimina los filtros'
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