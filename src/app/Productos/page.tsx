"use client";


import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client"; // ajusta la ruta según tu proyecto
import { notFound } from "next/navigation";

type Producto = {
  id: string;
  codigo: string;
  descripcion: string;
};

const supabase = createClient();

export default function Productos() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [codigo, setCodigo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [editando, setEditando] = useState<string | null>(null);

  useEffect(() => {
    obtenerProductos();
  }, []);

  const obtenerProductos = async () => {
    const { data, error } = await supabase.from("products").select("*");
    if (error) console.error(error);
    else setProductos(data as Producto[]);
  };

  const agregarProducto = async () => {
    const { error } = await supabase
      .from("products")
      .insert([{ codigo, descripcion }]);

    if (error) console.error(error);
    else {
      setCodigo("");
      setDescripcion("");
      obtenerProductos();
    }
  };

  const editarProducto = async () => {
    if (!editando) return;
    const { error } = await supabase
      .from("products")
      .update({ codigo, descripcion })
      .eq("id", editando);

    if (error) console.error(error);
    else {
      setCodigo("");
      setDescripcion("");
      setEditando(null);
      obtenerProductos();
    }
  };

  const eliminarProducto = async (id: string) => {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) console.error(error);
    else obtenerProductos();
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 flex flex-col items-center">
  <h1 className="text-2xl font-bold text-black mb-6">Productos</h1>
  <div className="bg-white border border-gray-200 w-full max-w-3xl p-6 rounded-lg shadow-sm mb-8">
  <h2 className="text-lg font-semibold text-black mb-4">Agregar / Editar Producto</h2>
  <div className="flex gap-4">
    <input
      type="text"
      placeholder="Código"
      value={codigo}
      onChange={(e) => setCodigo(e.target.value)}
      className="bg-white border border-gray-300 text-black px-3 py-2 rounded w-40 focus:outline-none focus:ring-2 focus:ring-red-500"
    />
    <input
      type="text"
      placeholder="Descripción"
      value={descripcion}
      onChange={(e) => setDescripcion(e.target.value)}
      className="bg-white border border-gray-300 text-black px-3 py-2 rounded w-60 focus:outline-none focus:ring-2 focus:ring-red-500"
    />
    {editando ? (
      <button
        onClick={editarProducto}
        className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-white font-semibold transition-colors"
      >
        Actualizar
      </button>
    ) : (
      <button
        onClick={agregarProducto}
        className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-white font-semibold transition-colors"
      >
        Agregar
      </button>
    )}
  </div>
</div>
<div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm w-3xl">
  <table className="min-w-full text-left text-sm">
    <thead className="border-b border-gray-200 bg-gray-100 text-xs font-semibold uppercase tracking-wide text-gray-600">
      <tr>
        <th className="px-4 py-2 text-center">Código</th>
        <th className="px-4 py-2 text-center">Descripción</th>
        <th className="px-4 py-2 text-center">Acciones</th>
      </tr>
    </thead>
    <tbody>
      {productos.map((p) => (
        <tr key={p.id} className="border-b border-gray-100 transition-colors last:border-0 hover:bg-gray-50">
          <td className="px-4 py-2 text-center text-black">{p.codigo}</td>
          <td className="px-4 py-2 text-center text-black">{p.descripcion}</td>
          <td className="px-4 py-2 text-center flex justify-center gap-2">
            <button
              onClick={() => {
                setCodigo(p.codigo);
                setDescripcion(p.descripcion);
                setEditando(p.id);
              }}
              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-white font-semibold transition-colors"
            >
              Editar
            </button>
            <button
              onClick={() => eliminarProducto(p.id)}
              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-white font-semibold transition-colors"
            >
              Eliminar
            </button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>

</div>

  );
}
