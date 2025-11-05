import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEmail,
  MaxLength,
  ValidateIf,
} from 'class-validator';

export class CreateProveedorDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre del proveedor es obligatorio' })
  @MaxLength(255)
  nombre: string;

  @IsString()
  @IsOptional() // <-- CAMBIADO: Es opcional
  @MaxLength(255)
  contacto?: string | null; // <-- CAMBIADO: Acepta null

  @IsString()
  @IsOptional() // <-- CAMBIADO: Es opcional
  @MaxLength(50)
  telefono?: string | null; // <-- CAMBIADO: Acepta null

  @IsEmail({}, { message: 'El formato del email no es válido' })
  @IsOptional() // <-- CAMBIADO: Es opcional
  // Validar solo si no es nulo y no es un string vacío
  @ValidateIf((o) => o.email !== null && o.email !== '')
  @MaxLength(255)
  email?: string | null; // <-- CAMBIADO: Acepta null

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