import React, { useState } from 'react';
import { Card, Button, Form, Spinner } from 'react-bootstrap';
import { ShieldCheck, ServerCrash } from 'lucide-react';
import { activarLicencia } from '../services/apiService';
import { useLicense } from '../context/LicenseContext';
import { useNavigate } from 'react-router-dom';

const LoginScreen = () => {
  const [dni, setDni] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const { setActivated } = useLicense();
  const navigate = useNavigate();

  const handleDniChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // FIltrar automáticamente los puntos y otros caracteres no numéricos
    const rawValue = e.target.value.replace(/\D/g, '');
    setDni(rawValue);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (dni.trim() === '') return;
    
    setErrorMsg(null);
    setLoading(true);

    try {
      await activarLicencia(dni);
      setActivated(true);
      navigate('/', { replace: true });
    } catch (error: any) {
      if (error.message === 'DNI_NO_REGISTRADO') {
        setErrorMsg('El DNI ingresado no posee una licencia comercial registrada. Por favor, verifique el número.');
      } else if (error.message === 'LICENCIA_SUSPENDIDA') {
        setErrorMsg('Su licencia se encuentra bloqueada/suspendida. Por favor, comuníquese con Soporte Técnico para regularizar el estado.');
      } else {
        setErrorMsg(error.message || 'Error desconocido.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center vh-100 bg-light">
      <Card className="p-4 shadow-lg border-0" style={{ maxWidth: '400px', width: '100%', borderRadius: '15px' }}>
        <Card.Body className="text-center">
          <div className="mb-4">
            <ShieldCheck size={64} className="text-primary opacity-75" />
          </div>
          <h3 className="mb-1 fw-bold text-dark">Activar Sistema</h3>
          <p className="text-muted small mb-4">Ingrese su DNI registrado para sincronizar la licencia local.</p>
          
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-4">
              <Form.Control
                size="lg"
                type="text"
                placeholder="Nº de DNI..."
                value={dni}
                onChange={handleDniChange}
                className="text-center fw-medium border-2"
                style={{ letterSpacing: '2px' }}
                disabled={loading}
                autoFocus
              />
            </Form.Group>

            {errorMsg && (
              <div className="alert alert-danger d-flex align-items-start text-start p-3 small border-0 rounded-3">
                <ServerCrash className="me-2 flex-shrink-0" size={18} />
                <span>{errorMsg}</span>
              </div>
            )}

            <Button
              variant="primary"
              type="submit"
              size="lg"
              className="w-100 fw-bold d-flex justify-content-center align-items-center gap-2"
              disabled={loading || !dni}
              style={{ borderRadius: '10px' }}
            >
              {loading ? (
                <>
                  <Spinner animation="border" size="sm" /> 
                  Validando en la nube...
                </>
              ) : (
                'Acceder'
              )}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default LoginScreen;
