"use client";

import { useEffect, useState } from "react";
import { updateMateriaPrima } from "@/app/actions/materia-prima";
import { fetchProveedores } from "@/app/actions/proveedor";
import { fetchProductos } from "@/app/actions/productos";
import type { MateriaPrimaFormData, MateriaPrimaRow } from "@/types/materia-prima";
import type { ProveedorRow } from "@/types/proveedor";
import type { ProductRow } from "@/types/inspections";

type Props = {
  registro: MateriaPrimaRow;
  onClose: () => void;
  onSuccess: () => void;
};

export function MateriaPrimaEditForm({ registro, onClose, onSuccess }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [proveedores, setProveedores] = useState<ProveedorRow[]>([]);
  const [productos, setProductos] = useState<ProductRow[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const [formData, setFormData] = useState<MateriaPrimaFormData>({
    fecha: registro.fecha,
    numero_oc: registro.numero_oc,
    proveedor: registro.proveedor,
    codigo: registro.codigo,
    descripcion: registro.descripcion,
    cantidad_revisada: registro.cantidad_revisada,
    cantidad_aceptada: registro.cantidad_aceptada,
    cantidad_rechazada: registro.cantidad_rechazada,
    referencia: registro.referencia,
    comentario: registro.comentario,
    certificado: registro.certificado,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoadingData(true);
    try {
      const [proveedoresResult, productosResult] = await Promise.all([
        fetchProveedores(),
        fetchProductos(),
      ]);

      if (proveedoresResult.data) setProveedores(proveedoresResult.data);
      if (productosResult.data) setProductos(productosResult.data);
    } catch (err) {
      console.error("Error loading data:", err);
    } finally {
      setLoadingData(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;

    setFormData((prev) => {
      const newData = {
        ...prev,
        [name]:
          type === "number"
            ? value === "" ? null : parseFloat(value)
            : value,
      };

      // Recalculate cantidad_aceptada if revisada or rechazada changes
      if (name === "cantidad_revisada" || name === "cantidad_rechazada") {
        const revisada = name === "cantidad_revisada" 
          ? (value === "" ? null : parseFloat(value))
          : newData.cantidad_revisada;
        const rechazada = name === "cantidad_rechazada"
          ? (value === "" ? null : parseFloat(value))
          : newData.cantidad_rechazada;

        if (revisada !== null && rechazada !== null) {
          newData.cantidad_aceptada = revisada - rechazada;
        }
      }

      return newData;
    });
  };

  const handleCodigoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const codigo = e.target.value;
    const producto = productos.find((p) => p.codigo === codigo);

    setFormData((prev) => ({
      ...prev,
      codigo,
      descripcion: producto?.descripcion || "",
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const result = await updateMateriaPrima(registro.id, formData);
      if (result.error) {
        setError(result.error);
        return;
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-black">Editar Registro de Materia Prima</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-xs text-red-600">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-black mb-1">
                Fecha *
              </label>
              <input
                type="date"
                name="fecha"
                value={formData.fecha}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-black mb-1">
                Número OC *
              </label>
              <input
                type="text"
                name="numero_oc"
                value={formData.numero_oc}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-black mb-1">
                Proveedor *
              </label>
              {loadingData ? (
                <p className="text-xs text-gray-500">Cargando...</p>
              ) : (
                <select
                  name="proveedor"
                  value={formData.proveedor}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="">Seleccionar proveedor...</option>
                  {proveedores.map((p) => (
                    <option key={p.id} value={p.nombre}>
                      {p.nombre}
                    </option>
                  ))}
                </select>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-black mb-1">
                Código de Producto *
              </label>
              <input
                type="text"
                value={formData.codigo}
                onChange={handleCodigoChange}
                placeholder="Ingrese código y se auto-cargará descripción"
                required
                list="productos-list"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <datalist id="productos-list">
                {productos.map((p) => (
                  <option key={p.codigo} value={p.codigo} />
                ))}
              </datalist>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-black mb-1">
              Descripción (automática)
            </label>
            <input
              type="text"
              value={formData.descripcion}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-xs bg-gray-50"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-black mb-1">
                Cantidad Revisada *
              </label>
              <input
                type="number"
                name="cantidad_revisada"
                value={formData.cantidad_revisada ?? ""}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-black mb-1">
                Cantidad Aceptada (automática)
              </label>
              <input
                type="number"
                name="cantidad_aceptada"
                value={formData.cantidad_aceptada ?? ""}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-xs bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-black mb-1">
                Cantidad Rechazada *
              </label>
              <input
                type="number"
                name="cantidad_rechazada"
                value={formData.cantidad_rechazada ?? ""}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-black mb-1">
              Referencia
            </label>
            <input
              type="text"
              name="referencia"
              value={formData.referencia || ""}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-black mb-1">
              Comentario
            </label>
            <textarea
              name="comentario"
              value={formData.comentario || ""}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-black mb-1">
              Certificado
            </label>
            <select
              name="certificado"
              value={formData.certificado}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="no es necesario">No es necesario</option>
              <option value="no existe">No existe</option>
              <option value="pendiente">Pendiente</option>
              <option value="Adjunto">Adjunto</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-red-600 text-white font-medium text-sm rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors"
            >
              {isLoading ? "Guardando..." : "Guardar Cambios"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-200 text-black font-medium text-sm rounded-md hover:bg-gray-300 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
