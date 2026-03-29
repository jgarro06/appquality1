"use client";

import { useState } from "react";
import { MateriaPrimaEditForm } from "./MateriaPrimaEditForm";
import type { MateriaPrimaRow } from "@/types/materia-prima";

type Props = {
  registros: MateriaPrimaRow[];
  onDelete: () => void;
};

export function MateriaPrimaTable({ registros, onDelete }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingRegistro, setEditingRegistro] = useState<MateriaPrimaRow | null>(null);

  const handleEdit = (registro: MateriaPrimaRow) => {
    setEditingRegistro(registro);
    setEditingId(registro.id);
  };

  const handleCloseEdit = () => {
    setEditingId(null);
    setEditingRegistro(null);
  };

  if (registros.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-gray-500">No hay registros de materia prima</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border border-gray-200 rounded-lg">
      <table className="w-full text-xs">
        <thead className="bg-gray-100 border-b border-gray-200">
          <tr>
            <th className="px-4 py-2 text-left font-semibold text-black">Fecha</th>
            <th className="px-4 py-2 text-left font-semibold text-black">OC</th>
            <th className="px-4 py-2 text-left font-semibold text-black">Proveedor</th>
            <th className="px-4 py-2 text-left font-semibold text-black">Código</th>
            <th className="px-4 py-2 text-left font-semibold text-black">Descripción</th>
            <th className="px-4 py-2 text-center font-semibold text-black">Revisada</th>
            <th className="px-4 py-2 text-center font-semibold text-black">Aceptada</th>
            <th className="px-4 py-2 text-center font-semibold text-black">Rechazada</th>
            <th className="px-4 py-2 text-left font-semibold text-black">Referencia</th>
            <th className="px-4 py-2 text-left font-semibold text-black">Comentario</th>
            <th className="px-4 py-2 text-center font-semibold text-black">Cert.</th>
            <th className="px-4 py-2 text-center font-semibold text-black">Acción</th>
          </tr>
        </thead>
        <tbody>
          {registros.map((registro, idx) => (
            <tr
              key={registro.id}
              className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
            >
              <td className="px-4 py-2 text-black">{registro.fecha}</td>
              <td className="px-4 py-2 text-black">{registro.numero_oc}</td>
              <td className="px-4 py-2 text-black">{registro.proveedor}</td>
              <td className="px-4 py-2 text-black">{registro.codigo}</td>
              <td className="px-4 py-2 text-black">{registro.descripcion}</td>
              <td className="px-4 py-2 text-center text-black">
                {registro.cantidad_revisada}
              </td>
              <td className="px-4 py-2 text-center text-black">
                {registro.cantidad_aceptada}
              </td>
              <td className="px-4 py-2 text-center text-black">
                {registro.cantidad_rechazada}
              </td>
              <td className="px-4 py-2 text-black">{registro.referencia || "-"}</td>
              <td className="px-4 py-2 text-black max-w-xs truncate">
                {registro.comentario || "-"}
              </td>
              <td className="px-4 py-2 text-center">
                <span className="text-xs font-medium text-gray-700">
                  {registro.certificado || "-"}
                </span>
              </td>
              <td className="px-4 py-2 text-center">
                <button
                  onClick={() => handleEdit(registro)}
                  className="text-blue-600 hover:text-blue-700 font-medium text-xs"
                >
                  Editar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {editingRegistro && (
        <MateriaPrimaEditForm
          registro={editingRegistro}
          onClose={handleCloseEdit}
          onSuccess={() => {
            handleCloseEdit();
            onDelete();
          }}
        />
      )}
    </div>
  );
}
