-- ============================================================
-- 01_ddl.sql — Esquema relacional (Proyecto 2 BD1)
-- ============================================================
-- Justificacion de normalizacion (1FN -> 2FN -> 3FN):
--
-- 1FN: Todos los atributos son atomicos (sin listas ni grupos repetidos).
--      Ej: telefono, email son valores unicos por fila.
--
-- 2FN: Toda PK es simple (SERIAL), por lo que no hay dependencias parciales.
--      detalle_ventas usa id_detalle como PK simple para evitar PK compuesta.
--
-- 3FN: No existen dependencias transitivas.
--      - productos.id_categoria -> categorias (no se duplica nombre/descripcion).
--      - productos.id_proveedor -> proveedores (no se duplica contacto).
--      - ventas guarda id_cliente / id_empleado (FK), no datos derivados.
--      - detalle_ventas guarda precio_unitario_momento porque el precio del
--        producto puede cambiar; este campo es un hecho historico, no
--        una dependencia transitiva.
--
-- Dependencias funcionales documentadas:
--   categorias:     id_categoria -> nombre, descripcion
--   proveedores:    id_proveedor -> nombre, contacto, telefono, email
--   productos:      id_producto  -> nombre, descripcion, precio_unitario,
--                                   stock, id_categoria, id_proveedor
--   empleados:      id_empleado  -> nombre, apellido, cargo, email
--   clientes:       id_cliente   -> nombre, apellido, email, telefono
--   ventas:         id_venta     -> fecha, id_cliente, id_empleado, total
--   detalle_ventas: id_detalle   -> id_venta, id_producto, cantidad,
--                                   precio_unitario_momento
--   usuarios:       id_usuario   -> username, password_hash, rol
-- ============================================================

DROP TABLE IF EXISTS detalle_ventas CASCADE;
DROP TABLE IF EXISTS ventas         CASCADE;
DROP TABLE IF EXISTS productos      CASCADE;
DROP TABLE IF EXISTS categorias     CASCADE;
DROP TABLE IF EXISTS proveedores    CASCADE;
DROP TABLE IF EXISTS empleados      CASCADE;
DROP TABLE IF EXISTS clientes       CASCADE;
DROP TABLE IF EXISTS usuarios       CASCADE;

CREATE TABLE categorias (
    id_categoria SERIAL PRIMARY KEY,
    nombre       VARCHAR(100) NOT NULL UNIQUE,
    descripcion  TEXT
);

CREATE TABLE proveedores (
    id_proveedor SERIAL PRIMARY KEY,
    nombre       VARCHAR(150) NOT NULL,
    contacto     VARCHAR(150),
    telefono     VARCHAR(30),
    email        VARCHAR(150)
);

CREATE TABLE productos (
    id_producto      SERIAL PRIMARY KEY,
    nombre           VARCHAR(150) NOT NULL,
    descripcion      TEXT,
    precio_unitario  NUMERIC(10,2) NOT NULL CHECK (precio_unitario >= 0),
    stock            INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    id_categoria     INTEGER NOT NULL,
    id_proveedor     INTEGER NOT NULL,
    CONSTRAINT fk_productos_categoria
        FOREIGN KEY (id_categoria) REFERENCES categorias(id_categoria)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_productos_proveedor
        FOREIGN KEY (id_proveedor) REFERENCES proveedores(id_proveedor)
        ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE empleados (
    id_empleado SERIAL PRIMARY KEY,
    nombre      VARCHAR(80) NOT NULL,
    apellido    VARCHAR(80) NOT NULL,
    cargo       VARCHAR(80) NOT NULL,
    email       VARCHAR(150) UNIQUE
);

CREATE TABLE clientes (
    id_cliente SERIAL PRIMARY KEY,
    nombre     VARCHAR(80) NOT NULL,
    apellido   VARCHAR(80) NOT NULL,
    email      VARCHAR(150) UNIQUE,
    telefono   VARCHAR(30)
);

CREATE TABLE ventas (
    id_venta    SERIAL PRIMARY KEY,
    fecha       TIMESTAMP NOT NULL DEFAULT NOW(),
    id_cliente  INTEGER NOT NULL,
    id_empleado INTEGER NOT NULL,
    total       NUMERIC(12,2) NOT NULL CHECK (total >= 0),
    CONSTRAINT fk_ventas_cliente
        FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_ventas_empleado
        FOREIGN KEY (id_empleado) REFERENCES empleados(id_empleado)
        ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE detalle_ventas (
    id_detalle               SERIAL PRIMARY KEY,
    id_venta                 INTEGER NOT NULL,
    id_producto              INTEGER NOT NULL,
    cantidad                 INTEGER NOT NULL CHECK (cantidad > 0),
    precio_unitario_momento  NUMERIC(10,2) NOT NULL CHECK (precio_unitario_momento >= 0),
    CONSTRAINT fk_detalle_venta
        FOREIGN KEY (id_venta) REFERENCES ventas(id_venta)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_detalle_producto
        FOREIGN KEY (id_producto) REFERENCES productos(id_producto)
        ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE usuarios (
    id_usuario     SERIAL PRIMARY KEY,
    username       VARCHAR(60) NOT NULL UNIQUE,
    password_hash  VARCHAR(200) NOT NULL,
    rol            VARCHAR(30) NOT NULL DEFAULT 'usuario'
                   CHECK (rol IN ('admin','usuario'))
);
