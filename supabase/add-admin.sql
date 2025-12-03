-- ============================================
-- SCRIPT PARA AGREGAR ADMINISTRADORES
-- ============================================
-- Ejecutar en Supabase SQL Editor
--
-- IMPORTANTE: Cambiar los valores antes de ejecutar
-- El password debe ser hasheado con bcrypt (cost 10)
-- Podes generar el hash en: https://bcrypt-generator.com/
-- ============================================

-- Ejemplo: Agregar admin con email y password hasheado
INSERT INTO admins (email, password_hash, nombre)
VALUES (
  'admin@juninpagos.com',           -- Cambiar email
  '$2a$10$XXXXXXXXXXXXXXXXXXXXXXXX', -- Cambiar por hash bcrypt del password
  'Administrador'                    -- Cambiar nombre
);

-- ============================================
-- CONSULTAS UTILES
-- ============================================

-- Ver todos los admins:
-- SELECT id, email, nombre, created_at, last_login FROM admins;

-- Eliminar admin por email:
-- DELETE FROM admins WHERE email = 'admin@juninpagos.com';

-- Actualizar ultimo login (esto lo hace la app automaticamente):
-- UPDATE admins SET last_login = NOW() WHERE email = 'admin@juninpagos.com';
