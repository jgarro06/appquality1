-- Create proveedor (suppliers) table
create table if not exists public.proveedor (
  id uuid primary key default gen_random_uuid(),
  nombre text not null unique,
  created_at timestamptz default now()
);

-- Create control_materia_prima (raw materials control) table
create table if not exists public.control_materia_prima (
  id uuid primary key default gen_random_uuid(),
  fecha date not null,
  numero_oc text not null,
  proveedor text not null,
  codigo text not null,
  descripcion text not null,
  cantidad_revisada integer not null check (cantidad_revisada >= 0),
  cantidad_aceptada integer not null check (cantidad_aceptada >= 0),
  cantidad_rechazada integer not null check (cantidad_rechazada >= 0),
  referencia text,
  comentario text,
  certificado boolean default false,
  created_at timestamptz default now()
);

-- Create indexes for better query performance
create index if not exists control_materia_prima_fecha_idx 
  on public.control_materia_prima (fecha desc);

create index if not exists proveedor_nombre_idx 
  on public.proveedor (nombre);

-- Add sample proveedor data
insert into public.proveedor (nombre)
values 
  ('Acme Components'),
  ('Global Supplies'),
  ('Tech Materials')
on conflict on constraint proveedor_nombre_key do nothing;
