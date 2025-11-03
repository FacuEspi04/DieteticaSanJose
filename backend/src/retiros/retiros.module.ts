import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RetirosService } from './retiros.service';
import { RetirosController } from './retiros.controller';
import { Retiro } from './retiro.entity';


@Module({
  imports: [TypeOrmModule.forFeature([Retiro])], // Importa la entidad Retiro
  controllers: [RetirosController],
  providers: [RetirosService],
})
export class RetirosModule {}

