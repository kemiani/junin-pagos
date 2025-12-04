-- ============================================
-- JUNIN PAGOS - AGREGAR USUARIO ADMIN
-- ============================================
--
-- INSTRUCCIONES:
-- 1. Primero crear el usuario en Authentication > Users
-- 2. Copiar el UUID del usuario creado
-- 3. Reemplazar los valores en este script
-- 4. Ejecutar en SQL Editor
--
-- ============================================

-- Reemplazar estos valores:
-- - 'UUID-AQUI' -> el UUID del usuario de Auth
-- - 'tu@email.com' -> el email del usuario
-- - 'Tu Nombre' -> el nombre del admin

INSERT INTO admin_users (id, email, name, role, is_active)
VALUES (
    'UUID-AQUI'::uuid,
    'tu@email.com',
    'Tu Nombre',
    'admin',
    true
);

-- Opcional: Actualizar metadata del usuario en auth.users
-- UPDATE auth.users
-- SET raw_user_meta_data = jsonb_set(
--     COALESCE(raw_user_meta_data, '{}'::jsonb),
--     '{role}',
--     '"admin"'
-- )
-- WHERE id = 'UUID-AQUI';

-- ============================================
-- VERIFICAR
-- ============================================
SELECT id, email, name, role, is_active, created_at
FROM admin_users;
