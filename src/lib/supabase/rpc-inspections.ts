import type { SupabaseClient } from "@supabase/supabase-js";

/** Tipos alineados a las RPC de `supabase/migrations/..._inspection_backend_rpc.sql` */

export type InspectionTipoRpc = "PT" | "MP";

export type SampleRowPTJson = {
  numero_muestra: number;
  placa?: string | null;
  amp1?: number | string | null;
  amp2?: number | string | null;
  amp3?: number | string | null;
  amp4?: number | string | null;
  amp5?: number | string | null;
  amp6?: number | string | null;
  amp7?: number | string | null;
  litros?: number | string | null;
};

export type SampleRowMPJson = {
  numero_muestra: number;
  medida1?: number | string | null;
  medida2?: number | string | null;
  medida3?: number | string | null;
  medida4?: number | string | null;
};

export async function rpcPreviewNextConsecutivo(
  client: SupabaseClient,
  tipo: InspectionTipoRpc,
) {
  return client.rpc("fn_preview_next_consecutivo", { p_tipo: tipo });
}

export async function rpcNextConsecutivo(
  client: SupabaseClient,
  tipo: InspectionTipoRpc,
) {
  return client.rpc("fn_next_consecutivo", { p_tipo: tipo });
}

export async function rpcCreateInspection(
  client: SupabaseClient,
  args: {
    p_op: string;
    p_fecha: string;
    p_inspector: string;
    p_tipo: InspectionTipoRpc;
    p_producto: string;
    p_kw: string | null;
    p_temperaturas: string | null;
    p_cantidad_muestras: number;
    p_instrumento: string | null;
    p_fecha_calibracion: string | null;
  },
) {
  return client.rpc("fn_create_inspection", args);
}

export async function rpcSetInspectionSamples(
  client: SupabaseClient,
  inspectionId: string,
  samples: SampleRowPTJson[] | SampleRowMPJson[],
) {
  return client.rpc("fn_set_inspection_samples", {
    p_inspection_id: inspectionId,
    p_samples: samples,
  });
}

export async function rpcSyncInspectionEstado(
  client: SupabaseClient,
  inspectionId: string,
) {
  return client.rpc("fn_sync_inspection_estado", {
    p_inspection_id: inspectionId,
  });
}

export async function rpcSetInspectionEstado(
  client: SupabaseClient,
  inspectionId: string,
  estado: "En proceso" | "Completado",
) {
  return client.rpc("fn_set_inspection_estado", {
    p_inspection_id: inspectionId,
    p_estado: estado,
  });
}

export async function rpcListInspections(
  client: SupabaseClient,
  filters: {
    p_desde?: string | null;
    p_hasta?: string | null;
    p_inspector?: string | null;
    p_producto?: string | null;
    p_tipo?: InspectionTipoRpc | null;
    p_estado?: "En proceso" | "Completado" | null;
    p_op?: string | null;
  },
) {
  return client.rpc("fn_list_inspections", {
    p_desde: filters.p_desde ?? null,
    p_hasta: filters.p_hasta ?? null,
    p_inspector: filters.p_inspector ?? null,
    p_producto: filters.p_producto ?? null,
    p_tipo: filters.p_tipo ?? null,
    p_estado: filters.p_estado ?? null,
    p_op: filters.p_op ?? null,
  });
}

export async function rpcGetInspectionDetail(
  client: SupabaseClient,
  inspectionId: string,
) {
  return client.rpc("fn_get_inspection_detail", {
    p_inspection_id: inspectionId,
  });
}
