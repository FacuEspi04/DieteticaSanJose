import { Body, Controller, Post, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ActivarLicenciaDto } from './dto/activar-licencia.dto';
import { ConfiguracionService } from '../configuracion/configuracion.service';
import { firstValueFrom } from 'rxjs';

@Controller('api/auth')
export class AuthController {
  constructor(
    private readonly httpService: HttpService,
    private readonly configuracionService: ConfiguracionService,
  ) {}

  @Post('activar')
  async activar(@Body() dto: ActivarLicenciaDto) {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new ForbiddenException('Servidor no configurado en la nube.');
    }

    const baseUrl = supabaseUrl.endsWith('/') ? supabaseUrl.slice(0, -1) : supabaseUrl;

    try {
      const response = await firstValueFrom(
        this.httpService.get(`${baseUrl}/rest/v1/comercios_licencias?dni=eq.${dto.dni}&select=*`, {
          headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
          },
        }),
      );

      const licencias = response.data;

      // 1. DNI no existe
      if (!licencias || licencias.length === 0) {
        throw new UnauthorizedException({ message: 'DNI_NO_REGISTRADO' });
      }

      const comercio = licencias[0];

      // 2. Licencia suspendida
      if (comercio.estado === 'SUSPENDIDO') {
         throw new ForbiddenException({ message: 'LICENCIA_SUSPENDIDA' });
      }

      // Existe y está activo (u otro estado permitido, pero mayormente ACTIVO)
      // Guardamos la configuración de forma local
      await this.configuracionService.setValor('dni_comercio', dto.dni);
      await this.configuracionService.setValor('comercio_estado', 'ACTIVO');
      await this.configuracionService.setValor('ultima_validacion_exitosa', new Date().toISOString());

      // Opcional: si devuelven 'fecha_vencimiento_abono', la podemos guardar
      if (comercio.fecha_vencimiento_abono) {
         await this.configuracionService.setValor('fecha_vencimiento_abono', comercio.fecha_vencimiento_abono);
      }

      return {
        message: 'Sistema activado exitosamente.',
        dni: dto.dni
      };

    } catch (error) {
      // Si el error provino directamente de nuestras excepciones arrojadas
      if (error instanceof UnauthorizedException || error instanceof ForbiddenException) {
        throw error;
      }
      
      // Error de red, u otros posibles códigos
      throw new ForbiddenException({ message: 'Hubo un error al contactar al servidor de licencias. Verifique su conexión.' });
    }
  }
}
