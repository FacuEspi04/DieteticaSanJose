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
      // ═══════════════════════════════════════════════════════════════════════
      // PASO 0: VERIFICAR ESTADO LOCAL PRIMERO (Bomba de Tiempo - Crítico)
      // ═══════════════════════════════════════════════════════════════════════
      const estadoLocalPrevio = await this.configuracionService.getValor('comercio_estado');
      if (estadoLocalPrevio === 'SUSPENDIDO') {
        this.logger.warn('⛔ Estado local SUSPENDIDO. Abortando sincronización.');
        return;
      }

      // ═══════════════════════════════════════════════════════════════════════
      // PASO 1: VERIFICAR LICENCIA EN SUPABASE
      // ═══════════════════════════════════════════════════════════════════════
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
              },
            }),
          );

          if (pingResponse.status >= 200 && pingResponse.status < 300 && pingResponse.data?.length > 0) {
            const comercio = pingResponse.data[0];

            // ⛔ SUSPENDIDO: Bloquear INMEDIATAMENTE y NO sincronizar NADA
            if (comercio.estado === 'SUSPENDIDO') {
              this.logger.warn('⛔ Licencia SUSPENDIDA detectada. Bloqueando sistema y abortando sincronización.');
              await this.configuracionService.setValor('comercio_estado', 'SUSPENDIDO');
              await this.configuracionService.setValor('ultima_validacion_exitosa', '');
              return;
            }

            // ✅ ACTIVO: Actualizar estado y continuar con sincronización
            await this.configuracionService.setValor('comercio_estado', 'ACTIVO');
            await this.configuracionService.setValor('ultima_validacion_exitosa', new Date().toISOString());

            if (comercio.fecha_vencimiento_abono) {
              await this.configuracionService.setValor('fecha_vencimiento_abono', comercio.fecha_vencimiento_abono);
            }
          }
        } catch (err) {
          this.logger.warn('Error al pingear Supabase. Verificando estado local...');
          // Si no hay conexión, verificar estado local guardado
          const estadoLocal = await this.configuracionService.getValor('comercio_estado');
          if (estadoLocal === 'SUSPENDIDO') {
            this.logger.warn('⛔ Sin conexión pero estado local es SUSPENDIDO. Abortando.');
            return;
          }
        }
      }

      // ═══════════════════════════════════════════════════════════════════════
      // PASO 2: SINCRONIZAR TABLAS (Solo si llegamos aquí = licencia OK)
      // ═══════════════════════════════════════════════════════════════════════
      // 1) Tablas padre, 2) Tablas hijas que dependen de ellas
      await this.syncEntity(this.categoriaRepository as any, 'categorias');
      await this.syncEntity(this.marcaRepository as any, 'marcas');
      await this.syncEntity(this.articuloRepository, 'articulos');
      await this.syncEntity(this.clienteRepository, 'clientes');
      await this.syncEntity(this.ventaRepository, 'ventas', 'numero_venta');
      await this.syncEntity(this.retiroRepository, 'retiros');

    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.warn(`Sincronización pausada: ${message}`);
    } finally {
      this.isSyncing = false;
    }
  }

  private async syncEntity<T extends { id: number }>(
    repository: Repository<T>,
    tableName: string,
    onConflictColumn?: string,
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
      const onConflictQuery = onConflictColumn
        ? `?on_conflict=${encodeURIComponent(onConflictColumn)}`
        : '';

      // POST / UPSERT a Supabase
      const response = await firstValueFrom(
        this.httpService.post(`${baseUrl}/rest/v1/${tableName}${onConflictQuery}`, payload, {
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
      // Convertir camelCase a snake_case para Supabase
      const snakeCaseKey = this.toSnakeCase(column.propertyName);
      row[snakeCaseKey] = (item as any)[column.propertyName];
    }

    return row;
  }

  // Convierte camelCase a snake_case (ej: "numeroVenta" → "numero_venta")
  private toSnakeCase(str: string): string {
    return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
  }
}
