import { Controller, Get, NotFoundException } from '@nestjs/common';
import { ConfiguracionService } from './configuracion.service';

@Controller('api/configuracion')
export class ConfiguracionController {
  constructor(private readonly configService: ConfiguracionService) {}

  @Get('licencia')
  async getLicencia() {
    const fechaStr = await this.configService.getValor('fecha_vencimiento_abono');
    const dni_comercio = await this.configService.getValor('dni_comercio');

    const defaultResponse = {
      fecha_vencimiento_abono: null as string | null,
      isActivated: !!dni_comercio,
      dni_comercio
    };
    
    // Si no existe, podemos asumir un valor por defecto o lanzar error
    if (!fechaStr) {
      // Si la nube aún no nos mandó una fecha, le otorgamos sus 15 días de Free Trial
      const defaultDate = new Date();
      defaultDate.setDate(defaultDate.getDate() + 15);
      await this.configService.setValor('fecha_vencimiento_abono', defaultDate.toISOString());
      defaultResponse.fecha_vencimiento_abono = defaultDate.toISOString();
      return defaultResponse;
    }

    defaultResponse.fecha_vencimiento_abono = fechaStr;
    return defaultResponse;
  }
}
