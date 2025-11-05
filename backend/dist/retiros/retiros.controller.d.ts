import { RetirosService } from './retiros.service';
import { CreateRetiroDto } from './dto/create-retiro.dto';
export declare class RetirosController {
    private readonly retirosService;
    constructor(retirosService: RetirosService);
    create(createRetiroDto: CreateRetiroDto): Promise<import("./retiro.entity").Retiro>;
    findAll(fecha?: string): Promise<import("./retiro.entity").Retiro[]>;
}
