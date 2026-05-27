-- ============================================================
-- 06_stored_procedures.sql - Stored Procedures (Proyecto 3)
-- ============================================================

-- ============================================================
-- SP 1: registrar_venta
-- Transaccion explicita con COMMIT y ROLLBACK dentro del procedure.
-- Parametros IN + OUT. Valida stock, inserta venta + detalle y descuenta stock.
-- ============================================================
CREATE OR REPLACE PROCEDURE registrar_venta(
  IN p_id_cliente INTEGER,
  IN p_id_empleado INTEGER,
  IN p_items JSON,
  OUT p_id_venta INTEGER,
  OUT p_total NUMERIC(12,2),
  OUT p_error TEXT
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_item JSON;
  v_id_prod INTEGER;
  v_cantidad INTEGER;
  v_precio NUMERIC(10,2);
  v_stock INTEGER;
  v_nombre_prod TEXT;
  v_subtotal NUMERIC(12,2) := 0;
BEGIN
  p_error := NULL;
  p_id_venta := NULL;
  p_total := 0;

  IF p_items IS NULL OR json_typeof(p_items) <> 'array' THEN
    p_error := 'La venta debe recibir un arreglo de productos';
    ROLLBACK;
    RETURN;
  END IF;

  IF json_array_length(p_items) = 0 THEN
    p_error := 'La venta debe tener al menos un producto';
    ROLLBACK;
    RETURN;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM clientes WHERE id_cliente = p_id_cliente) THEN
    p_error := 'Cliente no encontrado';
    ROLLBACK;
    RETURN;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM empleados WHERE id_empleado = p_id_empleado) THEN
    p_error := 'Empleado no encontrado';
    ROLLBACK;
    RETURN;
  END IF;

  INSERT INTO ventas (fecha, id_cliente, id_empleado, total)
  VALUES (NOW(), p_id_cliente, p_id_empleado, 0)
  RETURNING id_venta INTO p_id_venta;

  FOR v_item IN SELECT * FROM json_array_elements(p_items)
  LOOP
    v_id_prod := NULLIF(v_item->>'id_producto', '')::INTEGER;
    v_cantidad := NULLIF(v_item->>'cantidad', '')::INTEGER;

    IF v_id_prod IS NULL OR v_cantidad IS NULL OR v_cantidad <= 0 THEN
      p_error := 'Cada item requiere id_producto y cantidad mayor a 0';
      p_id_venta := NULL;
      p_total := 0;
      ROLLBACK;
      RETURN;
    END IF;

    SELECT precio_unitario, stock, nombre
      INTO v_precio, v_stock, v_nombre_prod
      FROM productos
     WHERE id_producto = v_id_prod
       FOR UPDATE;

    IF NOT FOUND THEN
      p_error := 'Producto ' || v_id_prod || ' no existe';
      p_id_venta := NULL;
      p_total := 0;
      ROLLBACK;
      RETURN;
    END IF;

    IF v_stock < v_cantidad THEN
      p_error := 'Stock insuficiente para "' || v_nombre_prod || '" (disponible: ' || v_stock || ')';
      p_id_venta := NULL;
      p_total := 0;
      ROLLBACK;
      RETURN;
    END IF;

    INSERT INTO detalle_ventas (id_venta, id_producto, cantidad, precio_unitario_momento)
    VALUES (p_id_venta, v_id_prod, v_cantidad, v_precio);

    UPDATE productos
       SET stock = stock - v_cantidad
     WHERE id_producto = v_id_prod;

    v_subtotal := v_subtotal + (v_precio * v_cantidad);
  END LOOP;

  UPDATE ventas
     SET total = v_subtotal
   WHERE id_venta = p_id_venta;

  p_total := v_subtotal;
  COMMIT;
END;
$$;

-- ============================================================
-- SP 2: actualizar_stock
-- Actualiza el stock de un producto. Valida stock >= 0.
-- Parametros IN/OUT + manejo de excepciones.
-- ============================================================
CREATE OR REPLACE PROCEDURE actualizar_stock(
  IN p_id_producto INTEGER,
  IN p_nuevo_stock INTEGER,
  OUT p_ok BOOLEAN,
  OUT p_mensaje TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
  p_ok := FALSE;
  p_mensaje := '';

  IF p_nuevo_stock < 0 THEN
    p_mensaje := 'El stock no puede ser negativo';
    RETURN;
  END IF;

  UPDATE productos
     SET stock = p_nuevo_stock
   WHERE id_producto = p_id_producto;

  IF NOT FOUND THEN
    p_mensaje := 'Producto no encontrado';
    RETURN;
  END IF;

  p_ok := TRUE;
  p_mensaje := 'Stock actualizado correctamente';

EXCEPTION
  WHEN OTHERS THEN
    p_ok := FALSE;
    p_mensaje := SQLERRM;
END;
$$;

-- ============================================================
-- SP 3: crear_producto
-- Inserta un producto nuevo. Valida precio >= 0 y stock >= 0.
-- ============================================================
CREATE OR REPLACE PROCEDURE crear_producto(
  IN p_nombre VARCHAR(150),
  IN p_descripcion TEXT,
  IN p_precio_unitario NUMERIC(10,2),
  IN p_stock INTEGER,
  IN p_id_categoria INTEGER,
  IN p_id_proveedor INTEGER,
  OUT p_id_producto INTEGER,
  OUT p_error TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
  p_error := NULL;

  IF p_precio_unitario < 0 THEN
    RAISE EXCEPTION 'El precio no puede ser negativo';
  END IF;

  IF p_stock < 0 THEN
    RAISE EXCEPTION 'El stock no puede ser negativo';
  END IF;

  INSERT INTO productos (nombre, descripcion, precio_unitario, stock, id_categoria, id_proveedor)
  VALUES (p_nombre, p_descripcion, p_precio_unitario, p_stock, p_id_categoria, p_id_proveedor)
  RETURNING id_producto INTO p_id_producto;

EXCEPTION
  WHEN OTHERS THEN
    p_error := SQLERRM;
    p_id_producto := NULL;
    RAISE;
END;
$$;

-- ============================================================
-- SP 4: crear_cliente
-- Inserta un cliente nuevo con validacion de email unico.
-- ============================================================
CREATE OR REPLACE PROCEDURE crear_cliente(
  IN p_nombre VARCHAR(80),
  IN p_apellido VARCHAR(80),
  IN p_email VARCHAR(150),
  IN p_telefono VARCHAR(30),
  OUT p_id_cliente INTEGER,
  OUT p_error TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
  p_error := NULL;

  INSERT INTO clientes (nombre, apellido, email, telefono)
  VALUES (p_nombre, p_apellido, p_email, p_telefono)
  RETURNING id_cliente INTO p_id_cliente;

EXCEPTION
  WHEN unique_violation THEN
    p_error := 'El email ya esta registrado';
    p_id_cliente := NULL;
    RAISE;
  WHEN OTHERS THEN
    p_error := SQLERRM;
    p_id_cliente := NULL;
    RAISE;
END;
$$;

-- ============================================================
-- SP 5: obtener_resumen_ventas
-- Devuelve KPIs de ventas: total, ingresos del mes y producto top.
-- ============================================================
CREATE OR REPLACE PROCEDURE obtener_resumen_ventas(
  OUT p_total_ventas INTEGER,
  OUT p_ingresos_mes NUMERIC(12,2),
  OUT p_producto_top TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
  SELECT COUNT(*)::INTEGER
    INTO p_total_ventas
    FROM ventas;

  SELECT COALESCE(SUM(total), 0)::NUMERIC(12,2)
    INTO p_ingresos_mes
    FROM ventas
   WHERE DATE_TRUNC('month', fecha) = DATE_TRUNC('month', NOW());

  SELECT p.nombre
    INTO p_producto_top
    FROM productos p
    JOIN detalle_ventas dv ON p.id_producto = dv.id_producto
   GROUP BY p.nombre
   ORDER BY SUM(dv.cantidad) DESC
   LIMIT 1;

  IF p_producto_top IS NULL THEN
    p_producto_top := 'Sin datos';
  END IF;
END;
$$;

-- ============================================================
-- SP 6: eliminar_cliente_seguro
-- Elimina un cliente solo si no tiene ventas asociadas.
-- ============================================================
CREATE OR REPLACE PROCEDURE eliminar_cliente_seguro(
  IN p_id_cliente INTEGER,
  OUT p_ok BOOLEAN,
  OUT p_mensaje TEXT
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  p_ok := FALSE;
  p_mensaje := '';

  SELECT COUNT(*)
    INTO v_count
    FROM ventas
   WHERE id_cliente = p_id_cliente;

  IF v_count > 0 THEN
    p_mensaje := 'No se puede eliminar: el cliente tiene ' || v_count || ' venta(s) asociada(s)';
    RETURN;
  END IF;

  DELETE FROM clientes
   WHERE id_cliente = p_id_cliente;

  IF NOT FOUND THEN
    p_mensaje := 'Cliente no encontrado';
    RETURN;
  END IF;

  p_ok := TRUE;
  p_mensaje := 'Cliente eliminado correctamente';

EXCEPTION
  WHEN OTHERS THEN
    p_ok := FALSE;
    p_mensaje := SQLERRM;
END;
$$;
