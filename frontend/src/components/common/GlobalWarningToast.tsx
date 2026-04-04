import Toast from '../ui/Toast';
import { useLicense } from '../../context/LicenseContext';

const GlobalWarningToast = () => {
  const { isWarning, setWarning } = useLicense();

  return (
    <Toast
      show={isWarning}
      onClose={() => setWarning(false)}
      variant="warning"
      title="⚠️ Atención Requerida"
      position="top-end"
    >
      El sistema lleva muchos días sin conexión a internet. Conecte el equipo pronto para evitar el bloqueo del sistema.
    </Toast>
  );
};

export default GlobalWarningToast;
