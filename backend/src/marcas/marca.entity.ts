import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'marcas' })
export class Marca {
  @PrimaryGeneratedColumn() // <-- CORREGIDO: Quitado "type: 'bigint'" y "unsigned"
  id: number;

  @Column({ type: 'varchar', length: 100, unique: true, nullable: false })
  nombre: string;
}
