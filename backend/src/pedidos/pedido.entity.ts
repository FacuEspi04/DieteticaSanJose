import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';

import { PedidoDetalle } from './pedido-detalle.entity';
import { Proveedor } from 'src/proveedores/proveedores.entity';

@Entity({ name: 'pedidos' })
export class Pedido {
  @PrimaryGeneratedColumn() // <-- CAMBIO: Quitado "type: 'bigint'"
  id: number;

  @Column({ name: 'proveedor_id', type: 'integer' }) // <-- CAMBIO: 'bigint' a 'integer'
  proveedorId: number;

  @Column({ name: 'fecha_pedido', type: 'date' })
  fechaPedido: Date;

  @Column({
    type: 'varchar', // <-- LÍNEA AÑADIDA
    enum: ['Pendiente', 'En_Transito', 'Recibido', 'Cancelado'],
    default: 'Pendiente',
  })
  estado: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  total: number;

  @Column({ type: 'text', nullable: true })
  notas: string | null;

  @CreateDateColumn({ name: 'created_at' }) // <-- 'type: datetime' eliminado
  createdAt: Date;

  @ManyToOne(() => Proveedor, (p) => p.pedidos, { eager: true }) // eager carga el proveedor
  @JoinColumn({ name: 'proveedor_id' })
  proveedor: Proveedor;

  @OneToMany(() => PedidoDetalle, (detalle) => detalle.pedido, {
    cascade: true, // Guarda detalles automáticamente
    eager: true, // Carga detalles automáticamente
  })
  items: PedidoDetalle[];
}

