"use server";

import { createClient } from "@/lib/supabase/server";
import type { ProveedorRow, ProveedorFormData } from "@/types/proveedor";

export async function fetchProveedores() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("proveedor")
    .select("*")
    .order("nombre", { ascending: true });

  if (error) {
    console.error("Error fetching proveedores:", error);
    return { data: null, error: error.message };
  }

  return { data: data as ProveedorRow[], error: null };
}

export async function createProveedor(formData: ProveedorFormData) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("proveedor")
    .insert([formData])
    .select()
    .single();

  if (error) {
    console.error("Error creating proveedor:", error);
    return { data: null, error: error.message };
  }

  return { data: data as ProveedorRow, error: null };
}

export async function deleteProveedor(id: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("proveedor")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting proveedor:", error);
    return { error: error.message };
  }

  return { error: null };
}

export async function updateProveedor(
  id: string,
  formData: Partial<ProveedorFormData>
) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("proveedor")
    .update(formData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating proveedor:", error);
    return { data: null, error: error.message };
  }

  return { data: data as ProveedorRow, error: null };
}
