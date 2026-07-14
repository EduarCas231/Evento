import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import '../../styles/SesionForm.css';

const EMPTY = { 
  titulo: '', 
  sala: '', 
  code: '', 
  capacidad: '', 
  detalles: '', 
  fecha: '', 
  hora_inicio: '', 
  hora_fin: '', 
  zona: '', 
  tipo: 'publico', 
  password: '' 
};

export default function SesionForm() {
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [sinPermiso, setSinPermiso] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const esEdicion = Boolean(id);

  useEffect(() => {
    if (!esEdicion) return;
    api.sesiones.obtener(id)
      .then((data) => {
        if (data.organizador !== user?.username) {
          setSinPermiso(true);
          return;
        }
        setForm({
          titulo: data.titulo || '',
          sala: data.sala || '',
          code: data.code || '',
          capacidad: data.capacidad || '',
          detalles: data.detalles || '',
          fecha: data.fecha || '',
          hora_inicio: data.hora_inicio || '',
          hora_fin: data.hora_fin || '',
          zona: data.zona || '',
          tipo: data.tipo || 'publico',
          password: data.password || '',
        });
      })
      .catch((err) => setError(err.message));
  }, [id, esEdicion, user]);

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!form.titulo.trim()) {
      setError('El título es obligatorio.');
      setLoading(false);
      return;
    }

    if (!form.fecha || !form.hora_inicio || !form.hora_fin) {
      setError('Fecha, hora de inicio y hora de fin son obligatorios.');
      setLoading(false);
      return;
    }

    if (!form.capacidad || Number(form.capacidad) <= 0) {
      setError('La capacidad debe ser un número mayor que cero.');
      setLoading(false);
      return;
    }

    if (form.tipo === 'privado' && !form.password.trim()) {
      setError('La contraseña es obligatoria para eventos privados.');
      setLoading(false);
      return;
    }

    const payload = {
      titulo: form.titulo,
      sala: form.sala,
      code: form.code || undefined,
      capacidad: form.capacidad ? Number(form.capacidad) : 0,
      detalles: form.detalles,
      fecha: form.fecha,
      hora_inicio: form.hora_inicio,
      hora_fin: form.hora_fin,
      zona: form.zona,
      tipo: form.tipo,
      ...(form.tipo === 'privado' ? { password: form.password } : {}),
    };

    try {
      if (esEdicion) {
        await api.sesiones.editar(id, payload);
        setSuccess('¡Evento actualizado con éxito!');
      } else {
        await api.sesiones.crear(payload);
        setSuccess('¡Evento creado con éxito!');
      }
      setTimeout(() => {
        navigate('/datos-sesion');
      }, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const campo = (label, name, type = 'text', placeholder = '') => (
    <div className="formInputGroup">
      <label className="formLabel">{label}</label>
      <input
        type={type}
        name={name}
        value={form[name]}
        onChange={handleChange}
        placeholder={placeholder}
        className="formInput"
        disabled={loading}
      />
    </div>
  );

  if (sinPermiso) {
    return (
      <div className="formContainer">
        <div className="formCard">
          <div className="formError">
            <svg className="formErrorIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span className="formErrorText">No tienes permiso para editar este evento — solo el organizador puede hacerlo.</span>
          </div>
          <button
            type="button"
            onClick={() => navigate('/datos-sesion')}
            className="formCancelButton"
            style={{ marginTop: '1rem' }}
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="formContainer">
      <div className="formCard">
        <div className="formHeader">
          <div className="formLogoContainer">
            <svg className="formLogo" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {esEdicion ? (
                <>
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
                </>
              ) : (
                <>
                  <path d="M12 5v14" />
                  <path d="M5 12h14" />
                </>
              )}
            </svg>
          </div>
          <h1 className="formTitle">
            {esEdicion ? 'Editar Evento' : 'Nuevo Evento'}
          </h1>
          <p className="formSubtitle">
            {esEdicion 
              ? 'Actualiza la información del evento' 
              : 'Completa los datos para crear un nuevo evento'}
          </p>
        </div>

        {error && (
          <div className="formError">
            <svg className="formErrorIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span className="formErrorText">{error}</span>
          </div>
        )}

        {success && (
          <div className="formSuccess">
            <svg className="formSuccessIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <span className="formSuccessText">{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="form">
          <div className="formGrid">
            {campo('Título *', 'titulo', 'text', 'Ej. Conferencia inaugural')}
            {campo('Código', 'code', 'text', 'Ej. CONF-01')}
            {campo('Sala', 'sala', 'text', 'Ej. Auditorio A')}
            {campo('Zona', 'zona', 'text', 'Ej. Zona Norte')}
            {campo('Capacidad', 'capacidad', 'number', 'Ej. 200')}
            {campo('Fecha', 'fecha', 'date')}
          </div>

          <div className="formTimeGrid">
            {campo('Hora inicio', 'hora_inicio', 'time')}
            {campo('Hora fin', 'hora_fin', 'time')}
          </div>

          <div className="formInputGroup">
            <label className="formLabel">Visibilidad</label>
            <div className="formSelectWrapper">
              <select
                name="tipo"
                value={form.tipo}
                onChange={handleChange}
                className="formSelect"
                disabled={loading}
              >
                <option value="publico">🌐 Público</option>
                <option value="privado">🔒 Privado</option>
              </select>
              <svg className="formSelectIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
          </div>

          {form.tipo === 'privado' && (
            <div className="formInputGroup formPasswordGroup">
              <label className="formLabel">Contraseña del evento *</label>
              <div className="formInputWrapper">
                <svg className="formInputIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0110 0v4" />
                </svg>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Contraseña para acceder al evento privado"
                  className="formInput formInputWithIcon"
                  disabled={loading}
                />
              </div>
            </div>
          )}

          <div className="formInputGroup">
            <label className="formLabel">Detalles</label>
            <textarea
              name="detalles"
              value={form.detalles}
              onChange={handleChange}
              rows={4}
              placeholder="Descripción de la sesión..."
              className="formTextarea"
              disabled={loading}
            />
          </div>

          <div className="formButtonGroup">
            <button
              type="submit"
              disabled={loading}
              className={`formSubmitButton ${loading ? 'formButtonDisabled' : ''}`}
            >
              {loading ? (
                <span className="formLoadingSpinner">
                  <span className="formSpinner"></span>
                  Guardando...
                </span>
              ) : (
                esEdicion ? 'Actualizar Sesión' : 'Crear Sesión'
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate('/datos-sesion')}
              className="formCancelButton"
              disabled={loading}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}