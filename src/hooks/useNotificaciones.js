import { useEffect, useRef } from 'react';
import { api } from '../services/api';

const POLL_INTERVAL = 30000;

function notificar(titulo, cuerpo) {
  if (Notification.permission !== 'granted') return;
  new Notification(titulo, { body: cuerpo, icon: '/favicon.ico' });
}

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

  // Pedir permiso al montar
  useEffect(() => {
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Detectar cambios cada vez que registrados cambia
  useEffect(() => {
    if (!registrados.length) return;

    const prev = prevRef.current;
    const idsActuales = registrados.map(s => s.id);
    limpiarFlags(idsActuales);

    registrados.forEach(s => {
      const ant = prev[s.id];

      // Cambio de sala
      if (ant && ant.sala !== s.sala) {
        notificar(
          `📍 Cambio de ubicación — ${s.titulo}`,
          `Nueva sala: ${s.sala || 'sin asignar'} (antes: ${ant.sala || '—'})`
        );
      }

      // Cupo lleno
      if (s.capacidad && s.ocupados >= s.capacidad && !yaNotificado('cupo', s.id)) {
        notificar(`🔴 Cupo lleno — ${s.titulo}`, 'El evento ha alcanzado su capacidad máxima.');
        marcarNotificado('cupo', s.id);
      }

      // Inicio del evento (ventana de 1 minuto desde que arranca)
      const inicio = new Date(`${s.fecha}T${s.hora_inicio}`);
      const diff = inicio - Date.now();
      if (diff <= 0 && diff > -60000 && !yaNotificado('inicio', s.id)) {
        notificar(`🟢 ¡Comenzó! — ${s.titulo}`, `El evento está iniciando en ${s.sala || 'su sala'}.`);
        marcarNotificado('inicio', s.id);
      }
    });

    // Evento eliminado: estaba antes y ya no está
    Object.values(prev).forEach(ant => {
      if (!idsActuales.includes(ant.id)) {
        notificar(`🗑️ Evento cancelado — ${ant.titulo}`, 'Este evento fue eliminado por el organizador.');
      }
    });

    prevRef.current = Object.fromEntries(registrados.map(s => [s.id, s]));
  }, [registrados]);

  // Polling cada 30s: recarga lista y enriquece con ocupados
  useEffect(() => {
    const poll = async () => {
      try {
        const data = await api.sesiones.misRegistros();
        const enriquecidos = await Promise.all(
          data.map(async s => {
            try {
              const info = await api.sesiones.asistentes(s.id);
              return { ...s, ocupados: info.ocupados, capacidad: info.capacidad ?? s.capacidad };
            } catch {
              return s;
            }
          })
        );
        setRegistrados(enriquecidos);
      } catch {}
    };

    const id = setInterval(poll, POLL_INTERVAL);
    return () => clearInterval(id);
  }, [setRegistrados]);
}
