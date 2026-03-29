import { createClient } from "@/lib/supabase/server";
import type {
  InspectionEstado,
  InspectionRow,
  InspectionTipo,
} from "@/types/inspections";

export type InspectionListFilters = {
  desde?: string;
  hasta?: string;
  inspector?: string;
  producto?: string;
  tipo?: InspectionTipo | "";
  estado?: InspectionEstado | "";
  op?: string;
};

export async function fetchInspectionsForList(filters: InspectionListFilters) {
  const supabase = await createClient();
  let q = supabase
    .from("inspections")
    .select("*")
    .order("fecha", { ascending: false });

  if (filters.desde) q = q.gte("fecha", filters.desde);
  if (filters.hasta) q = q.lte("fecha", filters.hasta);
  if (filters.op?.trim())
    q = q.ilike("op", `%${filters.op.trim()}%`);
  if (filters.producto?.trim())
    q = q.ilike("producto", `%${filters.producto.trim()}%`);
  if (filters.tipo) q = q.eq("tipo", filters.tipo);
  if (filters.estado) q = q.eq("estado", filters.estado);

  const { data, error } = await q;
  if (error) return { error: error.message, rows: [] as InspectionRow[] };
  return { rows: (data ?? []) as InspectionRow[], error: null };
}

export async function fetchInspectionById(id: string) {
  const supabase = await createClient();
  const { data: inspection, error: iErr } = await supabase
    .from("inspections")
    .select("*")
    .eq("id", id)
    .single();

  if (iErr) return { error: iErr.message, inspection: null, samples: [] };

  const { data: samples, error: sErr } = await supabase
    .from("inspection_samples")
    .select("*")
    .eq("inspection_id", id)
    .order("numero_muestra", { ascending: true });

  if (sErr) return { error: sErr.message, inspection: null, samples: [] };

  return { inspection, samples: samples ?? [], error: null };
}
