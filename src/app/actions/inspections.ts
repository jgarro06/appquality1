"use server";

import { revalidatePath } from "next/cache";
import { getNextConsecutivo } from "@/lib/consecutivo";
import { buildFinalizeSchema, inspectionBaseSchema } from "@/lib/schemas/inspection";
import { createClient } from "@/lib/supabase/server";
import type { InspectionEstado, InspectionTipo } from "@/types/inspections";

export type SampleInputPT = {
  numero_muestra: number;
  placa: string;
  amperajes: number[];
  litros: number;
};

export type SampleInputMP = {
  numero_muestra: number;
  medida1: number;
  medida2: number;
  medida3: number;
  medida4: number;
};

export type SaveInspectionPayload = {
  id?: string;
  op: string;
  fecha: string;
  inspector: string;
  tipo: InspectionTipo;
  producto: string;
  descripcion?: string | null;
  kw?: string | null;
  temperaturas?: string | null;
  cantidad_muestras: number;
  instrumento?: string | null;
  fecha_calibracion?: string | null;
  samplesPT?: SampleInputPT[];
  samplesMP?: SampleInputMP[];
};

function mapSamplesToRows(
  inspectionId: string,
  tipo: InspectionTipo,
  samplesPT: SampleInputPT[] | undefined,
  samplesMP: SampleInputMP[] | undefined,
) {
  if (tipo === "PT") {
    const list = samplesPT ?? [];
    return list.map((s) => {
      const a = s.amperajes;
      return {
        inspection_id: inspectionId,
        numero_muestra: s.numero_muestra,
        placa: s.placa,
        amp1: a[0] ?? null,
        amp2: a[1] ?? null,
        amp3: a[2] ?? null,
        amp4: a[3] ?? null,
        amp5: a[4] ?? null,
        amp6: a[5] ?? null,
        amp7: a[6] ?? null,
        litros: s.litros,
        medida1: null,
        medida2: null,
        medida3: null,
        medida4: null,
      };
    });
  }
  const list = samplesMP ?? [];
  return list.map((s) => ({
    inspection_id: inspectionId,
    numero_muestra: s.numero_muestra,
    placa: null,
    amp1: null,
    amp2: null,
    amp3: null,
    amp4: null,
    amp5: null,
    amp6: null,
    amp7: null,
    litros: null,
    medida1: s.medida1,
    medida2: s.medida2,
    medida3: s.medida3,
    medida4: s.medida4,
  }));
}

export async function previewConsecutivo(tipo: InspectionTipo) {
  const supabase = await createClient();
  const year = new Date().getFullYear();
  const consecutivo = await getNextConsecutivo(supabase, tipo, year);
  return { consecutivo, year };
}

export async function lookupProductByCodigo(codigo: string) {
  const trimmed = codigo.trim();
  if (!trimmed) return { descripcion: null as string | null };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("codigo, descripcion")
    .eq("codigo", trimmed)
    .maybeSingle();

  if (error) {
    return { error: error.message, descripcion: null as string | null };
  }
  return { descripcion: data?.descripcion ?? null };
}

export async function saveInspectionDraft(payload: SaveInspectionPayload) {
  const base = inspectionBaseSchema.safeParse(payload);
  if (!base.success) {
    return { ok: false as const, error: base.error.flatten().fieldErrors };
  }

  const { cantidad_muestras, tipo } = base.data;
  const count =
    tipo === "PT"
      ? (payload.samplesPT?.length ?? 0)
      : (payload.samplesMP?.length ?? 0);

  if (count > cantidad_muestras) {
    return {
      ok: false as const,
      error: {
        samples: [
          `No puede haber más de ${cantidad_muestras} muestras (tiene ${count}).`,
        ],
      },
    };
  }

  const supabase = await createClient();
  const year = new Date().getFullYear();
  const estado: InspectionEstado = "En proceso";

  const row = {
    op: base.data.op,
    fecha: base.data.fecha,
    inspector: base.data.inspector,
    tipo: base.data.tipo,
    producto: base.data.producto,
    descripcion: base.data.descripcion ?? null,
    kw: base.data.kw ?? null,
    temperaturas: base.data.temperaturas ?? null,
    cantidad_muestras: base.data.cantidad_muestras,
    instrumento: base.data.instrumento ?? null,
    fecha_calibracion: base.data.fecha_calibracion || null,
    estado,
  };

  let inspectionId = payload.id;

  if (inspectionId) {
    const { error: upErr } = await supabase
      .from("inspections")
      .update(row)
      .eq("id", inspectionId);
    if (upErr) return { ok: false as const, error: upErr.message };

    await supabase
      .from("inspection_samples")
      .delete()
      .eq("inspection_id", inspectionId);
  } else {
    const consecutivo = await getNextConsecutivo(
      supabase,
      base.data.tipo,
      year,
    );
    const { data: inserted, error: insErr } = await supabase
      .from("inspections")
      .insert({ ...row, consecutivo })
      .select("id")
      .single();
    if (insErr) return { ok: false as const, error: insErr.message };
    inspectionId = inserted!.id as string;
  }

  const sampleRows = mapSamplesToRows(
    inspectionId,
    tipo,
    payload.samplesPT,
    payload.samplesMP,
  );

  if (sampleRows.length > 0) {
    const { error: sErr } = await supabase
      .from("inspection_samples")
      .insert(sampleRows);
    if (sErr) return { ok: false as const, error: sErr.message };
  }

  revalidatePath("/inspecciones");
  revalidatePath(`/inspecciones/${inspectionId}`);
  return { ok: true as const, id: inspectionId };
}

export async function finalizeInspection(payload: SaveInspectionPayload) {
  const tipo = payload.tipo;
  const cantidad = payload.cantidad_muestras;

  const samples =
    tipo === "PT"
      ? (payload.samplesPT ?? []).map((s) => ({
          numero_muestra: s.numero_muestra,
          placa: s.placa,
          amperajes: s.amperajes as [
            number,
            number,
            number,
            number,
            number,
            number,
            number,
          ],
          litros: s.litros,
        }))
      : (payload.samplesMP ?? []).map((s) => ({
          numero_muestra: s.numero_muestra,
          medida1: s.medida1,
          medida2: s.medida2,
          medida3: s.medida3,
          medida4: s.medida4,
        }));

  const schema = buildFinalizeSchema(tipo, cantidad);
  const parsed = schema.safeParse({
    op: payload.op,
    fecha: payload.fecha,
    inspector: payload.inspector,
    tipo: payload.tipo,
    producto: payload.producto,
    descripcion: payload.descripcion,
    kw: payload.kw,
    temperaturas: payload.temperaturas,
    cantidad_muestras: payload.cantidad_muestras,
    instrumento: payload.instrumento,
    fecha_calibracion: payload.fecha_calibracion,
    samples,
  });

  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.flatten() };
  }

  const supabase = await createClient();
  const year = new Date().getFullYear();
  const estado: InspectionEstado = "Completado";

  const d = parsed.data;
  const row = {
    op: d.op,
    fecha: d.fecha,
    inspector: d.inspector,
    tipo: d.tipo,
    producto: d.producto,
    descripcion: d.descripcion ?? null,
    kw: d.kw ?? null,
    temperaturas: d.temperaturas ?? null,
    cantidad_muestras: d.cantidad_muestras,
    instrumento: d.instrumento ?? null,
    fecha_calibracion: d.fecha_calibracion || null,
    estado,
  };

  let inspectionId = payload.id;

  if (inspectionId) {
    const { error: upErr } = await supabase
      .from("inspections")
      .update(row)
      .eq("id", inspectionId);
    if (upErr) return { ok: false as const, error: upErr.message };

    await supabase
      .from("inspection_samples")
      .delete()
      .eq("inspection_id", inspectionId);
  } else {
    const consecutivo = await getNextConsecutivo(supabase, tipo, year);
    const { data: inserted, error: insErr } = await supabase
      .from("inspections")
      .insert({ ...row, consecutivo })
      .select("id")
      .single();
    if (insErr) return { ok: false as const, error: insErr.message };
    inspectionId = inserted!.id as string;
  }

  const sampleRows = mapSamplesToRows(
    inspectionId,
    tipo,
    tipo === "PT" ? payload.samplesPT : undefined,
    tipo === "MP" ? payload.samplesMP : undefined,
  );

  const { error: sErr } = await supabase
    .from("inspection_samples")
    .insert(sampleRows);
  if (sErr) return { ok: false as const, error: sErr.message };

  revalidatePath("/inspecciones");
  revalidatePath(`/inspecciones/${inspectionId}`);
  return { ok: true as const, id: inspectionId };
}
