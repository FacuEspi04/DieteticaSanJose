import { TurnoVenta } from 'src/common/turnos.util';
export declare class Retiro {
    id: number;
    fechaHora: Date;
    monto: number;
    motivo: string;
    turno: TurnoVenta;
    createdAt: Date;
}
