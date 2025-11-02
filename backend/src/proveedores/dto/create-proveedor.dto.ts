import { IsString, IsNotEmpty, IsOptional, IsEmail, MaxLength } from 'class-validator';

export class CreateProveedorDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre del proveedor es obligatorio' })
  @MaxLength(255)
  nombre: string;

  @IsString()
  @IsNotEmpty({ message: 'El nombre del contacto es obligatorio' })
  @MaxLength(255)
  contacto: string;
  
  @IsString()
  @IsNotEmpty({ message: 'El teléfono es obligatorio' })
  @MaxLength(50)
  telefono: string;

  @IsEmail({}, { message: 'El formato del email no es válido' })
  @IsNotEmpty({ message: 'El email es obligatorio' })
  @MaxLength(255)
  email: string;

  @IsString()
  @IsOptional()
  direccion?: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  cuit?: string;

  @IsString()
  @IsOptional()
  notas?: string;
}
