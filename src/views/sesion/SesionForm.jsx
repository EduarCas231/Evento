import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { 
  FiEdit2, FiPlus, FiSave, FiX, FiAlertCircle, 
  FiCheckCircle, FiLock, FiGlobe, FiCalendar,
  FiClock, FiMapPin, FiBookOpen,
  FiChevronDown, FiKey, FiInfo, FiUsers
} from 'react-icons/fi';
import { MdLocationOn, MdAccessTime, MdDateRange, MdPeople } from 'react-icons/md';
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

  const campo = (label, name, type = 'text', placeholder = '', icon = null) => (
    <div className="formInputGroup">
      <label className="formLabel">
        {label}
        {type !== 'hidden' && <span className="formLabelRequired">*</span>}
      </label>
      <div className="formInputWrapper">
        {icon && <span className="formInputIcon">{icon}</span>}
        <input
          type={type}
          name={name}
          value={form[name]}
          onChange={handleChange}
          placeholder={placeholder}
          className={`formInput ${icon ? 'formInputWithIcon' : ''}`}
          disabled={loading}
          required={type !== 'hidden'}
        />
      </div>
    </div>
  );

  if (sinPermiso) {
    return (
      <div className="formContainer">
        <div className="formCard">
          <div className="formError">
            <FiAlertCircle className="formErrorIcon" />
            <span className="formErrorText">No tienes permiso para editar este evento — solo el organizador puede hacerlo.</span>
          </div>
          <button
            type="button"
            onClick={() => navigate('/datos-sesion')}
            className="formCancelButton"
            style={{ marginTop: '1rem' }}
          >
            <FiX className="formButtonIcon" />
            Volver
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="formContainer">
      <div className="formCard">
        <div className="formCardAccent" />
        
        <div className="formHeader">
          <div className="formIconContainer">
            {esEdicion ? (
              <FiEdit2 className="formHeaderIcon" />
            ) : (
              <FiPlus className="formHeaderIcon" />
            )}
          </div>
          <div className="formHeaderText">
            <h1 className="formTitle">
              {esEdicion ? 'Editar Evento' : 'Nuevo Evento'}
            </h1>
            <p className="formSubtitle">
              {esEdicion 
                ? 'Actualiza la información del evento' 
                : 'Completa los datos para crear un nuevo evento'}
            </p>
          </div>
        </div>

        {error && (
          <div className="formMessage formMessageError">
            <FiAlertCircle className="formMessageIcon" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="formMessage formMessageSuccess">
            <FiCheckCircle className="formMessageIcon" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="form">
          {/* Información básica */}
          <div className="formSection">
            <div className="formSectionHeader">
              <FiBookOpen className="formSectionIcon" />
              <h2 className="formSectionTitle">Información Básica</h2>
            </div>
            <div className="formGrid">
              {campo('Título', 'titulo', 'text', 'Ej. Conferencia inaugural', <FiInfo />)}
              {campo('Código', 'code', 'text', 'Ej. CONF-01', <FiBookOpen />)}
            </div>
          </div>

          {/* Ubicación */}
          <div className="formSection">
            <div className="formSectionHeader">
              <FiMapPin className="formSectionIcon" />
              <h2 className="formSectionTitle">Ubicación</h2>
            </div>
            <div className="formGrid">
              {campo('Sala', 'sala', 'text', 'Ej. Auditorio A', <MdLocationOn />)}
              {campo('Ubicación', 'zona', 'text', 'Ej. Zona Norte', <FiMapPin />)}
            </div>
          </div>

          {/* Fecha y hora */}
          <div className="formSection">
            <div className="formSectionHeader">
              <FiCalendar className="formSectionIcon" />
              <h2 className="formSectionTitle">Fecha y Horario</h2>
            </div>
            <div className="formGrid">
              {campo('Fecha', 'fecha', 'date', '', <MdDateRange />)}
            </div>
            <div className="formTimeGrid">
              {campo('Hora Inicio', 'hora_inicio', 'time', '', <FiClock />)}
              {campo('Hora Fin', 'hora_fin', 'time', '', <MdAccessTime />)}
            </div>
          </div>

          {/* Capacidad */}
          <div className="formSection">
            <div className="formSectionHeader">
              <FiUsers className="formSectionIcon" />
              <h2 className="formSectionTitle">Capacidad</h2>
            </div>
            <div className="formGrid">
              {campo('Capacidad', 'capacidad', 'number', 'Ej. 200', <MdPeople />)}
            </div>
          </div>

          {/* Visibilidad */}
          <div className="formSection">
            <div className="formSectionHeader">
              <FiGlobe className="formSectionIcon" />
              <h2 className="formSectionTitle">Visibilidad</h2>
            </div>
            <div className="formInputGroup">
              <label className="formLabel">
                Tipo de Evento
                <span className="formLabelRequired">*</span>
              </label>
              <div className="formSelectWrapper">
                <select
                  name="tipo"
                  value={form.tipo}
                  onChange={handleChange}
                  className="formSelect"
                  disabled={loading}
                >
                  <option value="publico">
                    <FiGlobe className="formSelectOptionIcon" />
                    Público - Acceso sin contraseña
                  </option>
                  <option value="privado">
                    <FiLock className="formSelectOptionIcon" />
                    Privado - Requiere contraseña
                  </option>
                </select>
                <FiChevronDown className="formSelectIcon" />
              </div>
            </div>

            {form.tipo === 'privado' && (
              <div className="formInputGroup formPasswordGroup">
                <label className="formLabel">
                  Contraseña del evento
                  <span className="formLabelRequired">*</span>
                </label>
                <div className="formInputWrapper">
                  <FiKey className="formInputIcon" />
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
                <div className="formHelperText">
                  <FiInfo className="formHelperIcon" />
                  <span>La contraseña será requerida para unirse al evento</span>
                </div>
              </div>
            )}
          </div>

          {/* Detalles */}
          <div className="formSection">
            <div className="formSectionHeader">
              <FiInfo className="formSectionIcon" />
              <h2 className="formSectionTitle">Detalles Adicionales</h2>
            </div>
            <div className="formInputGroup">
              <label className="formLabel">Descripción</label>
              <textarea
                name="detalles"
                value={form.detalles}
                onChange={handleChange}
                rows={4}
                placeholder="Descripción detallada de la sesión..."
                className="formTextarea"
                disabled={loading}
              />
              <div className="formHelperText">
                <span>Máximo 500 caracteres</span>
                <span>{form.detalles?.length || 0}/500</span>
              </div>
            </div>
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
                <>
                  <FiSave className="formButtonIcon" />
                  {esEdicion ? 'Actualizar Evento' : 'Crear Evento'}
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate('/datos-sesion')}
              className="formCancelButton"
              disabled={loading}
            >
              <FiX className="formButtonIcon" />
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}