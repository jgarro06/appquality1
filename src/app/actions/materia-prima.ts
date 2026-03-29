"use server";

import { createClient } from "@/lib/supabase/server";
import type { MateriaPrimaRow, MateriaPrimaFormData } from "@/types/materia-prima";

export async function fetchMateriaPrima() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("control_materia_prima")
    .select("*")
    .order("fecha", { ascending: false });

  if (error) {
    console.error("Error fetching materia prima:", error);
    return { data: null, error: error.message };
  }

  return { data: data as MateriaPrimaRow[], error: null };
}

export async function createMateriaPrima(formData: MateriaPrimaFormData) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("control_materia_prima")
    .insert([formData])
    .select()
    .single();

  if (error) {
    console.error("Error creating materia prima:", error);
    return { data: null, error: error.message };
  }

  return { data: data as MateriaPrimaRow, error: null };
}

export async function deleteMateriaPrima(id: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("control_materia_prima")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting materia prima:", error);
    return { error: error.message };
  }

  return { error: null };
}

export async function updateMateriaPrima(
  id: string,
  formData: Partial<MateriaPrimaFormData>
) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("control_materia_prima")
    .update(formData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating materia prima:", error);
    return { data: null, error: error.message };
  }

  return { data: data as MateriaPrimaRow, error: null };
}
