"use client";

import { useEffect, useState } from "react";
import { fetchMateriaPrima } from "@/app/actions/materia-prima";
import { MateriaPrimaForm } from "@/components/materia-prima/MateriaPrimaForm";
import { MateriaPrimaTable } from "@/components/materia-prima/MateriaPrimaTable";
import type { MateriaPrimaRow } from "@/types/materia-prima";

export default function MateriaPrimaPage() {
  const [registros, setRegistros] = useState<MateriaPrimaRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRegistros = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchMateriaPrima();
      if (result.error) {
        setError(result.error);
        setRegistros([]);
      } else {
        setRegistros(result.data || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRegistros();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-black">Control de Materia Prima</h1>
          <p className="text-sm text-gray-600 mt-1">Gestiona y registra la entrada de materiales</p>
        </div>
        <MateriaPrimaForm onSuccess={loadRegistros} />
      </div>

      {error && (
        <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">Error al cargar los registros: {error}</p>
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-sm text-gray-500">Cargando registros...</p>
        </div>
      ) : (
        <MateriaPrimaTable registros={registros} onDelete={loadRegistros} />
      )}
    </div>
  );
}
