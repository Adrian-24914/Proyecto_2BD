const sequelize = require('../db-sequelize');
const { DataTypes } = require('sequelize');

const Categoria = sequelize.define('categorias', {
  id_categoria: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nombre: { type: DataTypes.STRING(100), allowNull: false },
  descripcion: { type: DataTypes.TEXT },
}, { timestamps: false });

const Proveedor = sequelize.define('proveedores', {
  id_proveedor: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nombre: { type: DataTypes.STRING(150), allowNull: false },
  contacto: { type: DataTypes.STRING(150) },
  telefono: { type: DataTypes.STRING(30) },
  email: { type: DataTypes.STRING(150) },
}, { timestamps: false });

const Producto = sequelize.define('productos', {
  id_producto: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nombre: { type: DataTypes.STRING(150), allowNull: false },
  descripcion: { type: DataTypes.TEXT },
  precio_unitario: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  stock: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  id_categoria: { type: DataTypes.INTEGER, allowNull: false },
  id_proveedor: { type: DataTypes.INTEGER, allowNull: false },
}, { timestamps: false });

const Cliente = sequelize.define('clientes', {
  id_cliente: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nombre: { type: DataTypes.STRING(80), allowNull: false },
  apellido: { type: DataTypes.STRING(80), allowNull: false },
  email: { type: DataTypes.STRING(150) },
  telefono: { type: DataTypes.STRING(30) },
}, { timestamps: false });

const Empleado = sequelize.define('empleados', {
  id_empleado: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nombre: { type: DataTypes.STRING(80), allowNull: false },
  apellido: { type: DataTypes.STRING(80), allowNull: false },
  cargo: { type: DataTypes.STRING(80), allowNull: false },
  email: { type: DataTypes.STRING(150) },
}, { timestamps: false });

const Usuario = sequelize.define('usuarios', {
  id_usuario: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  username: { type: DataTypes.STRING(60), allowNull: false, unique: true },
  password_hash: { type: DataTypes.STRING(200), allowNull: false },
  rol: { type: DataTypes.STRING(30), allowNull: false, defaultValue: 'cajero' },
}, { timestamps: false });

Producto.belongsTo(Categoria, { foreignKey: 'id_categoria' });
Producto.belongsTo(Proveedor, { foreignKey: 'id_proveedor' });
Categoria.hasMany(Producto, { foreignKey: 'id_categoria' });
Proveedor.hasMany(Producto, { foreignKey: 'id_proveedor' });

module.exports = { sequelize, Categoria, Proveedor, Producto, Cliente, Empleado, Usuario };
