-- Backend RPC: consecutivos, inspecciones, muestras y consultas.
-- Ejecutar en Supabase SQL Editor o con: supabase db push / migraciones locales.
-- Requisitos: tablas public.inspections, public.inspection_samples, public.products (esquema alineado al proyecto).

-- ---------------------------------------------------------------------------
-- 1) Consecutivo PT-AAAA-NN / MP-AAAA-NN (incremental por año y tipo)
-- ---------------------------------------------------------------------------
create or replace function public.fn_next_consecutivo (p_tipo text)
  returns text
  language plpgsql
  volatile
  as $$
declare
  v_year int := extract(year from current_date)::int;
  v_prefix text;
  v_max int;
  v_next int;
  v_nn text;
begin
  if p_tipo is null or p_tipo not in ('PT', 'MP') then
    raise exception 'INVALID_TIPO' using errcode = 'P0001';
  end if;

  v_prefix := p_tipo || '-' || v_year::text || '-';

  -- Evita carreras entre dos altas simultáneas del mismo tipo/año
  perform pg_advisory_xact_lock(hashtext('inspection_consecutivo:' || p_tipo || ':' || v_year::text), 0);

  select coalesce(max((regexp_match(i.consecutivo, '^(PT|MP)-(\d{4})-(\d+)$'))[3]::integer), 0)
    into v_max
  from public.inspections i
  where i.tipo = p_tipo
    and i.consecutivo ~ '^(PT|MP)-\d{4}-\d+$';

  v_next := v_max + 1;
  v_nn := case when v_next <= 999 then lpad(v_next::text, 2, '0') else v_next::text end;

  return v_prefix || v_nn;
end;
$$;

comment on function public.fn_next_consecutivo (text) is
'Genera el siguiente consecutivo PT-AAAA-NN o MP-AAAA-NN (bloqueo transaccional por tipo/año).';

-- Vista previa sin bloqueo transaccional (solo UI; puede diferir de la siguiente alta concurrente)
create or replace function public.fn_preview_next_consecutivo (p_tipo text)
  returns text
  language plpgsql
  stable
  as $$
declare
  v_year int := extract(year from current_date)::int;
  v_prefix text;
  v_max int;
  v_next int;
  v_nn text;
begin
  if p_tipo is null or p_tipo not in ('PT', 'MP') then
    raise exception 'INVALID_TIPO' using errcode = 'P0001';
  end if;
  v_prefix := p_tipo || '-' || v_year::text || '-';
  select coalesce(max((regexp_match(i.consecutivo, '^(PT|MP)-(\d{4})-(\d+)$'))[3]::integer), 0)
    into v_max
  from public.inspections i
  where i.tipo = p_tipo
    and i.consecutivo ~ '^(PT|MP)-\d{4}-\d+$';
  v_next := v_max + 1;
  v_nn := case when v_next <= 999 then lpad(v_next::text, 2, '0') else v_next::text end;
  return v_prefix || v_nn;
end;
$$;

-- ---------------------------------------------------------------------------
-- 2) Crear inspección: valida producto, copia descripción, estado En proceso
-- ---------------------------------------------------------------------------
create or replace function public.fn_create_inspection (
  p_op text,
  p_fecha date,
  p_inspector text,
  p_tipo text,
  p_producto text,
  p_kw text,
  p_temperaturas text,
  p_cantidad_muestras integer,
  p_instrumento text,
  p_fecha_calibracion date
)
  returns uuid
  language plpgsql
  volatile
  as $$
declare
  v_id uuid;
  v_desc text;
  v_cons text;
begin
  if p_tipo is null or p_tipo not in ('PT', 'MP') then
    raise exception 'INVALID_TIPO' using errcode = 'P0001';
  end if;
  if p_cantidad_muestras is null or p_cantidad_muestras < 1 then
    raise exception 'INVALID_CANTIDAD_MUESTRAS' using errcode = 'P0001';
  end if;

  select p.descripcion
    into v_desc
  from public.products p
  where p.codigo = trim(p_producto);

  if not found then
    raise exception 'PRODUCT_NOT_FOUND' using errcode = 'P0001';
  end if;

  v_cons := public.fn_next_consecutivo (p_tipo);

  insert into public.inspections (
    consecutivo,
    tipo,
    op,
    fecha,
    inspector,
    producto,
    descripcion,
    kw,
    temperaturas,
    cantidad_muestras,
    instrumento,
    fecha_calibracion,
    estado
  )
  values (
    v_cons,
    p_tipo,
    p_op,
    p_fecha,
    p_inspector,
    trim(p_producto),
    v_desc,
    p_kw,
    p_temperaturas,
    p_cantidad_muestras,
    p_instrumento,
    p_fecha_calibracion,
    'En proceso'
  )
  returning id into v_id;

  return v_id;
end;
$$;

comment on function public.fn_create_inspection (text, date, text, text, text, text, text, integer, text, date) is
'Inserta inspección con consecutivo automático y descripción tomada de products.';

-- ---------------------------------------------------------------------------
-- 3) Sincronizar estado según cantidad de muestras vs cantidad_muestras
-- ---------------------------------------------------------------------------
create or replace function public.fn_sync_inspection_estado (p_inspection_id uuid)
  returns text
  language plpgsql
  volatile
  as $$
declare
  v_need int;
  v_have bigint;
  v_new text;
begin
  select i.cantidad_muestras
    into v_need
  from public.inspections i
  where i.id = p_inspection_id;

  if not found then
    raise exception 'INSPECTION_NOT_FOUND' using errcode = 'P0001';
  end if;

  select count(*)::bigint
    into v_have
  from public.inspection_samples s
  where s.inspection_id = p_inspection_id;

  if v_have >= v_need then
    v_new := 'Completado';
  else
    v_new := 'En proceso';
  end if;

  update public.inspections i
  set
    estado = v_new
  where i.id = p_inspection_id;

  return v_new;
end;
$$;

-- ---------------------------------------------------------------------------
-- 4) Reemplazar muestras de una inspección (valida tipo y tope cantidad_muestras)
--    p_samples: array JSON de objetos según tipo.
--    PT: numero_muestra, placa, amp1..amp7, litros
--    MP: numero_muestra, medida1..medida4
-- ---------------------------------------------------------------------------
create or replace function public.fn_set_inspection_samples (
  p_inspection_id uuid,
  p_samples jsonb
)
  returns void
  language plpgsql
  volatile
  as $$
declare
  v_tipo text;
  v_need int;
  v_estado text;
  v_len int;
  elem jsonb;
begin
  select i.tipo, i.cantidad_muestras, i.estado
    into v_tipo, v_need, v_estado
  from public.inspections i
  where i.id = p_inspection_id
  for update;

  if not found then
    raise exception 'INSPECTION_NOT_FOUND' using errcode = 'P0001';
  end if;

  if v_estado = 'Completado' then
    raise exception 'INSPECTION_LOCKED' using errcode = 'P0001';
  end if;

  if p_samples is null or jsonb_typeof(p_samples) <> 'array' then
    raise exception 'INVALID_SAMPLES_JSON' using errcode = 'P0001';
  end if;

  v_len := jsonb_array_length(p_samples);

  if v_len > v_need then
    raise exception 'TOO_MANY_SAMPLES' using errcode = 'P0001';
  end if;

  delete from public.inspection_samples s
  where s.inspection_id = p_inspection_id;

  if v_len = 0 then
    perform public.fn_sync_inspection_estado (p_inspection_id);
    return;
  end if;

  if v_tipo = 'PT' then
    for elem in select jsonb_array_elements(p_samples)
      loop
        insert into public.inspection_samples (
          inspection_id,
          numero_muestra,
          placa,
          amp1,
          amp2,
          amp3,
          amp4,
          amp5,
          amp6,
          amp7,
          litros,
          medida1,
          medida2,
          medida3,
          medida4
        )
        values (
          p_inspection_id,
          (elem->>'numero_muestra')::integer,
          nullif(trim(elem->>'placa'), ''),
          nullif(elem->>'amp1', '')::numeric,
          nullif(elem->>'amp2', '')::numeric,
          nullif(elem->>'amp3', '')::numeric,
          nullif(elem->>'amp4', '')::numeric,
          nullif(elem->>'amp5', '')::numeric,
          nullif(elem->>'amp6', '')::numeric,
          nullif(elem->>'amp7', '')::numeric,
          nullif(elem->>'litros', '')::numeric,
          null,
          null,
          null,
          null
        );
      end loop;
  elsif v_tipo = 'MP' then
    for elem in select jsonb_array_elements(p_samples)
      loop
        insert into public.inspection_samples (
          inspection_id,
          numero_muestra,
          placa,
          amp1,
          amp2,
          amp3,
          amp4,
          amp5,
          amp6,
          amp7,
          litros,
          medida1,
          medida2,
          medida3,
          medida4
        )
        values (
          p_inspection_id,
          (elem->>'numero_muestra')::integer,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          nullif(elem->>'medida1', '')::numeric,
          nullif(elem->>'medida2', '')::numeric,
          nullif(elem->>'medida3', '')::numeric,
          nullif(elem->>'medida4', '')::numeric
        );
      end loop;
  else
    raise exception 'INVALID_TIPO' using errcode = 'P0001';
  end if;

  perform public.fn_sync_inspection_estado (p_inspection_id);
end;
$$;

comment on function public.fn_set_inspection_samples (uuid, jsonb) is
'Reemplaza todas las muestras de la inspección y recalcula estado (En proceso / Completado).';

-- ---------------------------------------------------------------------------
-- 5) Forzar estado (opcional; normalmente use fn_sync_inspection_estado)
-- ---------------------------------------------------------------------------
create or replace function public.fn_set_inspection_estado (
  p_inspection_id uuid,
  p_estado text
)
  returns text
  language plpgsql
  volatile
  as $$
declare
  v_rc int;
begin
  if p_estado is null or p_estado not in ('En proceso', 'Completado') then
    raise exception 'INVALID_ESTADO' using errcode = 'P0001';
  end if;

  update public.inspections i
  set
    estado = p_estado
  where i.id = p_inspection_id;

  get diagnostics v_rc = row_count;

  if v_rc = 0 then
    raise exception 'INSPECTION_NOT_FOUND' using errcode = 'P0001';
  end if;

  return p_estado;
end;
$$;

-- ---------------------------------------------------------------------------
-- 6) Listar inspecciones con filtros opcionales
-- ---------------------------------------------------------------------------
create or replace function public.fn_list_inspections (
  p_desde date default null,
  p_hasta date default null,
  p_inspector text default null,
  p_producto text default null,
  p_tipo text default null,
  p_estado text default null
)
  returns setof public.inspections
  language sql
  stable
  as $$
  select i.*
  from public.inspections i
  where (p_desde is null or i.fecha >= p_desde)
  and (p_hasta is null or i.fecha <= p_hasta)
  and (
    p_inspector is null
    or length(trim(p_inspector)) = 0
    or i.inspector ilike '%' || trim(p_inspector) || '%'
  )
  and (
    p_producto is null
    or length(trim(p_producto)) = 0
    or i.producto ilike '%' || trim(p_producto) || '%'
  )
  and (p_tipo is null or i.tipo = p_tipo)
  and (p_estado is null or i.estado = p_estado)
  order by i.fecha desc, i.created_at desc nulls last;
$$;

-- ---------------------------------------------------------------------------
-- 7) Detalle: inspección + muestras como JSON
-- ---------------------------------------------------------------------------
create or replace function public.fn_get_inspection_detail (p_inspection_id uuid)
  returns jsonb
  language sql
  stable
  as $$
  select jsonb_build_object(
    'inspection',
    to_jsonb(i),
    'samples',
    coalesce((
      select jsonb_agg(to_jsonb(s) order by s.numero_muestra)
      from public.inspection_samples s
      where s.inspection_id = p_inspection_id
    ), '[]'::jsonb)
  )
  from public.inspections i
  where i.id = p_inspection_id;
$$;

comment on function public.fn_get_inspection_detail (uuid) is
'Devuelve { inspection: {...}, samples: [...] } o NULL si no existe.';

-- ---------------------------------------------------------------------------
-- Permisos (ajusta si solo usas service_role o usuarios autenticados)
-- ---------------------------------------------------------------------------
grant execute on function public.fn_next_consecutivo (text) to anon,
  authenticated;

grant execute on function public.fn_preview_next_consecutivo (text) to anon,
  authenticated;

grant execute on function public.fn_create_inspection (text, date, text, text, text, text, text, integer, text, date) to anon,
  authenticated;

grant execute on function public.fn_sync_inspection_estado (uuid) to anon,
  authenticated;

grant execute on function public.fn_set_inspection_samples (uuid, jsonb) to anon,
  authenticated;

grant execute on function public.fn_set_inspection_estado (uuid, text) to anon,
  authenticated;

grant execute on function public.fn_list_inspections (date, date, text, text, text, text) to anon,
  authenticated;

grant execute on function public.fn_get_inspection_detail (uuid) to anon,
  authenticated;
