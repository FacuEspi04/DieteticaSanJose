import React, { useState, useEffect, useRef } from "react";
import { formatearMoneda, formatearPeso, formatearPrecioInput, parsePrecioInput } from "../../utils/formatters";
import { Barcode, Trash2, CheckCircle, ArrowLeft, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  getArticulos,
  createVenta,
  type CreateVentaDto,
  type CreateVentaItemDto,
  type FormaPago,
  type Venta,
  getClientes,
  createCliente,
  type Cliente,
  getVentasPorFecha,
} from "../../services/apiService";
import Modal from '../ui/Modal';
import Spinner from '../ui/Spinner';
import * as S from '../ui/styles';

interface ArticuloVenta {
  id: number; nombre: string; codigoBarras: string; marca: string; stock: number; precio: number; esPesable: boolean;
}
interface ItemVenta {
  articulo: ArticuloVenta; cantidad: number; subtotal: number; subtotalPersonalizado?: number;
}

const RegistrarVenta: React.FC = () => {
  const navigate = useNavigate();
  const [codigoBarras, setCodigoBarras] = useState("");
  const [sugerencias, setSugerencias] = useState<ArticuloVenta[]>([]);
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
  const [sugerenciasClientes, setSugerenciasClientes] = useState<Cliente[]>([]);
  const [mostrarSugerenciasClientes, setMostrarSugerenciasClientes] = useState(false);
  const [itemsVenta, setItemsVenta] = useState<ItemVenta[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");
  const [nombreCliente, setNombreCliente] = useState("");
  const [clienteIdSeleccionado, setClienteIdSeleccionado] = useState<number | "">("");
  const [catalogoArticulos, setCatalogoArticulos] = useState<ArticuloVenta[]>([]);
  const [listaClientes, setListaClientes] = useState<Cliente[]>([]);
  const [showModalCliente, setShowModalCliente] = useState(false);
  const [nuevoClienteNombre, setNuevoClienteNombre] = useState("");
  const [isCreatingCliente, setIsCreatingCliente] = useState(false);
  const [formaPago, setFormaPago] = useState<FormaPago>("efectivo");
  const [interesPorcentaje, setInteresPorcentaje] = useState<string>("10");
  const [esCtaCte, setEsCtaCte] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [articuloPesableActivo, setArticuloPesableActivo] = useState<ArticuloVenta | null>(null);
  const [modalPesoCantidad, setModalPesoCantidad] = useState("");
  const [modalPesoUnidad, setModalPesoUnidad] = useState<"gramos" | "kilos">("gramos");
  const [modalPrecioFinal, setModalPrecioFinal] = useState("");
  const [modalPrecioEditado, setModalPrecioEditado] = useState(false);
  const [clienteGeneralConsecutivo, setClienteGeneralConsecutivo] = useState<number | null>(null);
  const searchWrapperRef = useRef<HTMLDivElement>(null);
  const clientesWrapperRef = useRef<HTMLDivElement>(null);
  const sugerenciasListRef = useRef<HTMLUListElement>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

  useEffect(() => {
    if (selectedIndex >= 0 && sugerenciasListRef.current) {
      const activeEl = sugerenciasListRef.current.children[selectedIndex] as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({ block: "nearest" });
      }
    }
  }, [selectedIndex]);

  useEffect(() => {
    const cargarDatos = async () => {
      setIsLoading(true);
      try {
        const [apiItems, clientesApi] = await Promise.all([getArticulos(), getClientes()]);
        const mapeados: ArticuloVenta[] = apiItems.map((a) => ({
          id: Number(a.id), nombre: a.nombre,
          marca: typeof a.marca === 'object' && a.marca !== null ? (a.marca as any).nombre || '' : String(a.marca || ''),
          codigoBarras: a.codigo_barras, precio: Number(a.precio), stock: a.stock ?? 0, esPesable: a.esPesable || false,
        }));
        setCatalogoArticulos(mapeados); setListaClientes(clientesApi || []); setError("");
      } catch (e: any) { setError("Error al cargar el catálogo o clientes. " + e.message); setCatalogoArticulos([]); } finally { setIsLoading(false); }
    };
    cargarDatos();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchWrapperRef.current && !searchWrapperRef.current.contains(event.target as Node)) setMostrarSugerencias(false);
      if (clientesWrapperRef.current && !clientesWrapperRef.current.contains(event.target as Node)) setMostrarSugerenciasClientes(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getTodayString = () => { const h = new Date(); return `${h.getFullYear()}-${String(h.getMonth()+1).padStart(2,'0')}-${String(h.getDate()).padStart(2,'0')}`; };

  useEffect(() => {
    const cargarConsecutivo = async () => {
      if (!showModal) return;
      if (esCtaCte || nombreCliente.trim()) { setClienteGeneralConsecutivo(null); return; }
      try {
        const ventasDia: Venta[] = await getVentasPorFecha(getTodayString());
        const c = ventasDia.filter((v) => { const n = (v.clienteNombre||'').trim(); return !n || n === 'Cliente General' || n.startsWith('Cliente General '); }).length;
        setClienteGeneralConsecutivo(c + 1);
      } catch { setClienteGeneralConsecutivo(null); }
    };
    cargarConsecutivo();
  }, [showModal, esCtaCte, nombreCliente]);

  const getNombreClienteModal = () => {
    if (esCtaCte && clienteIdSeleccionado) return listaClientes.find((c) => c.id === clienteIdSeleccionado)?.nombre;
    if (nombreCliente.trim()) return nombreCliente;
    if (clienteGeneralConsecutivo) return `Cliente General ${clienteGeneralConsecutivo}`;
    return "Cliente General";
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const texto = e.target.value; setCodigoBarras(texto);
    setSelectedIndex(-1);
    if (texto.length > 1) {
      const matches = catalogoArticulos.filter((a) => a.nombre.toLowerCase().includes(texto.toLowerCase()) || a.codigoBarras.includes(texto));
      setSugerencias(matches.slice(0, 15)); setMostrarSugerencias(true);
    } else { setSugerencias([]); setMostrarSugerencias(false); }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!mostrarSugerencias || sugerencias.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < sugerencias.length - 1 ? prev + 1 : prev));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === "Enter") {
      if (selectedIndex >= 0 && selectedIndex < sugerencias.length) {
        e.preventDefault();
        procesarAgregadoDeArticulo(sugerencias[selectedIndex]);
      }
    } else if (e.key === "Escape") {
      setMostrarSugerencias(false);
      setSelectedIndex(-1);
    }
  };

  const procesarAgregadoDeArticulo = (articulo: ArticuloVenta, cantidadManual?: number, subtotalPersonalizado?: number) => {
    setError("");
    if (articulo.stock <= 0) { setError(`El artículo "${articulo.nombre}" no tiene stock disponible`); setCodigoBarras(""); setMostrarSugerencias(false); return; }
    if (articulo.esPesable && cantidadManual === undefined) {
      setArticuloPesableActivo(articulo); setModalPesoCantidad(""); setModalPesoUnidad("gramos"); setModalPrecioFinal(""); setModalPrecioEditado(false);
      setCodigoBarras(""); setSugerencias([]); setMostrarSugerencias(false); setSelectedIndex(-1); return;
    }
    const cantidadA = cantidadManual !== undefined ? cantidadManual : 1;
    const existente = itemsVenta.find((i) => i.articulo.id === articulo.id);
    if (existente) {
      const nueva = existente.cantidad + cantidadA;
      if (nueva > articulo.stock) { setError(`No hay suficiente stock de "${articulo.nombre}". Disponible: ${articulo.stock}`); setCodigoBarras(""); setMostrarSugerencias(false); return; }
      const sub = subtotalPersonalizado !== undefined ? existente.subtotal + subtotalPersonalizado : nueva * articulo.precio;
      setItemsVenta(itemsVenta.map((i) => i.articulo.id === articulo.id ? { ...i, cantidad: nueva, subtotal: sub, subtotalPersonalizado: subtotalPersonalizado !== undefined ? sub : i.subtotalPersonalizado } : i));
    } else {
      if (cantidadA > articulo.stock) { setError(`No hay suficiente stock de "${articulo.nombre}". Disponible: ${articulo.stock}`); setCodigoBarras(""); setMostrarSugerencias(false); return; }
      setItemsVenta([...itemsVenta, { articulo, cantidad: cantidadA, subtotal: subtotalPersonalizado !== undefined ? subtotalPersonalizado : cantidadA * articulo.precio, subtotalPersonalizado }]);
    }
    setCodigoBarras(""); setSugerencias([]); setMostrarSugerencias(false); setSelectedIndex(-1);
  };

  const confirmarArticuloPesable = () => {
    if (!articuloPesableActivo) return;
    let cantidadNum = parseFloat(modalPesoCantidad.replace(',', '.'));
    if (isNaN(cantidadNum) || cantidadNum <= 0) { setError("Ingrese una cantidad válida"); return; }
    const cantidadEnKilos = modalPesoUnidad === "gramos" ? cantidadNum / 1000 : cantidadNum;
    const precioFinalNum = modalPrecioFinal ? parsePrecioInput(modalPrecioFinal) : articuloPesableActivo.precio * cantidadEnKilos;
    if (isNaN(precioFinalNum) || precioFinalNum <= 0) { setError("Ingrese un precio final válido"); return; }
    procesarAgregadoDeArticulo(articuloPesableActivo, cantidadEnKilos, precioFinalNum);
    setArticuloPesableActivo(null);
  };

  const calcularSubtotalSugerido = (ct: string, u: "gramos"|"kilos", pk: number): string => {
    const n = parseFloat(ct.replace(',','.')); if (isNaN(n) || n <= 0) return "";
    const k = u === "gramos" ? n / 1000 : n;
    return formatearPrecioInput((k * pk).toFixed(2).replace('.', ','));
  };

  useEffect(() => {
    if (!articuloPesableActivo || modalPrecioEditado) return;
    setModalPrecioFinal(calcularSubtotalSugerido(modalPesoCantidad, modalPesoUnidad, articuloPesableActivo.precio));
  }, [modalPesoCantidad, modalPesoUnidad, articuloPesableActivo, modalPrecioEditado]);

  const buscarArticuloPorCodigo = (c: string) => catalogoArticulos.find((a) => a.codigoBarras === c);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); const c = codigoBarras.trim(); if (!c) return;
    const art = buscarArticuloPorCodigo(c);
    if (art) { procesarAgregadoDeArticulo(art); }
    else if (sugerencias.length === 1) { procesarAgregadoDeArticulo(sugerencias[0]); }
    else if (sugerencias.length > 1) { setError("Múltiples productos encontrados. Por favor selecciona uno de la lista."); }
    else { setError(`No se encontró ningún artículo con el código o nombre: ${c}`); }
  };

  const eliminarItem = (id: number) => setItemsVenta(itemsVenta.filter((i) => i.articulo.id !== id));
  const actualizarCantidad = (articuloId: number, nuevaCantidad: number) => {
    if (nuevaCantidad <= 0) { eliminarItem(articuloId); return; }
    const item = itemsVenta.find((i) => i.articulo.id === articuloId);
    if (!item) return;
    if (nuevaCantidad > item.articulo.stock) { setError(`Stock insuficiente. Disponible: ${item.articulo.stock}`); setItemsVenta(itemsVenta.map(i => i.articulo.id === articuloId ? {...i, cantidad: i.articulo.stock, subtotal: i.articulo.stock * i.articulo.precio} : i)); return; }
    setError(""); setItemsVenta(itemsVenta.map((i) => i.articulo.id === articuloId ? { ...i, cantidad: nuevaCantidad, subtotal: nuevaCantidad * i.articulo.precio } : i));
  };

  const calcularTotal = () => itemsVenta.reduce((t, i) => t + i.subtotal, 0);
  const calcularInteres = () => { if (esCtaCte) return 0; if (formaPago === "credito") return (calcularTotal() * (parseFloat(interesPorcentaje) || 0)) / 100; return 0; };
  const calcularTotalFinal = () => calcularTotal() + calcularInteres();

  const confirmarVenta = () => {
    if (itemsVenta.length === 0) { setError("No hay productos en la venta"); return; }
    if (esCtaCte && !clienteIdSeleccionado) { setError("Debe seleccionar un cliente para Cuenta Corriente"); return; }
    setShowModal(true);
  };

  const procesarVenta = async () => {
    setIsSubmitting(true); setError("");
    const itemsDto: CreateVentaItemDto[] = itemsVenta.map(i => ({ articuloId: Number(i.articulo.id), cantidad: i.cantidad, subtotalPersonalizado: i.subtotalPersonalizado }));
    const clienteEncontrado = esCtaCte && clienteIdSeleccionado ? listaClientes.find((c) => c.id === clienteIdSeleccionado) : null;
    const nombreGuardar = clienteEncontrado ? clienteEncontrado.nombre : (nombreCliente.trim() || "Cliente General");
    const nuevaVenta: CreateVentaDto = { clienteNombre: nombreGuardar, clienteId: clienteEncontrado ? clienteEncontrado.id : undefined, items: itemsDto, formaPago: esCtaCte ? null : formaPago, estado: esCtaCte ? "Pendiente" : "Completada", interes: calcularInteres() };
    try {
      const ventaGuardada = await createVenta(nuevaVenta);
      setShowModal(false); setExito(`¡Venta N° ${ventaGuardada.numeroVenta} registrada! Total: ${formatearMoneda(ventaGuardada.total)}`);
      setItemsVenta([]); setNombreCliente(""); setClienteIdSeleccionado(""); setFormaPago("efectivo"); setEsCtaCte(false); setInteresPorcentaje("10"); setCodigoBarras("");
      const apiItems = await getArticulos();
      setCatalogoArticulos(apiItems.map((a) => ({ id: Number(a.id), nombre: a.nombre, marca: typeof a.marca === 'object' && a.marca !== null ? (a.marca as any).nombre || '' : String(a.marca || ''), codigoBarras: a.codigo_barras, precio: Number(a.precio), stock: a.stock ?? 0, esPesable: a.esPesable ?? false })));
      setTimeout(() => setExito(""), 3000);
    } catch (apiError: any) { setError(apiError.message || "Error al procesar la venta."); setShowModal(false); } finally { setIsSubmitting(false); }
  };

  const cancelarVenta = () => { setItemsVenta([]); setCodigoBarras(""); setNombreCliente(""); setClienteIdSeleccionado(""); setFormaPago("efectivo"); setEsCtaCte(false); setError(""); };

  const handleCrearCliente = async () => {
    if (!nuevoClienteNombre.trim()) { setError("El nombre del cliente es obligatorio"); return; }
    setIsCreatingCliente(true); setError("");
    try {
      const nuevoCliente = await createCliente({ nombre: nuevoClienteNombre.trim() });
      setListaClientes([...listaClientes, nuevoCliente]); setClienteIdSeleccionado(nuevoCliente.id); setShowModalCliente(false); setNuevoClienteNombre("");
      setExito(`Cliente ${nuevoCliente.nombre} creado con éxito.`); setTimeout(() => setExito(""), 3000);
    } catch (e: any) { setError(e.message || "Error al crear cliente"); } finally { setIsCreatingCliente(false); }
  };

  return (
    <div>
      <div className="mt-2">
        <div className={`${S.card} mb-3`}>
          <div className={`${S.cardHeader} gap-2`}>
            <button onClick={() => navigate("/ventas")} className={S.btnLink}><ArrowLeft size={24} /></button>
            <h5 className="text-base font-semibold">Registrar Nueva Venta</h5>
          </div>
          <div className={S.cardBody}>
            {error && <div className={S.alertDanger}><span className="flex-1">{error}</span><button onClick={() => setError("")} className="text-red-500 hover:text-red-700 cursor-pointer">✕</button></div>}
            {exito && <div className={S.alertSuccess}><CheckCircle size={24} className="shrink-0" /> {exito}</div>}

            {/* Cta Cte toggle */}
            <div className={S.formGroup}>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={esCtaCte} onChange={(e) => { setEsCtaCte(e.target.checked); if (!e.target.checked) setClienteIdSeleccionado(""); }} className="w-4 h-4 rounded accent-brand-500" />
                <span className="text-sm text-slate-700">🏦 Venta en Cuenta Corriente (pago pendiente)</span>
              </label>
            </div>

            {/* Client selection */}
            {esCtaCte ? (
              <div className={S.formGroup}>
                <label className={S.label}>Seleccionar Cliente <span className="text-red-500">*</span></label>
                <div className="flex gap-2">
                  <select value={clienteIdSeleccionado} onChange={(e) => setClienteIdSeleccionado(e.target.value ? Number(e.target.value) : "")} className={S.select}>
                    <option value="">-- Seleccione un cliente --</option>
                    {listaClientes.map(c => <option key={c.id} value={c.id}>{c.nombre} {c.telefono ? `(${c.telefono})` : ""}</option>)}
                  </select>
                  <button className={S.btnOutlinePrimary} onClick={() => setShowModalCliente(true)}>+ Nuevo</button>
                </div>
              </div>
            ) : (
              <div className={S.formGroup}>
                <label className={S.label}>Nombre del Cliente (Opcional)</label>
                <div ref={clientesWrapperRef} className="relative">
                  <input type="text" placeholder="Ingresa el nombre del cliente..." value={nombreCliente}
                    onChange={(e) => {
                      const v = e.target.value; setNombreCliente(v);
                      const found = listaClientes.find((c) => c.nombre.toLowerCase() === v.toLowerCase());
                      setClienteIdSeleccionado(found ? found.id : "");
                      if (v.trim().length > 1) { setSugerenciasClientes(listaClientes.filter((c) => c.nombre.toLowerCase().includes(v.toLowerCase())).slice(0, 6)); setMostrarSugerenciasClientes(true); }
                      else { setSugerenciasClientes([]); setMostrarSugerenciasClientes(false); }
                    }} autoComplete="off" className={S.input} />
                  {mostrarSugerenciasClientes && sugerenciasClientes.length > 0 && (
                    <ul className="absolute top-full left-0 right-0 z-50 max-h-[200px] overflow-y-auto bg-white border border-slate-200 rounded-lg shadow-lg">
                      {sugerenciasClientes.map((c) => (
                        <li key={c.id} onClick={() => { setNombreCliente(c.nombre); setClienteIdSeleccionado(c.id); setMostrarSugerenciasClientes(false); }}
                          className="flex justify-between items-center px-3 py-2 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-b-0">
                          <div><strong>{c.nombre}</strong>{c.telefono && <div className="text-xs text-slate-500">{c.telefono}</div>}</div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}

            {/* Forma de pago */}
            {!esCtaCte && (
              <>
                <div className={S.formGroup}>
                  <label className={S.label}>Forma de Pago <span className="text-red-500">*</span></label>
                  <select value={formaPago} onChange={(e) => setFormaPago(e.target.value as FormaPago)} className={S.select}>
                    <option value="efectivo">Efectivo</option><option value="debito">Débito</option>
                    <option value="credito">Crédito (con interés)</option><option value="transferencia">Transferencia</option>
                  </select>
                </div>
                {formaPago === "credito" && (
                  <div className={S.formGroup}>
                    <label className={S.label}>Interés para Tarjeta de Crédito (%)</label>
                    <div className={S.inputGroupWrapper}>
                      <input type="number" min="0" step="0.5" value={interesPorcentaje} onChange={(e) => setInteresPorcentaje(e.target.value)} className={`${S.inputGroupInput} rounded-r-none`} />
                      <span className={`${S.inputGroupText} border-l-0 rounded-r-lg rounded-l-none border-r`}>%</span>
                    </div>
                    <p className={S.formText}>Interés actual: {interesPorcentaje}% ({formatearMoneda(calcularInteres())})</p>
                  </div>
                )}
              </>
            )}

            {esCtaCte && <div className={`${S.alertInfo} mt-2 mb-3`}><small>ℹ️ Esta venta quedará registrada como <strong>Pendiente</strong>.</small></div>}

            {/* Search bar */}
            <div ref={searchWrapperRef} className="relative">
              <form onSubmit={handleSubmit}>
                <div className={S.formGroup}>
                  <label className={S.label}>Buscar Producto (Nombre o Escáner)</label>
                  <div className={S.inputGroupWrapper}>
                    <span className={S.inputGroupText}>
                      {codigoBarras.length > 0 && isNaN(Number(codigoBarras)) ? <Search size={16}/> : <Barcode size={16} />}
                    </span>
                    <input type="text" placeholder={isLoading ? "Cargando catálogo..." : "Escribe nombre o escanea código..."} value={codigoBarras}
                      onChange={handleInputChange} onKeyDown={handleKeyDown} autoFocus disabled={isLoading} autoComplete="off" className={`${S.inputGroupInput} rounded-r-none`} />
                    <button type="submit" disabled={isLoading} className={`${S.btnPrimary} rounded-l-none rounded-r-lg`}>Agregar</button>
                  </div>
                  <p className={S.formText}>Si buscas por nombre, escribe y selecciona de la lista. Si usas lector, presiona el gatillo.</p>

                  {mostrarSugerencias && sugerencias.length > 0 && (
                    <ul ref={sugerenciasListRef} className="absolute top-full left-0 right-0 z-50 max-h-[200px] overflow-y-auto bg-white border border-slate-200 rounded-lg shadow-lg mt-1">
                      {sugerencias.map((art, index) => (
                        <li key={art.id} onClick={() => procesarAgregadoDeArticulo(art)} onMouseEnter={() => setSelectedIndex(index)}
                          className={`flex justify-between items-center px-3 py-2 cursor-pointer border-b border-slate-100 last:border-b-0 ${selectedIndex === index ? "bg-slate-200" : "hover:bg-slate-50"}`}>
                          <div>
                            <strong>{art.nombre}</strong>
                            <div className="text-xs text-slate-500">{art.marca ? `${art.marca} - ` : ''}{art.codigoBarras}</div>
                          </div>
                          <div className="text-right">
                            <span className={art.stock > 0 ? S.badgeSuccess : S.badgeDanger}>Stock: {art.stock}</span>
                            <div className="font-bold text-blue-600 mt-1 text-sm">{formatearMoneda(art.precio)}</div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Items table */}
        {itemsVenta.length > 0 && (
          <div className={S.card}>
            <div className={S.cardHeader}>
              <h6 className="text-sm font-semibold">Productos en la Venta</h6>
              <span className={S.badgePrimary}>{itemsVenta.length} producto{itemsVenta.length !== 1 ? "s" : ""}</span>
            </div>
            <div className={S.cardBody}>
              <div className="overflow-x-auto rounded-lg border border-slate-200">
                <table className={S.table}>
                  <thead className={S.tableHeaderBrand}>
                    <tr>
                      <th className={S.th}>Producto</th><th className={S.th}>Precio Unit.</th>
                      <th className={S.th} style={{width:"150px"}}>Cantidad</th><th className={S.th}>Subtotal</th><th className={S.th}>Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {itemsVenta.map((item) => (
                      <tr key={item.articulo.id} className={S.trHover}>
                        <td className={S.td}>{item.articulo.nombre}</td>
                        <td className={S.td}>{formatearMoneda(item.articulo.precio)}{item.articulo.esPesable ? " /Kg" : ""}</td>
                        <td className={S.td}>
                          {item.articulo.esPesable ? (
                            <span className="font-bold">{formatearPeso(item.cantidad)}</span>
                          ) : (
                            <div className="flex items-center">
                              <button className={S.btnOutlineSecondary} onClick={() => actualizarCantidad(item.articulo.id, item.cantidad - 1)}>−</button>
                              <input type="number" min="1" max={item.articulo.stock} value={item.cantidad}
                                onChange={(e) => actualizarCantidad(item.articulo.id, parseFloat(e.target.value) || 0)}
                                className="w-14 text-center border-t border-b border-slate-300 py-1.5 text-sm" />
                              <button className={S.btnOutlineSecondary} onClick={() => actualizarCantidad(item.articulo.id, item.cantidad + 1)} disabled={item.cantidad >= item.articulo.stock}>+</button>
                            </div>
                          )}
                        </td>
                        <td className={S.td}>{formatearMoneda(item.subtotal)}</td>
                        <td className={`${S.td} text-center`}><button className={S.btnDanger} onClick={() => eliminarItem(item.articulo.id)}><Trash2 size={14} /></button></td>
                      </tr>
                    ))}
                    <tr className="bg-slate-50 font-bold">
                      <td colSpan={3} className={`${S.td} text-right`}>SUBTOTAL:</td><td className={S.td}>{formatearMoneda(calcularTotal())}</td><td className={S.td}></td>
                    </tr>
                    {!esCtaCte && formaPago === "credito" && calcularInteres() > 0 && (
                      <tr className="bg-amber-50">
                        <td colSpan={3} className={`${S.td} text-right`}>INTERÉS ({interesPorcentaje}%):</td><td className={S.td}>{formatearMoneda(calcularInteres())}</td><td className={S.td}></td>
                      </tr>
                    )}
                    <tr className="bg-slate-800 text-white font-bold">
                      <td colSpan={3} className={`${S.td} text-right`}>TOTAL A PAGAR:</td><td className={S.td}>{formatearMoneda(calcularTotalFinal())}</td><td className={S.td}></td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="flex justify-end gap-2 mt-3">
                <button className={S.btnSecondary} onClick={cancelarVenta}>Cancelar Venta</button>
                <button className={S.btnSuccess} onClick={confirmarVenta}>Confirmar Venta</button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Confirmar Venta */}
        <Modal show={showModal} onHide={() => setShowModal(false)}>
          <Modal.Header closeButton onHide={() => setShowModal(false)} className="modal-header-brand"><Modal.Title>Confirmar Venta</Modal.Title></Modal.Header>
          <Modal.Body>
            <h5 className="font-semibold mb-3">Resumen de la venta:</h5>
            <p><strong>Cliente:</strong> {getNombreClienteModal()}</p>
            {esCtaCte ? <div className={S.alertWarning}><strong>⚠️ CUENTA CORRIENTE - Pago Pendiente</strong></div> : <p><strong>Forma de Pago:</strong> {formaPago.charAt(0).toUpperCase() + formaPago.slice(1)}</p>}
            <ul className="list-disc list-inside mb-3">{itemsVenta.map((i) => <li key={i.articulo.id}>{i.articulo.nombre} x {i.articulo.esPesable ? formatearPeso(i.cantidad) : i.cantidad} = {formatearMoneda(i.subtotal)}</li>)}</ul>
            <hr className="my-2" />
            <div className="flex justify-between"><span>Subtotal:</span><strong>{formatearMoneda(calcularTotal())}</strong></div>
            {!esCtaCte && formaPago === "credito" && calcularInteres() > 0 && <div className="flex justify-between text-amber-600"><span>Interés ({interesPorcentaje}%):</span><strong>{formatearMoneda(calcularInteres())}</strong></div>}
            <hr className="my-2" />
            <h4 className="text-right text-lg font-bold">Total {esCtaCte ? "Pendiente" : "a Pagar"}: {formatearMoneda(calcularTotalFinal())}</h4>
            {error && isSubmitting && <div className={`${S.alertDanger} mt-3`}>{error}</div>}
          </Modal.Body>
          <Modal.Footer>
            <button className={S.btnSecondary} onClick={() => setShowModal(false)} disabled={isSubmitting}>Cancelar</button>
            <button className={S.btnSuccess} onClick={procesarVenta} disabled={isSubmitting}>
              {isSubmitting ? <><Spinner size="sm" className="text-white" /> Procesando...</> : "Confirmar y Procesar"}
            </button>
          </Modal.Footer>
        </Modal>

        {/* Modal Nuevo Cliente */}
        <Modal show={showModalCliente} onHide={() => setShowModalCliente(false)}>
          <Modal.Header closeButton onHide={() => setShowModalCliente(false)}><Modal.Title>Agregar Nuevo Cliente</Modal.Title></Modal.Header>
          <Modal.Body>
            <div className={S.formGroup}>
              <label className={S.label}>Nombre Completo <span className="text-red-500">*</span></label>
              <input type="text" placeholder="Ej: Juan Pérez" value={nuevoClienteNombre} onChange={(e) => setNuevoClienteNombre(e.target.value)} autoFocus className={S.input} />
            </div>
            <div className={`${S.alertInfo} py-2`}><small>Podrás completar más datos de este cliente desde la sección <strong>Cuentas Corrientes</strong>.</small></div>
          </Modal.Body>
          <Modal.Footer>
            <button className={S.btnSecondary} onClick={() => setShowModalCliente(false)} disabled={isCreatingCliente}>Cancelar</button>
            <button className={S.btnPrimary} onClick={handleCrearCliente} disabled={isCreatingCliente || !nuevoClienteNombre.trim()}>
              {isCreatingCliente ? <Spinner size="sm" /> : "Guardar Cliente"}
            </button>
          </Modal.Footer>
        </Modal>

        {/* Modal Pesable */}
        <Modal show={!!articuloPesableActivo} onHide={() => setArticuloPesableActivo(null)}>
          <Modal.Header closeButton onHide={() => setArticuloPesableActivo(null)}><Modal.Title>Indicar Cantidad</Modal.Title></Modal.Header>
          <Modal.Body>
            <h5 className="mb-3 text-blue-600 font-semibold">{articuloPesableActivo?.nombre}</h5>
            <div className={S.formGroup}>
              <label className={S.label}>Unidad de medida</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-1.5 cursor-pointer"><input type="radio" name="unidadMedida" checked={modalPesoUnidad === "gramos"} onChange={() => setModalPesoUnidad("gramos")} /> Gramos (gr)</label>
                <label className="flex items-center gap-1.5 cursor-pointer"><input type="radio" name="unidadMedida" checked={modalPesoUnidad === "kilos"} onChange={() => setModalPesoUnidad("kilos")} /> Kilos (Kg)</label>
              </div>
            </div>
            <div className={S.formGroup}>
              <label className={S.label}>Cantidad en {modalPesoUnidad}</label>
              <div className={S.inputGroupWrapper}>
                <input id="inputPesoVenta" type="number" step="any" placeholder={modalPesoUnidad === "gramos" ? "Ej: 250" : "Ej: 1.5"} value={modalPesoCantidad}
                  onChange={(e) => setModalPesoCantidad(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); confirmarArticuloPesable(); } }}
                  className={`${S.inputGroupInput} rounded-r-none`} />
                <span className={`${S.inputGroupText} rounded-r-lg rounded-l-none border-l-0 border-r`}>{modalPesoUnidad === "gramos" ? "gr" : "Kg"}</span>
              </div>
            </div>
            <div className="mt-3">
              <label className={S.label}>Precio Final / Subtotal</label>
              <div className={S.inputGroupWrapper}>
                <span className={S.inputGroupText}>$</span>
                <input type="text" placeholder="Ej: 1.000" value={modalPrecioFinal}
                  onChange={(e) => { setModalPrecioFinal(formatearPrecioInput(e.target.value)); setModalPrecioEditado(true); }}
                  inputMode="decimal" className={S.inputGroupInput} />
              </div>
              <p className={S.formText}>Se autocalcula en base al precio por kilo, pero podés editarlo.</p>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <button className={S.btnSecondary} onClick={() => setArticuloPesableActivo(null)}>Cancelar</button>
            <button className={S.btnSuccess} onClick={confirmarArticuloPesable}>Aceptar</button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
};

export default RegistrarVenta;
