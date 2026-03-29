import { createClient } from "@/lib/supabase/client";

/** Consulta de catálogo desde el navegador (requiere RLS de lectura en `products`). */
export async function fetchProductDescriptionByCodigo(codigo: string) {
  const trimmed = codigo.trim();
  if (!trimmed) {
    return { descripcion: null as string | null, error: null as string | null };
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from("products")
    .select("descripcion")
    .eq("codigo", trimmed)
    .maybeSingle();

  if (error) return { descripcion: null, error: error.message };
  return { descripcion: data?.descripcion ?? null, error: null };
}
