declare class CreatePedidoItemDto {
    articuloId: number;
    cantidad: number;
}
export declare class CreatePedidoDto {
    proveedorId: number;
    notas?: string;
    items: CreatePedidoItemDto[];
}
export {};
