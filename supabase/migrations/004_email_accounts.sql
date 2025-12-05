-- =====================================================
-- MIGRACIÓN 004: CUENTAS DE EMAIL Y RECEPCIÓN
-- =====================================================

-- Tabla de cuentas de email (kevin@, tomas@, info@, etc.)
CREATE TABLE IF NOT EXISTS email_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,                          -- "Kevin Emiani", "Tomás", "Info General"
    type TEXT DEFAULT 'personal' CHECK (type IN ('personal', 'shared')),
    is_default BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Relación: qué usuarios pueden usar qué cuentas
CREATE TABLE IF NOT EXISTS email_account_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email_account_id UUID REFERENCES email_accounts(id) ON DELETE CASCADE,
    admin_user_id UUID REFERENCES admin_users(id) ON DELETE CASCADE,
    can_send BOOLEAN DEFAULT true,
    can_receive BOOLEAN DEFAULT true,
    is_owner BOOLEAN DEFAULT false,              -- Dueño de la cuenta personal
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(email_account_id, admin_user_id)
);

-- Agregar campo para emails recibidos
ALTER TABLE emails ADD COLUMN IF NOT EXISTS direction TEXT DEFAULT 'outbound' CHECK (direction IN ('outbound', 'inbound'));
ALTER TABLE emails ADD COLUMN IF NOT EXISTS email_account_id UUID REFERENCES email_accounts(id);
ALTER TABLE emails ADD COLUMN IF NOT EXISTS raw_payload JSONB;
ALTER TABLE emails ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT false;

-- Índices
CREATE INDEX IF NOT EXISTS idx_email_accounts_email ON email_accounts(email);
CREATE INDEX IF NOT EXISTS idx_email_accounts_type ON email_accounts(type) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_email_account_users_account ON email_account_users(email_account_id);
CREATE INDEX IF NOT EXISTS idx_email_account_users_user ON email_account_users(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_emails_direction ON emails(direction);
CREATE INDEX IF NOT EXISTS idx_emails_account ON emails(email_account_id);
CREATE INDEX IF NOT EXISTS idx_emails_is_read ON emails(is_read) WHERE direction = 'inbound';

-- RLS
ALTER TABLE email_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_account_users ENABLE ROW LEVEL SECURITY;

-- Política: Los admins ven cuentas a las que tienen acceso
CREATE POLICY "Admins can view their email accounts" ON email_accounts
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM email_account_users eau
            JOIN admin_users au ON au.id = eau.admin_user_id
            WHERE eau.email_account_id = email_accounts.id
            AND au.id = auth.uid()
            AND au.is_active = true
        )
        OR
        EXISTS (
            SELECT 1 FROM admin_users
            WHERE id = auth.uid() AND is_active = true AND role = 'super_admin'
        )
    );

-- Política: Solo super_admin puede crear/modificar cuentas
CREATE POLICY "Super admin can manage email accounts" ON email_accounts
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM admin_users
            WHERE id = auth.uid() AND is_active = true AND role = 'super_admin'
        )
    );

-- Política: Los admins ven sus propios permisos de cuentas
CREATE POLICY "Admins can view their account permissions" ON email_account_users
    FOR SELECT
    TO authenticated
    USING (
        admin_user_id = auth.uid()
        OR
        EXISTS (
            SELECT 1 FROM admin_users
            WHERE id = auth.uid() AND is_active = true AND role = 'super_admin'
        )
    );

-- Super admin puede gestionar permisos
CREATE POLICY "Super admin can manage account permissions" ON email_account_users
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM admin_users
            WHERE id = auth.uid() AND is_active = true AND role = 'super_admin'
        )
    );

-- Trigger para updated_at en email_accounts
DROP TRIGGER IF EXISTS email_accounts_updated_at ON email_accounts;
CREATE TRIGGER email_accounts_updated_at
    BEFORE UPDATE ON email_accounts
    FOR EACH ROW EXECUTE FUNCTION update_email_updated_at();

-- =====================================================
-- DATOS INICIALES: Cuentas de email
-- =====================================================

-- Insertar cuentas de email predeterminadas
INSERT INTO email_accounts (email, name, type, is_default) VALUES
    ('info@juninpagos.net', 'Info General', 'shared', true),
    ('noreply@juninpagos.net', 'No Reply', 'shared', false)
ON CONFLICT (email) DO NOTHING;

-- Nota: Las cuentas personales (kevin@, tomas@) se crean cuando
-- se vinculan con los usuarios de admin_users

-- =====================================================
-- FUNCIÓN: Crear cuenta personal al vincular usuario
-- =====================================================

CREATE OR REPLACE FUNCTION create_personal_email_account()
RETURNS TRIGGER AS $$
DECLARE
    email_parts TEXT[];
    email_name TEXT;
    account_id UUID;
BEGIN
    -- Si el email del admin contiene @juninpagos.net, crear cuenta personal
    IF NEW.email LIKE '%@juninpagos.net' THEN
        email_parts := string_to_array(NEW.email, '@');
        email_name := COALESCE(NEW.name, initcap(email_parts[1]));

        -- Crear cuenta de email personal
        INSERT INTO email_accounts (email, name, type, is_active)
        VALUES (NEW.email, email_name, 'personal', true)
        ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
        RETURNING id INTO account_id;

        -- Vincular usuario como dueño
        INSERT INTO email_account_users (email_account_id, admin_user_id, can_send, can_receive, is_owner)
        VALUES (account_id, NEW.id, true, true, true)
        ON CONFLICT (email_account_id, admin_user_id) DO NOTHING;

        -- También dar acceso a la cuenta compartida 'info@'
        INSERT INTO email_account_users (email_account_id, admin_user_id, can_send, can_receive, is_owner)
        SELECT ea.id, NEW.id, true, true, false
        FROM email_accounts ea
        WHERE ea.email = 'info@juninpagos.net' AND ea.type = 'shared'
        ON CONFLICT (email_account_id, admin_user_id) DO NOTHING;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para crear cuenta cuando se agrega admin
DROP TRIGGER IF EXISTS create_email_account_for_admin ON admin_users;
CREATE TRIGGER create_email_account_for_admin
    AFTER INSERT ON admin_users
    FOR EACH ROW
    EXECUTE FUNCTION create_personal_email_account();

-- =====================================================
-- EJECUTAR PARA USUARIOS EXISTENTES
-- =====================================================

-- Crear cuentas para admins existentes con @juninpagos.net
DO $$
DECLARE
    admin_record RECORD;
    email_parts TEXT[];
    email_name TEXT;
    account_id UUID;
BEGIN
    FOR admin_record IN SELECT * FROM admin_users WHERE email LIKE '%@juninpagos.net' LOOP
        email_parts := string_to_array(admin_record.email, '@');
        email_name := COALESCE(admin_record.name, initcap(email_parts[1]));

        -- Crear cuenta personal
        INSERT INTO email_accounts (email, name, type, is_active)
        VALUES (admin_record.email, email_name, 'personal', true)
        ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
        RETURNING id INTO account_id;

        -- Vincular como dueño
        INSERT INTO email_account_users (email_account_id, admin_user_id, can_send, can_receive, is_owner)
        VALUES (account_id, admin_record.id, true, true, true)
        ON CONFLICT (email_account_id, admin_user_id) DO NOTHING;

        -- Acceso a info@
        INSERT INTO email_account_users (email_account_id, admin_user_id, can_send, can_receive, is_owner)
        SELECT ea.id, admin_record.id, true, true, false
        FROM email_accounts ea
        WHERE ea.email = 'info@juninpagos.net'
        ON CONFLICT (email_account_id, admin_user_id) DO NOTHING;
    END LOOP;
END $$;
