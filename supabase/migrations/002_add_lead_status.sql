-- =====================================================================
-- JUNIN PAGOS - MIGRACION: AGREGAR ESTADO A LEADS
-- =====================================================================
--
-- DESCRIPCION: Agrega campo estado para seguimiento de leads
-- VERSION: 1.0.1
-- FECHA: 2024-12
--
-- ESTADOS DISPONIBLES:
-- - nuevo: Lead recién ingresado (default)
-- - contactado: Ya se contactó al lead
-- - interesado: Mostró interés
-- - convertido: Se convirtió en cliente
-- - perdido: No se pudo convertir
--
-- =====================================================================

-- Agregar columna estado si no existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'leads' AND column_name = 'estado'
    ) THEN
        ALTER TABLE leads ADD COLUMN estado TEXT DEFAULT 'nuevo';
    END IF;
END $$;

-- Agregar constraint para valores válidos
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.constraint_column_usage
        WHERE table_name = 'leads' AND constraint_name = 'leads_estado_check'
    ) THEN
        ALTER TABLE leads ADD CONSTRAINT leads_estado_check
        CHECK (estado IN ('nuevo', 'contactado', 'interesado', 'convertido', 'perdido'));
    END IF;
END $$;

-- Agregar columna notas si no existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'leads' AND column_name = 'notas'
    ) THEN
        ALTER TABLE leads ADD COLUMN notas TEXT;
    END IF;
END $$;

-- Crear índice para estado
CREATE INDEX IF NOT EXISTS idx_leads_estado ON leads(estado);

-- Actualizar leads existentes que no tengan estado
UPDATE leads SET estado = 'nuevo' WHERE estado IS NULL;

-- =====================================================================
-- VERIFICAR
-- =====================================================================
DO $$
BEGIN
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'MIGRACION 002 - COMPLETADA';
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'Campos agregados:';
    RAISE NOTICE '  - estado (nuevo, contactado, interesado, convertido, perdido)';
    RAISE NOTICE '  - notas (texto libre)';
    RAISE NOTICE '=====================================================';
END $$;
