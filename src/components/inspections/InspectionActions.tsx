"use client";

import Link from "next/link";
import { useState } from "react";
import { fetchInspectionDataForExport } from "@/app/actions/export";
import { ExportButtons } from "./ExportButtons";

type Props = {
  inspectionId: string;
  estado: string;
};

export function InspectionActions({ inspectionId, estado }: Props) {
  const [isLoadingExport, setIsLoadingExport] = useState(false);
  const [exportData, setExportData] = useState<any>(null);
  const [showExportButtons, setShowExportButtons] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const handleShowExport = async () => {
    if (exportData) {
      setShowExportButtons(!showExportButtons);
      return;
    }

    try {
      setIsLoadingExport(true);
      setLoadError(null);
      const result = await fetchInspectionDataForExport(inspectionId);
      
      if (result.error) {
        setLoadError(result.error);
        return;
      }
      
      if (result.data) {
        setExportData(result.data);
        setShowExportButtons(true);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Error desconocido";
      setLoadError(errorMessage);
      console.error("Error loading export data:", error);
    } finally {
      setIsLoadingExport(false);
    }
  };

  const isCompleted = estado === "Completado";

  return (
    <div className="flex flex-col items-center gap-2 py-1">
      {/* Botón Abrir */}
      <Link
        href={`/inspecciones/${inspectionId}`}
        className="inline-flex items-center justify-center px-3 py-1.5 rounded-md bg-red-600 text-white font-medium text-xs transition-colors duration-150 hover:bg-red-700"
      >
        Abrir
      </Link>

      {/* Sección Descargar (solo para completado) */}
      {isCompleted && (
        <div className="w-full flex flex-col items-center gap-1">
          {/* Botón Descargar */}
          <button
            onClick={handleShowExport}
            disabled={isLoadingExport}
            className="inline-flex items-center justify-center px-3 py-1.5 rounded-md bg-red-600 text-white font-medium text-xs transition-colors duration-150 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoadingExport ? "Cargando..." : "Descargar"}
          </button>

          {/* Error message */}
          {loadError && (
            <p className="text-xs text-red-600 font-medium">{loadError}</p>
          )}

          {/* Botones de exportación */}
          {showExportButtons && exportData && (
            <div className="w-full flex justify-center">
              <ExportButtons data={exportData} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
