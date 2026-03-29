"use server";

import { createClient } from "@/lib/supabase/server";

export async function fetchInspectionDataForExport(inspectionId: string) {
  const supabase = await createClient();

  // Obtener datos de la inspección
  const { data: inspection, error: inspectionError } = await supabase
    .from("inspections")
    .select("*")
    .eq("id", inspectionId)
    .single();

  if (inspectionError || !inspection) {
    return { error: "Inspección no encontrada", data: null };
  }

  // Obtener muestras desde la tabla unificada inspection_samples
  const { data: samples, error: samplesError } = await supabase
    .from("inspection_samples")
    .select("*")
    .eq("inspection_id", inspectionId)
    .order("numero_muestra", { ascending: true });

  if (samplesError) {
    console.error("Error obteniendo muestras:", samplesError);
    return { 
      error: `Error obteniendo muestras: ${samplesError.message}`, 
      data: null 
    };
  }

  return {
    error: null,
    data: {
      id: inspection.id,
      consecutivo: inspection.consecutivo,
      fecha: inspection.fecha,
      inspector: inspection.inspector,
      tipo: inspection.tipo,
      producto: inspection.producto,
      descripcion: inspection.descripcion,
      op: inspection.op,
      kw: inspection.kw,
      temperaturas: inspection.temperaturas,
      cantidad_muestras: inspection.cantidad_muestras,
      instrumento: inspection.instrumento,
      fecha_calibracion: inspection.fecha_calibracion,
      estado: inspection.estado,
      samples: samples || [],
    },
  };
}
