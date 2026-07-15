import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import {
  FiArrowLeft, FiUsers, FiUserCheck, FiUserX, FiPercent,
  FiClock, FiCalendar, FiMapPin, FiBarChart2, FiAlertCircle,
  FiTrendingUp, FiMail,
} from 'react-icons/fi';
import '../../styles/ResumenEvento.css';

function GraficaFlujo({ porHora }) {
  if (!porHora.length) {
    return (
      <div className="resumenGraficaVacia">
        <FiBarChart2 className="resumenGraficaVaciaIcon" />
        <span>Todavía no hay entradas registradas para graficar.</span>
      </div>
    );
  }

  const max = Math.max(...porHora.map((p) => p.total));
  const anchoBarra = 100 / porHora.length;

  return (
    <div className="resumenGrafica">
      <svg viewBox={`0 0 100 60`} preserveAspectRatio="none" className="resumenGraficaSvg">
        {porHora.map((p, idx) => {
          const alturaPct = max > 0 ? (p.total / max) * 50 : 0;
          const x = idx * anchoBarra + anchoBarra * 0.15;
          const w = anchoBarra * 0.7;
          const y = 50 - alturaPct;
          return (
            <g key={p.hora}>
              <rect
                x={x}
                y={y}
                width={w}
                height={alturaPct}
                rx="1"
                className="resumenGraficaBarra"
              />
              <text
                x={x + w / 2}
                y={y - 2}
                textAnchor="middle"
                className="resumenGraficaValor"
              >
                {p.total}
              </text>
            </g>
          );
        })}
        <line x1="0" y1="50" x2="100" y2="50" className="resumenGraficaEje" />
      </svg>
      <div className="resumenGraficaEtiquetas">
        {porHora.map((p) => (
          <span key={p.hora} className="resumenGraficaEtiqueta">
            {p.hora.slice(11, 16)}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function ResumenEvento() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [evento, setEvento] = useState(null);
  const [flujo, setFlujo] = useState(null);
  const [asistentes, setAsistentes] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    Promise.all([
      api.sesiones.obtener(id),
      api.qr.flujo(id),
      api.sesiones.asistentes(id),
    ])
      .then(([eventoData, flujoData, asistentesData]) => {
        setEvento(eventoData);
        setFlujo(flujoData);
        setAsistentes(asistentesData);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const porcentajeAsistencia = useMemo(() => {
    if (!flujo || !flujo.total_registrados) return 0;
    return Math.round((flujo.total_presentes / flujo.total_registrados) * 100);
  }, [flujo]);

  const horaPico = useMemo(() => {
    if (!flujo || !flujo.por_hora.length) return null;
    return flujo.por_hora.reduce((max, p) => (p.total > max.total ? p : max), flujo.por_hora[0]);
  }, [flujo]);

  const noAsistieron = useMemo(() => {
    if (!asistentes?.asistentes) return [];
    return asistentes.asistentes.filter((a) => !a.presente);
  }, [asistentes]);

  if (loading) {
    return (
      <div className="resumenLoadingContainer">
        <div className="resumenSpinner"></div>
        <p>Cargando resumen del evento...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="resumenContainer">
        <div className="resumenError">
          <FiAlertCircle className="resumenErrorIcon" />
          <span>{error}</span>
        </div>
        <button onClick={() => navigate('/datos-sesion')} className="resumenVolverButton">
          <FiArrowLeft className="resumenVolverIcon" />
          Volver
        </button>
      </div>
    );
  }

  return (
    <div className="resumenContainer">
      <div className="resumenHeader">
        <button onClick={() => navigate('/datos-sesion')} className="resumenVolverButton">
          <FiArrowLeft className="resumenVolverIcon" />
          Volver
        </button>
        <span className="resumenEstadoBadge">{evento.estado}</span>
      </div>

      <h1 className="resumenTitulo">{evento.titulo}</h1>
      <div className="resumenMeta">
        <span className="resumenMetaItem">
          <FiMapPin className="resumenMetaIcon" />
          {evento.sala || 'Sin sala asignada'}
        </span>
        <span className="resumenMetaItem">
          <FiCalendar className="resumenMetaIcon" />
          {evento.fecha}
        </span>
        <span className="resumenMetaItem">
          <FiClock className="resumenMetaIcon" />
          {evento.hora_inicio} - {evento.hora_fin}
        </span>
      </div>

      <div className="resumenStatsGrid">
        <div className="resumenStatCard">
          <FiUsers className="resumenStatIcon" />
          <div className="resumenStatValor">{flujo.total_registrados}</div>
          <div className="resumenStatLabel">Registrados</div>
        </div>
        <div className="resumenStatCard resumenStatCardOk">
          <FiUserCheck className="resumenStatIcon" />
          <div className="resumenStatValor">{flujo.total_presentes}</div>
          <div className="resumenStatLabel">Asistieron</div>
        </div>
        <div className="resumenStatCard resumenStatCardWarn">
          <FiUserX className="resumenStatIcon" />
          <div className="resumenStatValor">{flujo.total_registrados - flujo.total_presentes}</div>
          <div className="resumenStatLabel">No asistieron</div>
        </div>
        <div className="resumenStatCard resumenStatCardAccent">
          <FiPercent className="resumenStatIcon" />
          <div className="resumenStatValor">{porcentajeAsistencia}%</div>
          <div className="resumenStatLabel">Porcentaje de ingreso</div>
        </div>
      </div>

      {horaPico && (
        <div className="resumenHoraPico">
          <FiTrendingUp className="resumenHoraPicoIcon" />
          <span>
            Hora de mayor afluencia: <strong>{horaPico.hora.slice(11, 16)}</strong> con{' '}
            <strong>{horaPico.total}</strong> {horaPico.total === 1 ? 'entrada' : 'entradas'}
          </span>
        </div>
      )}

      <div className="resumenSeccion">
        <h2 className="resumenSeccionTitulo">
          <FiBarChart2 className="resumenSeccionIcon" />
          Flujo de ingreso por hora
        </h2>
        <GraficaFlujo porHora={flujo.por_hora} />
      </div>

      <div className="resumenSeccion">
        <h2 className="resumenSeccionTitulo">
          <FiUserX className="resumenSeccionIcon" />
          Personas que no se presentaron ({noAsistieron.length})
        </h2>
        {noAsistieron.length === 0 ? (
          <p className="resumenListaVacia">Todos los registrados asistieron al evento.</p>
        ) : (
          <div className="resumenTableWrapper">
            <table className="resumenTable">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th>Registro</th>
                </tr>
              </thead>
              <tbody>
                {noAsistieron.map((a) => (
                  <tr key={a.id}>
                    <td>{a.nombre || a.username}</td>
                    <td>
                      <FiMail className="resumenTableEmailIcon" />
                      {a.email}
                    </td>
                    <td>{a.hora_ingreso || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
