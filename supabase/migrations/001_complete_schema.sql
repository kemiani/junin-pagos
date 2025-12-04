-- =====================================================================
-- JUNIN PAGOS - MIGRACION COMPLETA Y UNIFICADA
-- =====================================================================
--
-- DESCRIPCION: Schema completo para base de datos limpia
-- VERSION: 1.0.0 (Unificada)
-- FECHA: 2024-12
--
-- INSTRUCCIONES:
-- 1. Ejecutar este archivo en una base de datos Supabase LIMPIA
-- 2. Solo ejecutar UNA VEZ
-- 3. Despues de ejecutar, crear el primer admin manualmente
--
-- TABLAS CREADAS:
-- - leads (contactos del formulario)
-- - admin_users (usuarios administrativos)
--
-- =====================================================================

-- =====================================================================
-- SECCION 1: FUNCIONES UTILITARIAS
-- =====================================================================

-- Funcion: Actualizar timestamp automaticamente
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION update_timestamp() IS 'Actualiza automaticamente el campo updated_at';

-- =====================================================================
-- SECCION 2: TABLA LEADS (PRINCIPAL)
-- =====================================================================

CREATE TABLE IF NOT EXISTS leads (
    -- Identificador
    id SERIAL PRIMARY KEY,

    -- Informacion del contacto
    nombre TEXT NOT NULL,
    telefono TEXT NOT NULL,
    localidad TEXT DEFAULT '',

    -- Metadata
    ip TEXT,

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indices para leads
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_localidad ON leads(localidad);
CREATE INDEX IF NOT EXISTS idx_leads_telefono ON leads(telefono);

-- Trigger para updated_at
DROP TRIGGER IF EXISTS set_leads_updated_at ON leads;
CREATE TRIGGER set_leads_updated_at
    BEFORE UPDATE ON leads
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

-- Comentarios
COMMENT ON TABLE leads IS 'Tabla principal de leads para JuninPagos';

-- =====================================================================
-- SECCION 3: TABLA ADMIN_USERS
-- =====================================================================

CREATE TABLE IF NOT EXISTS admin_users (
    -- Identificador (vinculado a auth.users de Supabase)
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Informacion basica
    email TEXT UNIQUE NOT NULL,
    name TEXT,

    -- Rol y permisos
    role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),

    -- Estado
    is_active BOOLEAN NOT NULL DEFAULT true,
    last_login_at TIMESTAMPTZ,

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Constraints
    CONSTRAINT valid_admin_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Indices
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
CREATE INDEX IF NOT EXISTS idx_admin_users_role ON admin_users(role) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_admin_users_active ON admin_users(is_active);

-- Trigger
DROP TRIGGER IF EXISTS set_admin_users_updated_at ON admin_users;
CREATE TRIGGER set_admin_users_updated_at
    BEFORE UPDATE ON admin_users
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

-- Comentarios
COMMENT ON TABLE admin_users IS 'Usuarios administrativos con control de acceso';
COMMENT ON COLUMN admin_users.role IS 'Nivel de acceso: admin (estandar) o super_admin (acceso total)';

-- =====================================================================
-- SECCION 4: ROW LEVEL SECURITY (RLS)
-- =====================================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------
-- Politicas: LEADS
-- ---------------------------------------------------------------------

-- Eliminar politicas existentes si las hay
DROP POLICY IF EXISTS "leads_insert_anon" ON leads;
DROP POLICY IF EXISTS "leads_select_authenticated" ON leads;
DROP POLICY IF EXISTS "leads_update_authenticated" ON leads;
DROP POLICY IF EXISTS "leads_delete_authenticated" ON leads;

-- Anonimos pueden insertar leads (formulario publico)
CREATE POLICY "leads_insert_anon" ON leads
    FOR INSERT TO anon
    WITH CHECK (nombre IS NOT NULL AND telefono IS NOT NULL);

-- Admins autenticados pueden ver todos los leads
CREATE POLICY "leads_select_authenticated" ON leads
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM admin_users au
            WHERE au.id = auth.uid() AND au.is_active = true
        )
    );

-- Admins autenticados pueden actualizar leads
CREATE POLICY "leads_update_authenticated" ON leads
    FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM admin_users au
            WHERE au.id = auth.uid() AND au.is_active = true
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM admin_users au
            WHERE au.id = auth.uid() AND au.is_active = true
        )
    );

-- Admins autenticados pueden eliminar leads
CREATE POLICY "leads_delete_authenticated" ON leads
    FOR DELETE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM admin_users au
            WHERE au.id = auth.uid() AND au.is_active = true
        )
    );

-- ---------------------------------------------------------------------
-- Politicas: ADMIN_USERS
-- ---------------------------------------------------------------------

-- Eliminar politicas existentes si las hay
DROP POLICY IF EXISTS "admin_users_select_authenticated" ON admin_users;
DROP POLICY IF EXISTS "admin_users_insert_super_admin" ON admin_users;
DROP POLICY IF EXISTS "admin_users_update_super_admin" ON admin_users;
DROP POLICY IF EXISTS "admin_users_update_own_login" ON admin_users;
DROP POLICY IF EXISTS "admin_users_delete_super_admin" ON admin_users;

CREATE POLICY "admin_users_select_authenticated" ON admin_users
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM admin_users au
            WHERE au.id = auth.uid() AND au.is_active = true
        )
    );

CREATE POLICY "admin_users_insert_super_admin" ON admin_users
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM admin_users au
            WHERE au.id = auth.uid() AND au.role = 'super_admin' AND au.is_active = true
        )
    );

CREATE POLICY "admin_users_update_super_admin" ON admin_users
    FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM admin_users au
            WHERE au.id = auth.uid() AND au.role = 'super_admin' AND au.is_active = true
        )
    );

CREATE POLICY "admin_users_update_own_login" ON admin_users
    FOR UPDATE TO authenticated
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

CREATE POLICY "admin_users_delete_super_admin" ON admin_users
    FOR DELETE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM admin_users au
            WHERE au.id = auth.uid() AND au.role = 'super_admin' AND au.is_active = true
        )
    );

-- =====================================================================
-- SECCION 5: GRANTS Y PERMISOS
-- =====================================================================

-- Secuencias
GRANT USAGE, SELECT ON SEQUENCE leads_id_seq TO anon, authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- =====================================================================
-- SECCION 6: OPTIMIZACION
-- =====================================================================

ANALYZE leads;
ANALYZE admin_users;

-- =====================================================================
-- MIGRACION COMPLETA
-- =====================================================================

DO $$
BEGIN
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'JUNIN PAGOS - MIGRACION COMPLETA EXITOSA';
    RAISE NOTICE '=====================================================';
    RAISE NOTICE '';
    RAISE NOTICE 'TABLAS CREADAS:';
    RAISE NOTICE '  - leads (contactos del formulario)';
    RAISE NOTICE '  - admin_users (usuarios administrativos)';
    RAISE NOTICE '';
    RAISE NOTICE 'RLS HABILITADO en todas las tablas';
    RAISE NOTICE '';
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'PROXIMO PASO:';
    RAISE NOTICE 'Crear usuario admin en Supabase Auth y';
    RAISE NOTICE 'agregar registro en tabla admin_users';
    RAISE NOTICE '=====================================================';
END $$;
