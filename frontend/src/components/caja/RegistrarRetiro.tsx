import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Wallet } from 'lucide-react';
import { createRetiro, type CreateRetiroDto } from '../../services/apiService';
import { formatearPrecioInput, parsePrecioInput } from '../../utils/formatters';
import Spinner from '../ui/Spinner';
import * as S from '../ui/styles';

interface RetiroForm {
  monto: string;
  motivo: string;
  formaPago: string;
}

const RegistrarRetiro: React.FC = () => {
  const navigate = useNavigate();
  const [exito, setExito] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<RetiroForm>({
    monto: '',
    motivo: '',
    formaPago: 'Efectivo',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    if (name === 'monto') {
      setFormData({ ...formData, monto: formatearPrecioInput(value) });
      return;
    }
    setFormData({ ...formData, [name]: value });
  };

  const validarFormulario = (): boolean => {
    if (!formData.monto || parsePrecioInput(formData.monto) <= 0) { setError('El monto debe ser un número mayor a 0'); return false; }
    if (!formData.motivo.trim()) { setError('El motivo del retiro es obligatorio'); return false; }
    if (!formData.formaPago) { setError('La forma de pago es obligatoria'); return false; }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setExito(false);
    if (!validarFormulario()) return;
    setIsSubmitting(true);
    const nuevoRetiro: CreateRetiroDto = { monto: parsePrecioInput(formData.monto), motivo: formData.motivo.trim(), formaPago: formData.formaPago };
    try {
      await createRetiro(nuevoRetiro);
      setExito(true);
      setTimeout(() => { navigate('/ventas'); }, 2000);
    } catch (apiError: any) { setError(apiError.message || 'Error al guardar el retiro.'); } finally { setIsSubmitting(false); }
  };

  const handleCancelar = () => navigate('/ventas');

  return (
    <div>
      <div className="mt-2">
        <div className={S.card}>
          <div className={`${S.cardHeader} gap-2`}>
            <button onClick={handleCancelar} className={S.btnLink}><ArrowLeft size={24} /></button>
            <h5 className="text-base font-semibold">Registrar Retiro de Caja</h5>
          </div>
          <div className={S.cardBody}>
            {error && <div className={S.alertDanger}><span className="flex-1">{error}</span><button onClick={() => setError('')} className="text-red-500 hover:text-red-700 cursor-pointer">✕</button></div>}
            {exito && <div className={S.alertSuccess}><CheckCircle size={24} className="shrink-0" /> ¡Retiro registrado exitosamente! Redirigiendo...</div>}

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className={S.formGroup}>
                  <label className={S.label}>Monto a Retirar <span className="text-red-500">*</span></label>
                  <div className={S.inputGroupWrapper}>
                    <span className={S.inputGroupText}>$</span>
                    <input type="text" name="monto" value={formData.monto} onChange={handleChange} placeholder="0,00" inputMode="decimal" required autoFocus className={S.inputGroupInput} />
                  </div>
                </div>
                <div className={S.formGroup}>
                  <label className={S.label}>Motivo del Retiro <span className="text-red-500">*</span></label>
                  <input type="text" name="motivo" value={formData.motivo} onChange={handleChange} placeholder="Ej: Pago a proveedor, compra de insumos..." required className={S.input} />
                </div>
              </div>
              <div className={S.formGroup}>
                <label className={S.label}>Forma de Pago <span className="text-red-500">*</span></label>
                <select name="formaPago" value={formData.formaPago} onChange={handleChange} required className={S.select}>
                  <option value="Efectivo">Efectivo</option>
                  <option value="Transferencia">Transferencia</option>
                  <option value="Débito">Tarjeta de Débito</option>
                  <option value="Crédito">Tarjeta de Crédito</option>
                  <option value="Mercado Pago">Mercado Pago</option>
                  <option value="Cuenta Corriente">Cuenta Corriente</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>

              <div className={S.alertWarning}>
                <Wallet size={20} className="shrink-0" />
                Este monto se descontará del total recaudado del día en el reporte de ventas.
              </div>

              <p className="text-xs text-slate-500 mb-4">Los campos marcados con <span className="text-red-500">*</span> son obligatorios</p>

              <div className="flex justify-end gap-2">
                <button type="button" className={S.btnSecondary} onClick={handleCancelar} disabled={isSubmitting}>Cancelar</button>
                <button type="submit" className={S.btnSuccess} disabled={isSubmitting}>
                  {isSubmitting ? <><Spinner size="sm" className="text-white" /> Guardando...</> : 'Guardar Retiro'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrarRetiro;
