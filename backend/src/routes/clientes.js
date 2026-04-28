const express = require('express');
const pool = require('../db');

const router = express.Router();

router.get('/', async (req, res) => {
    const { rows } = await pool.query('SELECT * FROM clientes ORDER BY id_cliente');
    res.json(rows);
});

router.post('/', async (req, res) => {
    const { nombre, apellido, email, telefono } = req.body || {};
    if (!nombre || !apellido) return res.status(400).json({ error: 'Nombre y apellido son requeridos' });
    try {
        const { rows } = await pool.query(
            `INSERT INTO clientes (nombre, apellido, email, telefono)
             VALUES ($1,$2,$3,$4) RETURNING *`,
            [nombre, apellido, email || null, telefono || null]
        );
        res.status(201).json(rows[0]);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.put('/:id', async (req, res) => {
    const { nombre, apellido, email, telefono } = req.body || {};
    try {
        const { rows } = await pool.query(
            `UPDATE clientes SET nombre=$1, apellido=$2, email=$3, telefono=$4
              WHERE id_cliente=$5 RETURNING *`,
            [nombre, apellido, email, telefono, req.params.id]
        );
        if (rows.length === 0) return res.status(404).json({ error: 'Cliente no encontrado' });
        res.json(rows[0]);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const { rowCount } = await pool.query('DELETE FROM clientes WHERE id_cliente=$1', [req.params.id]);
        if (rowCount === 0) return res.status(404).json({ error: 'Cliente no encontrado' });
        res.json({ success: true });
    } catch (err) {
        res.status(400).json({ error: 'No se puede eliminar: cliente con ventas asociadas' });
    }
});

module.exports = router;
