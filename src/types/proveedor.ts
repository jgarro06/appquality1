export type ProveedorRow = {
  id: string;
  nombre: string;
  created_at?: string;
};

export type ProveedorFormData = Omit<ProveedorRow, "id" | "created_at">;
