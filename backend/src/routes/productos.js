const express = require('express');
const { Producto, Categoria, Proveedor } = require('../models');
const pool = require('../db');
const { requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const productos = await Producto.findAll({
            include: [
                { model: Categoria, as: 'categoria', attributes: ['nombre'] },
                { model: Proveedor, as: 'proveedor', attributes: ['nombre'] },
            ],
            order: [['id_producto', 'ASC']],
        });

        const rows = productos.map((p) => ({
            id_producto: p.id_producto,
            nombre: p.nombre,
            descripcion: p.descripcion,
            precio_unitario: p.precio_unitario,
            stock: p.stock,
            id_categoria: p.id_categoria,
            id_proveedor: p.id_proveedor,
            categoria: p.categoria?.nombre || '',
            proveedor: p.proveedor?.nombre || '',
        }));

        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al listar productos' });
    }
});

router.post(
    '/',
    requireRole('bodeguero', 'gerente', 'administrador'),
    async (req, res) => {
        const { nombre, descripcion, precio_unitario, stock, id_categoria, id_proveedor } = req.body || {};
        if (!nombre || precio_unitario == null || stock == null || !id_categoria || !id_proveedor) {
            return res.status(400).json({ error: 'Campos requeridos faltantes' });
        }

        try {
            const result = await pool.query(
                'CALL crear_producto($1, $2, $3, $4, $5, $6, NULL, NULL)',
                [nombre, descripcion || null, precio_unitario, stock, id_categoria, id_proveedor]
            );
            const row = result.rows[0];
            if (row.p_error) return res.status(400).json({ error: row.p_error });
            res.status(201).json({ id_producto: row.p_id_producto });
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    }
);

router.put(
    '/:id',
    requireRole('bodeguero', 'gerente', 'administrador'),
    async (req, res) => {
        const { nombre, descripcion, precio_unitario, stock, id_categoria, id_proveedor } = req.body || {};
        try {
            const [updated] = await Producto.update(
                { nombre, descripcion, precio_unitario, stock, id_categoria, id_proveedor },
                { where: { id_producto: req.params.id } }
            );
            if (updated === 0) return res.status(404).json({ error: 'Producto no encontrado' });
            res.json({ success: true });
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    }
);

router.delete(
    '/:id',
    requireRole('administrador'),
    async (req, res) => {
        try {
            const deleted = await Producto.destroy({ where: { id_producto: req.params.id } });
            if (deleted === 0) return res.status(404).json({ error: 'Producto no encontrado' });
            res.json({ success: true });
        } catch (err) {
            res.status(400).json({ error: 'No se puede eliminar: producto referenciado en ventas' });
        }
    }
);

module.exports = router;
