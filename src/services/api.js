const BASE_URL = process.env.REACT_APP_API_URL || 'https://comapi.duckdns.org/api';


async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  
  // Configurar las cabeceras por defecto
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Si hay un token guardado, lo añadimos automáticamente a la petición
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, config);
  const data = await response.json();

  if (!response.ok) {
    // Lanza el objeto de error completo que viene de tu Flask
    throw new Error(data.error || 'Ocurrió un error en la petición');
  }

  return data;
}

// Objeto con las funciones de servicios disponibles
export const api = {
  // Autenticación
  auth: {
    login: (email, password) => 
      apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),
    register: (username, email, password, role) =>
      apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ username, email, password, role }),
      }),
    verify: () => 
      apiFetch('/auth/verify', { 
        method: 'GET' 
      }),
  },

  // Usuarios
  users: {
    listar: () => apiFetch('/auth/users', { method: 'GET' }),
  },

  // Sesiones
  sesiones: {
    listar: () => apiFetch('/sesiones', { method: 'GET' }),
    misEventos: () => apiFetch('/sesiones/mis', { method: 'GET' }),
    obtener: (id) => apiFetch(`/sesiones/${id}`, { method: 'GET' }),
    asistentes: (id) => apiFetch(`/asistentes/sesion/${id}`, { method: 'GET' }),
    misRegistros: () => apiFetch('/asistentes/mis-eventos', { method: 'GET' }),
    misUniones: () => apiFetch('/asistentes/mis-uniones', { method: 'GET' }),
    eliminarAsistente: (idAsistencia) => apiFetch(`/asistentes/${idAsistencia}`, { method: 'DELETE' }),
    crear: (data) => apiFetch('/sesiones', { method: 'POST', body: JSON.stringify(data) }),
    editar: (id, data) => apiFetch(`/sesiones/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    eliminar: (id) => apiFetch(`/sesiones/${id}`, { method: 'DELETE' }),
    unirse: (code, password) => apiFetch('/asistentes/unirse', { method: 'POST', body: JSON.stringify({ code, ...(password ? { password } : {}) }) }),
    cambiarVisibilidad: (id, tipo) => apiFetch(`/sesiones/${id}/visibilidad`, { method: 'PUT', body: JSON.stringify({ tipo }) }),
    iniciar: (id) => apiFetch(`/sesiones/${id}/iniciar`, { method: 'PUT' }),
    finalizar: (id) => apiFetch(`/sesiones/${id}/finalizar`, { method: 'PUT' }),
  },

  // QR / Asistencia (check-in)
  qr: {
    // No es un fetch normal: se usa como src de <img>, por eso arma la URL
    // directo (el backend acepta el token por query param, igual que SSE).
    miPaseUrl: (idSesion, token) => `${BASE_URL}/asistentes/mi-qr/${idSesion}?token=${token}`,
    escanear: (qrToken) => apiFetch('/asistentes/escanear', { method: 'POST', body: JSON.stringify({ qr_token: qrToken }) }),
    flujo: (idSesion) => apiFetch(`/asistentes/flujo/${idSesion}`, { method: 'GET' }),
  },
};