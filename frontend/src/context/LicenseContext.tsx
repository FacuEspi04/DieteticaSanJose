import { createContext, useContext, useState, useEffect } from 'react';
import type { FC, ReactNode } from 'react';

interface LicenseContextProps {
  isBlocked: boolean;
  isSuspended: boolean;
  isWarning: boolean;
  isActivated: boolean;
  isInitializing: boolean;
  setBlocked: (val: boolean) => void;
  setSuspended: (val: boolean) => void;
  setWarning: (val: boolean) => void;
  setActivated: (val: boolean) => void;
}

import { getLicenciaExpiration } from '../services/apiService';

const LicenseContext = createContext<LicenseContextProps | undefined>(undefined);

export let globalSetBlocked: ((val: boolean) => void) | null = null;
export let globalSetSuspended: ((val: boolean) => void) | null = null;
export let globalSetWarning: ((val: boolean) => void) | null = null;
export let globalSetActivated: ((val: boolean) => void) | null = null;

export const LicenseProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [isBlocked, setBlocked] = useState(false);
  const [isSuspended, setSuspended] = useState(false);
  const [isWarning, setWarning] = useState(false);
  const [isActivated, setActivated] = useState(false);
  const [isInitializing, setInitializing] = useState(true);

  useEffect(() => {
    globalSetBlocked = setBlocked;
    globalSetSuspended = setSuspended;
    globalSetWarning = setWarning;
    globalSetActivated = setActivated;
  }, [setBlocked, setSuspended, setWarning, setActivated]);

  useEffect(() => {
    // Ping inicial de activación
    getLicenciaExpiration()
      .then(res => {
         if (res.isActivated) setActivated(true);
      })
      .catch((e) => console.error("Error al validar licencia inicial.", e))
      .finally(() => setInitializing(false));
  }, []);

  return (
    <LicenseContext.Provider value={{ isBlocked, isSuspended, isWarning, isActivated, isInitializing, setBlocked, setSuspended, setWarning, setActivated }}>
      {children}
    </LicenseContext.Provider>
  );
};

export const useLicense = () => {
  const context = useContext(LicenseContext);
  if (!context) {
    throw new Error('useLicense debe ser utilizado dentro de un LicenseProvider');
  }
  return context;
};
