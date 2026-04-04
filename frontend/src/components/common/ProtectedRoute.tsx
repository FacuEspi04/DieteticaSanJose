import { Navigate, Outlet } from 'react-router-dom';
import { useLicense } from '../../context/LicenseContext';
import Spinner from '../ui/Spinner';

const ProtectedRoute = () => {
  const { isActivated, isInitializing } = useLicense();

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
         <div className="text-center">
           <Spinner />
           <p className="mt-3 text-slate-500">Aguarde un momento...</p>
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
