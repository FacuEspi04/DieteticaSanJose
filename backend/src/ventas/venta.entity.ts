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
  @PrimaryGeneratedColumn() // <-- CAMBIO: Quitado "type: 'bigint'"
  id: number; // Esta es la PK interna

  @Column({ type: 'integer', unique: true }) // <-- CAMBIO: 'bigint' a 'integer'
  numeroVenta: number; // <-- Lo asignamos por código en el servicio

  @Column({ type: 'datetime' }) // <-- 'datetime' está OK en SQLite
  fechaHora: Date;

  @Column({ name: 'cliente_id', type: 'integer', nullable: true }) // <-- CAMBIO: 'bigint' a 'integer'
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
    type: 'varchar', // <-- CORRECTO para SQLite
    enum: FormaPago,
    nullable: true, // <-- Acepta null (para Cta. Cte. y Anuladas)
  })
  formaPago: FormaPago | null;

  @Column({
    type: 'varchar', // <-- CORRECTO para SQLite
    enum: VentaEstado,
  })
  estado: VentaEstado;

  @Column({
    type: 'varchar', // <-- CORRECTO para SQLite
    enum: TurnoVenta,
  })
  turno: TurnoVenta;


  @CreateDateColumn({ name: 'created_at' }) // <-- CAMBIO: Quitado "type: 'datetime'"
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' }) // <-- CAMBIO: Quitado "type: 'datetime'"
  updatedAt: Date;
}

