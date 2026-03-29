"use client";

import { useEffect, useState } from "react";
import { fetchProveedores } from "@/app/actions/proveedor";
import { ProveedorForm } from "@/components/proveedor/ProveedorForm";
import { ProveedorTable } from "@/components/proveedor/ProveedorTable";
import type { ProveedorRow } from "@/types/proveedor";

export default function ProveedorPage() {
  const [proveedores, setProveedores] = useState<ProveedorRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProveedores = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchProveedores();
      if (result.error) {
        setError(result.error);
        setProveedores([]);
      } else {
        setProveedores(result.data || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProveedores();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-black">Gestión de Proveedores</h1>
          <p className="text-sm text-gray-600 mt-1">Administra los proveedores de la empresa</p>
        </div>
        <ProveedorForm onSuccess={loadProveedores} />
      </div>

      {error && (
        <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">Error al cargar los proveedores: {error}</p>
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-sm text-gray-500">Cargando proveedores...</p>
        </div>
      ) : (
        <ProveedorTable proveedores={proveedores} onDelete={loadProveedores} />
      )}
    </div>
  );
}
