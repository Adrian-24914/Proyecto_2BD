const express = require('express');
const pool = require('../db');

const router = express.Router();

router.get('/', async (req, res) => {
    const { rows } = await pool.query(
        'SELECT id_empleado, nombre, apellido, cargo, email FROM empleados ORDER BY apellido, nombre'
    );
    res.json(rows);
});

module.exports = router;
