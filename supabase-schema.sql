-- ==========================================================
-- TouchBizz Menu - Production Supabase PostgreSQL Schema
-- ==========================================================
-- Run this script in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/_/sql

-- 1. Enable UUID extension
create extension if not exists "uuid-ossp";

-- 2. Create tables
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.restaurants (
  id uuid default uuid_generate_v4() primary key,
  owner_id uuid references auth.users on delete cascade not null,
  name text not null,
  slug text not null unique,
  description text,
  address text,
  phone text,
  logo_url text,
  cover_image_url text,
  theme text default 'classic' not null,
  primary_color text default '#2563eb' not null,
  is_published boolean default false not null,
  currency text default 'DH' not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Support for establishments table
create table if not exists public.establishments (
  id uuid default uuid_generate_v4() primary key,
  owner_id uuid references auth.users on delete cascade not null,
  name text not null,
  slug text not null unique,
  description text,
  address text,
  phone text,
  logo_url text,
  cover_image_url text,
  theme text default 'classic' not null,
  primary_color text default '#2563eb' not null,
  is_published boolean default false not null,
  currency text default 'DH' not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.establishments enable row level security;
create policy "Public establishments view" on public.establishments for select using (true);
create policy "Owner manage establishments" on public.establishments for all using (true);

create table if not exists public.categories (
  id uuid default uuid_generate_v4() primary key,
  restaurant_id uuid references public.restaurants(id) on delete cascade not null,
  name_fr text not null,
  name_ar text,
  name_en text,
  description_fr text,
  description_ar text,
  description_en text,
  sort_order integer default 0 not null,
  is_visible boolean default true not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.menu_items (
  id uuid default uuid_generate_v4() primary key,
  restaurant_id uuid references public.restaurants(id) on delete cascade not null,
  category_id uuid references public.categories(id) on delete cascade not null,
  name_fr text not null,
  name_ar text,
  name_en text,
  description_fr text,
  description_ar text,
  description_en text,
  price numeric(10, 2) not null,
  old_price numeric(10, 2),
  image_url text,
  is_available boolean default true not null,
  is_visible boolean default true not null,
  sort_order integer default 0 not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Indexes for fast mobile querying
create index if not exists idx_restaurants_slug on public.restaurants (slug);
create index if not exists idx_restaurants_owner on public.restaurants (owner_id);
create index if not exists idx_categories_restaurant on public.categories (restaurant_id, sort_order);
create index if not exists idx_menu_items_restaurant on public.menu_items (restaurant_id, sort_order);
create index if not exists idx_menu_items_category on public.menu_items (category_id);

-- 4. Enable Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.restaurants enable row level security;
alter table public.categories enable row level security;
alter table public.menu_items enable row level security;

-- 5. RLS Policies

-- Profiles Policies
create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Restaurants Policies
-- Owner full management
create policy "Owners can do everything on their restaurants"
  on public.restaurants for all
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

-- Public can read published restaurants (by slug)
create policy "Public can view published restaurants"
  on public.restaurants for select
  using (is_published = true);

-- Categories Policies
-- Owner full management
create policy "Owners can manage categories"
  on public.categories for all
  using (
    exists (
      select 1 from public.restaurants
      where restaurants.id = categories.restaurant_id
      and restaurants.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.restaurants
      where restaurants.id = categories.restaurant_id
      and restaurants.owner_id = auth.uid()
    )
  );

-- Public can view visible categories for published restaurants
create policy "Public can view visible categories"
  on public.categories for select
  using (
    is_visible = true and exists (
      select 1 from public.restaurants
      where restaurants.id = categories.restaurant_id
      and restaurants.is_published = true
    )
  );

-- Menu Items Policies
-- Owner full management
create policy "Owners can manage menu items"
  on public.menu_items for all
  using (
    exists (
      select 1 from public.restaurants
      where restaurants.id = menu_items.restaurant_id
      and restaurants.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.restaurants
      where restaurants.id = menu_items.restaurant_id
      and restaurants.owner_id = auth.uid()
    )
  );

-- Public can view visible items for published restaurants
create policy "Public can view visible menu items"
  on public.menu_items for select
  using (
    is_visible = true and exists (
      select 1 from public.restaurants
      where restaurants.id = menu_items.restaurant_id
      and restaurants.is_published = true
    )
  );

-- 6. Storage Bucket for restaurant assets (logo, cover, product photos)
insert into storage.buckets (id, name, public)
values ('restaurant-assets', 'restaurant-assets', true)
on conflict (id) do nothing;

create policy "Public can view restaurant assets"
  on storage.objects for select
  using (bucket_id = 'restaurant-assets');

create policy "Authenticated owners can upload restaurant assets"
  on storage.objects for insert
  with check (bucket_id = 'restaurant-assets' and auth.role() = 'authenticated');

create policy "Authenticated owners can update restaurant assets"
  on storage.objects for update
  using (bucket_id = 'restaurant-assets' and auth.role() = 'authenticated');

create policy "Authenticated owners can delete restaurant assets"
  on storage.objects for delete
  using (bucket_id = 'restaurant-assets' and auth.role() = 'authenticated');

-- 7. Trigger to automatically create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', 'Propriétaire'));
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
