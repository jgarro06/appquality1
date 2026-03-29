"use server";

import { createClient } from "@/lib/supabase/server";
import type { ProductRow } from "@/types/inspections";

export async function fetchProductos() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("codigo", { ascending: true });

  if (error) {
    console.error("Error fetching productos:", error);
    return { data: null, error: error.message };
  }

  return { data: data as ProductRow[], error: null };
}
