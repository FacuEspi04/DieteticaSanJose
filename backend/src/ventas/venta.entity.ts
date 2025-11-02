import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  UpdateDateColumn, // <-- Importar UpdateDateColumn
} from 'typeorm';

import { VentaDetalle } from './venta-detalle.entity';
import { Cliente } from 'src/clientes/cliente.entity';


// Enums (los moví aquí para que sean fáciles de exportar)
export enum FormaPago {
  EFECTIVO = 'efectivo',
  DEBITO = 'debito',
  CREDITO = 'credito',
  TRANSFERENCIA = 'transferencia',
}

export enum VentaEstado {
  COMPLETADA = 'Completada',
  PENDIENTE = 'Pendiente',
  // ANULADA = 'Anulada', // <-- Eliminado
}

export enum TurnoVenta {
  MANANA = 'mañana',
  TARDE = 'tarde',
  FUERA = 'fuera',
}

@Entity({ name: 'ventas' })
export class Venta {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number; // Esta es la PK interna

  @Column({ type: 'bigint', unsigned: true, unique: true })
  numeroVenta: number; // <-- Lo asignamos por código en el servicio

  @Column({ type: 'datetime' })
  fechaHora: Date;

  @Column({ name: 'cliente_id', type: 'bigint', unsigned: true, nullable: true })
  clienteId: number | null; // Acepta null

  @ManyToOne(() => Cliente, { nullable: true, eager: true })
  @JoinColumn({ name: 'cliente_id' })
  cliente: Cliente;

  @Column({ type: 'varchar', length: 255 })
  clienteNombre: string; // Para "Cliente General" o Cta. Cte.

  @OneToMany(() => VentaDetalle, (detalle) => detalle.venta, {
    cascade: true, // Guarda/actualiza detalles junto con la venta
    eager: true, // Carga los items automáticamente
  })
  items: VentaDetalle[];

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  subtotal: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  interes: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total: number;

  @Column({
    type: 'enum',
    enum: FormaPago,
    nullable: true, // <-- Acepta null (para Cta. Cte. y Anuladas)
  })
  formaPago: FormaPago | null;

  @Column({
    type: 'enum',
    enum: VentaEstado,
  })
  estado: VentaEstado;

  @Column({
    type: 'enum',
    enum: TurnoVenta,
  })
  turno: TurnoVenta;

  // --- Eliminamos los campos de anulación ---
  // @Column({ name: 'anulado_ts', type: 'datetime', nullable: true })
  // anuladoTs: Date | null;
  // @Column({ name: 'motivo_anulacion', type: 'text', nullable: true })
  // motivoAnulacion: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt: Date;
  
  @UpdateDateColumn({ name: 'updated_at', type: 'datetime' })
  updatedAt: Date;
}

