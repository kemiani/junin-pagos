# Supabase - JuninPagos

## Estructura

```
supabase/
├── migrations/
│   └── 001_complete_schema.sql   <- Migracion principal
├── add-admin.sql                  <- Script para agregar admin
└── README.md
```

## Como Ejecutar

### Opcion 1: Supabase Dashboard (Recomendado)

1. Ir a tu proyecto en [supabase.com](https://supabase.com)
2. Ir a **SQL Editor**
3. Copiar y pegar el contenido de `migrations/001_complete_schema.sql`
4. Ejecutar

### Opcion 2: Supabase CLI

```bash
supabase db push
```

## Despues de la Migracion

### Crear el primer Admin

1. En Supabase Dashboard, ir a **Authentication > Users**
2. Crear un nuevo usuario con email y password
3. Copiar el `UUID` del usuario creado
4. En **SQL Editor**, ejecutar el script `add-admin.sql` (modificando los valores)

O manualmente:

```sql
INSERT INTO admin_users (id, email, name, role)
VALUES (
    'UUID-DEL-USUARIO-AQUI',
    'tu-email@ejemplo.com',
    'Tu Nombre',
    'admin'
);
```

### Actualizar metadata del usuario (opcional)

```sql
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
    COALESCE(raw_user_meta_data, '{}'::jsonb),
    '{role}',
    '"admin"'
)
WHERE id = 'UUID-DEL-USUARIO-AQUI';
```

## Tablas Creadas

| Tabla | Descripcion |
|-------|-------------|
| `leads` | Contactos del formulario (nombre, telefono, localidad) |
| `admin_users` | Usuarios administrativos |

## RLS (Row Level Security)

- **Anonimos** pueden insertar leads (formulario publico)
- **Autenticados** (admins) pueden ver, editar y eliminar leads
- Solo **super_admin** puede crear/eliminar otros admins

## Variables de Entorno (.env.local)

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
```

El `SUPABASE_SERVICE_ROLE_KEY` se obtiene de:
**Settings > API > Project API keys > service_role (secret)**
