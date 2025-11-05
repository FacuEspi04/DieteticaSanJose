import { Pedido } from 'src/pedidos/pedido.entity';
export declare class Proveedor {
    id: number;
    nombre: string;
    contacto: string | null;
    telefono: string | null;
    email: string | null;
    direccion: string | null;
    cuit: string | null;
    notas: string | null;
    activo: boolean;
    createdAt: Date;
    pedidos: Pedido[];
}
