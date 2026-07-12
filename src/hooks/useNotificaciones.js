import { useEffect, useRef } from 'react';
import { api } from '../services/api';

const POLL_INTERVAL = 30000;

function yaNotificado(tipo, id) {
  return localStorage.getItem(`notif_${tipo}_${id}`) === '1';
}

function marcarNotificado(tipo, id) {
  localStorage.setItem(`notif_${tipo}_${id}`, '1');
}

function limpiarFlags(ids) {
  Object.keys(localStorage)
    .filter(k => k.startsWith('notif_') && !ids.some(id => k.endsWith(`_${id}`)))
    .forEach(k => localStorage.removeItem(k));
}

export function useNotificaciones(registrados, setRegistrados) {
  const prevRef = useRef({});

  useEffect(() => {
    if (Notification.permission === 'default') Notification.requestPermission();
  }, []);

  // Detectar cambios y disparar notificaciones locales (tab abierto)
  useEffect(() => {
    if (!registrados.length) return;
    const prev = prevRef.current;
    const idsActuales = registrados.map(s => s.id);
    limpiarFlags(idsActuales);

    registrados.forEach(s => {
      const ant = prev[s.id];
      if (!ant) return; // primera carga, no notificar

      if (ant.sala !== s.sala) {
        new Notification(`📍 Cambio de sala — ${s.titulo}`, {
          body: `Nueva sala: ${s.sala || '—'} (antes: ${ant.sala || '—'})`,
          icon: '/favicon.ico',
        });
      }

      if (s.capacidad && s.ocupados >= s.capacidad && !yaNotificado('cupo', s.id)) {
        new Notification(`🔴 Cupo lleno — ${s.titulo}`, {
          body: 'El evento alcanzó su capacidad máxima.',
          icon: '/favicon.ico',
        });
        marcarNotificado('cupo', s.id);
      }

      const diff = new Date(`${s.fecha}T${s.hora_inicio}`) - Date.now();
      if (diff <= 0 && diff > -60000 && !yaNotificado('inicio', s.id)) {
        new Notification(`🟢 ¡Comenzó! — ${s.titulo}`, {
          body: `Iniciando en ${s.sala || 'su sala'}.`,
          icon: '/favicon.ico',
        });
        marcarNotificado('inicio', s.id);
      }
    });

    Object.values(prev).forEach(ant => {
      if (!idsActuales.includes(ant.id)) {
        new Notification(`🗑️ Evento cancelado — ${ant.titulo}`, {
          body: 'Este evento fue eliminado por el organizador.',
          icon: '/favicon.ico',
        });
      }
    });

    prevRef.current = Object.fromEntries(registrados.map(s => [s.id, s]));
  }, [registrados]);

  // Polling: merge en lugar de reemplazar para no re-renderizar tarjetas
  useEffect(() => {
    const poll = async () => {
      try {
        const data = await api.sesiones.misRegistros();

        // Obtener ocupados de todas las sesiones en paralelo
        const infoAsistentes = await Promise.all(
          data.map(s =>
            api.sesiones.asistentes(s.id)
              .then(info => ({ id: s.id, ocupados: info.ocupados, capacidad: info.capacidad }))
              .catch(() => ({ id: s.id, ocupados: 0, capacidad: s.capacidad }))
          )
        );
        const mapaInfo = Object.fromEntries(infoAsistentes.map(i => [i.id, i]));

        // Merge: actualizar campos sin reemplazar objetos que no cambiaron
        setRegistrados(prev => {
          const prevMap = Object.fromEntries(prev.map(s => [s.id, s]));
          const nuevos = data.map(s => {
            const info = mapaInfo[s.id] || {};
            const merged = { ...s, ocupados: info.ocupados ?? 0, capacidad: info.capacidad ?? s.capacidad };
            const old = prevMap[s.id];
            // Retornar misma referencia si nada cambió (evita re-render)
            if (old &&
              old.sala === merged.sala &&
              old.titulo === merged.titulo &&
              old.fecha === merged.fecha &&
              old.hora_inicio === merged.hora_inicio &&
              old.ocupados === merged.ocupados &&
              old.capacidad === merged.capacidad
            ) return old;
            return merged;
          });
          return nuevos;
        });
      } catch {}
    };

    const id = setInterval(poll, POLL_INTERVAL);
    return () => clearInterval(id);
  }, [setRegistrados]);
}
