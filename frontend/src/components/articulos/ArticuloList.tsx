import { useState, useEffect, useMemo } from 'react';
import { formatearMoneda } from '../../utils/formatters';
import {
  Search,
  AlertTriangle,
  Plus,
  Trash2,
  Pencil,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  getArticulos,
  deleteArticulo,
  type Articulo,
} from '../../services/apiService';
import Modal from '../ui/Modal';
import Spinner from '../ui/Spinner';
import * as S from '../ui/styles';

const ArticuloList: React.FC = () => {
  const navigate = useNavigate();

  const [busqueda, setBusqueda] = useState('');
  const [articulos, setArticulos] = useState<Articulo[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [articuloAEliminar, setArticuloAEliminar] = useState<Articulo | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    cargarArticulos();
  }, []);

  const cargarArticulos = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getArticulos();
      setArticulos(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar los artículos');
    } finally {
      setIsLoading(false);
    }
  };

  const confirmarEliminacion = (articulo: Articulo) => {
    setArticuloAEliminar(articulo);
    setShowModal(true);
  };

  const handleEditar = (id: number) => {
    navigate(`/articulos/editar/${id}`);
  };

  const eliminarArticulo = async () => {
    if (!articuloAEliminar) return;
    setIsDeleting(true);
    setError(null);
    try {
      await deleteArticulo(articuloAEliminar.id);
      setArticulos((prevArticulos) =>
        prevArticulos.filter((art) => art.id !== articuloAEliminar.id),
      );
      setShowModal(false);
      setArticuloAEliminar(null);
    } catch (err: any) {
      setError(err.message || 'Error al eliminar el artículo');
    } finally {
      setIsDeleting(false);
    }
  };

  const articulosFiltrados = useMemo(() => {
    const terminoBusqueda = busqueda.toLowerCase().trim();
    if (!terminoBusqueda) return articulos;
    return articulos.filter((articulo) => {
      return (
        (articulo.codigo_barras && articulo.codigo_barras.includes(terminoBusqueda)) ||
        (articulo.nombre && articulo.nombre.toLowerCase().includes(terminoBusqueda)) ||
        (articulo.marca && articulo.marca.nombre.toLowerCase().includes(terminoBusqueda)) ||
        (articulo.categoria && articulo.categoria.nombre.toLowerCase().includes(terminoBusqueda))
      );
    });
  }, [articulos, busqueda]);

  const articulosStockBajo = useMemo(() => {
    return articulos.filter((articulo) => articulo.stock <= articulo.stock_minimo);
  }, [articulos]);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Artículos</h1>
        <button
          className={S.btnDark}
          onClick={() => navigate('/articulos/nuevo')}
        >
          <Plus size={16} />
          Agregar Artículo
        </button>
      </div>

      {articulosStockBajo.length > 0 && (
        <div className={S.alertWarning}>
          <div className="flex justify-between items-center w-full">
            <div className="flex items-center gap-3">
              <AlertTriangle size={24} className="text-amber-500 shrink-0" />
              <div>
                <strong>
                  Stock bajo en {articulosStockBajo.length} producto
                  {articulosStockBajo.length !== 1 ? "s" : ""}:
                </strong>
                <ul className="mb-0 mt-1 text-sm list-disc list-inside">
                  {articulosStockBajo.map((art) => (
                    <li key={art.id}>
                      {art.nombre} (Stock: {art.stock} / Mín: {art.stock_minimo})
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <button
              className={S.btnOutlineDark}
              onClick={() => navigate('/proveedores/pedidos/nuevo')}
            >
              Crear Pedido
            </button>
          </div>
        </div>
      )}

      <div className={S.card}>
        <div className={S.cardBody}>
          {error && !isDeleting && (
            <div className={S.alertDanger}>
              <span className="flex-1">{error}</span>
              <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700 ml-2 cursor-pointer">✕</button>
            </div>
          )}

          <div className={S.formGroup}>
            <div className={S.inputGroupWrapper}>
              <span className={S.inputGroupText}>
                <Search size={16} className="text-slate-400" />
              </span>
              <input
                type="text"
                placeholder="Buscar por código, nombre, marca o categoría..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                autoFocus
                className={S.inputGroupInput}
              />
            </div>
            <p className={S.formText}>
              {articulosFiltrados.length} artículo
              {articulosFiltrados.length !== 1 ? 's' : ''} encontrado
              {articulosFiltrados.length !== 1 ? 's' : ''}
            </p>
          </div>

          {isLoading ? (
            <div className="text-center py-10">
              <Spinner />
              <p className="mt-2 text-slate-500">Cargando artículos...</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className={S.table}>
                <thead className={S.tableHeaderBrand}>
                  <tr>
                    <th className={S.th}>Código de Barras</th>
                    <th className={S.th}>Nombre</th>
                    <th className={S.th}>Marca</th>
                    <th className={S.th}>Stock</th>
                    <th className={S.th}>Stock Mínimo</th>
                    <th className={S.th}>Precio</th>
                    <th className={S.th}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {articulosFiltrados && articulosFiltrados.length > 0 ? (
                    articulosFiltrados.map((articulo) => (
                      <tr key={articulo.id} className={`${S.trStriped} ${S.trHover}`}>
                        <td className={S.td}>
                          <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded">{articulo.codigo_barras}</code>
                        </td>
                        <td className={`${S.td} font-medium`}>{articulo.nombre}</td>
                        <td className={S.td}>
                          {articulo.marca ? articulo.marca.nombre : <small className="text-slate-400">N/A</small>}
                        </td>
                        <td className={S.td}>
                          {articulo.stock <= articulo.stock_minimo ? (
                            <span className={S.badgeDanger}>{articulo.stock}</span>
                          ) : (
                            <span className={S.badgeSuccess}>{articulo.stock}</span>
                          )}
                        </td>
                        <td className={S.td}>{articulo.stock_minimo}</td>
                        <td className={`${S.td} font-medium`}>{formatearMoneda(articulo.precio)}</td>
                        <td className={`${S.td} text-center`}>
                          <div className="flex gap-1.5 justify-center">
                            <button
                              className={S.btnOutlinePrimary}
                              onClick={() => handleEditar(articulo.id)}
                              title="Editar artículo"
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              className={S.btnOutlineDanger}
                              onClick={() => confirmarEliminacion(articulo)}
                              title="Eliminar artículo"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className={`${S.td} text-center py-6 text-slate-500`}>
                        {busqueda
                          ? `No se encontraron artículos que coincidan con "${busqueda}"`
                          : 'No hay artículos disponibles. Comienza agregando uno.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal de confirmación */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton onHide={() => setShowModal(false)} className="modal-header-brand">
          <Modal.Title>Confirmar Eliminación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && isDeleting && <div className={S.alertDanger}>{error}</div>}
          {articuloAEliminar && (
            <>
              <p>¿Estás seguro de que deseas eliminar el siguiente artículo?</p>
              <div className={S.alertWarning}>
                <div>
                  <strong>{articuloAEliminar.nombre}</strong>
                  <br />
                  {articuloAEliminar.marca && (
                    <>
                      Marca: {articuloAEliminar.marca.nombre}
                      <br />
                    </>
                  )}
                  Código: <code>{articuloAEliminar.codigo_barras}</code>
                  <br />
                  Precio: {formatearMoneda(articuloAEliminar.precio)}
                </div>
              </div>
              <p className="text-red-600">
                <strong>Esta acción no se puede deshacer.</strong>
              </p>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <button className={S.btnSecondary} onClick={() => setShowModal(false)} disabled={isDeleting}>
            Cancelar
          </button>
          <button className={S.btnDanger} onClick={eliminarArticulo} disabled={isDeleting}>
            {isDeleting ? (
              <>
                <Spinner size="sm" className="mr-2" />
                Eliminando...
              </>
            ) : (
              'Eliminar'
            )}
          </button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ArticuloList;
