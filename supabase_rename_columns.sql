-- ═══════════════════════════════════════════════════════════════════════════════════
-- SCRIPT SQL: Renombrar columnas camelCase → snake_case en Supabase
-- ═══════════════════════════════════════════════════════════════════════════════════
-- Ejecutar en: Supabase SQL Editor (Dashboard > SQL Editor > New Query)
-- Fecha: 2026-04-03
-- ═══════════════════════════════════════════════════════════════════════════════════

-- ┌─────────────────────────────────────────────────────────────────────────────────┐
-- │ PASO 1: Eliminar índices que usan columnas con comillas                         │
-- └─────────────────────────────────────────────────────────────────────────────────┘

DROP INDEX IF EXISTS idx_ventas_numeroVenta;

-- ┌─────────────────────────────────────────────────────────────────────────────────┐
-- │ PASO 2: Renombrar columnas en tabla VENTAS                                      │
-- └─────────────────────────────────────────────────────────────────────────────────┘

ALTER TABLE ventas RENAME COLUMN "numeroVenta" TO numero_venta;
ALTER TABLE ventas RENAME COLUMN "fechaHora" TO fecha_hora;
ALTER TABLE ventas RENAME COLUMN "clienteNombre" TO cliente_nombre;
ALTER TABLE ventas RENAME COLUMN "formaPago" TO forma_pago;

-- ┌─────────────────────────────────────────────────────────────────────────────────┐
-- │ PASO 3: Renombrar columnas en tabla VENTA_DETALLES                              │
-- └─────────────────────────────────────────────────────────────────────────────────┘

ALTER TABLE venta_detalles RENAME COLUMN "precioUnitario" TO precio_unitario;

-- ┌─────────────────────────────────────────────────────────────────────────────────┐
-- │ PASO 4: Renombrar columnas en tabla RETIROS                                     │
-- └─────────────────────────────────────────────────────────────────────────────────┘

ALTER TABLE retiros RENAME COLUMN "fechaHora" TO fecha_hora;
ALTER TABLE retiros RENAME COLUMN "formaPago" TO forma_pago;

-- ┌─────────────────────────────────────────────────────────────────────────────────┐
-- │ PASO 5: Recrear índice con nombre correcto                                      │
-- └─────────────────────────────────────────────────────────────────────────────────┘

CREATE INDEX idx_ventas_numero_venta ON ventas(numero_venta);

-- ═══════════════════════════════════════════════════════════════════════════════════
-- VERIFICACIÓN: Ejecuta esto después para confirmar los cambios
-- ═══════════════════════════════════════════════════════════════════════════════════

-- SELECT column_name FROM information_schema.columns WHERE table_name = 'ventas' ORDER BY ordinal_position;
-- SELECT column_name FROM information_schema.columns WHERE table_name = 'venta_detalles' ORDER BY ordinal_position;
-- SELECT column_name FROM information_schema.columns WHERE table_name = 'retiros' ORDER BY ordinal_position;
