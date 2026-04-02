import { IsString, Matches } from 'class-validator';

export class ActivarLicenciaDto {
  @IsString()
  @Matches(/^[0-9]+$/, { message: 'El DNI solo puede contener números.' })
  dni: string;
}
