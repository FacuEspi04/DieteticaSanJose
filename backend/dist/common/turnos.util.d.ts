export declare enum TurnoVenta {
    MANANA = "ma\u00F1ana",
    TARDE = "tarde",
    FUERA = "fuera"
}
export declare const determinarTurno: (fecha: Date) => TurnoVenta;
