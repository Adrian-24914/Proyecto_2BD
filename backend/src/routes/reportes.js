const express = require('express');
const { Parser } = require('json2csv');
const pool = require('../db');
const { requireRole } = require('../middleware/auth');

const router = express.Router();

router.get(
    '/resumen',
    requireRole('gerente', 'administrador', 'cajero'),
    async (req, res) => {
        try {
            const result = await pool.query('CALL obtener_resumen_ventas(NULL, NULL, NULL)');
            const row = result.rows[0];
            res.json({
                total_ventas: row.p_total_ventas,
                ingresos_mes_actual: row.p_ingresos_mes,
                producto_mas_vendido: row.p_producto_top ? { nombre: row.p_producto_top } : null,
            });
        } catch (err) {
            res.status(500).json({ error: 'Error al calcular resumen' });
        }
    }
);

router.get(
    '/ventas/csv',
    requireRole('gerente', 'administrador'),
    async (req, res) => {
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
    }
);

module.exports = router;
