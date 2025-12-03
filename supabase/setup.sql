-- ============================================
-- JUNIN PAGOS - SETUP COMPLETO DE BASE DE DATOS
-- ============================================
-- Ejecutar este script en Supabase SQL Editor
-- URL: https://supabase.com/dashboard/project/csiawmteettocvcxajcb/sql
-- ============================================

-- 1. TABLA DE LEADS
CREATE TABLE IF NOT EXISTS leads (
  id SERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  telefono TEXT NOT NULL,
  localidad TEXT DEFAULT '',
  ip TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);


-- 2. TABLA DE ADMINS (para futuro sistema de login)
CREATE TABLE IF NOT EXISTS admins (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  nombre TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_admins_email ON admins(email);


-- ============================================
-- VERIFICAR QUE SE CREARON LAS TABLAS
-- ============================================
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('leads', 'admins');
