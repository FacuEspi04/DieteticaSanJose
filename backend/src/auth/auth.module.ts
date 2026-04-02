import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AuthController } from './auth.controller';
import { ConfiguracionModule } from '../configuracion/configuracion.module';

@Module({
  imports: [
    HttpModule,
    ConfiguracionModule
  ],
  controllers: [AuthController],
})
export class AuthModule {}
