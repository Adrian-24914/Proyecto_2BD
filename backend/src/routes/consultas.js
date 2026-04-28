const express = require('express');
const pool = require('../db');

const router = express.Router();

// 2.1 JOIN — Query 1: Detalle completo de ventas
router.get('/joins/detalle-ventas', async (req, res) => {
    const { rows } = await pool.query(`
        SELECT v.id_venta, v.fecha,
               c.nombre || ' ' || c.apellido AS cliente,
               e.nombre || ' ' || e.apellido AS empleado,
               p.nombre AS producto,
               dv.cantidad, dv.precio_unitario_momento,
               (dv.cantidad * dv.precio_unitario_momento) AS subtotal
          FROM ventas v
          JOIN clientes  c  ON v.id_cliente  = c.id_cliente
          JOIN empleados e  ON v.id_empleado = e.id_empleado
          JOIN detalle_ventas dv ON v.id_venta = dv.id_venta
          JOIN productos p  ON dv.id_producto = p.id_producto
         ORDER BY v.fecha DESC
         LIMIT 100
    `);
    res.json(rows);
});

// 2.1 JOIN — Query 2: Productos con categoria y proveedor
router.get('/joins/productos-detalle', async (req, res) => {
    const { rows } = await pool.query(`
        SELECT p.id_producto, p.nombre AS producto, p.precio_unitario, p.stock,
               cat.nombre  AS categoria,
               prov.nombre AS proveedor
          FROM productos p
          JOIN categorias  cat  ON p.id_categoria = cat.id_categoria
          JOIN proveedores prov ON p.id_proveedor = prov.id_proveedor
         ORDER BY cat.nombre, p.nombre
    `);
    res.json(rows);
});

// 2.1 JOIN — Query 3: Historial de compras por cliente
router.get('/joins/historial-clientes', async (req, res) => {
    const { rows } = await pool.query(`
        SELECT c.nombre || ' ' || c.apellido AS cliente,
               COUNT(v.id_venta) AS total_compras,
               SUM(v.total)      AS monto_total,
               MAX(v.fecha)      AS ultima_compra
          FROM clientes c
          JOIN ventas v ON c.id_cliente = v.id_cliente
         GROUP BY c.id_cliente, c.nombre, c.apellido
         ORDER BY monto_total DESC
    `);
    res.json(rows);
});

// 2.2 SUBQUERY — Query 4: Productos nunca vendidos (NOT EXISTS)
router.get('/subqueries/no-vendidos', async (req, res) => {
    const { rows } = await pool.query(`
        SELECT p.id_producto, p.nombre, p.stock, cat.nombre AS categoria
          FROM productos p
          JOIN categorias cat ON p.id_categoria = cat.id_categoria
         WHERE NOT EXISTS (
             SELECT 1 FROM detalle_ventas dv WHERE dv.id_producto = p.id_producto
         )
         ORDER BY p.nombre
    `);
    res.json(rows);
});

// 2.2 SUBQUERY — Query 5: Clientes que compraron mas que el promedio
router.get('/subqueries/clientes-sobre-promedio', async (req, res) => {
    const { rows } = await pool.query(`
        SELECT c.nombre || ' ' || c.apellido AS cliente,
               SUM(v.total) AS total_gastado
          FROM clientes c
          JOIN ventas v ON c.id_cliente = v.id_cliente
         GROUP BY c.id_cliente, c.nombre, c.apellido
        HAVING SUM(v.total) > (
            SELECT AVG(total_por_cliente) FROM (
                SELECT SUM(total) AS total_por_cliente
                  FROM ventas
                 GROUP BY id_cliente
            ) sub
        )
         ORDER BY total_gastado DESC
    `);
    res.json(rows);
});

// 2.3 GROUP BY + HAVING + agregacion: Ventas por mes
router.get('/agregacion/ventas-por-mes', async (req, res) => {
    const { rows } = await pool.query(`
        SELECT DATE_TRUNC('month', fecha) AS mes,
               COUNT(*)   AS num_ventas,
               SUM(total) AS ingresos,
               AVG(total) AS ticket_promedio,
               MAX(total) AS venta_maxima
          FROM ventas
         GROUP BY DATE_TRUNC('month', fecha)
        HAVING COUNT(*) >= 2
         ORDER BY mes DESC
    `);
    res.json(rows);
});

// 2.4 CTE: Top productos mas vendidos con RANK()
router.get('/cte/top-productos', async (req, res) => {
    const { rows } = await pool.query(`
        WITH ventas_por_producto AS (
            SELECT p.id_producto, p.nombre,
                   SUM(dv.cantidad) AS unidades_vendidas,
                   SUM(dv.cantidad * dv.precio_unitario_momento) AS ingresos_generados
              FROM productos p
              JOIN detalle_ventas dv ON p.id_producto = dv.id_producto
             GROUP BY p.id_producto, p.nombre
        ),
        ranking AS (
            SELECT *, RANK() OVER (ORDER BY unidades_vendidas DESC) AS posicion
              FROM ventas_por_producto
        )
        SELECT posicion, nombre, unidades_vendidas, ingresos_generados
          FROM ranking
         ORDER BY posicion
         LIMIT 10
    `);
    res.json(rows);
});

// 2.5 VIEW auxiliar: stock bajo
router.get('/vistas/stock-bajo', async (req, res) => {
    const { rows } = await pool.query('SELECT * FROM vista_stock_bajo');
    res.json(rows);
});

module.exports = router;
