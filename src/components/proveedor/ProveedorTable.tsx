"use client";

import { useState } from "react";
import { deleteProveedor, updateProveedor } from "@/app/actions/proveedor";
import type { ProveedorRow } from "@/types/proveedor";

type Props = {
  proveedores: ProveedorRow[];
  onDelete: () => void;
};

export function ProveedorTable({ proveedores, onDelete }: Props) {
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<ProveedorRow> | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este proveedor?")) {
      return;
    }

    setIsDeleting(id);
    try {
      const result = await deleteProveedor(id);
      if (result.error) {
        alert("Error al eliminar: " + result.error);
        return;
      }
      onDelete();
    } finally {
      setIsDeleting(null);
    }
  };

  const handleEdit = (proveedor: ProveedorRow) => {
    setIsEditing(proveedor.id);
    setEditData(proveedor);
  };

  const handleSaveEdit = async (id: string) => {
    if (!editData) return;
    try {
      const result = await updateProveedor(id, {
        nombre: editData.nombre || "",
      });
      if (result.error) {
        alert("Error al actualizar: " + result.error);
        return;
      }
      setIsEditing(null);
      setEditData(null);
      onDelete();
    } catch (err) {
      alert("Error: " + (err instanceof Error ? err.message : "Desconocido"));
    }
  };

  if (proveedores.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-gray-500">No hay proveedores registrados</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border border-gray-200 rounded-lg">
      <table className="w-full text-xs">
        <thead className="bg-gray-100 border-b border-gray-200">
          <tr>
            <th className="px-4 py-2 text-left font-semibold text-black">Nombre</th>
            <th className="px-4 py-2 text-center font-semibold text-black">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {proveedores.map((proveedor, idx) => (
            <tr
              key={proveedor.id}
              className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
            >
              <td className="px-4 py-2 text-black">
                {isEditing === proveedor.id ? (
                  <input
                    type="text"
                    value={editData?.nombre || ""}
                    onChange={(e) =>
                      setEditData((prev) => ({
                        ...prev,
                        nombre: e.target.value,
                      }))
                    }
                    className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                  />
                ) : (
                  proveedor.nombre
                )}
              </td>
              <td className="px-4 py-2 text-center space-x-2">
                {isEditing === proveedor.id ? (
                  <>
                    <button
                      onClick={() => handleSaveEdit(proveedor.id)}
                      className="text-green-600 hover:text-green-700 font-medium text-xs"
                    >
                      Guardar
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(null);
                        setEditData(null);
                      }}
                      className="text-gray-600 hover:text-gray-700 font-medium text-xs"
                    >
                      Cancelar
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => handleEdit(proveedor)}
                      className="text-blue-600 hover:text-blue-700 font-medium text-xs"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(proveedor.id)}
                      disabled={isDeleting === proveedor.id}
                      className="text-red-600 hover:text-red-700 font-medium text-xs disabled:opacity-50"
                    >
                      {isDeleting === proveedor.id ? "..." : "Eliminar"}
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
