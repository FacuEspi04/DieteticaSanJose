import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne, 
  JoinColumn,
} from 'typeorm';
import { Venta } from './venta.entity';
import { Articulo } from 'src/articulos/articulo.entity';


@Entity({ name: 'venta_detalles' })
export class VentaDetalle {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  // Relación con la Venta
  @Column({ name: 'numero_venta', type: 'bigint', unsigned: true })
  numeroVenta: number;

  @ManyToOne(() => Venta, (venta) => venta.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'numero_venta' })
  venta: Venta;

  // Relación con el Artículo
  @Column({ name: 'articulo_id', type: 'bigint', unsigned: true, nullable: true })
  articuloId: number;

  @ManyToOne(() => Articulo, { onDelete: 'SET NULL', eager: true }) // eager: true carga el artículo
  @JoinColumn({ name: 'articulo_id' })
  articulo: Articulo;

  @Column({ type: 'int' })
  cantidad: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  precioUnitario: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  subtotal: number;
}

