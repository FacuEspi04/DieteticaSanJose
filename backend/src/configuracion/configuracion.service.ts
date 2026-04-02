import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Configuracion } from './configuracion.entity';

@Injectable()
export class ConfiguracionService {
  private readonly logger = new Logger(ConfiguracionService.name);

  constructor(
    @InjectRepository(Configuracion)
    private readonly configRepository: Repository<Configuracion>,
  ) {}

  async getValor(clave: string): Promise<string | null> {
    const registro = await this.configRepository.findOne({ where: { clave } });
    return registro ? registro.valor : null;
  }

  async setValor(clave: string, valor: string): Promise<void> {
    let registro = await this.configRepository.findOne({ where: { clave } });
    if (!registro) {
      registro = this.configRepository.create({ clave, valor });
    } else {
      registro.valor = valor;
    }
    await this.configRepository.save(registro);
  }
}
