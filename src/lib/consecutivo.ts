import type { SupabaseClient } from "@supabase/supabase-js";
import type { InspectionTipo } from "@/types/inspections";

/**
 * Genera el siguiente consecutivo PT-AAAA-NN o MP-AAAA-NN
 * consultando los existentes en `inspections` para el año y tipo.
 */
export async function getNextConsecutivo(
  supabase: SupabaseClient,
  tipo: InspectionTipo,
  year: number,
): Promise<string> {
  const prefix = `${tipo}-${year}-`;
  const { data, error } = await supabase
    .from("inspections")
    .select("consecutivo")
    .like("consecutivo", `${prefix}%`);

  if (error) throw error;

  let max = 0;
  for (const row of data ?? []) {
    const c = row.consecutivo as string | undefined;
    if (!c?.startsWith(prefix)) continue;
    const tail = c.slice(prefix.length);
    const n = parseInt(tail, 10);
    if (!Number.isNaN(n)) max = Math.max(max, n);
  }

  const next = max + 1;
  const nn = next <= 999 ? String(next).padStart(2, "0") : String(next);
  return `${prefix}${nn}`;
}
