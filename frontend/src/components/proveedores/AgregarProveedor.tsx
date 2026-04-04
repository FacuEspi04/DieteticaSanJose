import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { createProveedor, type CreateProveedorDto} from "../../services/apiService";
import * as S from '../ui/styles';
import Spinner from '../ui/Spinner';

interface ProveedorForm {
  nombre: string;
  contacto: string;
  telefono: string;
  email: string;
  direccion: string;
  cuit: string;
  notas: string;
}

const AgregarProveedor: React.FC = () => {
  const navigate = useNavigate();
  const [exito, setExito] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<ProveedorForm>({
    nombre: "",
    contacto: "",
    telefono: "",
    email: "",
    direccion: "",
    cuit: "",
    notas: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const validarFormulario = (): boolean => {
    if (!formData.nombre.trim()) {
      setError("El nombre del proveedor es obligatorio");
      return false;
    }
    if (!formData.contacto.trim()) {
      setError("El nombre del contacto es obligatorio");
      return false;
    }
    if (!formData.telefono.trim()) {
      setError("El teléfono es obligatorio");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email.trim() && !emailRegex.test(formData.email)) {
      setError("El formato del email no es válido");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setExito(false);

    if (!validarFormulario()) {
      return;
    }

    setIsSubmitting(true);

    const proveedorDto: CreateProveedorDto = {
      nombre: formData.nombre,
      contacto: formData.contacto,
      telefono: formData.telefono,
      email: formData.email,
      direccion: formData.direccion || undefined,
      cuit: formData.cuit || undefined,
      notas: formData.notas || undefined,
    };

    try {
      await createProveedor(proveedorDto);
      
      setExito(true);
      setIsSubmitting(false);

      setFormData({
        nombre: "",
        contacto: "",
        telefono: "",
        email: "",
        direccion: "",
        cuit: "",
        notas: "",
      });

      setTimeout(() => {
        navigate("/proveedores");
      }, 2000);

    } catch (err: any) {
      setError(err.message || "Error al guardar el proveedor");
      setIsSubmitting(false);
    }
  };

  const handleCancelar = () => {
    navigate("/proveedores");
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Agregar Nuevo Proveedor</h1>
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
                <button onClick={() => setError("")} className="text-red-500 hover:text-red-700 ml-2 cursor-pointer">✕</button>
              </div>
            )}
            {exito && (
              <div className={S.alertSuccess}>
                <CheckCircle size={20} className="shrink-0" />
                ¡Proveedor agregado exitosamente! Redirigiendo...
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
                    placeholder="Ej: Distribuidora Natural"
                    required
                    disabled={isSubmitting}
                    className={S.input}
                  />
                </div>
                <div>
                  <label className={S.label}>
                    Persona de Contacto <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="contacto"
                    value={formData.contacto}
                    onChange={(e: any) => handleChange(e)}
                    placeholder="Ej: Juan Pérez"
                    required
                    disabled={isSubmitting}
                    className={S.input}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className={S.label}>
                    Teléfono <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="telefono"
                    value={formData.telefono}
                    onChange={(e: any) => handleChange(e)}
                    placeholder="Ej: 261-4567890"
                    required
                    disabled={isSubmitting}
                    className={S.input}
                  />
                </div>
                <div>
                  <label className={S.label}>
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={(e: any) => handleChange(e)}
                    placeholder="Ej: contacto@proveedor.com"
                    disabled={isSubmitting}
                    className={S.input}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className={S.label}>CUIT</label>
                  <input
                    type="text"
                    name="cuit"
                    value={formData.cuit}
                    onChange={(e: any) => handleChange(e)}
                    placeholder="Ej: 20-12345678-9"
                    disabled={isSubmitting}
                    className={S.input}
                  />
                </div>
                <div>
                  <label className={S.label}>Dirección</label>
                  <input
                    type="text"
                    name="direccion"
                    value={formData.direccion}
                    onChange={(e: any) => handleChange(e)}
                    placeholder="Ej: Calle Falsa 123, Mendoza"
                    disabled={isSubmitting}
                    className={S.input}
                  />
                </div>
              </div>

              <div className={S.formGroup}>
                <label className={S.label}>Notas / Observaciones</label>
                <textarea
                  rows={3}
                  name="notas"
                  value={formData.notas}
                  onChange={(e: any) => handleChange(e)}
                  placeholder="Información adicional sobre el proveedor..."
                  disabled={isSubmitting}
                  className={S.input}
                />
              </div>

              <p className={S.formText}>
                Los campos marcados con <span className="text-red-500">*</span> son obligatorios
              </p>

              {/* Botones de acción */}
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
                    "Guardar Proveedor"
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

export default AgregarProveedor;
