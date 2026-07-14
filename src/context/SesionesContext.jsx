import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

const BASE_URL = process.env.REACT_APP_API_URL || 'https://comapi.duckdns.org/api';

const SesionesContext = createContext(null);

export function SesionesProvider({ children }) {
  const [sesiones, setSesiones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [conectado, setConectado] = useState(false);
  const esRef = useRef(null);
  const { user, token } = useAuth(); // ajusta según lo que exponga tu AuthContext

  // Carga inicial de todas las sesiones (una sola vez, al montar el Provider)
  const cargarSesiones = useCallback(() => {
    setLoading(true);
    api.sesiones.listar()
      .then((data) => {
        setSesiones(data);
        // Carga el conteo de asistentes de cada una, en paralelo
        data.forEach((s) => {
          api.sesiones.asistentes(s.id)
            .then((d) => {
              setSesiones((prev) =>
                prev.map((x) => x.id === s.id ? { ...x, ocupados: d.ocupados ?? 0 } : x)
              );
            })
            .catch(() => {});
        });
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (user) cargarSesiones();
  }, [user, cargarSesiones]);

  // Conexión SSE única para toda la app
  useEffect(() => {
    if (!token) return;

    const url = `${BASE_URL}/sse/stream?token=${token}`;
    const es = new EventSource(url);
    esRef.current = es;

    es.onopen = () => setConectado(true);

    es.addEventListener('sesion_actualizada', (e) => {
      const datos = JSON.parse(e.data);
      setSesiones(prev => {
        const existe = prev.some(s => s.id === datos.id);
        return existe
          ? prev.map(s => s.id === datos.id ? { ...s, ...datos } : s)
          : [...prev, datos]; // por si es una sesión nueva que este usuario aún no tenía
      });
    });

    es.addEventListener('sesion_eliminada', (e) => {
      const { id } = JSON.parse(e.data);
      setSesiones(prev => prev.filter(s => s.id !== id));
    });

    es.addEventListener('asistentes_actualizado', (e) => {
      const { id_sesion, ocupados, capacidad } = JSON.parse(e.data);
      setSesiones(prev =>
        prev.map(s => s.id === id_sesion ? { ...s, ocupados, capacidad } : s)
      );
    });

    es.onerror = (event) => {
      setConectado(false);
      console.error('SSE connection error', event);
    };

    return () => {
      es.close();
      setConectado(false);
    };
  }, [token]);

  const value = {
    sesiones,
    setSesiones,
    loading,
    error,
    conectado,
    recargar: cargarSesiones,
  };

  return (
    <SesionesContext.Provider value={value}>
      {children}
    </SesionesContext.Provider>
  );
}

export function useSesiones() {
  const ctx = useContext(SesionesContext);
  if (!ctx) {
    throw new Error('useSesiones debe usarse dentro de un SesionesProvider');
  }
  return ctx;
}