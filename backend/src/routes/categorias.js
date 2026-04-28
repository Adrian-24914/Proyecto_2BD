const express = require('express');
const pool = require('../db');

const router = express.Router();

router.get('/', async (req, res) => {
    const { rows } = await pool.query('SELECT * FROM categorias ORDER BY nombre');
    res.json(rows);
});

module.exports = router;
