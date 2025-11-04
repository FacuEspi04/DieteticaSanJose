import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module'; 
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  
  
  app.enableCors({
    origin: '*', 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', 
    allowedHeaders: 'Content-Type, Accept',
  });
  
  //app.setGlobalPrefix('api');
  // Pipe de validación global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Ignora datos que no estén en los DTOs
      forbidNonWhitelisted: true, // Lanza error si llegan datos extra
      transform: true, // Transforma automáticamente los payloads a los tipos de DTO
    }),
  );

  await app.listen(3000);
}
bootstrap();
