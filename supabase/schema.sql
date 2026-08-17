-- Elite · Esquema para el catálogo de aguas minerales
-- Ejecuta este script en el editor SQL de Supabase (Dashboard > SQL Editor).

-- 1. Tabla de productos
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  title text not null,
  description text not null default '',
  price numeric not null default 0,
  currency_code text not null default 'USD',
  image_url text,
  tags text[] not null default '{}',
  product_type text not null default 'Agua mineral'
);

alter table public.products enable row level security;

-- 2. Políticas de acceso (público lee, autenticados administran)
drop policy if exists "Public read products" on public.products;
create policy "Public read products" on public.products
  for select using (true);

drop policy if exists "Authenticated insert products" on public.products;
create policy "Authenticated insert products" on public.products
  for insert with check (auth.role() = 'authenticated');

drop policy if exists "Authenticated update products" on public.products;
create policy "Authenticated update products" on public.products
  for update using (auth.role() = 'authenticated');

drop policy if exists "Authenticated delete products" on public.products;
create policy "Authenticated delete products" on public.products
  for delete using (auth.role() = 'authenticated');

-- 3. Bucket público para las fotos de los productos
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

drop policy if exists "Public read product images" on storage.objects;
create policy "Public read product images" on storage.objects
  for select using (bucket_id = 'product-images');

drop policy if exists "Authenticated upload product images" on storage.objects;
create policy "Authenticated upload product images" on storage.objects
  for insert with check (bucket_id = 'product-images' and auth.role() = 'authenticated');

drop policy if exists "Authenticated delete product images" on storage.objects;
create policy "Authenticated delete product images" on storage.objects
  for delete using (bucket_id = 'product-images' and auth.role() = 'authenticated');

-- 4. Tabla de imágenes del slider del inicio
create table if not exists public.slides (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  image_url text not null,
  position int not null default 0
);

alter table public.slides enable row level security;

drop policy if exists "Public read slides" on public.slides;
create policy "Public read slides" on public.slides
  for select using (true);

drop policy if exists "Authenticated insert slides" on public.slides;
create policy "Authenticated insert slides" on public.slides
  for insert with check (auth.role() = 'authenticated');

drop policy if exists "Authenticated update slides" on public.slides;
create policy "Authenticated update slides" on public.slides
  for update using (auth.role() = 'authenticated');

drop policy if exists "Authenticated delete slides" on public.slides;
create policy "Authenticated delete slides" on public.slides
  for delete using (auth.role() = 'authenticated');

-- 5. Bucket público para las imágenes del slider
insert into storage.buckets (id, name, public)
values ('slide-images', 'slide-images', true)
on conflict (id) do nothing;

drop policy if exists "Public read slide images" on storage.objects;
create policy "Public read slide images" on storage.objects
  for select using (bucket_id = 'slide-images');

drop policy if exists "Authenticated upload slide images" on storage.objects;
create policy "Authenticated upload slide images" on storage.objects
  for insert with check (bucket_id = 'slide-images' and auth.role() = 'authenticated');

drop policy if exists "Authenticated delete slide images" on storage.objects;
create policy "Authenticated delete slide images" on storage.objects
  for delete using (bucket_id = 'slide-images' and auth.role() = 'authenticated');

-- 6. Configuración general (redes sociales del pie de página)
create table if not exists public.settings (
  id text primary key default 'general',
  instagram_url text not null default '',
  facebook_url text not null default '',
  x_url text not null default '',
  updated_at timestamptz not null default now()
);

insert into public.settings (id) values ('general')
on conflict (id) do nothing;

alter table public.settings enable row level security;

drop policy if exists "Public read settings" on public.settings;
create policy "Public read settings" on public.settings
  for select using (true);

drop policy if exists "Authenticated insert settings" on public.settings;
create policy "Authenticated insert settings" on public.settings
  for insert with check (auth.role() = 'authenticated');

drop policy if exists "Authenticated update settings" on public.settings;
create policy "Authenticated update settings" on public.settings
  for update using (auth.role() = 'authenticated');

-- 7. Tabla de pedidos (guardado de compras y clientes con Auth0)
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  customer_name text not null,
  customer_city text not null,
  customer_id_number text not null,
  customer_phone text not null,
  quantity int not null default 1,
  total_price numeric not null default 0,
  currency text not null default 'USD',
  items jsonb not null default '[]'::jsonb,
  auth0_user_id text,
  auth0_user_email text,
  status text not null default 'completed'
);

alter table public.orders enable row level security;

drop policy if exists "Public insert orders" on public.orders;
create policy "Public insert orders" on public.orders
  for insert with check (true);

drop policy if exists "Public read orders" on public.orders;
create policy "Public read orders" on public.orders
  for select using (true);

drop policy if exists "Authenticated update orders" on public.orders;
create policy "Authenticated update orders" on public.orders
  for update using (auth.role() = 'authenticated');

drop policy if exists "Authenticated delete orders" on public.orders;
create policy "Authenticated delete orders" on public.orders
  for delete using (auth.role() = 'authenticated');
