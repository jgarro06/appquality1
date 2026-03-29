-- Esquema alineado con las tablas reales del proyecto.

create table if not exists public.products (
  id uuid primary key default gen_random_uuid (),
  codigo text not null unique,
  descripcion text not null
);

create table if not exists public.inspections (
  id uuid primary key default gen_random_uuid (),
  consecutivo text not null unique,
  tipo text not null check (tipo in ('PT', 'MP')),
  op text not null,
  fecha date not null,
  inspector text not null,
  producto text not null,
  descripcion text,
  kw text,
  temperaturas text,
  cantidad_muestras integer not null check (cantidad_muestras >= 1),
  instrumento text,
  fecha_calibracion date,
  estado text not null check (estado in ('En proceso', 'Completado')),
  created_at timestamptz default now ()
);

create table if not exists public.inspection_samples (
  id uuid primary key default gen_random_uuid (),
  inspection_id uuid not null references public.inspections (id) on delete cascade,
  numero_muestra integer not null,
  placa text,
  amp1 numeric,
  amp2 numeric,
  amp3 numeric,
  amp4 numeric,
  amp5 numeric,
  amp6 numeric,
  amp7 numeric,
  litros numeric,
  medida1 numeric,
  medida2 numeric,
  medida3 numeric,
  medida4 numeric
);

create index if not exists inspection_samples_inspection_id_idx on public.inspection_samples (inspection_id);
