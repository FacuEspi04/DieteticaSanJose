import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'categorias' })
export class Categoria {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true }) // <-- CORRECCIÓN AQUÍ
  id: number;

  @Column({ type: 'varchar', length: 100, unique: true, nullable: false })
  nombre: string;
}
