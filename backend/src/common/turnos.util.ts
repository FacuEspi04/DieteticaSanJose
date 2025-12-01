// Define el Enum para los turnos
export enum TurnoVenta {
  MANANA = 'mañana',
  TARDE = 'tarde',
  FUERA = 'fuera',
}

/**
 * Determina el turno de la venta (mañana, tarde, fuera).
 * Asume que la fecha 'new Date()' está en la zona horaria local del servidor.
 */
export const determinarTurno = (fecha: Date): TurnoVenta => {
  const hora = fecha.getHours();
  const minutos = fecha.getMinutes();
  const tiempoEnMinutos = hora * 60 + minutos;

  // Mañana: 8:30 - 13:30 (510 - 810 minutos)
  if (tiempoEnMinutos >= 510 && tiempoEnMinutos <= 810)
    return TurnoVenta.MANANA;
    
  // Tarde: 16:30 - 21:30 (990 - 1290 minutos)
  if (tiempoEnMinutos >= 990 && tiempoEnMinutos <= 1290)
    return TurnoVenta.TARDE;

  return TurnoVenta.FUERA;
};

