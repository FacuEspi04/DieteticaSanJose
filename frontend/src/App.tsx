import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Layout from './components/Layout';
import { LicenseProvider } from './context/LicenseContext';
import BloqueoLicenciaModal from './components/common/BloqueoLicenciaModal';
import SuspendidaLicenciaModal from './components/common/SuspendidaLicenciaModal';
import GlobalWarningToast from './components/common/GlobalWarningToast';
import ProtectedRoute from './components/common/ProtectedRoute';
import LoginScreen from './components/LoginScreen';
import Inicio from './components/Inicio';
import ArticuloDetail from './components/articulos/ArticuloDetail';
import ArticuloList from './components/articulos/ArticuloList';
import AgregarArticulo from './components/articulos/AgregarArticulo';
import EditarArticulo from './components/articulos/EditarArticulo';
import ProveedoresList from './components/proveedores/ProveedoresList';
import AgregarProveedor from './components/proveedores/AgregarProveedor';
import EditarProveedor from './components/proveedores/EditarProveedor';
import VentasList from './components/ventas/VentasList';
import RegistrarVenta from './components/ventas/RegistrarVenta';
import CuentasCorrientes from './components/ventas/CuentasCorrientes';
import CrearPedido from './components/proveedores/CrearPedido';
import ListaPedidos from './components/proveedores/ListaPedidos';

import RegistrarRetiro from './components/caja/RegistrarRetiro';


function App() {
  return (
    <LicenseProvider>
      <Router>
      <BloqueoLicenciaModal />
      <SuspendidaLicenciaModal />
      <GlobalWarningToast />
      <Routes>
        <Route path="/login" element={<LoginScreen />} />
        
        {/* Rutas Privadas */}
        <Route element={<ProtectedRoute />}>
          <Route
            path="/"
            element={
              <Layout />
            }
          >
          {/* Ruta de inicio */}
          <Route index element={<Inicio />} />

          {/* Rutas de artículos */}
          <Route path="articulos" element={<ArticuloList />} />
          <Route path="articulos/nuevo" element={<AgregarArticulo />} />
          <Route path="articulos/:id" element={<ArticuloDetail />} />
          <Route path="/articulos/editar/:id" element={<EditarArticulo />} />

          {/* Rutas de proveedores */}
          <Route path="proveedores" element={<ProveedoresList />} />
          <Route path="proveedores/nuevo" element={<AgregarProveedor />} />
          <Route path="proveedores/editar/:id" element={<EditarProveedor />} />
          <Route path="proveedores/pedidos/lista" element={<ListaPedidos />} />
          <Route path="proveedores/pedidos/nuevo" element={<CrearPedido />} />
    <Route path="proveedores/pedidos/editar/:id" element={<CrearPedido />} />
          <Route path="ventas" element={<VentasList />} />
          <Route path="ventas/nueva" element={<RegistrarVenta />} />
          <Route path="ventas/cuentas-corrientes" element={<CuentasCorrientes />} />
          <Route path="/ventas/nuevo-retiro" element={<RegistrarRetiro />} />
          </Route>
        </Route>
      </Routes>
    </Router>
    </LicenseProvider>
  );
}

export default App;
