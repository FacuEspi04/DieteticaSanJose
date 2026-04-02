import { useState, useEffect } from 'react';
import { Badge } from 'react-bootstrap';
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
  
  // Set times to midnight to avoid time-of-day discrepancies
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const expStart = new Date(expirationDate.getFullYear(), expirationDate.getMonth(), expirationDate.getDate());

  const diffTime = expStart.getTime() - todayStart.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays > 5) {
    const formattedDate = expStart.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
    return (
      <div className="d-flex align-items-center text-light small px-2 font-monospace">
        <CheckCircle size={15} className="text-success me-2" />
        <span className="opacity-100 fw-semibold text-white">Licencia hasta el {formattedDate}</span>
      </div>
    );
  }

  if (diffDays > 0 && diffDays <= 5) {
    return (
      <Badge bg="warning" text="dark" className="d-flex align-items-center gap-1">
        <AlertTriangle size={14} />
        Abono vence en {diffDays} {diffDays === 1 ? 'día' : 'días'}
      </Badge>
    );
  }

  //diffDays <= 0
  return (
    <Badge bg="danger" className="d-flex align-items-center gap-1">
      <XCircle size={14} />
      Licencia Vencida
    </Badge>
  );
};

export default LicenseStatusBadge;
