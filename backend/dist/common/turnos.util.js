"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.determinarTurno = exports.TurnoVenta = void 0;
var TurnoVenta;
(function (TurnoVenta) {
    TurnoVenta["MANANA"] = "ma\u00F1ana";
    TurnoVenta["TARDE"] = "tarde";
    TurnoVenta["FUERA"] = "fuera";
})(TurnoVenta || (exports.TurnoVenta = TurnoVenta = {}));
const determinarTurno = (fecha) => {
    const hora = fecha.getHours();
    const minutos = fecha.getMinutes();
    const tiempoEnMinutos = hora * 60 + minutos;
    if (tiempoEnMinutos >= 540 && tiempoEnMinutos <= 810)
        return TurnoVenta.MANANA;
    if (tiempoEnMinutos >= 990 && tiempoEnMinutos <= 1260)
        return TurnoVenta.TARDE;
    return TurnoVenta.FUERA;
};
exports.determinarTurno = determinarTurno;
//# sourceMappingURL=turnos.util.js.map