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
  <h1 className="text-2xl font-bold text-white mb-6">Productos</h1>
  <div className="bg-zinc-800 w-full max-w-3xl p-6 rounded-lg shadow-lg mb-8">
  <h2 className="text-lg font-semibold text-white mb-4">Agregar / Editar Producto</h2>
  <div className="flex gap-4">
    <input
      type="text"
      placeholder="Código"
      value={codigo}
      onChange={(e) => setCodigo(e.target.value)}
      className="bg-zinc-700 text-white px-3 py-2 rounded w-40 focus:outline-none focus:ring-2 focus:ring-white"
    />
    <input
      type="text"
      placeholder="Descripción"
      value={descripcion}
      onChange={(e) => setDescripcion(e.target.value)}
      className="bg-zinc-700 text-white px-3 py-2 rounded w-60 focus:outline-none focus:ring-2 focus:ring-green-500"
    />
    {editando ? (
      <button
        onClick={editarProducto}
        className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-white font-semibold"
      >
        Actualizar
      </button>
    ) : (
      <button
        onClick={agregarProducto}
        className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-white font-semibold"
      >
        Agregar
      </button>
    )}
  </div>
</div>
<div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950 w-3xl">
  <table className="min-w-full text-left text-sm">
    <thead className="border-b border-zinc-200 bg-zinc-50 text-xs font-semibold uppercase tracking-wide text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-400">
      <tr>
        <th className="px-4 py-2 text-center">Código</th>
        <th className="px-4 py-2 text-center">Descripción</th>
        <th className="px-4 py-2 text-center">Acciones</th>
      </tr>
    </thead>
    <tbody>
      {productos.map((p) => (
        <tr key={p.id} className="border-b border-zinc-100 transition-colors last:border-0 hover:bg-zinc-50/80 dark:border-zinc-900 dark:hover:bg-zinc-900/40">
          <td className="px-4 py-2 text-center">{p.codigo}</td>
          <td className="px-4 py-2 text-center">{p.descripcion}</td>
          <td className="px-4 py-2 text-center flex justify-center gap-2">
            <button
              onClick={() => {
                setCodigo(p.codigo);
                setDescripcion(p.descripcion);
                setEditando(p.id);
              }}
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-white font-semibold"
            >
              Editar
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
