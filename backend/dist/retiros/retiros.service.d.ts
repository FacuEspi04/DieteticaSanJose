import { Repository } from 'typeorm';
import { CreateRetiroDto } from './dto/create-retiro.dto';
import { Retiro } from './retiro.entity';
export declare class RetirosService {
    private readonly retiroRepository;
    private readonly logger;
    constructor(retiroRepository: Repository<Retiro>);
    create(createRetiroDto: CreateRetiroDto): Promise<Retiro>;
    findAll(fecha?: string): Promise<Retiro[]>;
}
