import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AppModule } from '../app.module';

async function bootstrap() {
  const logger = new Logger('ResetDB');
  logger.log('Iniciando limpieza de datos transaccionales...');

  // Creamos el contexto de la aplicación de NestJS sin levantar el servidor HTTP
  const app = await NestFactory.createApplicationContext(AppModule);
  
  // Obtenemos la conexión activa a TypeORM/SQLite
  const dataSource = app.get(DataSource);

  // Lista de las tablas a limpiar
  // ¡No se incluyen configuracion, articulos, marcas ni categorias!
  const tablasTransaccionales = [
    'venta_detalles',
    'ventas',
    'retiros',
    'pedido_detalles',
    'pedidos',
    'clientes',
    'proveedores'
  ];

  // Desactivamos temporalmente el chequeo de Foreign Keys para poder vaciar con libertad (importante en SQLite)
  await dataSource.query(`PRAGMA foreign_keys = OFF;`);

  for (const tabla of tablasTransaccionales) {
    try {
      // 1. Borramos todo el contenido de la tabla transaccional
      await dataSource.query(`DELETE FROM ${tabla};`);
      
      // 2. Reiniciamos el autoincremental de la tabla
      // En este caso empleamos la instrucción dictaminada usando sqlite_sequence
      await dataSource.query(`UPDATE sqlite_sequence SET seq = 0 WHERE name = '${tabla}';`);
      
      logger.log(`✅ Tabla limpiada y secuencia reiniciada: ${tabla}`);
    } catch (error) {
      // Algunas tablas podrían no existir en sqlite_sequence si no tienen registros previos,
      // lanzamos un warning en vez de quebrar el script entero.
      logger.warn(`⚠️ Aviso procesando tabla ${tabla}: ${error.message}`);
    }
  }

  // Reactivamos chequeo de Foreign Keys
  await dataSource.query(`PRAGMA foreign_keys = ON;`);

  logger.log('✨ Limpieza finalizada correctamente.');
  await app.close();
}

bootstrap();
