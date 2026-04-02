import { Injectable, NestMiddleware, ForbiddenException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ConfiguracionService } from '../../configuracion/configuracion.service';

@Injectable()
export class LicenciaMiddleware implements NestMiddleware {
  constructor(private readonly configService: ConfiguracionService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    // Bypass para rutas necesarias para recuperar acceso desde login
    if (
      req.originalUrl.includes('/api/auth/activar') ||
      req.originalUrl.includes('/api/configuracion/licencia') ||
      req.originalUrl.includes('/api/health')
    ) {
      return next();
    }

    const comercioEstado = await this.configService.getValor('comercio_estado');
    if (comercioEstado === 'SUSPENDIDO') {
      return res.status(403).json({
        statusCode: 403,
        message: 'Su licencia se encuentra suspendida. Comuníquese con Soporte Técnico.',
        error: 'LICENSE_SUSPENDED',
      });
    }

    const fechaStr = await this.configService.getValor('ultima_validacion_exitosa');
    
    // Si no hay fecha, significa que es la primera vez que arranca. Usamos hoy.
    let ultimaValidacion = new Date();
    
    if (!fechaStr) {
      await this.configService.setValor('ultima_validacion_exitosa', ultimaValidacion.toISOString());
    } else {
      ultimaValidacion = new Date(fechaStr);
    }

    const hoy = new Date();
    const diferenciaMs = hoy.getTime() - ultimaValidacion.getTime();
    const diferenciaDias = Math.floor(diferenciaMs / (1000 * 60 * 60 * 24)); // Redondeo hacia abajo de días pasados
    
    // De 12 a 14 días
    if (diferenciaDias >= 12 && diferenciaDias < 15) {
      res.setHeader('X-License-Warning', 'true');
    }
    
    // Bloqueo total
    if (diferenciaDias >= 15) {
      // Respondemos directamente con 403 y cortamos la petición
      return res.status(403).json({
        statusCode: 403,
        message: 'Licencia Local Expirada. Por favor conecte el equipo a internet.',
        error: 'LICENSE_OFFLINE_EXPIRED'
      });
    }

    next();
  }
}
