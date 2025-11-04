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
  @PrimaryGeneratedColumn() // <-- CAMBIO: Quitado "type: 'bigint'" y "unsigned"
  id: number;

  @Column({ type: 'varchar', length: 255 })
  nombre: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  contacto: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  telefono: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email: string;

  @Column({ type: 'text', nullable: true })
  direccion: string;

  @Column({ type: 'varchar', length: 20, unique: true, nullable: true })
  cuit: string;

  @Column({ type: 'text', nullable: true })
  notas: string;

  @Column({ type: 'boolean', default: true })
  activo: boolean;

  @CreateDateColumn({ name: 'created_at' }) // <-- CAMBIO: Quitado "type: 'datetime'"
  createdAt: Date;

  @OneToMany(() => Pedido, (pedido) => pedido.proveedor)
  pedidos: Pedido[];
}
