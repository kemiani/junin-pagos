-- Tabla de administradores
CREATE TABLE IF NOT EXISTS admins (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  nombre TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ
);

-- Indice para buscar por email
CREATE INDEX IF NOT EXISTS idx_admins_email ON admins(email);

-- Comentario
COMMENT ON TABLE admins IS 'Usuarios administradores del panel';
