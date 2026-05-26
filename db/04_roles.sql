-- ============================================================
-- 04_roles.sql - 5 roles del DBMS con permisos granulares
-- ============================================================
-- Roles del negocio:
--   administrador : acceso total de lectura y escritura
--   gerente       : lectura total + reportes; sin DELETE en ventas
--   cajero        : registrar ventas y leer productos/clientes
--   bodeguero     : gestionar productos (stock); sin acceso a ventas
--   cliente_web   : solo lectura de productos y categorias
-- ============================================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'administrador') THEN
    CREATE ROLE administrador;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'gerente') THEN
    CREATE ROLE gerente;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'cajero') THEN
    CREATE ROLE cajero;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'bodeguero') THEN
    CREATE ROLE bodeguero;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'cliente_web') THEN
    CREATE ROLE cliente_web;
  END IF;
END
$$;

-- administrador
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO administrador;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO administrador;

-- gerente
GRANT SELECT ON ALL TABLES IN SCHEMA public TO gerente;
GRANT INSERT, UPDATE ON ventas TO gerente;
GRANT INSERT, UPDATE ON detalle_ventas TO gerente;
GRANT INSERT, UPDATE, DELETE ON productos TO gerente;
GRANT INSERT, UPDATE, DELETE ON clientes TO gerente;
GRANT INSERT, UPDATE, DELETE ON empleados TO gerente;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO gerente;

-- cajero
GRANT SELECT ON productos TO cajero;
GRANT SELECT ON categorias TO cajero;
GRANT SELECT ON proveedores TO cajero;
GRANT SELECT ON clientes TO cajero;
GRANT SELECT ON empleados TO cajero;
GRANT SELECT, INSERT ON ventas TO cajero;
GRANT SELECT, INSERT ON detalle_ventas TO cajero;
GRANT UPDATE (stock) ON productos TO cajero;
GRANT SELECT ON vista_resumen_ventas TO cajero;
GRANT SELECT ON vista_stock_bajo TO cajero;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO cajero;

-- bodeguero
GRANT SELECT, INSERT, UPDATE ON productos TO bodeguero;
GRANT SELECT ON categorias TO bodeguero;
GRANT SELECT ON proveedores TO bodeguero;
GRANT SELECT ON vista_stock_bajo TO bodeguero;
GRANT USAGE, SELECT ON SEQUENCE productos_id_producto_seq TO bodeguero;

-- cliente_web
GRANT SELECT ON productos TO cliente_web;
GRANT SELECT ON categorias TO cliente_web;

REVOKE ALL ON usuarios FROM cliente_web;
REVOKE ALL ON usuarios FROM bodeguero;
REVOKE ALL ON usuarios FROM cajero;
