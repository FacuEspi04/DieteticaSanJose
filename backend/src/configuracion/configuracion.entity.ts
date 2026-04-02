import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'configuracion' })
export class Configuracion {
  @PrimaryColumn({ type: 'varchar', length: 50 })
  clave: string;

  @Column({ type: 'text', nullable: true })
  valor: string;
}
