-- =====================================================
-- MIGRACIÓN 003: SISTEMA DE EMAILS
-- =====================================================
-- Ejecutar en Supabase SQL Editor

-- Tabla de threads (conversaciones) - crear primero por la FK
CREATE TABLE IF NOT EXISTS email_threads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id INTEGER REFERENCES leads(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    last_email_at TIMESTAMPTZ,
    email_count INTEGER DEFAULT 0,
    is_archived BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla principal de emails
CREATE TABLE IF NOT EXISTS emails (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Relaciones
    lead_id INTEGER REFERENCES leads(id) ON DELETE CASCADE,
    admin_user_id UUID REFERENCES admin_users(id) ON DELETE SET NULL,
    thread_id UUID REFERENCES email_threads(id) ON DELETE CASCADE,

    -- Resend tracking
    resend_id TEXT UNIQUE,

    -- Contenido
    subject TEXT NOT NULL,
    body_html TEXT NOT NULL,
    body_text TEXT,

    -- Direcciones
    from_email TEXT NOT NULL,
    from_name TEXT,
    to_email TEXT NOT NULL,
    to_name TEXT,
    reply_to TEXT,

    -- Estado y tracking
    status TEXT DEFAULT 'draft' CHECK (status IN (
        'draft',
        'queued',
        'sent',
        'delivered',
        'opened',
        'clicked',
        'bounced',
        'complained',
        'failed'
    )),

    -- Organización
    is_archived BOOLEAN DEFAULT false,
    is_starred BOOLEAN DEFAULT false,
    folder TEXT DEFAULT 'sent' CHECK (folder IN ('sent', 'drafts', 'archived', 'trash')),

    -- Metadata de tracking
    opened_at TIMESTAMPTZ,
    opened_count INTEGER DEFAULT 0,
    clicked_at TIMESTAMPTZ,
    clicked_count INTEGER DEFAULT 0,

    -- Timestamps
    scheduled_at TIMESTAMPTZ,
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de templates de email
CREATE TABLE IF NOT EXISTS email_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    subject TEXT NOT NULL,
    body_html TEXT NOT NULL,
    body_text TEXT,
    variables JSONB DEFAULT '[]',
    category TEXT DEFAULT 'general',
    is_active BOOLEAN DEFAULT true,
    usage_count INTEGER DEFAULT 0,
    created_by UUID REFERENCES admin_users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de adjuntos
CREATE TABLE IF NOT EXISTS email_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email_id UUID REFERENCES emails(id) ON DELETE CASCADE,
    filename TEXT NOT NULL,
    content_type TEXT NOT NULL,
    size_bytes INTEGER NOT NULL,
    storage_path TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de webhooks log
CREATE TABLE IF NOT EXISTS email_webhook_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resend_id TEXT,
    event_type TEXT NOT NULL,
    payload JSONB NOT NULL,
    processed BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- ÍNDICES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_emails_lead_id ON emails(lead_id);
CREATE INDEX IF NOT EXISTS idx_emails_thread_id ON emails(thread_id);
CREATE INDEX IF NOT EXISTS idx_emails_status ON emails(status);
CREATE INDEX IF NOT EXISTS idx_emails_folder ON emails(folder) WHERE folder != 'trash';
CREATE INDEX IF NOT EXISTS idx_emails_created_at ON emails(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_emails_resend_id ON emails(resend_id) WHERE resend_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_emails_admin_user ON emails(admin_user_id);

CREATE INDEX IF NOT EXISTS idx_threads_lead_id ON email_threads(lead_id);
CREATE INDEX IF NOT EXISTS idx_threads_last_email ON email_threads(last_email_at DESC);

CREATE INDEX IF NOT EXISTS idx_templates_category ON email_templates(category) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_templates_name ON email_templates(name);

CREATE INDEX IF NOT EXISTS idx_attachments_email ON email_attachments(email_id);

CREATE INDEX IF NOT EXISTS idx_webhook_logs_resend ON email_webhook_logs(resend_id);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_unprocessed ON email_webhook_logs(created_at) WHERE processed = false;

-- =====================================================
-- RLS POLICIES
-- =====================================================

ALTER TABLE emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_webhook_logs ENABLE ROW LEVEL SECURITY;

-- Emails: Solo admins activos pueden ver/modificar
CREATE POLICY "Admins can manage emails" ON emails
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM admin_users
            WHERE id = auth.uid() AND is_active = true
        )
    );

-- Threads: Solo admins activos
CREATE POLICY "Admins can manage threads" ON email_threads
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM admin_users
            WHERE id = auth.uid() AND is_active = true
        )
    );

-- Templates: Solo admins activos
CREATE POLICY "Admins can manage templates" ON email_templates
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM admin_users
            WHERE id = auth.uid() AND is_active = true
        )
    );

-- Attachments: Solo admins activos
CREATE POLICY "Admins can manage attachments" ON email_attachments
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM admin_users
            WHERE id = auth.uid() AND is_active = true
        )
    );

-- Webhook logs: Solo lectura para admins
CREATE POLICY "Admins can view webhook logs" ON email_webhook_logs
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM admin_users
            WHERE id = auth.uid() AND is_active = true
        )
    );

-- =====================================================
-- FUNCIONES Y TRIGGERS
-- =====================================================

-- Función para actualizar updated_at en emails
CREATE OR REPLACE FUNCTION update_email_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
DROP TRIGGER IF EXISTS emails_updated_at ON emails;
CREATE TRIGGER emails_updated_at
    BEFORE UPDATE ON emails
    FOR EACH ROW EXECUTE FUNCTION update_email_updated_at();

DROP TRIGGER IF EXISTS threads_updated_at ON email_threads;
CREATE TRIGGER threads_updated_at
    BEFORE UPDATE ON email_threads
    FOR EACH ROW EXECUTE FUNCTION update_email_updated_at();

DROP TRIGGER IF EXISTS templates_updated_at ON email_templates;
CREATE TRIGGER templates_updated_at
    BEFORE UPDATE ON email_templates
    FOR EACH ROW EXECUTE FUNCTION update_email_updated_at();

-- Función para actualizar estadísticas del thread
CREATE OR REPLACE FUNCTION update_thread_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.thread_id IS NOT NULL THEN
        UPDATE email_threads
        SET
            email_count = email_count + 1,
            last_email_at = COALESCE(NEW.sent_at, NOW()),
            updated_at = NOW()
        WHERE id = NEW.thread_id;
    ELSIF TG_OP = 'DELETE' AND OLD.thread_id IS NOT NULL THEN
        UPDATE email_threads
        SET
            email_count = GREATEST(email_count - 1, 0),
            updated_at = NOW()
        WHERE id = OLD.thread_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_thread_on_email ON emails;
CREATE TRIGGER update_thread_on_email
    AFTER INSERT OR DELETE ON emails
    FOR EACH ROW
    EXECUTE FUNCTION update_thread_stats();

-- =====================================================
-- DATOS INICIALES: Templates predefinidos
-- =====================================================

INSERT INTO email_templates (name, subject, body_html, body_text, variables, category) VALUES
(
    'Bienvenida',
    'Bienvenido a Junín Pagos - {{nombre}}',
    '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #0891b2; margin: 0;">Junín Pagos</h1>
        </div>
        <h2 style="color: #334155;">¡Hola {{nombre}}!</h2>
        <p style="color: #475569; line-height: 1.6;">Gracias por contactarnos. Hemos recibido tu consulta y nos pondremos en contacto contigo a la brevedad.</p>
        <p style="color: #475569; line-height: 1.6;">Mientras tanto, te invitamos a conocer más sobre nuestros servicios de facturación y pagos.</p>
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
            <p style="color: #64748b; margin: 0;">Saludos cordiales,</p>
            <p style="color: #334155; font-weight: bold; margin: 5px 0 0 0;">Equipo Junín Pagos</p>
        </div>
    </div>',
    'Hola {{nombre}}!\n\nGracias por contactarnos. Hemos recibido tu consulta y nos pondremos en contacto contigo a la brevedad.\n\nMientras tanto, te invitamos a conocer más sobre nuestros servicios.\n\nSaludos cordiales,\nEquipo Junín Pagos',
    '[{"name": "nombre", "description": "Nombre del lead"}]',
    'onboarding'
),
(
    'Seguimiento',
    'Seguimiento de tu consulta - Junín Pagos',
    '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #0891b2; margin: 0;">Junín Pagos</h1>
        </div>
        <h2 style="color: #334155;">Hola {{nombre}}</h2>
        <p style="color: #475569; line-height: 1.6;">Queríamos hacer un seguimiento de tu consulta anterior.</p>
        <p style="color: #475569; line-height: 1.6;">¿Pudiste resolver tus dudas? ¿Hay algo más en lo que podamos ayudarte?</p>
        <p style="color: #475569; line-height: 1.6;">Estamos a tu disposición para cualquier consulta adicional.</p>
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
            <p style="color: #64748b; margin: 0;">Quedamos a tu disposición,</p>
            <p style="color: #334155; font-weight: bold; margin: 5px 0 0 0;">Equipo Junín Pagos</p>
        </div>
    </div>',
    'Hola {{nombre}}\n\nQueríamos hacer un seguimiento de tu consulta anterior.\n\n¿Pudiste resolver tus dudas? ¿Hay algo más en lo que podamos ayudarte?\n\nQuedamos a tu disposición,\nEquipo Junín Pagos',
    '[{"name": "nombre", "description": "Nombre del lead"}]',
    'followup'
),
(
    'Promoción',
    '¡Oferta especial para ti, {{nombre}}!',
    '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #0891b2; margin: 0;">Junín Pagos</h1>
        </div>
        <h2 style="color: #334155;">¡Hola {{nombre}}!</h2>
        <p style="color: #475569; line-height: 1.6;">Tenemos una oferta especial pensada para vos:</p>
        <div style="background: #f0fdfa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #0891b2;">
            <p style="font-size: 18px; font-weight: bold; color: #0891b2; margin: 0;">{{oferta}}</p>
        </div>
        <p style="color: #475569; line-height: 1.6;">Esta promoción es por tiempo limitado. ¡No te la pierdas!</p>
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
            <p style="color: #64748b; margin: 0;">Saludos,</p>
            <p style="color: #334155; font-weight: bold; margin: 5px 0 0 0;">Equipo Junín Pagos</p>
        </div>
    </div>',
    'Hola {{nombre}}!\n\nTenemos una oferta especial: {{oferta}}\n\nEsta promoción es por tiempo limitado. ¡No te la pierdas!\n\nSaludos,\nEquipo Junín Pagos',
    '[{"name": "nombre", "description": "Nombre del lead"}, {"name": "oferta", "description": "Descripción de la oferta"}]',
    'marketing'
),
(
    'Información de Servicios',
    'Información sobre nuestros servicios - Junín Pagos',
    '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #0891b2; margin: 0;">Junín Pagos</h1>
        </div>
        <h2 style="color: #334155;">Hola {{nombre}}</h2>
        <p style="color: #475569; line-height: 1.6;">Te enviamos la información que solicitaste sobre nuestros servicios:</p>
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #334155; margin-top: 0;">Nuestros Servicios</h3>
            <ul style="color: #475569; line-height: 1.8;">
                <li>Facturación electrónica</li>
                <li>Gestión de pagos</li>
                <li>Cobranzas automatizadas</li>
                <li>Reportes y análisis</li>
            </ul>
        </div>
        <p style="color: #475569; line-height: 1.6;">Si tenés alguna consulta adicional, no dudes en contactarnos.</p>
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
            <p style="color: #64748b; margin: 0;">Saludos cordiales,</p>
            <p style="color: #334155; font-weight: bold; margin: 5px 0 0 0;">Equipo Junín Pagos</p>
        </div>
    </div>',
    'Hola {{nombre}}\n\nTe enviamos la información que solicitaste sobre nuestros servicios:\n\n- Facturación electrónica\n- Gestión de pagos\n- Cobranzas automatizadas\n- Reportes y análisis\n\nSi tenés alguna consulta adicional, no dudes en contactarnos.\n\nSaludos cordiales,\nEquipo Junín Pagos',
    '[{"name": "nombre", "description": "Nombre del lead"}]',
    'general'
)
ON CONFLICT (name) DO NOTHING;
