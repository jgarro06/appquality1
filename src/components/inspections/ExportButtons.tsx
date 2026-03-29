"use client";

import { useState } from "react";
import {
  exportToPDF,
  exportToExcel,
  type InspectionExportData,
} from "@/lib/export-utils";

type Props = {
  data: InspectionExportData;
};

export function ExportButtons({ data }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExportPDF = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setTimeout(async () => {
        await exportToPDF(data);
        setIsLoading(false);
      }, 100);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error desconocido";
      setError(errorMessage);
      console.error("Error exporting to PDF:", err);
      setIsLoading(false);
    }
  };

  const handleExportExcel = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setTimeout(() => {
        exportToExcel(data);
        setIsLoading(false);
      }, 100);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error desconocido";
      setError(errorMessage);
      console.error("Error exporting to Excel:", err);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-1 pt-1">
      <div className="flex items-center gap-2">
        {/* Botón PDF */}
        <button
          onClick={handleExportPDF}
          disabled={isLoading}
          title="Descargar como PDF"
          className="inline-flex items-center justify-center px-2.5 py-1 rounded-md bg-red-600 text-white font-medium text-xs transition-colors duration-150 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "..." : "PDF"}
        </button>

        {/* Botón Excel */}
        <button
          onClick={handleExportExcel}
          disabled={isLoading}
          title="Descargar como Excel"
          className="inline-flex items-center justify-center px-2.5 py-1 rounded-md bg-red-600 text-white font-medium text-xs transition-colors duration-150 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "..." : "Excel"}
        </button>
      </div>

      {/* Error message */}
      {error && (
        <p className="text-xs text-red-600">{error}</p>
      )}
    </div>
  );
}
