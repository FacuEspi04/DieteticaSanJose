import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // --- ESTA ES LA CONFIGURACIÓN CRUCIAL ---
  // Reemplaza el app.enableCors() simple por este bloque
  app.enableCors({
    origin: '*', // O para más seguridad: 'http://localhost:5173'
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // <-- Asegúrate de que PATCH esté aquí
    allowedHeaders: 'Content-Type, Accept',
  });
  // --- FIN DE LA CORRECCIÓN ---

  // Pipe de validación global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Ignora datos que no estén en los DTOs
      forbidNonWhitelisted: true, // Lanza error si llegan datos extra
      transform: true, // Transforma automáticamente los payloads a los tipos de DTO
    }),
  );

  await app.listen(process.env.PORT || 3000);
}
bootstrap();

