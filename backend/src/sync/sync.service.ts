import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { firstValueFrom } from 'rxjs';

import { Venta } from '../ventas/venta.entity';
import { Articulo } from '../articulos/articulo.entity';
import { Cliente } from '../clientes/cliente.entity';
import { Retiro } from '../retiros/retiro.entity';
import { Categoria } from '../categorias/categoria.entity';
import { Marca } from '../marcas/marca.entity';
import { ConfiguracionService } from '../configuracion/configuracion.service';

@Injectable()
export class SyncService {
  private readonly logger = new Logger(SyncService.name);
  private isSyncing = false;

  constructor(
    private readonly httpService: HttpService,
    @InjectRepository(Venta) private readonly ventaRepository: Repository<Venta>,
    @InjectRepository(Articulo) private readonly articuloRepository: Repository<Articulo>,
    @InjectRepository(Cliente) private readonly clienteRepository: Repository<Cliente>,
    @InjectRepository(Retiro) private readonly retiroRepository: Repository<Retiro>,
    @InjectRepository(Categoria) private readonly categoriaRepository: Repository<Categoria>,
    @InjectRepository(Marca) private readonly marcaRepository: Repository<Marca>,
    private readonly configuracionService: ConfiguracionService,
  ) {}

  @Cron(CronExpression.EVERY_30_SECONDS)
  async handleCron() {
    if (this.isSyncing) return;
    this.isSyncing = true;

    try {
      // Orden importante por relaciones FK:
      // 1) Tablas padre, 2) Tablas hijas que dependen de ellas
      await this.syncEntity(this.categoriaRepository as any, 'categorias');
      await this.syncEntity(this.marcaRepository as any, 'marcas');
      await this.syncEntity(this.articuloRepository, 'articulos');
      await this.syncEntity(this.clienteRepository, 'clientes');
      await this.syncEntity(this.ventaRepository, 'ventas');
      await this.syncEntity(this.retiroRepository, 'retiros');

      let connectedToCloud = false;
      const supabaseUrl = process.env.SUPABASE_URL;
      const supabaseKey = process.env.SUPABASE_KEY;
      const dniComercio = await this.configuracionService.getValor('dni_comercio');

      if (supabaseUrl && supabaseKey && dniComercio) {
        const baseUrl = supabaseUrl.endsWith('/') ? supabaseUrl.slice(0, -1) : supabaseUrl;
        
        try {
           const pingResponse = await firstValueFrom(
             this.httpService.get(`${baseUrl}/rest/v1/comercios_licencias?dni=eq.${dniComercio}&select=*`, {
                headers: {
                  apikey: supabaseKey,
                  Authorization: `Bearer ${supabaseKey}`,
                }
             })
           );
           
           if (pingResponse.status >= 200 && pingResponse.status < 300 && pingResponse.data && pingResponse.data.length > 0) {
              connectedToCloud = true;
              const comercio = pingResponse.data[0];
              
              // Estado suspendido se maneja de forma explícita (separado de offline expirado)
               if (comercio.estado === 'SUSPENDIDO') {
                  this.logger.warn('Se detectó suspensión en la nube.');
                  await this.configuracionService.setValor('comercio_estado', 'SUSPENDIDO');
               } else {
                  await this.configuracionService.setValor('comercio_estado', 'ACTIVO');
                  // Si está activo, renovamos el check de conexión
                  await this.configuracionService.setValor('ultima_validacion_exitosa', new Date().toISOString());
                  
                  // Si tiene su fecha configurada, la volcamos directamente al disco local para destrabar el cartel visual
                  if (comercio.fecha_vencimiento_abono) {
                      await this.configuracionService.setValor('fecha_vencimiento_abono', comercio.fecha_vencimiento_abono);
                  }
              }
           }
        } catch (err) {
           this.logger.warn(`Error al pingear el servidor para validar licencia.`);
        }
      }

    } catch (error) {
      this.logger.warn(`Sincronización pausada: ${error.message}`);
    } finally {
      this.isSyncing = false;
    }
  }

  private async syncEntity<T extends { id: number }>(
    repository: Repository<T>,
    tableName: string,
  ) {
    const hasSyncColumn = repository.metadata.columns.some(
      (column) => column.propertyName === 'sincronizado',
    );

    // 1. Consultar a la base de datos local
    const pendientes = hasSyncColumn
      ? await repository.find({
          where: { sincronizado: false } as any,
          take: 50,
        })
      : await repository.find({
          take: 200,
        });

    // 2. Si no hay registros pendientes, terminar la ejecución silenciosamente
    if (pendientes.length === 0) return;

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      this.logger.warn(`Credenciales SUPABASE_URL o SUPABASE_KEY no configuradas. Ignorando sincronización.`);
      return;
    }

    try {
      // 3. Preparar payload con nombres reales de columnas (snake_case) para Supabase
      const payload = pendientes.map((item) => this.toDatabasePayload(item, repository));

      // Si la URL principal termina en /, evitamos //rest/v1
      const baseUrl = supabaseUrl.endsWith('/') ? supabaseUrl.slice(0, -1) : supabaseUrl;

      // POST / UPSERT a Supabase
      const response = await firstValueFrom(
        this.httpService.post(`${baseUrl}/rest/v1/${tableName}`, payload, {
          headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
            Prefer: 'resolution=merge-duplicates',
          },
        }),
      );

      // 4. Si la respuesta de la nube es exitosa (HTTP 200/201/204), actualizar registros locales
      if (response.status >= 200 && response.status < 300) {
        // En TypeORM, `update` o `save` por ID cambia la propiedad
        if (hasSyncColumn) {
          await repository.update(
            pendientes.map((p) => p.id),
            { sincronizado: true } as any,
          );
        }
        this.logger.log(`Sincronizados ${pendientes.length} registros en la tabla '${tableName}'`);
      }
    } catch (error: any) {
      // 5. Diagnóstico detallado para errores de Supabase
      const status = error?.response?.status;
      const statusText = error?.response?.statusText;
      const responseData = error?.response?.data;
      const message = error?.message ?? 'Sin conexión';
      const mensaje = statusText ?? message;

      this.logger.warn(`Sincronización pausada para ${tableName}: ${mensaje}`);
      this.logger.warn(
        `[SyncService] ${tableName} -> status=${status ?? 'N/A'} statusText=${statusText ?? 'N/A'} pendientes=${pendientes.length}`,
      );
      if (responseData !== undefined) {
        this.logger.warn(
          `[SyncService] ${tableName} -> response=${JSON.stringify(responseData)}`,
        );
      }

      // Lanza el error para cortar el flujo principal
      throw new Error(`Fallo en la sincronización de ${tableName} - ${mensaje}`);
    }
  }

  private toDatabasePayload<T extends { id: number }>(
    item: T,
    repository: Repository<T>,
  ): Record<string, unknown> {
    const row: Record<string, unknown> = {};

    for (const column of repository.metadata.columns) {
      if (column.propertyName === 'sincronizado') continue;
      row[column.databaseName] = (item as any)[column.propertyName];
    }

    return row;
  }
}
