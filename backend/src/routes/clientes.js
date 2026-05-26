const express = require('express');
const { Cliente } = require('../models');
const pool = require('../db');
const { requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/', requireRole('cajero', 'gerente', 'administrador'), async (req, res) => {
    try {
        const clientes = await Cliente.findAll({ order: [['id_cliente', 'ASC']] });
        res.json(clientes);
    } catch (err) {
        res.status(500).json({ error: 'Error al listar clientes' });
    }
});

router.post(
    '/',
    requireRole('cajero', 'gerente', 'administrador'),
    async (req, res) => {
        const { nombre, apellido, email, telefono } = req.body || {};
        if (!nombre || !apellido) return res.status(400).json({ error: 'Nombre y apellido son requeridos' });

        try {
            const result = await pool.query(
                'CALL crear_cliente($1, $2, $3, $4, NULL, NULL)',
                [nombre, apellido, email || null, telefono || null]
            );
            const row = result.rows[0];
            if (row.p_error) return res.status(400).json({ error: row.p_error });
            res.status(201).json({ id_cliente: row.p_id_cliente });
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    }
);

router.put(
    '/:id',
    requireRole('cajero', 'gerente', 'administrador'),
    async (req, res) => {
        const { nombre, apellido, email, telefono } = req.body || {};
        try {
            const [updated] = await Cliente.update(
                { nombre, apellido, email, telefono },
                { where: { id_cliente: req.params.id } }
            );
            if (updated === 0) return res.status(404).json({ error: 'Cliente no encontrado' });
            res.json({ success: true });
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    }
);

router.delete(
    '/:id',
    requireRole('gerente', 'administrador'),
    async (req, res) => {
        try {
            const result = await pool.query(
                'CALL eliminar_cliente_seguro($1, NULL, NULL)',
                [req.params.id]
            );
            const row = result.rows[0];
            if (!row.p_ok) return res.status(400).json({ error: row.p_mensaje });
            res.json({ success: true, mensaje: row.p_mensaje });
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    }
);

module.exports = router;
