-- ============================================================
-- 05_usuarios_prueba.sql - Un usuario funcional por cada rol
-- ============================================================

ALTER TABLE usuarios DROP CONSTRAINT IF EXISTS usuarios_rol_check;
TRUNCATE usuarios RESTART IDENTITY CASCADE;

ALTER TABLE usuarios ADD CONSTRAINT usuarios_rol_check
  CHECK (rol IN ('administrador','gerente','cajero','bodeguero','cliente_web'));

INSERT INTO usuarios (username, password_hash, rol) VALUES
('admin_user',
 '$2b$10$wQv0Y.K8Y0kY7n6X8J7Q1eN1YQ3mZ9b8W6lQpJ2y7Q6V8Xq3F1xCu',
 'administrador'),
('gerente_user',
 '$2b$10$wQv0Y.K8Y0kY7n6X8J7Q1eN1YQ3mZ9b8W6lQpJ2y7Q6V8Xq3F1xCu',
 'gerente'),
('cajero_user',
 '$2b$10$wQv0Y.K8Y0kY7n6X8J7Q1eN1YQ3mZ9b8W6lQpJ2y7Q6V8Xq3F1xCu',
 'cajero'),
('bodeguero_user',
 '$2b$10$wQv0Y.K8Y0kY7n6X8J7Q1eN1YQ3mZ9b8W6lQpJ2y7Q6V8Xq3F1xCu',
 'bodeguero'),
('cliente_user',
 '$2b$10$wQv0Y.K8Y0kY7n6X8J7Q1eN1YQ3mZ9b8W6lQpJ2y7Q6V8Xq3F1xCu',
 'cliente_web');

-- Todos los usuarios tienen contrasena: admin123.
