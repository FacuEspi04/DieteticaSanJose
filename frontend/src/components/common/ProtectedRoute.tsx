import { Navigate, Outlet } from 'react-router-dom';
import { useLicense } from '../../context/LicenseContext';
import { Spinner } from 'react-bootstrap';

const ProtectedRoute = () => {
  const { isActivated, isInitializing } = useLicense();

  if (isInitializing) {
    return (
      <div className="d-flex align-items-center justify-content-center vh-100 bg-light">
         <div className="text-center">
           <Spinner animation="border" variant="primary" />
           <p className="mt-3 text-muted">Aguarde un momento...</p>
         </div>
      </div>
    );
  }

  if (!isActivated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
