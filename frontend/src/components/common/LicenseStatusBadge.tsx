import { useState, useEffect } from 'react';
import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { getLicenciaExpiration } from '../../services/apiService';

const LicenseStatusBadge = () => {
  const [expirationDate, setExpirationDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLicencia = async () => {
      try {
        const data = await getLicenciaExpiration();
        if (data.fecha_vencimiento_abono) {
          setExpirationDate(new Date(data.fecha_vencimiento_abono));
        }
      } catch (error) {
        console.error('Error fetching license info', error);
      } finally {
        setLoading(false);
      }
    };
    fetchLicencia();
  }, []);

  if (loading || !expirationDate) return null;

  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const expStart = new Date(expirationDate.getFullYear(), expirationDate.getMonth(), expirationDate.getDate());

  const diffTime = expStart.getTime() - todayStart.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays > 5) {
    const formattedDate = expStart.toLocaleDateString('es-ES', { day: 'numeric', month: 'numeric', year: 'numeric' });
    return (
      <div className="flex items-center text-white text-sm px-2 font-mono">
        <CheckCircle size={15} className="text-emerald-400 mr-2" />
        <span className="font-semibold text-white">Licencia válida hasta el {formattedDate}</span>
      </div>
    );
  }

  if (diffDays > 0 && diffDays <= 5) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
        <AlertTriangle size={14} />
        Abono vence en {diffDays} {diffDays === 1 ? 'día' : 'días'}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
      <XCircle size={14} />
      Licencia Vencida
    </span>
  );
};

export default LicenseStatusBadge;
