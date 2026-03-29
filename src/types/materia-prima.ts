export type MateriaPrimaRow = {
  id: string;
  fecha: string;
  numero_oc: string;
  proveedor: string;
  codigo: string;
  descripcion: string;
  cantidad_revisada: number | null;
  cantidad_aceptada: number | null;
  cantidad_rechazada: number | null;
  referencia: string | null;
  comentario: string | null;
  certificado: string;
  created_at?: string;
};

export type MateriaPrimaFormData = Omit<MateriaPrimaRow, "id" | "created_at">;
