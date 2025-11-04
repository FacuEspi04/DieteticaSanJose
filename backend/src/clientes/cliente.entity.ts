import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'clientes' })
export class Cliente {
  @PrimaryGeneratedColumn() // <-- CAMBIO: Quitado "type: 'bigint'" y "unsigned"
  id: number;

  @Column({ type: 'varchar', length: 255 })
  nombre: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  telefono: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email: string;

  @Column({ type: 'text', nullable: true })
  direccion: string;

  @Column({
    name: 'limite_credito',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  limiteCredito: number;

  @CreateDateColumn({ name: 'created_at' }) // <-- CAMBIO: Quitado "type: 'datetime'"
  createdAt: Date;
}

