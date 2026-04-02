import { Toast, ToastContainer } from 'react-bootstrap';
import { useLicense } from '../../context/LicenseContext';

const GlobalWarningToast = () => {
  const { isWarning, setWarning } = useLicense();

  return (
    <ToastContainer position="top-end" className="p-3" style={{ zIndex: 9999 }}>
      <Toast 
        show={isWarning} 
        onClose={() => setWarning(false)} 
        bg="warning"
      >
        <Toast.Header>
          <strong className="me-auto text-dark">⚠️ Atención Requerida</strong>
        </Toast.Header>
        <Toast.Body className="text-dark fw-medium">
          El sistema lleva muchos días sin conexión a internet. Conecte el equipo pronto para evitar el bloqueo del sistema.
        </Toast.Body>
      </Toast>
    </ToastContainer>
  );
};

export default GlobalWarningToast;
