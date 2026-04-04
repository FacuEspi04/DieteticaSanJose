import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import {
  getProveedorById,
  updateProveedor,
  type UpdateProveedorDto,
} from '../../services/apiService';
import * as S from '../ui/styles';
import Spinner from '../ui/Spinner';

interface ProveedorForm {
  nombre: string;
  contacto: string;
  telefono: string;
  email: string;
}

const EditarProveedor: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const proveedorId = Number(id);

  const [exito, setExito] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<ProveedorForm>({
    nombre: '',
    contacto: '',
    telefono: '',
    email: '',
  });

  useEffect(() => {
    if (!proveedorId) {
      setError('ID de proveedor inválido.');
      setIsLoading(false);
      return;
    }

    const cargarDatos = async () => {
      setIsLoading(true);
      try {
        const proveedorData = await getProveedorById(proveedorId);
        setFormData({
          nombre: proveedorData.nombre,
          contacto: proveedorData.contacto || '',
          telefono: proveedorData.telefono || '',
          email: proveedorData.email || '',
        });
      } catch (err: any) {
        console.error('Error al cargar datos:', err);
        setError(err.message || 'No se pudieron cargar los datos del proveedor.');
      } finally {
        setIsLoading(false);
      }
    };

    cargarDatos();
  }, [proveedorId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const validarFormulario = (): boolean => {
    if (!formData.nombre.trim()) {
      setError('El nombre del proveedor es obligatorio');
      return false;
    }
    if (
      formData.email.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
    ) {
      setError('El formato del email no es válido');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setExito(false);

    if (!validarFormulario()) {
      return;
    }

    setIsSubmitting(true);

    const proveedorActualizado: UpdateProveedorDto = {
      nombre: formData.nombre.trim(),
      contacto: formData.contacto.trim() || null,
      telefono: formData.telefono.trim() || null,
      email: formData.email.trim() || null,
    };

    try {
      await updateProveedor(proveedorId, proveedorActualizado);
      setExito(true);
      setTimeout(() => {
        navigate('/proveedores');
      }, 2000);
    } catch (apiError: any) {
      console.error('Error al actualizar proveedor:', apiError);
      setError(apiError.message || 'Error al actualizar el proveedor.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelar = () => {
    navigate('/proveedores');
  };

  if (isLoading) {
    return (
      <div className="text-center py-10">
        <Spinner />
        <p className="mt-2 text-slate-500">Cargando datos del proveedor...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Editar Proveedor: {formData.nombre}</h1>
        <button
          className={S.btnOutlineDark}
          onClick={handleCancelar}
          disabled={isSubmitting}
        >
          <ArrowLeft size={16} /> Volver
        </button>
      </div>

      <div className="max-w-4xl mx-auto mt-6">
        <div className={S.card}>
          <div className={S.cardBody}>
            {error && (
              <div className={S.alertDanger}>
                <span className="flex-1">{error}</span>
                <button onClick={() => setError('')} className="text-red-500 hover:text-red-700 ml-2 cursor-pointer">✕</button>
              </div>
            )}
            {exito && (
              <div className={S.alertSuccess}>
                <CheckCircle size={20} className="shrink-0" />
                ¡Proveedor actualizado exitosamente! Redirigiendo...
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className={S.label}>
                    Nombre del Proveedor <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={(e: any) => handleChange(e)}
                    required
                    className={S.input}
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <label className={S.label}>Contacto</label>
                  <input
                    type="text"
                    name="contacto"
                    value={formData.contacto}
                    onChange={(e: any) => handleChange(e)}
                    className={S.input}
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className={S.label}>Teléfono</label>
                  <div className={S.inputGroupWrapper}>
                    <span className={S.inputGroupText}>📞</span>
                    <input
                      type="tel"
                      name="telefono"
                      value={formData.telefono}
                      onChange={(e: any) => handleChange(e)}
                      className={S.inputGroupInput}
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
                <div>
                  <label className={S.label}>Email</label>
                  <div className={S.inputGroupWrapper}>
                    <span className={S.inputGroupText}>@</span>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={(e: any) => handleChange(e)}
                      placeholder="ejemplo@proveedor.com"
                      className={S.inputGroupInput}
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
              </div>

              <p className={S.formText}>
                Los campos marcados con <span className="text-red-500">*</span> son obligatorios
              </p>

              <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  className={S.btnOutlineSecondary}
                  onClick={handleCancelar}
                  disabled={isSubmitting}
                >
                  Cancelar
                </button>
                <button 
                   type="submit" 
                   className={S.btnSuccess} 
                   disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Spinner size="sm" className="mr-2" /> Guardando...
                    </>
                  ) : (
                    'Guardar Cambios'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditarProveedor;