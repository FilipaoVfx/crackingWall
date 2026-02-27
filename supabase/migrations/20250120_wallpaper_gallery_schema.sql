/*
# Wallpaper Gallery Database Schema
Esquema completo para la galería de wallpapers con autenticación y métricas

## Query Description: 
Este script creará la estructura completa de la base de datos para la galería de wallpapers.
Incluye tablas para usuarios, wallpapers, likes y descargas, junto con funciones para manejar contadores
y políticas de seguridad (RLS). Es seguro ejecutar - no elimina datos existentes.

## Metadata:
- Schema-Category: "Structural"
- Impact-Level: "Medium"
- Requires-Backup: false
- Reversible: true

## Structure Details:
- users: Perfiles de usuario sincronizados con auth.users
- wallpapers: Catálogo de wallpapers con metadatos
- user_likes: Relación many-to-many entre usuarios y wallpapers liked
- user_downloads: Historial de descargas por usuario

## Security Implications:
- RLS Status: Enabled en todas las tablas públicas
- Policy Changes: Yes - políticas restrictivas por usuario
- Auth Requirements: Autenticación requerida para likes/downloads

## Performance Impact:
- Indexes: Agregados en claves foráneas y campos de búsqueda
- Triggers: Sincronización automática con auth.users
- Estimated Impact: Mínimo - optimizado para consultas frecuentes
*/

-- Crear tabla de usuarios (sincronizada con auth.users)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Crear tabla de wallpapers
CREATE TABLE IF NOT EXISTS public.wallpapers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    url TEXT NOT NULL,
    resolution TEXT NOT NULL,
    downloads INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Crear tabla de likes de usuarios
CREATE TABLE IF NOT EXISTS public.user_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    wallpaper_id UUID NOT NULL REFERENCES public.wallpapers(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, wallpaper_id)
);

-- Crear tabla de descargas de usuarios
CREATE TABLE IF NOT EXISTS public.user_downloads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    wallpaper_id UUID NOT NULL REFERENCES public.wallpapers(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Crear índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_user_likes_user_id ON public.user_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_user_likes_wallpaper_id ON public.user_likes(wallpaper_id);
CREATE INDEX IF NOT EXISTS idx_user_downloads_user_id ON public.user_downloads(user_id);
CREATE INDEX IF NOT EXISTS idx_user_downloads_wallpaper_id ON public.user_downloads(wallpaper_id);
CREATE INDEX IF NOT EXISTS idx_wallpapers_category ON public.wallpapers(category);
CREATE INDEX IF NOT EXISTS idx_wallpapers_title ON public.wallpapers USING gin(to_tsvector('spanish', title));

-- Función para incrementar likes
CREATE OR REPLACE FUNCTION increment_likes(wallpaper_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE public.wallpapers 
    SET likes = likes + 1, updated_at = timezone('utc'::text, now())
    WHERE id = wallpaper_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para decrementar likes
CREATE OR REPLACE FUNCTION decrement_likes(wallpaper_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE public.wallpapers 
    SET likes = GREATEST(likes - 1, 0), updated_at = timezone('utc'::text, now())
    WHERE id = wallpaper_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para incrementar descargas
CREATE OR REPLACE FUNCTION increment_downloads(wallpaper_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE public.wallpapers 
    SET downloads = downloads + 1, updated_at = timezone('utc'::text, now())
    WHERE id = wallpaper_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para crear perfil automáticamente cuando se registra un usuario
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.users (id, email, created_at, updated_at)
    VALUES (new.id, new.email, new.created_at, new.updated_at);
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Crear trigger si no existe
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Habilitar RLS en todas las tablas
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallpapers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_downloads ENABLE ROW LEVEL SECURITY;

-- Políticas para users
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- Políticas para wallpapers (lectura pública, escritura solo autenticada)
DROP POLICY IF EXISTS "Wallpapers are viewable by everyone" ON public.wallpapers;
CREATE POLICY "Wallpapers are viewable by everyone" ON public.wallpapers
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert wallpapers" ON public.wallpapers;
CREATE POLICY "Authenticated users can insert wallpapers" ON public.wallpapers
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Políticas para user_likes
DROP POLICY IF EXISTS "Users can view all likes" ON public.user_likes;
CREATE POLICY "Users can view all likes" ON public.user_likes
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can manage own likes" ON public.user_likes;
CREATE POLICY "Users can manage own likes" ON public.user_likes
    FOR ALL USING (auth.uid() = user_id);

-- Políticas para user_downloads
DROP POLICY IF EXISTS "Users can view own downloads" ON public.user_downloads;
CREATE POLICY "Users can view own downloads" ON public.user_downloads
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own downloads" ON public.user_downloads;
CREATE POLICY "Users can insert own downloads" ON public.user_downloads
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Insertar wallpapers de muestra si la tabla está vacía
INSERT INTO public.wallpapers (title, category, url, resolution, downloads, likes)
SELECT 
    'ABSTRACT ' || generate_series,
    CASE (generate_series % 6)
        WHEN 0 THEN 'ABSTRACT'
        WHEN 1 THEN 'NATURE'
        WHEN 2 THEN 'URBAN'
        WHEN 3 THEN 'MINIMAL'
        WHEN 4 THEN 'COLORFUL'
        ELSE 'DARK'
    END,
    'https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://placehold.co/' || 
    (ARRAY[1920, 2560, 3840])[1 + (generate_series % 3)] || 'x' ||
    (ARRAY[1080, 1440, 2160])[1 + (generate_series % 3)] || '/' ||
    (ARRAY['FF00FF', '00FF00', 'FFFF00', '00FFFF', 'FF0000', '000000'])[1 + (generate_series % 6)] ||
    '/FFFFFF?text=WALLPAPER',
    (ARRAY[1920, 2560, 3840])[1 + (generate_series % 3)] || 'x' ||
    (ARRAY[1080, 1440, 2160])[1 + (generate_series % 3)],
    (random() * 1000)::integer,
    (random() * 100)::integer
FROM generate_series(1, 30)
WHERE NOT EXISTS (SELECT 1 FROM public.wallpapers LIMIT 1);

-- Conceder permisos necesarios
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;
