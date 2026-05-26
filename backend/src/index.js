require('dotenv').config();
const express = require('express');
const cors = require('cors');

const { sequelize } = require('./models');

const auth        = require('./routes/auth');
const productos   = require('./routes/productos');
const clientes    = require('./routes/clientes');
const categorias  = require('./routes/categorias');
const proveedores = require('./routes/proveedores');
const empleados   = require('./routes/empleados');
const ventas      = require('./routes/ventas');
const consultas   = require('./routes/consultas');
const reportes    = require('./routes/reportes');

const { authMiddleware } = require('./middleware/auth');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.use('/api/auth', auth);

app.use('/api/productos',   authMiddleware, productos);
app.use('/api/clientes',    authMiddleware, clientes);
app.use('/api/categorias',  authMiddleware, categorias);
app.use('/api/proveedores', authMiddleware, proveedores);
app.use('/api/empleados',   authMiddleware, empleados);
app.use('/api/ventas',      authMiddleware, ventas);
app.use('/api/consultas',   authMiddleware, consultas);
app.use('/api/reportes',    authMiddleware, reportes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

const PORT = process.env.PORT || 4000;

sequelize.authenticate()
  .then(() => console.log('[Sequelize] Conexion establecida'))
  .catch((err) => console.error('[Sequelize] Error de conexion:', err));

app.listen(PORT, () => console.log(`Backend escuchando en :${PORT}`));
