import { useEffect, useRef } from 'react';

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

function notif(titulo, cuerpo) {
  if (Notification.permission === 'granted') {
    new Notification(titulo, { body: cuerpo, icon: '/favicon.ico' });
  }
}

export function useNotificaciones(registrados) {
  const prevRef = useRef({});

  useEffect(() => {
    if (Notification.permission === 'default') Notification.requestPermission();
  }, []);

  useEffect(() => {
    if (!registrados.length) return;
    const prev = prevRef.current;
    const idsActuales = registrados.map(s => s.id);
    limpiarFlags(idsActuales);

    registrados.forEach(s => {
      const ant = prev[s.id];
      if (!ant) return;

      if (ant.sala !== s.sala)
        notif(`📍 Cambio de sala — ${s.titulo}`, `Nueva sala: ${s.sala || '—'} (antes: ${ant.sala || '—'})`);

      if (s.capacidad && s.ocupados >= s.capacidad && !yaNotificado('cupo', s.id)) {
        notif(`🔴 Cupo lleno — ${s.titulo}`, 'El evento alcanzó su capacidad máxima.');
        marcarNotificado('cupo', s.id);
      }

      const diff = new Date(`${s.fecha}T${s.hora_inicio}`) - Date.now();
      if (diff <= 0 && diff > -60000 && !yaNotificado('inicio', s.id)) {
        notif(`🟢 ¡Comenzó! — ${s.titulo}`, `Iniciando en ${s.sala || 'su sala'}.`);
        marcarNotificado('inicio', s.id);
      }
    });

    Object.values(prev).forEach(ant => {
      if (!idsActuales.includes(ant.id))
        notif(`🗑️ Evento cancelado — ${ant.titulo}`, 'Este evento fue eliminado por el organizador.');
    });

    prevRef.current = Object.fromEntries(registrados.map(s => [s.id, s]));
  }, [registrados]);
}
