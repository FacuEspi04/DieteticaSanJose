import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Barcode, RefreshCw } from 'lucide-react';
import {
  type Categoria,
  type Marca,
  getArticuloById,
  getCategorias,
  getMarcas,
  createMarca,
  createCategoria,
  type UpdateArticuloDto,
  updateArticulo,
} from '../../services/apiService';
import { formatearPrecioInput, parsePrecioInput } from '../../utils/formatters';
import Modal from '../ui/Modal';
import Spinner from '../ui/Spinner';
import * as S from '../ui/styles';

interface ArticuloForm {
  nombre: string;
  marcaId: string;
  codigoBarras: string;
  precio: string;
  stock: string;
  stockMinimo: string;
  categoriaId: string;
  esPesable: boolean;
}

const EditarArticulo: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const articuloId = Number(id);

  const [exito, setExito] = useState(false);
  const [error, setError] = useState('');
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [marcas, setMarcas] = useState<Marca[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showMarcaModal, setShowMarcaModal] = useState(false);
  const [newMarcaName, setNewMarcaName] = useState('');
  const [errorMarca, setErrorMarca] = useState('');

  const [showCategoriaModal, setShowCategoriaModal] = useState(false);
  const [newCategoriaName, setNewCategoriaName] = useState('');
  const [errorCategoria, setErrorCategoria] = useState('');

  const [formData, setFormData] = useState<ArticuloForm>({
    nombre: '',
    marcaId: '',
    codigoBarras: '',
    precio: '',
    stock: '',
    stockMinimo: '',
    categoriaId: '',
    esPesable: false,
  });

  useEffect(() => {
    if (!articuloId) {
      setError('ID de artículo inválido.');
      setIsLoading(false);
      return;
    }

    const cargarDatos = async () => {
      setIsLoading(true);
      try {
        const [articuloData, categoriasData, marcasData] = await Promise.all([
          getArticuloById(articuloId),
          getCategorias(),
          getMarcas(),
        ]);

        const categoriasOrdenadas = categoriasData.sort((a, b) => a.nombre.localeCompare(b.nombre));
        const marcasOrdenadas = marcasData.sort((a, b) => a.nombre.localeCompare(b.nombre));

        setCategorias(categoriasOrdenadas);
        setMarcas(marcasOrdenadas);

        const marcaOtros = marcasOrdenadas.find(
          (m) => m.nombre.toLowerCase() === 'otros' || m.nombre.toLowerCase() === 'otra'
        );

        setFormData({
          nombre: articuloData.nombre,
          marcaId: String(articuloData.marca?.id || marcaOtros?.id || ''),
          codigoBarras: articuloData.codigo_barras,
          precio: formatearPrecioInput(articuloData.precio),
          stock: String(articuloData.stock),
          stockMinimo: String(articuloData.stock_minimo),
          esPesable: articuloData.esPesable || false,
          categoriaId: String(articuloData.categoria?.id || ''),
        });
      } catch (err: any) {
        console.error('Error al cargar datos:', err);
        setError(err.message || 'No se pudieron cargar los datos.');
      } finally {
        setIsLoading(false);
      }
    };

    cargarDatos();
  }, [articuloId]);

  const generarCodigoBarras = () => {
    const prefijo = '779';
    let codigo = prefijo;
    for (let i = 0; i < 9; i++) {
      codigo += Math.floor(Math.random() * 10);
    }
    const digitoVerificador = calcularDigitoVerificador(codigo);
    codigo += digitoVerificador;
    setFormData((prev) => ({
      ...prev,
      codigoBarras: codigo,
    }));
  };

  const calcularDigitoVerificador = (codigo: string): number => {
    let suma = 0;
    for (let i = 0; i < codigo.length; i++) {
      const digito = parseInt(codigo[i]);
      suma += i % 2 === 0 ? digito : digito * 3;
    }
    const modulo = suma % 10;
    return modulo === 0 ? 0 : 10 - modulo;
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const target = e.target as HTMLInputElement;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;

    if (name === 'marcaId' && value === 'NUEVA_MARCA') {
      setShowMarcaModal(true);
      setErrorMarca('');
      setNewMarcaName('');
    } else if (name === 'categoriaId' && value === 'NUEVA_CATEGORIA') {
      setShowCategoriaModal(true);
      setErrorCategoria('');
      setNewCategoriaName('');
    } else if (name === 'precio') {
      setFormData({
        ...formData,
        [name]: formatearPrecioInput(value as string),
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const validarFormulario = (): boolean => {
    if (!formData.nombre.trim()) {
      setError('El nombre del artículo es obligatorio');
      return false;
    }
    if (!formData.precio || parsePrecioInput(formData.precio) <= 0) {
      setError('El precio debe ser mayor a 0');
      return false;
    }
    if (!formData.stock || parseFloat(formData.stock) < 0) {
      setError('El stock no puede ser negativo');
      return false;
    }
    if (!formData.stockMinimo || parseFloat(formData.stockMinimo) < 0) {
      setError('El stock mínimo no puede ser negativo');
      return false;
    }
    if (!formData.categoriaId || formData.categoriaId === 'NUEVA_CATEGORIA') {
      setError('Debes seleccionar una categoría');
      return false;
    }
    if (!formData.marcaId || formData.marcaId === 'NUEVA_MARCA') {
      setError('Debes seleccionar una marca');
      return false;
    }
    return true;
  };

  const handleCrearMarca = async () => {
    if (!newMarcaName.trim()) {
      setErrorMarca('El nombre de la marca no puede estar vacío.');
      return;
    }
    setIsSubmitting(true);
    setErrorMarca('');
    try {
      const nuevaMarca = await createMarca({ nombre: newMarcaName.trim() });
      setMarcas([...marcas, nuevaMarca]);
      setFormData((prev) => ({ ...prev, marcaId: String(nuevaMarca.id) }));
      setShowMarcaModal(false);
      setNewMarcaName('');
    } catch (err: any) {
      console.error('Error al crear marca:', err);
      setErrorMarca(err.message || 'Error al guardar la marca.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCrearCategoria = async () => {
    if (!newCategoriaName.trim()) {
      setErrorCategoria('El nombre de la categoría no puede estar vacío.');
      return;
    }
    setIsSubmitting(true);
    setErrorCategoria('');
    try {
      const nuevaCategoria = await createCategoria({
        nombre: newCategoriaName.trim(),
      });
      setCategorias([...categorias, nuevaCategoria]);
      setFormData((prev) => ({
        ...prev,
        categoriaId: String(nuevaCategoria.id),
      }));
      setShowCategoriaModal(false);
      setNewCategoriaName('');
    } catch (err: any) {
      console.error('Error al crear categoría:', err);
      setErrorCategoria(err.message || 'Error al guardar la categoría.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setExito(false);

    if (!validarFormulario()) {
      return;
    }

    setIsSubmitting(true);

    const articuloActualizado: UpdateArticuloDto = {
      nombre: formData.nombre.trim(),
      marcaId: parseInt(formData.marcaId, 10),
      codigo_barras: formData.codigoBarras,
      precio: parsePrecioInput(formData.precio),
      stock: parseFloat(formData.stock),
      stock_minimo: parseFloat(formData.stockMinimo),
      esPesable: formData.esPesable,
      categoriaId: parseInt(formData.categoriaId, 10),
    };

    try {
      await updateArticulo(articuloId, articuloActualizado);
      setExito(true);

      setTimeout(() => {
        navigate('/articulos');
      }, 2000);
    } catch (apiError: any) {
      console.error('Error al actualizar artículo:', apiError);
      setError(apiError.message || 'Error al actualizar el artículo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelar = () => {
    navigate('/articulos');
  };

  if (isLoading) {
    return (
      <div className="text-center py-10">
        <Spinner />
        <p className="mt-2 text-slate-500">Cargando datos del artículo...</p>
      </div>
    );
  }

  return (
    <div>
      <div className={S.card}>
        <div className={`${S.cardHeader} gap-2`}>
          <button onClick={handleCancelar} className={S.btnLink}>
            <ArrowLeft size={20} />
          </button>
          <h5 className="text-base font-semibold">Editar Artículo: {formData.nombre}</h5>
        </div>
        <div className={S.cardBody}>
          {error && (
            <div className={S.alertDanger}>
              <span className="flex-1">{error}</span>
              <button onClick={() => setError('')} className="text-red-500 hover:text-red-700 cursor-pointer">✕</button>
            </div>
          )}
          {exito && (
            <div className={S.alertSuccess}>
              <CheckCircle size={20} className="shrink-0" />
              ¡Artículo actualizado exitosamente! Redirigiendo...
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-8">
                <div className={S.formGroup}>
                  <label className={S.label}>
                    Nombre del Artículo <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    required
                    className={S.input}
                  />
                </div>
              </div>
              <div className="md:col-span-4">
                <div className={S.formGroup}>
                  <label className={S.label}>Código de Barras</label>
                  <div className={S.inputGroupWrapper}>
                    <span className={S.inputGroupText}>
                      <Barcode size={16} />
                    </span>
                    <input
                      type="text"
                      name="codigoBarras"
                      value={formData.codigoBarras}
                      onChange={handleChange}
                      placeholder="Escanee o escriba el código"
                      className={`${S.inputGroupInput} rounded-r-none`}
                    />
                    <button
                      type="button"
                      className={`${S.inputGroupBtn} rounded-r-lg`}
                      onClick={generarCodigoBarras}
                      title="Generar nuevo código aleatorio"
                    >
                      <RefreshCw size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className={S.formGroup}>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="esPesable"
                  checked={formData.esPesable}
                  onChange={handleChange}
                  className="w-4 h-4 rounded accent-brand-500"
                />
                <span className="text-sm text-slate-700">Este artículo se vende por peso (Granel/Kg)</span>
              </label>
              {formData.esPesable && (
                <p className="text-xs text-blue-600 mt-1">
                  El precio base debe ser por 1 Kg. El stock se medirá en Kilos.
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className={S.formGroup}>
                <label className={S.label}>
                  Precio <span className="text-red-500">*</span>
                </label>
                <div className={S.inputGroupWrapper}>
                  <span className={S.inputGroupText}>$</span>
                  <input
                    type="text"
                    name="precio"
                    value={formData.precio}
                    onChange={handleChange}
                    placeholder="0,00"
                    required
                    className={S.inputGroupInput}
                  />
                </div>
              </div>
              <div className={S.formGroup}>
                <label className={S.label}>
                  Stock Actual <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step={formData.esPesable ? "0.001" : "1"}
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  min="0"
                  required
                  className={S.input}
                />
              </div>
              <div className={S.formGroup}>
                <label className={S.label}>
                  Stock Mínimo <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step={formData.esPesable ? "0.001" : "1"}
                  name="stockMinimo"
                  value={formData.stockMinimo}
                  onChange={handleChange}
                  min="0"
                  required
                  className={S.input}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className={S.formGroup}>
                <label className={S.label}>
                  Categoría <span className="text-red-500">*</span>
                </label>
                <select
                  name="categoriaId"
                  value={formData.categoriaId}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                  className={S.select}
                >
                  <option value="">Selecciona una categoría</option>
                  {categorias.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.nombre}
                    </option>
                  ))}
                  <option value="NUEVA_CATEGORIA" style={{ fontStyle: 'italic' }}>
                    -- Agregar Nueva Categoría --
                  </option>
                </select>
              </div>
              <div className={S.formGroup}>
                <label className={S.label}>
                  Marca <span className="text-red-500">*</span>
                </label>
                <select
                  name="marcaId"
                  value={formData.marcaId}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                  className={S.select}
                >
                  <option value="">Selecciona una marca</option>
                  {marcas.map((marca) => (
                    <option key={marca.id} value={marca.id}>
                      {marca.nombre}
                    </option>
                  ))}
                  <option value="NUEVA_MARCA" style={{ fontStyle: 'italic' }}>
                    -- Agregar Nueva Marca --
                  </option>
                </select>
              </div>
            </div>

            <p className="text-xs text-slate-500 mb-4">
              Los campos marcados con <span className="text-red-500">*</span> son obligatorios
            </p>

            <div className="flex justify-end gap-2">
              <button type="button" className={S.btnSecondary} onClick={handleCancelar} disabled={isSubmitting}>
                Cancelar
              </button>
              <button type="submit" className={S.btnSuccess} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Spinner size="sm" className="text-white" />
                    Guardando Cambios...
                  </>
                ) : (
                  'Guardar Cambios'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Modal Marca */}
      <Modal show={showMarcaModal} onHide={() => setShowMarcaModal(false)}>
        <Modal.Header closeButton onHide={() => setShowMarcaModal(false)}>
          <Modal.Title>Crear Nueva Marca</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {errorMarca && <div className={S.alertDanger}>{errorMarca}</div>}
          <div>
            <label className={S.label}>Nombre de la nueva marca</label>
            <input
              type="text"
              placeholder="Ej: Yin Yang"
              value={newMarcaName}
              onChange={(e) => setNewMarcaName(e.target.value)}
              autoFocus
              className={S.input}
            />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <button className={S.btnSecondary} onClick={() => setShowMarcaModal(false)} disabled={isSubmitting}>
            Cancelar
          </button>
          <button className={S.btnPrimary} onClick={handleCrearMarca} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Spinner size="sm" className="text-white" />
                Creando...
              </>
            ) : (
              'Crear y Seleccionar'
            )}
          </button>
        </Modal.Footer>
      </Modal>

      {/* Modal Categoría */}
      <Modal show={showCategoriaModal} onHide={() => setShowCategoriaModal(false)}>
        <Modal.Header closeButton onHide={() => setShowCategoriaModal(false)}>
          <Modal.Title>Crear Nueva Categoría</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {errorCategoria && <div className={S.alertDanger}>{errorCategoria}</div>}
          <div>
            <label className={S.label}>Nombre de la nueva categoría</label>
            <input
              type="text"
              placeholder="Ej: Galletitas"
              value={newCategoriaName}
              onChange={(e) => setNewCategoriaName(e.target.value)}
              autoFocus
              className={S.input}
            />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <button className={S.btnSecondary} onClick={() => setShowCategoriaModal(false)} disabled={isSubmitting}>
            Cancelar
          </button>
          <button className={S.btnPrimary} onClick={handleCrearCategoria} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Spinner size="sm" className="text-white" />
                Creando...
              </>
            ) : (
              'Crear y Seleccionar'
            )}
          </button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default EditarArticulo;
