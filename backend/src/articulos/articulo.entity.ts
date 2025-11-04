import { Categoria } from 'src/categorias/categoria.entity';
import { Marca } from 'src/marcas/marca.entity';
import { PedidoDetalle } from 'src/pedidos/pedido-detalle.entity';
import { VentaDetalle } from 'src/ventas/venta-detalle.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  OneToMany, // <-- Importar OneToMany
} from 'typeorm';
// Importamos las otras entidades que dependen de Articulo


@Entity({ name: 'articulos' })
export class Articulo {
  @PrimaryGeneratedColumn() // <-- CAMBIO: Quitado "type: 'bigint'" y "unsigned"
  id: number;

  @Column({ type: 'varchar', length: 255 })
  nombre: string;

  @Column({ name: 'codigo_barras', type: 'varchar', length: 50, unique: true })
  codigo_barras: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 }) // <-- CAMBIO: Quitado "unsigned"
  precio: number;

  @Column({ type: 'int', default: 0 })
  stock: number;

  @Column({ name: 'stock_minimo', type: 'int', default: 0 })
  stock_minimo: number;

  // --- Relación con Categoría ---
  @Column({ name: 'categoria_id', type: 'integer', nullable: true }) // <-- CAMBIO: 'bigint' a 'integer' y quitado "unsigned"
  categoriaId: number | null;

  @ManyToOne(() => Categoria, {
    eager: true,
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'categoria_id' })
  categoria: Categoria | null; // <-- CORREGIDO: Acepta null

  // --- Relación con Marca ---
  @Column({ name: 'marca_id', type: 'integer', nullable: true }) // <-- CAMBIO: 'bigint' a 'integer' y quitado "unsigned"
  marcaId: number | null;

  @ManyToOne(() => Marca, {
    eager: true,
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'marca_id' })
  marca: Marca | null; // <-- CORREGIDO: Acepta null

  @Column({ type: 'boolean', default: true })
  activo: boolean;

  @CreateDateColumn({ name: 'created_at' }) // <-- CAMBIO: Quitado "type: 'datetime'"
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' }) // <-- CAMBIO: Quitado "type: 'datetime'"
  updatedAt: Date;

  // --- Relaciones Inversas (para que TypeORM sepa de ellas) ---
  @OneToMany(() => VentaDetalle, (detalle) => detalle.articulo)
  itemsVenta: VentaDetalle[];

  @OneToMany(() => PedidoDetalle, (detalle) => detalle.articulo)
  itemsPedido: PedidoDetalle[];
}

