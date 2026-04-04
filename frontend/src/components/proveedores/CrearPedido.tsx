import React, { useEffect, useState, useMemo } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatearPeso } from "../../utils/formatters";
import { 
  FileDown, 
  ClipboardPlus, 
  Search, 
  AlertTriangle, 
  Plus, 
  Minus, 
  Trash2, 
  ArrowLeft
} from "lucide-react";
import {
  createPedido,
  updatePedido,
  getPedidoById,
  getArticulos,
  getProveedores,
  type Articulo,
  type CreatePedidoDto,
  type Pedido,
  type Proveedor,
} from "../../services/apiService";
import { useNavigate, useParams } from "react-router-dom";
import Modal from '../ui/Modal';
import Spinner from '../ui/Spinner';
import * as S from '../ui/styles';

interface ItemPedido {
  articulo: Articulo;
  cantidad: number;
}

type PedidoGuardado = Pedido;

const CrearPedido: React.FC = () => {

  // --- Estados de Datos ---
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [catalogoArticulos, setCatalogoArticulos] = useState<Articulo[]>([]);

  // --- Estados del Formulario de Pedido ---
  const [proveedorId, setProveedorId] = useState<string>("");
  const [itemsPedido, setItemsPedido] = useState<ItemPedido[]>([]);
  const [observaciones, setObservaciones] = useState<string>("");
  
  // --- Estados de UI y Filtros ---
  const navigate = useNavigate();
  const { id } = useParams();
  const [busqueda, setBusqueda] = useState(""); 
  const [showConfirm, setShowConfirm] = useState(false);
  const [exito, setExito] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [pedidoConfirmado, setPedidoConfirmado] = useState<PedidoGuardado | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [, setIsDraftMode] = useState(false);
  const [pedidoId, setPedidoId] = useState<number | null>(null);

  useEffect(() => {
    const cargarDatos = async () => {
      setIsLoading(true);
      try {
        const [provData, artData] = await Promise.all([
          getProveedores(),
          getArticulos(),
        ]);

        const articulosMapeados = artData.map((a) => ({
          ...a,
          id: Number(a.id),
          precio: Number(a.precio),
        }));

        setProveedores(provData);
        setCatalogoArticulos(articulosMapeados);

        if (id) {
          const pedidoDraft = await getPedidoById(Number(id));
          if (pedidoDraft) {
            setPedidoId(pedidoDraft.id);
            if (pedidoDraft.proveedorId) setProveedorId(String(pedidoDraft.proveedorId));
            if (pedidoDraft.notas) setObservaciones(pedidoDraft.notas);
            if (pedidoDraft.estado === 'Borrador') {
              setIsDraftMode(true);
            }
            if (pedidoDraft.items) {
               const mappedItems = pedidoDraft.items.map((i: any) => ({
                 articulo: articulosMapeados.find(a => Number(a.id) === Number(i.articulo?.id || i.articuloId)) || 
                           {...i.articulo, id: i.articuloId || i.articulo?.id},
                 cantidad: i.cantidad
               }));
               setItemsPedido(mappedItems as any);
            }
          }
        }
      } catch (err: any) {
        setError(err.message || "Error al cargar datos iniciales");
      } finally {
        setIsLoading(false);
      }
    };
    cargarDatos();
  }, [id]);

  const articulosFiltrados = useMemo(() => {
    return catalogoArticulos.filter(a => 
      a.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      a.codigo_barras?.includes(busqueda)
    );
  }, [catalogoArticulos, busqueda]);

  const stockCritico = useMemo(() => {
    return articulosFiltrados.filter(a => a.stock <= a.stock_minimo);
  }, [articulosFiltrados]);

  const stockNormal = useMemo(() => {
    return articulosFiltrados.filter(a => a.stock > a.stock_minimo);
  }, [articulosFiltrados]);


  const agregarAlPedido = (articulo: Articulo) => {
    setError("");
    const existente = itemsPedido.find((i) => i.articulo.id === articulo.id);

    if (existente) {
      setItemsPedido(
        itemsPedido.map((i) =>
          i.articulo.id === articulo.id
            ? { ...i, cantidad: i.cantidad + 1 }
            : i
        )
      );
    } else {
      setItemsPedido([...itemsPedido, { articulo, cantidad: 1 }]);
    }
  };

  const restarDelPedido = (articuloId: number) => {
    const existente = itemsPedido.find((i) => i.articulo.id === articuloId);
    if (existente && existente.cantidad > 1) {
        setItemsPedido(
            itemsPedido.map((i) =>
              i.articulo.id === articuloId
                ? { ...i, cantidad: i.cantidad - 1 }
                : i
            )
          );
    } else {
        eliminarDelPedido(articuloId);
    }
  }

  const cambiarCantidadManual = (articuloId: number, nuevaCantidad: number) => {
      const existente = itemsPedido.find((i) => i.articulo.id === articuloId);
      if (!existente) return;
      if (nuevaCantidad <= 0) return;
      setItemsPedido(itemsPedido.map(i => i.articulo.id === articuloId ? {...i, cantidad: nuevaCantidad} : i));
  }

  const eliminarDelPedido = (id: number) => {
    setItemsPedido(itemsPedido.filter((i) => i.articulo.id !== id));
  };

  const abrirConfirmacion = () => {
    setError("");
    if (!proveedorId) {
      setError("Debes seleccionar un proveedor antes de confirmar.");
      return;
    }
    if (itemsPedido.length === 0) {
      setError("El pedido está vacío. Agrega artículos desde el listado.");
      return;
    }
    setShowConfirm(true);
  };

  const confirmarPedido = async () => {
    setIsSubmitting(true);
    setError("");

    const pedidoDto: CreatePedidoDto = {
      proveedorId: Number(proveedorId),
      notas: observaciones || undefined,
      estado: "Pendiente",
      items: itemsPedido.map((item) => ({
        articuloId: item.articulo.id,
        cantidad: item.cantidad,
      })),
    };

    try {
      let pedidoGuardado;
      if (pedidoId) {
        pedidoGuardado = await updatePedido(pedidoId, pedidoDto);
      } else {
        pedidoGuardado = await createPedido(pedidoDto);
      }
      setPedidoConfirmado(pedidoGuardado);
      setShowConfirm(false);
      setExito("¡Pedido confirmado exitosamente!");
      
      setItemsPedido([]);
      setObservaciones("");
      setPedidoId(null);
      setIsDraftMode(false);
      
      setTimeout(() => setExito(""), 3000);
    } catch (err: any) {
      console.error("Error al confirmar pedido:", err);
      setError(err.message || "Error al confirmar el pedido");
      setShowConfirm(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const guardarComoBorrador = async () => {
    setIsSubmitting(true);
    setError("");

    const pedidoDto: CreatePedidoDto = {
      proveedorId: Number(proveedorId),
      notas: observaciones || undefined,
      estado: "Borrador",
      items: itemsPedido.map((item) => ({
        articuloId: item.articulo.id,
        cantidad: item.cantidad,
      })),
    };

    try {
      let pedidoGuardado;
      if (pedidoId) {
        pedidoGuardado = await updatePedido(pedidoId, pedidoDto);
      } else {
        pedidoGuardado = await createPedido(pedidoDto);
      }
      setPedidoConfirmado(pedidoGuardado);
      setShowConfirm(false);
      setExito("¡Pedido guardado como Borrador! Puedes editarlo después.");
      
      setItemsPedido([]);
      setObservaciones("");
      setPedidoId(null);
      setIsDraftMode(false);
      
      setTimeout(() => setExito(""), 3000);
      navigate("/proveedores/pedidos/lista");
    } catch (err: any) {
      console.error("Error al guardar como borrador:", err);
      setError(err.message || "Error al guardar el borrador");
      setShowConfirm(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNuevoPedido = () => {
    setPedidoConfirmado(null);
    setExito("");
    setError("");
    setItemsPedido([]);
    setProveedorId("");
    setObservaciones("");
    setBusqueda("");
  };

  const addPDFHeader = (doc: jsPDF, title: string, rightText: string) => {
    const margin = 14;
    doc.setFillColor(30, 41, 59);
    doc.rect(0, 0, doc.internal.pageSize.width, 26, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text(title, margin, 17);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    const textWidth = doc.getTextWidth(rightText);
    doc.text(rightText, doc.internal.pageSize.width - margin - textWidth, 17);

    doc.setTextColor(50, 50, 50);
  };

  const imprimirPedido = (pedido: PedidoGuardado) => {
    const doc = new jsPDF();
    const margin = 14;
    const fechaFormateada = new Date(pedido.fechaPedido).toLocaleDateString("es-AR");

    addPDFHeader(doc, "Pedido a Proveedor", `Fecha: ${fechaFormateada}`);

    doc.setFontSize(11);
    doc.text(`N° Pedido: ${pedido.id}`, margin, 34);

    doc.setFontSize(14);
    doc.text("Proveedor", margin, 46);
    doc.setFontSize(11);
    let startY = 52;
    doc.text(`Nombre: ${pedido.proveedor.nombre}`, margin, startY);
    
    if (pedido.notas) {
      startY += 10;
      doc.text(`Notas: ${pedido.notas}`, margin, startY);
    }

    startY += 10;
    autoTable(doc, {
      startY: startY + 4,
      head: [["Artículo", "Cantidad"]],
      body: pedido.items.map((i) => {
        const cantidadTxt = i.articulo.esPesable ? formatearPeso(i.cantidad) : String(i.cantidad);
        return [
          i.articulo.nombre,
          cantidadTxt,
        ];
      }),
      theme: "striped",
      headStyles: { fillColor: [30, 41, 59], halign: "center" },
      columnStyles: { 0: { halign: "center" }, 1: { halign: "center" } },
    });

    doc.save(`pedido_${pedido.proveedor.nombre}_${fechaFormateada}.pdf`);
  };

  if (isLoading) {
      return (
        <div className="text-center py-10">
          <Spinner />
          <p className="mt-2 text-slate-500">Cargando catálogo...</p>
        </div>
      );
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title flex items-center gap-2"><ClipboardPlus size={26}/> Nuevo Pedido</h1>
        <button
          className={S.btnOutlineDark}
          onClick={() => navigate("/proveedores")}
        >
          <ArrowLeft size={16} /> Volver
        </button>
      </div>

      {error && (
        <div className={S.alertDanger}>
          <span className="flex-1">{error}</span>
          <button onClick={() => setError("")} className="text-red-500 hover:text-red-700 ml-2">✕</button>
        </div>
      )}
      {exito && (
        <div className={S.alertSuccess}>
          <span className="flex-1">{exito}</span>
          <button onClick={() => setExito("")} className="text-emerald-500 hover:text-emerald-700 ml-2">✕</button>
        </div>
      )}

      {!pedidoConfirmado ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
                <div className={S.card}>
                    <div className={S.cardHeader}>
                        <div className={`${S.inputGroupWrapper} w-full md:w-2/3 lg:w-1/2`}>
                            <span className={`${S.inputGroupText} bg-white`}><Search size={16}/></span>
                            <input 
                                type="text" 
                                className={S.inputGroupInput}
                                placeholder="Buscar artículo por nombre o código..."
                                value={busqueda}
                                onChange={(e) => setBusqueda(e.target.value)}
                                autoFocus
                            />
                        </div>
                    </div>
                    <div className={`${S.cardBody} max-h-[70vh] overflow-y-auto`}>
                        
                        {stockCritico.length > 0 && (
                            <div className="mb-6">
                                <h6 className="text-red-600 font-semibold flex items-center mb-3">
                                    <AlertTriangle className="mr-2" size={16}/> Artículos con Stock Crítico (Bajo Mínimo)
                                </h6>
                                <div className="overflow-x-auto rounded-lg border border-red-200">
                                  <table className="w-full text-sm">
                                      <thead className="bg-red-50 text-red-700">
                                          <tr>
                                              <th className={`${S.th} !text-center`}>Artículo</th>
                                              <th className={`${S.th} !text-center`}>Stock Actual</th>
                                              <th className={`${S.th} !text-center`}>Stock mínimo</th>
                                              <th className={`${S.th} !text-center`}>Acción</th>
                                          </tr>
                                      </thead>
                                      <tbody>
                                          {stockCritico.map(art => (
                                              <tr key={art.id} className="border-t border-red-100 bg-red-50/30">
                                                  <td className={`${S.td} font-bold text-slate-800 !text-center align-middle`}>{art.nombre}</td>
                                                  <td className={`${S.td} !text-center text-red-600 font-bold align-middle`}>{art.stock}</td>
                                                  <td className={`${S.td} !text-center text-slate-500 align-middle`}>{art.stock_minimo}</td>
                                                  <td className={`${S.td} !text-center align-middle`}>
                                                      <div className="flex justify-center">
                                                          <button 
                                                              className={S.btnOutlineDanger} 
                                                              onClick={() => agregarAlPedido(art)}
                                                          >
                                                              <Plus size={14}/> Agregar
                                                          </button>
                                                      </div>
                                                  </td>
                                              </tr>
                                          ))}
                                      </tbody>
                                  </table>
                                </div>
                            </div>
                        )}

                        <h6 className="text-slate-500 font-semibold mb-3">Catálogo General</h6>
                        <div className="overflow-x-auto rounded-lg border border-slate-200">
                          <table className={S.table}>
                              <thead className="bg-slate-50">
                                  <tr>
                                      <th className={`${S.th} !text-center`}>Artículo</th>
                                      <th className={`${S.th} !text-center`}>Stock</th>
                                      <th className={`${S.th} !text-center`}>Stock mínimo</th>
                                      <th className={`${S.th} !text-center`}>Acción</th>
                                  </tr>
                              </thead>
                              <tbody>
                                  {stockNormal.map(art => (
                                      <tr key={art.id} className={`${S.trStriped} ${S.trHover}`}>
                                          <td className={`${S.td} !text-center align-middle font-bold text-slate-800`}>{art.nombre}</td>
                                          <td className={`${S.td} !text-center align-middle`}>
                                              <span className={S.badgeSuccess}>{art.stock}</span>
                                          </td>
                                          <td className={`${S.td} !text-center text-slate-500 align-middle`}>{art.stock_minimo}</td>
                                          <td className={`${S.td} !text-center align-middle`}>
                                              <div className="flex justify-center">
                                                  <button 
                                                      className={S.btnOutlinePrimary} 
                                                      onClick={() => agregarAlPedido(art)}
                                                  >
                                                      <Plus size={14}/>
                                                  </button>
                                              </div>
                                          </td>
                                      </tr>
                                  ))}
                                  {stockNormal.length === 0 && stockCritico.length === 0 && (
                                      <tr><td colSpan={4} className={`${S.td} text-center text-slate-500 py-4`}>No se encontraron artículos.</td></tr>
                                  )}
                              </tbody>
                          </table>
                        </div>
                    </div>
                </div>
            </div>

            <div>
                <div className={`${S.card} h-full flex flex-col`}>
                    <div className="bg-slate-800 text-white px-5 py-4 rounded-t-xl">
                        <h5 className="font-semibold m-0">Resumen del Pedido</h5>
                    </div>
                    <div className={`${S.cardBody} flex-1 flex flex-col bg-slate-50`}>
                        <div className={S.formGroup}>
                            <label className={S.label}>Proveedor</label>
                            <select 
                                value={proveedorId} 
                                onChange={(e) => setProveedorId(e.target.value)}
                                className={S.select}
                            >
                                <option value="">-- Seleccionar Proveedor --</option>
                                {proveedores.map(p => (
                                    <option key={p.id} value={p.id}>{p.nombre}</option>
                                ))}
                            </select>
                            {!proveedorId && <p className="text-xs text-red-500 mt-1">Seleccione uno para continuar</p>}
                        </div>

                        <div className={S.formGroup}>
                            <label className={S.label}>Observaciones</label>
                            <textarea 
                                rows={2}
                                className={S.input}
                                placeholder="Ej: Entregar por la mañana..." 
                                value={observaciones}
                                onChange={(e) => setObservaciones(e.target.value)}
                            />
                        </div>

                        <div className="border-t border-slate-200 my-4"></div>

                        <div className="flex-1 overflow-auto max-h-[40vh]">
                            {itemsPedido.length === 0 ? (
                                <div className="text-center text-slate-500 py-6 text-sm">
                                    <em>El pedido está vacío.<br/>Seleccione artículos de la izquierda.</em>
                                </div>
                            ) : (
                                <table className="w-full text-sm">
                                    <tbody>
                                        {itemsPedido.map((item, idx) => (
                                            <tr key={idx} className="border-b border-slate-200 last:border-0 hover:bg-slate-100 transition-colors">
                                                <td className="py-2 px-2 text-center align-middle w-1/3">
                                                    <span className="font-bold text-slate-800">{item.articulo.nombre}</span>
                                                </td>
                                                <td className="py-2 px-2 align-middle w-1/3">
                                                    <div className="flex justify-center items-center">
                                                        <button type="button" className={`${S.btnOutlineSecondary} rounded-r-none px-2 h-[34px] flex items-center justify-center`} onClick={() => restarDelPedido(item.articulo.id)}><Minus size={14}/></button>
                                                        <input 
                                                            className="w-16 h-[34px] text-sm font-medium text-slate-800 border-y border-slate-300 bg-white focus:outline-none focus:border-brand-500 text-center px-1 m-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                            type="number"
                                                            step={item.articulo.esPesable ? "0.001" : "1"}
                                                            value={item.cantidad} 
                                                            onChange={(e) => cambiarCantidadManual(item.articulo.id, parseFloat(e.target.value) || 0)}
                                                        />
                                                        <button type="button" className={`${S.btnOutlineSecondary} rounded-l-none px-2 h-[34px] flex items-center justify-center`} onClick={() => agregarAlPedido(item.articulo)}><Plus size={14}/></button>
                                                    </div>
                                                </td>
                                                <td className="py-2 px-2 text-center align-middle w-1/3">
                                                    <button type="button" className="text-red-500 hover:text-red-700 p-1 inline-flex justify-center items-center" onClick={() => eliminarDelPedido(item.articulo.id)}>
                                                        <Trash2 size={16}/>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                    <div className={S.cardFooter}>
                        <div className="flex justify-between items-center w-full">
                            <strong className="text-slate-800">Total Items: {itemsPedido.length}</strong>
                            <button 
                                className={S.btnSuccess} 
                                onClick={abrirConfirmacion}
                                disabled={itemsPedido.length === 0 || !proveedorId}
                            >
                                Confirmar Pedido
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      ) : (
        <div className={S.card}>
            <div className="p-10 text-center">
                <div className="text-emerald-500 flex justify-center mb-4">
                    <ClipboardPlus size={64}/>
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-2">¡Pedido Generado Exitosamente!</h3>
                <p className="text-slate-500 mb-6">El pedido ha sido guardado en el sistema.</p>
                <div className="flex justify-center gap-3">
                    <button className={S.btnSecondary} onClick={handleNuevoPedido}>
                        Volver al Inicio
                    </button>
                    <button className={S.btnPrimary} onClick={() => pedidoConfirmado && imprimirPedido(pedidoConfirmado)}>
                        <FileDown className="mr-2" size={16}/> Descargar PDF
                    </button>
                </div>
            </div>
        </div>
      )}

      <Modal show={showConfirm} onHide={() => setShowConfirm(false)}>
        <Modal.Header closeButton onHide={() => setShowConfirm(false)} className="modal-header-brand">
          <Modal.Title>Confirmar Pedido</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Se generará un pedido para: <strong>{proveedores.find(p => p.id === Number(proveedorId))?.nombre}</strong></p>
          <p>Cantidad de artículos distintos: <strong>{itemsPedido.length}</strong></p>
          <div className={S.alertWarning}>
            <span className="text-sm">Verifique que las cantidades sean correctas antes de confirmar.</span>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <button className={S.btnSecondary} onClick={() => setShowConfirm(false)} disabled={isSubmitting}>
            Cancelar
          </button>
          <button className={S.btnOutlinePrimary} onClick={guardarComoBorrador} disabled={isSubmitting}>
            {isSubmitting ? <Spinner size="sm" className="mr-2" /> : "Guardar como Borrador"}
          </button>
          <button className={S.btnSuccess} onClick={confirmarPedido} disabled={isSubmitting}>
            {isSubmitting ? <><Spinner size="sm" className="mr-2"/> Guardando...</> : "Confirmar Pedido"}
          </button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default CrearPedido;