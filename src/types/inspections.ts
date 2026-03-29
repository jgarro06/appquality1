export type InspectionTipo = "PT" | "MP";

export type InspectionEstado = "En proceso" | "Completado";

export type ProductRow = {
  codigo: string;
  descripcion: string;
};

/** Filas de `inspections` (nombres alineados a Supabase) */
export type InspectionRow = {
  id: string;
  op: string;
  fecha: string;
  inspector: string;
  tipo: InspectionTipo;
  consecutivo: string;
  producto: string;
  descripcion: string | null;
  kw: string | null;
  temperaturas: string | null;
  cantidad_muestras: number;
  instrumento: string | null;
  fecha_calibracion: string | null;
  estado: InspectionEstado;
  created_at?: string;
};

/** Filas de `inspection_samples` */
export type InspectionSampleRow = {
  id?: string;
  inspection_id?: string;
  numero_muestra: number;
  placa: string | null;
  amp1: number | null;
  amp2: number | null;
  amp3: number | null;
  amp4: number | null;
  amp5: number | null;
  amp6: number | null;
  amp7: number | null;
  litros: number | null;
  medida1: number | null;
  medida2: number | null;
  medida3: number | null;
  medida4: number | null;
};
