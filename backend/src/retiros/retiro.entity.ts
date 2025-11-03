import { TurnoVenta } from 'src/common/turnos.util';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';
// Importamos el enum de turnos que creamos


@Entity({ name: 'retiros' })
export class Retiro {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'datetime' })
  fechaHora: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2, unsigned: true })
  monto: number;

  @Column({ type: 'text' })
  motivo: string;

  @Column({
    type: 'enum',
    enum: TurnoVenta,
  })
  turno: TurnoVenta;

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt: Date;
}

