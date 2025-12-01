import { 
  IsString, 
  IsNumber, 
  IsPositive, 
  IsNotEmpty, 
  IsOptional,
  IsDateString 
} from 'class-validator';

export class PagarCuentaDto {
  @IsString()
  @IsNotEmpty()
  clienteNombre: string;

  @IsNumber()
  @IsPositive()
  monto: number;

  @IsString()
  @IsNotEmpty()
  formaPago: string;

  @IsNumber()
  @IsOptional()
  interes?: number;

  // --- AGREGADO: Necesario para que funcione la selección de fecha ---
  @IsOptional()
  @IsString()
  fecha?: string; 
}