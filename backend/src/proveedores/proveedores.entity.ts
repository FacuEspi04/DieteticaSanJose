import { Pedido } from 'src/pedidos/pedido.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'proveedores' })
export class Proveedor {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  nombre: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  contacto: string | null; // <-- CORREGIDO

  @Column({ type: 'varchar', length: 50, nullable: true })
  telefono: string | null; // <-- CORREGIDO

  @Column({ type: 'varchar', length: 255, nullable: true })
  email: string | null; // <-- CORREGIDO

  @Column({ type: 'text', nullable: true })
  direccion: string | null; // <-- CORREGIDO

  @Column({ type: 'varchar', length: 20, unique: true, nullable: true })
  cuit: string | null; // <-- CORREGIDO

  @Column({ type: 'text', nullable: true })
  notas: string | null; // <-- CORREGIDO

  @Column({ type: 'boolean', default: true })
  activo: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @OneToMany(() => Pedido, (pedido) => pedido.proveedor)
  pedidos: Pedido[];
}