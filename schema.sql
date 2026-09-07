-- Diario Nutricional: esquema de base de datos
-- Ejecutar en Supabase: SQL Editor -> New query -> pegar todo -> Run

-- 1. Perfiles (uno por persona: tú y tu novia). Se crea automáticamente
--    al registrarse cada uno con su email en la app.
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'Yo',
  created_at timestamptz default now()
);

-- 2. Productos: base compartida entre los dos perfiles (una vez que uno
--    identifica un producto, el otro no tiene que repetirlo).
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  categoria text,
  kcal numeric,
  proteinas numeric,
  carbohidratos numeric,
  grasas numeric,
  ultimo_precio numeric,
  created_at timestamptz default now()
);

-- 3. Recetas (personales, cada perfil ve solo las suyas)
create table if not exists recipes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  meal text not null, -- Desayuno / Almuerzo / Comida / Merienda / Cena
  servings int not null default 1,
  created_at timestamptz default now()
);

create table if not exists recipe_ingredients (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid references recipes(id) on delete cascade,
  product_id uuid references products(id),
  grams numeric not null
);

-- 4. Diario (personal, cada perfil ve solo el suyo)
create table if not exists diary_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  entry_date date not null,
  meal text not null,
  name text not null,
  qty text,
  kcal numeric not null,
  created_at timestamptz default now()
);

-- 5. Tickets de compra (personal, cada perfil ve solo el suyo)
create table if not exists tickets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  supermercado text,
  total numeric not null,
  created_at timestamptz default now()
);

create table if not exists ticket_items (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid references tickets(id) on delete cascade,
  product_id uuid references products(id),
  precio numeric
);

-- ---------- Seguridad: cada uno solo ve lo suyo ----------
alter table profiles enable row level security;
alter table recipes enable row level security;
alter table recipe_ingredients enable row level security;
alter table diary_entries enable row level security;
alter table tickets enable row level security;
alter table ticket_items enable row level security;
alter table products enable row level security;

create policy "ver mi perfil" on profiles for select using (auth.uid() = id);
create policy "crear mi perfil" on profiles for insert with check (auth.uid() = id);
create policy "editar mi perfil" on profiles for update using (auth.uid() = id);

create policy "mis recetas" on recipes for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "ingredientes de mis recetas" on recipe_ingredients for all
  using (exists (select 1 from recipes r where r.id = recipe_id and r.user_id = auth.uid()))
  with check (exists (select 1 from recipes r where r.id = recipe_id and r.user_id = auth.uid()));

create policy "mi diario" on diary_entries for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "mis tickets" on tickets for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "items de mis tickets" on ticket_items for all
  using (exists (select 1 from tickets t where t.id = ticket_id and t.user_id = auth.uid()))
  with check (exists (select 1 from tickets t where t.id = ticket_id and t.user_id = auth.uid()));

-- Productos: compartidos entre cualquier persona registrada en la app
create policy "todos ven productos" on products for select using (auth.role() = 'authenticated');
create policy "todos crean/editan productos" on products for insert with check (auth.role() = 'authenticated');
create policy "todos actualizan productos" on products for update using (auth.role() = 'authenticated');
