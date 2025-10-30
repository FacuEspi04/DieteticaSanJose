const BASE_URL = import.meta?.env?.VITE_API_URL || 'http://localhost:4000';

export interface ArticuloDto {
  id: number;
  nombre: string;
  codigoBarras: string;
  precio: number;
  stock: number;
}

export async function fetchArticulos(): Promise<ArticuloDto[]> {
  const res = await fetch(`${BASE_URL}/api/articulos?page=1&pageSize=1000`);
  if (!res.ok) throw new Error('Error al cargar artículos');
  const data = await res.json();
  return (data.items || []).map((a: any) => ({
    id: Number(a.id),
    nombre: a.nombre,
    codigoBarras: a.codigoBarras || a.codigo_barras,
    precio: Number(a.precio),
    stock: Number(a.stock ?? 0),
  }));
}


