import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateMarcaDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre de la marca no puede estar vacío.' })
  @MaxLength(100)
  nombre: string;
}