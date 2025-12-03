-- Tabla de leads (contactos del formulario)
CREATE TABLE IF NOT EXISTS leads (
  id SERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  telefono TEXT NOT NULL,
  localidad TEXT DEFAULT '',
  ip TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indice para ordenar por fecha
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);

-- Comentario de la tabla
COMMENT ON TABLE leads IS 'Leads capturados desde el formulario de contacto';
