-- Crear extensión para UUID
create extension if not exists "uuid-ossp";

-- Tabla de usuarios (ya manejada por Supabase Auth)
-- Solo necesitamos crear un trigger para sincronizar con auth.users

-- Tabla de wallpapers
create table public.wallpapers (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  category text not null check (category in ('ABSTRACT', 'NATURE', 'URBAN', 'MINIMAL', 'COLORFUL', 'DARK')),
  url text not null,
  resolution text not null,
  downloads integer default 0,
  likes integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tabla de likes de usuarios
create table public.user_likes (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  wallpaper_id uuid references public.wallpapers(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, wallpaper_id)
);

-- Tabla de descargas de usuarios
create table public.user_downloads (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  wallpaper_id uuid references public.wallpapers(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tabla de usuarios públicos (para datos adicionales)
create table public.users (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Función para incrementar likes
create or replace function increment_likes(wallpaper_id uuid)
returns void as $$
begin
  update public.wallpapers 
  set likes = likes + 1, updated_at = now()
  where id = wallpaper_id;
end;
$$ language plpgsql;

-- Función para decrementar likes
create or replace function decrement_likes(wallpaper_id uuid)
returns void as $$
begin
  update public.wallpapers 
  set likes = greatest(likes - 1, 0), updated_at = now()
  where id = wallpaper_id;
end;
$$ language plpgsql;

-- Función para incrementar descargas
create or replace function increment_downloads(wallpaper_id uuid)
returns void as $$
begin
  update public.wallpapers 
  set downloads = downloads + 1, updated_at = now()
  where id = wallpaper_id;
end;
$$ language plpgsql;

-- Función para sincronizar usuarios
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

-- Trigger para crear usuario público cuando se registra
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Políticas de seguridad (RLS)
alter table public.wallpapers enable row level security;
alter table public.user_likes enable row level security;
alter table public.user_downloads enable row level security;
alter table public.users enable row level security;

-- Políticas para wallpapers (lectura pública, escritura para autenticados)
create policy "Wallpapers are viewable by everyone" on public.wallpapers
  for select using (true);

create policy "Users can insert wallpapers" on public.wallpapers
  for insert with check (auth.role() = 'authenticated');

-- Políticas para likes (solo el usuario puede gestionar sus likes)
create policy "Users can view all likes" on public.user_likes
  for select using (true);

create policy "Users can insert their own likes" on public.user_likes
  for insert with check (auth.uid() = user_id);

create policy "Users can delete their own likes" on public.user_likes
  for delete using (auth.uid() = user_id);

-- Políticas para descargas (solo el usuario puede ver/crear sus descargas)
create policy "Users can view their own downloads" on public.user_downloads
  for select using (auth.uid() = user_id);

create policy "Users can insert their own downloads" on public.user_downloads
  for insert with check (auth.uid() = user_id);

-- Políticas para usuarios públicos
create policy "Users can view their own profile" on public.users
  for select using (auth.uid() = id);

create policy "Users can update their own profile" on public.users
  for update using (auth.uid() = id);

-- Insertar datos de ejemplo
insert into public.wallpapers (title, category, url, resolution, downloads, likes) values
  ('ABSTRACT NEON 001', 'ABSTRACT', 'https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://placehold.co/1920x1080/FF00FF/FFFFFF?text=ABSTRACT', '1920x1080', 1500, 89),
  ('NATURE BRUTAL 002', 'NATURE', 'https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://placehold.co/2560x1440/00FF00/000000?text=NATURE', '2560x1440', 2340, 156),
  ('URBAN CHAOS 003', 'URBAN', 'https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://placehold.co/1920x1080/FFFF00/000000?text=URBAN', '1920x1080', 890, 67),
  ('MINIMAL BLACK 004', 'MINIMAL', 'https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://placehold.co/3840x2160/000000/FFFFFF?text=MINIMAL', '3840x2160', 3450, 234),
  ('COLORFUL EXPLOSION 005', 'COLORFUL', 'https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://placehold.co/1920x1080/00FFFF/000000?text=COLORFUL', '1920x1080', 1890, 145),
  ('DARK VOID 006', 'DARK', 'https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://placehold.co/2560x1440/000000/FF00FF?text=DARK', '2560x1440', 2100, 189);

-- Tabla para registrar hits en el honeypot
create table public.honeypot_logs (
  id uuid default uuid_generate_v4() primary key,
  ip_address text,
  user_agent text,
  payload jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Habilitar RLS pero restringir todo (solo la Service Role Key puede escribir/leer)
alter table public.honeypot_logs enable row level security;

-- Índice para búsquedas rápidas
create index idx_honeypot_ip on public.honeypot_logs(ip_address);

-- Crear índices para mejor rendimiento
create index idx_wallpapers_category on public.wallpapers(category);
create index idx_wallpapers_created_at on public.wallpapers(created_at desc);
create index idx_user_likes_user_id on public.user_likes(user_id);
create index idx_user_likes_wallpaper_id on public.user_likes(wallpaper_id);
create index idx_user_downloads_user_id on public.user_downloads(user_id);
create index idx_user_downloads_wallpaper_id on public.user_downloads(wallpaper_id);
