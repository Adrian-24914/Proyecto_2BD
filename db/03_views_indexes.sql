-- ============================================================
-- 03_views_indexes.sql — Indices y vistas
-- ============================================================

-- Indice 1: busquedas frecuentes de productos por categoria
CREATE INDEX idx_productos_categoria ON productos(id_categoria);

-- Indice 2: filtros y reportes por rango de fechas en ventas
CREATE INDEX idx_ventas_fecha ON ventas(fecha);

-- Indice 3 (extra): joins y agregaciones por cliente
CREATE INDEX idx_ventas_cliente ON ventas(id_cliente);

-- Indice 4 (extra): joins frecuentes en detalle_ventas
CREATE INDEX idx_detalle_producto ON detalle_ventas(id_producto);

-- ------------------------------------------------------------
-- VIEW principal: resumen de ventas (consumida por el backend)
-- ------------------------------------------------------------
CREATE OR REPLACE VIEW vista_resumen_ventas AS
SELECT
    v.id_venta,
    v.fecha,
    v.total,
    c.nombre || ' ' || c.apellido AS cliente,
    e.nombre || ' ' || e.apellido AS empleado,
    COUNT(dv.id_detalle)          AS num_productos
FROM ventas v
JOIN clientes  c ON v.id_cliente  = c.id_cliente
JOIN empleados e ON v.id_empleado = e.id_empleado
LEFT JOIN detalle_ventas dv ON v.id_venta = dv.id_venta
GROUP BY v.id_venta, v.fecha, v.total, c.nombre, c.apellido, e.nombre, e.apellido;

-- ------------------------------------------------------------
-- VIEW auxiliar: stock bajo
-- ------------------------------------------------------------
CREATE OR REPLACE VIEW vista_stock_bajo AS
SELECT p.id_producto, p.nombre, p.stock, c.nombre AS categoria
FROM productos p
JOIN categorias c ON p.id_categoria = c.id_categoria
WHERE p.stock < 30
ORDER BY p.stock ASC;
