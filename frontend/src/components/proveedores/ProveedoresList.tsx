import React, { useState, useEffect } from "react";
import { Plus, Trash2, Pencil, ClipboardList, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getProveedores, deleteProveedor, type Proveedor } from "../../services/apiService";
import Modal from '../ui/Modal';
import Spinner from '../ui/Spinner';
import * as S from '../ui/styles';

const ProveedoresList: React.FC = () => {
  const navigate = useNavigate();
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exito, setExito] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [proveedorAEliminar, setProveedorAEliminar] = useState<Proveedor | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => { cargarProveedores(); }, []);

  const cargarProveedores = async () => {
    setIsLoading(true); setError(null); setExito(null);
    try { setProveedores(await getProveedores()); } catch (err: any) { setError(err.message || "Error al cargar los proveedores"); } finally { setIsLoading(false); }
  };

  const handleEditar = (id: number) => navigate(`/proveedores/editar/${id}`);
  const abrirModalEliminar = (proveedor: Proveedor) => { setProveedorAEliminar(proveedor); setShowModal(true); setError(null); };
  const cancelarEliminacion = () => { setShowModal(false); setProveedorAEliminar(null); };

  const confirmarEliminacion = async () => {
    if (!proveedorAEliminar) return;
    setIsDeleting(true); setError(null);
    try {
      await deleteProveedor(proveedorAEliminar.id);
      setProveedores((prev) => prev.filter((p) => p.id !== proveedorAEliminar.id));
      setExito(`Proveedor "${proveedorAEliminar.nombre}" eliminado exitosamente.`);
      setShowModal(false); setProveedorAEliminar(null);
      setTimeout(() => setExito(null), 3000);
    } catch (apiError: any) { setError(apiError.message || "No se pudo eliminar el proveedor."); } finally { setIsDeleting(false); }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Proveedores</h1>
        <div className="flex flex-wrap gap-2">
          <button className={S.btnOutlineSecondary} onClick={() => navigate("/proveedores/pedidos/lista")}><ArrowLeft size={14} className="mr-1" /> Volver a pedidos</button>
          <button className={S.btnOutlineDark} onClick={() => navigate("/proveedores/pedidos/nuevo")}><ClipboardList size={14} className="mr-1" /> Nuevo Pedido</button>
          <button className={S.btnDark} onClick={() => navigate("/proveedores/nuevo")}><Plus size={14} className="mr-1" /> Agregar</button>
        </div>
      </div>

      <div className={S.card}>
        <div className={S.cardBody}>
          {error && !isDeleting && <div className={S.alertDanger}><span className="flex-1">{error}</span><button onClick={() => setError(null)} className="text-red-500 hover:text-red-700 ml-2 cursor-pointer">✕</button></div>}
          {exito && <div className={S.alertSuccess}>{exito}</div>}

          {isLoading ? (
            <div className="text-center py-10"><Spinner /><p className="mt-2 text-slate-500">Cargando proveedores...</p></div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className={S.table}>
                <thead className={S.tableHeaderBrand}>
                  <tr>
                    <th className={S.th}>Nombre</th><th className={S.th}>Contacto</th><th className={S.th}>Teléfono</th><th className={S.th}>Email</th><th className={S.th}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {proveedores && proveedores.length > 0 ? proveedores.map((p) => (
                    <tr key={p.id} className={`${S.trStriped} ${S.trHover}`}>
                      <td className={`${S.td} font-medium`}>{p.nombre}</td>
                      <td className={S.td}>{p.contacto}</td>
                      <td className={S.td}>{p.telefono}</td>
                      <td className={S.td}>{p.email}</td>
                      <td className={`${S.td} text-center`}>
                        <div className="flex justify-center gap-1.5">
                          <button className={S.btnOutlinePrimary} onClick={() => handleEditar(p.id)} title="Editar proveedor"><Pencil size={14} /></button>
                          <button className={S.btnOutlineDanger} onClick={() => abrirModalEliminar(p)} title="Eliminar proveedor"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan={5} className={`${S.td} text-center text-slate-500`}>No hay proveedores disponibles.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <Modal show={showModal} onHide={cancelarEliminacion}>
        <Modal.Header closeButton onHide={cancelarEliminacion} className="modal-header-brand"><Modal.Title>Confirmar Eliminación</Modal.Title></Modal.Header>
        <Modal.Body>
          {error && isDeleting && <div className={S.alertDanger}>{error}</div>}
          {proveedorAEliminar && (
            <>
              <p>¿Estás seguro de que deseas eliminar al proveedor?</p>
              <div className={S.alertWarning}>
                <div><strong>{proveedorAEliminar.nombre}</strong><br />Contacto: {proveedorAEliminar.contacto}<br />Email: {proveedorAEliminar.email}</div>
              </div>
              <p className="text-red-600"><strong>Esta acción no se puede deshacer.</strong></p>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <button className={S.btnSecondary} onClick={cancelarEliminacion} disabled={isDeleting}>Cancelar</button>
          <button className={S.btnDanger} onClick={confirmarEliminacion} disabled={isDeleting}>
            {isDeleting ? <><Spinner size="sm" className="mr-2" /> Eliminando...</> : "Eliminar"}
          </button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ProveedoresList;
