const express = require('express');
const pool = require('../db');

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const { rows } = await pool.query(`
            SELECT p.id_producto, p.nombre, p.descripcion, p.precio_unitario,
                   p.stock, p.id_categoria, p.id_proveedor,
                   c.nombre AS categoria, pr.nombre AS proveedor
            FROM productos p
            JOIN categorias c  ON p.id_categoria = c.id_categoria
            JOIN proveedores pr ON p.id_proveedor = pr.id_proveedor
            ORDER BY p.id_producto
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: 'Error al listar productos' });
    }
});

router.post('/', async (req, res) => {
    const { nombre, descripcion, precio_unitario, stock, id_categoria, id_proveedor } = req.body || {};
    if (!nombre || precio_unitario == null || stock == null || !id_categoria || !id_proveedor) {
        return res.status(400).json({ error: 'Campos requeridos faltantes' });
    }
    if (Number(precio_unitario) < 0 || Number(stock) < 0) {
        return res.status(400).json({ error: 'Precio y stock no pueden ser negativos' });
    }
    try {
        const { rows } = await pool.query(
            `INSERT INTO productos (nombre, descripcion, precio_unitario, stock, id_categoria, id_proveedor)
             VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
            [nombre, descripcion || null, precio_unitario, stock, id_categoria, id_proveedor]
        );
        res.status(201).json(rows[0]);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { nombre, descripcion, precio_unitario, stock, id_categoria, id_proveedor } = req.body || {};
    try {
        const { rows } = await pool.query(
            `UPDATE productos
                SET nombre=$1, descripcion=$2, precio_unitario=$3,
                    stock=$4, id_categoria=$5, id_proveedor=$6
              WHERE id_producto=$7
              RETURNING *`,
            [nombre, descripcion, precio_unitario, stock, id_categoria, id_proveedor, id]
        );
        if (rows.length === 0) return res.status(404).json({ error: 'Producto no encontrado' });
        res.json(rows[0]);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const { rowCount } = await pool.query('DELETE FROM productos WHERE id_producto=$1', [req.params.id]);
        if (rowCount === 0) return res.status(404).json({ error: 'Producto no encontrado' });
        res.json({ success: true });
    } catch (err) {
        res.status(400).json({ error: 'No se puede eliminar: producto referenciado en ventas' });
    }
});

module.exports = router;
