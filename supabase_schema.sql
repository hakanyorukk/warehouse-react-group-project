-- ============================================================================
-- Warehouse Inventory System — Supabase schema
-- Run this script in your Supabase project's SQL Editor (in one go).
-- ============================================================================

-- ── Tables ──────────────────────────────────────────────────────────────────

create table if not exists categories (
  id bigserial primary key,
  name text not null
);

create table if not exists suppliers (
  id bigserial primary key,
  name text not null,
  contact_email text,
  phone text
);

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  role text not null default 'staff' check (role in ('admin', 'staff'))
);

create table if not exists products (
  id bigserial primary key,
  sku text not null unique,
  name text not null,
  category_id bigint references categories(id) on delete set null,
  unit text not null default 'pcs',
  min_stock int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists stock_movements (
  id bigserial primary key,
  product_id bigint not null references products(id) on delete cascade,
  supplier_id bigint references suppliers(id) on delete set null,
  user_id uuid references auth.users(id) on delete set null,
  movement_type text not null check (movement_type in ('IN', 'OUT')),
  quantity int not null check (quantity > 0),
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists idx_movements_product on stock_movements (product_id);
create index if not exists idx_movements_created on stock_movements (created_at desc);

-- ── Auto-create a profile row when a new auth user signs up ─────────────────

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    'staff'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── Row Level Security (any authenticated user can read/write) ──────────────

alter table categories       enable row level security;
alter table suppliers        enable row level security;
alter table products         enable row level security;
alter table stock_movements  enable row level security;
alter table profiles         enable row level security;

drop policy if exists "auth all categories" on categories;
create policy "auth all categories" on categories for all to authenticated using (true) with check (true);

drop policy if exists "auth all suppliers" on suppliers;
create policy "auth all suppliers" on suppliers for all to authenticated using (true) with check (true);

drop policy if exists "auth all products" on products;
create policy "auth all products" on products for all to authenticated using (true) with check (true);

drop policy if exists "auth all movements" on stock_movements;
create policy "auth all movements" on stock_movements for all to authenticated using (true) with check (true);

drop policy if exists "read all profiles" on profiles;
create policy "read all profiles" on profiles for select to authenticated using (true);

drop policy if exists "update own profile" on profiles;
create policy "update own profile" on profiles for update to authenticated using (auth.uid() = id);

-- ── Seed data (matches the design's sample products) ────────────────────────

insert into categories (name) values
  ('Electronics'),
  ('Furniture'),
  ('Stationery'),
  ('Cleaning Supplies')
on conflict do nothing;

insert into suppliers (name, contact_email, phone) values
  ('TechDist Ltd', 'orders@techdist.com', '01234 567890'),
  ('OfficeWorld', 'supply@officeworld.com', '01234 111222'),
  ('CleanCo', 'info@cleanco.com', '01234 333444')
on conflict do nothing;

insert into products (sku, name, category_id, unit, min_stock) values
  ('ELEC-001', 'Laptop',           (select id from categories where name = 'Electronics'),       'pcs',   5),
  ('ELEC-002', 'Monitor',          (select id from categories where name = 'Electronics'),       'pcs',   3),
  ('FURN-001', 'Office Chair',     (select id from categories where name = 'Furniture'),         'pcs',   4),
  ('STAT-001', 'A4 Paper (ream)',  (select id from categories where name = 'Stationery'),        'reams', 20),
  ('STAT-002', 'Ballpoint Pens',   (select id from categories where name = 'Stationery'),        'box',   10),
  ('CLEN-001', 'Floor Cleaner',    (select id from categories where name = 'Cleaning Supplies'), 'litre', 8)
on conflict (sku) do nothing;
