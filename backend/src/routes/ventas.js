const express = require('express');
const pool = require('../db');

const router = express.Router();

// Listado principal: consume la VIEW vista_resumen_ventas
router.get('/', async (req, res) => {
    try {
        const { rows } = await pool.query(
            'SELECT * FROM vista_resumen_ventas ORDER BY fecha DESC'
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: 'Error al listar ventas' });
    }
});

router.get('/:id', async (req, res) => {
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

// Transaccion explicita con BEGIN / COMMIT / ROLLBACK
router.post('/', async (req, res) => {
    const { id_cliente, id_empleado, items } = req.body || {};
    if (!id_cliente || !id_empleado || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: 'id_cliente, id_empleado e items son requeridos' });
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        let total = 0;

        // 1. Bloquear productos y validar stock
        for (const item of items) {
            if (!item.id_producto || !item.cantidad || item.cantidad <= 0) {
                throw new Error('Cada item requiere id_producto y cantidad > 0');
            }
            const r = await client.query(
                'SELECT id_producto, nombre, stock, precio_unitario FROM productos WHERE id_producto = $1 FOR UPDATE',
                [item.id_producto]
            );
            if (r.rows.length === 0) throw new Error(`Producto ${item.id_producto} no existe`);
            const prod = r.rows[0];
            if (prod.stock < item.cantidad) {
                throw new Error(`Stock insuficiente para "${prod.nombre}" (disponible: ${prod.stock})`);
            }
            item._precio = Number(prod.precio_unitario);
            total += item._precio * item.cantidad;
        }

        // 2. Insertar venta cabecera
        const ventaIns = await client.query(
            `INSERT INTO ventas (fecha, id_cliente, id_empleado, total)
             VALUES (NOW(), $1, $2, $3) RETURNING id_venta`,
            [id_cliente, id_empleado, total]
        );
        const id_venta = ventaIns.rows[0].id_venta;

        // 3. Insertar detalle y descontar stock
        for (const item of items) {
            await client.query(
                `INSERT INTO detalle_ventas (id_venta, id_producto, cantidad, precio_unitario_momento)
                 VALUES ($1,$2,$3,$4)`,
                [id_venta, item.id_producto, item.cantidad, item._precio]
            );
            await client.query(
                'UPDATE productos SET stock = stock - $1 WHERE id_producto = $2',
                [item.cantidad, item.id_producto]
            );
        }

        await client.query('COMMIT');
        res.status(201).json({ success: true, id_venta, total });
    } catch (err) {
        await client.query('ROLLBACK');
        res.status(400).json({ error: err.message });
    } finally {
        client.release();
    }
});

module.exports = router;
