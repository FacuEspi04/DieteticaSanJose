import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // --- AÑADE ESTA LÍNEA AQUÍ ---
  // Esto le da permiso al frontend para que pueda
  // hacerle peticiones al backend.
  app.enableCors();

  await app.listen(process.env.PORT || 3000);
}
bootstrap();
