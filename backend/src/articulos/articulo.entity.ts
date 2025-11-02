
import { Categoria } from 'src/categorias/categoria.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'articulos' })
export class Articulo {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'varchar', length: 255 })
  nombre: string;

  // --- CAMBIO ---
  @Column({ type: 'varchar', length: 100, nullable: true })
  marca: string; // <-- AÑADIDO

  @Column({ name: 'codigo_barras', type: 'varchar', length: 50, unique: true })
  codigo_barras: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, unsigned: true })
  precio: number;

  @Column({ type: 'int', default: 0 })
  stock: number;

  @Column({ name: 'stock_minimo', type: 'int', default: 0 })
  stock_minimo: number;

  @Column({ name: 'categoria_id', type: 'bigint', unsigned: true, nullable: true })
  categoriaId: number;

  @ManyToOne(() => Categoria, {
    eager: true,
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'categoria_id' })
  categoria: Categoria;

  // --- CAMBIO ---
  // @Column({ type: 'text', nullable: true })
  // descripcion: string; // <-- ELIMINADO

  @Column({ type: 'boolean', default: true })
  activo: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime' })
  updatedAt: Date;
}

