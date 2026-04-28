const express = require('express');
const { Parser } = require('json2csv');
const pool = require('../db');

const router = express.Router();

router.get('/resumen', async (req, res) => {
    try {
        const totalVentas = await pool.query('SELECT COUNT(*)::int AS total FROM ventas');
        const ingresosMes = await pool.query(`
            SELECT COALESCE(SUM(total),0)::numeric(12,2) AS ingresos
              FROM ventas
             WHERE DATE_TRUNC('month', fecha) = DATE_TRUNC('month', NOW())
        `);
        const productoTop = await pool.query(`
            SELECT p.nombre, SUM(dv.cantidad)::int AS unidades
              FROM productos p
              JOIN detalle_ventas dv ON p.id_producto = dv.id_producto
             GROUP BY p.nombre
             ORDER BY unidades DESC
             LIMIT 1
        `);
        res.json({
            total_ventas: totalVentas.rows[0].total,
            ingresos_mes_actual: ingresosMes.rows[0].ingresos,
            producto_mas_vendido: productoTop.rows[0] || null,
        });
    } catch (err) {
        res.status(500).json({ error: 'Error al calcular resumen' });
    }
});

router.get('/ventas/csv', async (req, res) => {
    try {
        const { rows } = await pool.query(
            'SELECT * FROM vista_resumen_ventas ORDER BY fecha DESC'
        );
        const parser = new Parser();
        const csv = parser.parse(rows);
        res.header('Content-Type', 'text/csv');
        res.attachment('reporte_ventas.csv');
        res.send(csv);
    } catch (err) {
        res.status(500).json({ error: 'Error al generar CSV' });
    }
});

module.exports = router;
