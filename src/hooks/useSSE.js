import { useEffect, useRef } from 'react';

const BASE_URL = process.env.REACT_APP_API_URL || 'https://comapi.duckdns.org/api';

export function useSSE(setRegistrados) {
  const esRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    // SSE no soporta headers, pasamos token como query param
    const url = `${BASE_URL}/sse/stream?token=${token}`;
    const es = new EventSource(url);
    esRef.current = es;

    // Sesión editada: actualizar campos en la tarjeta correspondiente
    es.addEventListener('sesion_actualizada', (e) => {
      const datos = JSON.parse(e.data);
      setRegistrados(prev =>
        prev.map(s => s.id === datos.id ? { ...s, ...datos } : s)
      );
    });

    // Sesión eliminada: quitar de la lista
    es.addEventListener('sesion_eliminada', (e) => {
      const { id } = JSON.parse(e.data);
      setRegistrados(prev => prev.filter(s => s.id !== id));
    });

    // Conteo de asistentes actualizado
    es.addEventListener('asistentes_actualizado', (e) => {
      const { id_sesion, ocupados, capacidad } = JSON.parse(e.data);
      setRegistrados(prev =>
        prev.map(s => s.id === id_sesion ? { ...s, ocupados, capacidad } : s)
      );
    });

    es.onerror = (event) => {
      console.error('SSE connection error', event);
      // No cerramos EventSource manualmente: el navegador intentará reconectar.
    };

    return () => {
      es.close();
    };
  }, [setRegistrados]);
}
