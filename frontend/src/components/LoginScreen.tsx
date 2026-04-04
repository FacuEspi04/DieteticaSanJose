import React, { useState } from 'react';
import { ShieldCheck, ServerCrash } from 'lucide-react';
import { activarLicencia } from '../services/apiService';
import { useLicense } from '../context/LicenseContext';
import { useNavigate } from 'react-router-dom';
import Spinner from './ui/Spinner';

const LoginScreen = () => {
  const [dni, setDni] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const { setActivated } = useLicense();
  const navigate = useNavigate();

  const handleDniChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    <div className="flex items-center justify-center h-screen bg-slate-50">
      <div className="p-6 bg-white shadow-xl border border-slate-200 rounded-2xl w-full max-w-sm">
        <div className="text-center">
          <div className="mb-5">
            <ShieldCheck size={64} className="mx-auto text-blue-500 opacity-75" />
          </div>
          <h3 className="mb-1 font-bold text-slate-900 text-xl">Activar Sistema</h3>
          <p className="text-slate-500 text-sm mb-5">Ingrese su DNI registrado para sincronizar la licencia local.</p>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-5">
              <input
                type="text"
                placeholder="Nº de DNI..."
                value={dni}
                onChange={handleDniChange}
                className="w-full text-center font-medium border-2 border-slate-300 rounded-lg px-4 py-3 text-lg tracking-widest focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 disabled:bg-slate-100 disabled:text-slate-400 transition-colors"
                disabled={loading}
                autoFocus
              />
            </div>

            {errorMsg && (
              <div className="flex items-start text-left p-3 mb-4 text-sm bg-red-50 text-red-700 border border-red-200 rounded-lg">
                <ServerCrash className="mr-2 shrink-0 mt-0.5" size={18} />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !dni}
              className="w-full font-bold flex justify-center items-center gap-2 bg-blue-600 text-white rounded-lg px-4 py-3 text-base hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              {loading ? (
                <>
                  <Spinner size="sm" className="text-white" />
                  Validando en la nube...
                </>
              ) : (
                'Acceder'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
