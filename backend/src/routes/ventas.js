const express = require('express');
const pool = require('../db');
const { requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/', requireRole('cajero', 'gerente', 'administrador'), async (req, res) => {
    try {
        const { rows } = await pool.query(
            'SELECT * FROM vista_resumen_ventas ORDER BY fecha DESC'
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: 'Error al listar ventas' });
    }
});

router.get('/:id', requireRole('cajero', 'gerente', 'administrador'), async (req, res) => {
    try {
        const venta = await pool.query(
            'SELECT * FROM vista_resumen_ventas WHERE id_venta = $1',
            [req.params.id]
        );
        if (venta.rows.length === 0) return res.status(404).json({ error: 'Venta no encontrada' });
        const detalle = await pool.query(`
            SELECT dv.id_detalle, dv.cantidad, dv.precio_unitario_momento,
                   p.nombre AS producto,
                   (dv.cantidad * dv.precio_unitario_momento) AS subtotal
              FROM detalle_ventas dv
              JOIN productos p ON dv.id_producto = p.id_producto
             WHERE dv.id_venta = $1
        `, [req.params.id]);
        res.json({ ...venta.rows[0], detalle: detalle.rows });
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener venta' });
    }
});

router.post(
    '/',
    requireRole('cajero', 'gerente', 'administrador'),
    async (req, res) => {
        const { id_cliente, id_empleado, items } = req.body || {};
        if (!id_cliente || !id_empleado || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: 'id_cliente, id_empleado e items son requeridos' });
        }

        try {
            const itemsJson = JSON.stringify(items);
            const result = await pool.query(
                'CALL registrar_venta($1, $2, $3::json, NULL, NULL, NULL)',
                [id_cliente, id_empleado, itemsJson]
            );
            const row = result.rows[0];
            if (row.p_error) return res.status(400).json({ error: row.p_error });

            res.status(201).json({
                success: true,
                id_venta: row.p_id_venta,
                total: row.p_total,
            });
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    }
);

module.exports = router;
