import { fetchInspectionsForList } from "@/lib/data/inspections";
import type { InspectionEstado, InspectionTipo } from "@/types/inspections";
import Link from "next/link";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function badgeEstado(estado: InspectionEstado) {
  const base =
    "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset";
  if (estado === "Completado")
    return `${base} bg-emerald-50 text-emerald-800 ring-emerald-600/20 dark:bg-emerald-950/50 dark:text-emerald-200`;
  return `${base} bg-amber-50 text-amber-900 ring-amber-600/20 dark:bg-amber-950/50 dark:text-amber-100`;
}

export default async function InspeccionesPage({ searchParams }: Props) {
  const sp = await searchParams;
  const desde = typeof sp.desde === "string" ? sp.desde : undefined;
  const hasta = typeof sp.hasta === "string" ? sp.hasta : undefined;
  const inspector =
    typeof sp.inspector === "string" ? sp.inspector : undefined;
  const producto =
    typeof sp.producto === "string" ? sp.producto : undefined;
  const op =
    typeof sp.op === "string" ? sp.op : undefined;
  const tipo =
    sp.tipo === "PT" || sp.tipo === "MP" ? (sp.tipo as InspectionTipo) : "";
  const estado =
    sp.estado === "En proceso" || sp.estado === "Completado"
      ? (sp.estado as InspectionEstado)
      : "";

  const { rows, error } = await fetchInspectionsForList({
    desde,
    hasta,
    inspector,
    producto,
    tipo: tipo || undefined,
    estado: estado || undefined,  
    op: op || undefined,
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            Calidad
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">
            Dashboard de inspecciones
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            {rows.length === 1
              ? "1 inspección listada."
              : `${rows.length} inspecciones listadas.`}{" "}
            Filtre por fecha, inspector, producto, tipo y estado.
          </p>
        </div>
        <Link
          href="/inspecciones/nueva"
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
        >
          Nueva inspección
        </Link>
      </div>

      <form
        method="get"
        className="mb-8 grid gap-4 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-4 dark:border-zinc-800 dark:bg-zinc-950"
      >
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-zinc-700 dark:text-zinc-300">
            Desde
          </span>
          <input
            type="date"
            name="desde"
            defaultValue={desde ?? ""}
            className="rounded-md border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-zinc-700 dark:text-zinc-300">
            Hasta
          </span>
          <input
            type="date"
            name="hasta"
            defaultValue={hasta ?? ""}
            className="rounded-md border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-zinc-700 dark:text-zinc-300">
            Número de OP
          </span>
          <input
            name="op"
            defaultValue={op ?? ""}
            placeholder="Número de OP"
            className="rounded-md border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-zinc-700 dark:text-zinc-300">
            Código producto
          </span>
          <input
            name="producto"
            defaultValue={producto ?? ""}
            className="rounded-md border border-zinc-300 bg-white px-3 py-2 font-mono dark:border-zinc-700 dark:bg-zinc-900"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-zinc-700 dark:text-zinc-300">
            Tipo
          </span>
          <select
            name="tipo"
            defaultValue={tipo}
            className="rounded-md border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
          >
            <option value="">Todos</option>
            <option value="PT">PT</option>
            <option value="MP">MP</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-zinc-700 dark:text-zinc-300">
            Estado
          </span>
          <select
            name="estado"
            defaultValue={estado}
            className="rounded-md border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
          >
            <option value="">Todos</option>
            <option value="En proceso">En proceso</option>
            <option value="Completado">Completado</option>
          </select>
        </label>
        <div className="flex items-end gap-2 sm:col-span-2">
          <button
            type="submit"
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
          >
            Aplicar filtros
          </button>
          <Link
            href="/inspecciones"
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900"
          >
            Limpiar
          </Link>
        </div>
      </form>

      {error && (
        <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900 dark:border-red-900 dark:bg-red-950/40 dark:text-red-100">
          {error}
        </p>
      )}

      <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-zinc-200 bg-zinc-50 text-xs font-semibold uppercase tracking-wide text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-400">
            <tr>
              <th className="px-4 py-3 text-center">Consecutivo</th>
              <th className="px-4 py-3 text-center">Fecha</th>
              <th className="px-4 py-3 text-center">Inspector</th>
              <th className="px-4 py-3 text-center">Tipo</th>
              <th className="px-4 py-3 text-center">Producto</th>
              <th className="px-4 py-3 text-center">Estado</th>
              <th className="px-4 py-3 text-center">Número de OP</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-10 text-center text-zinc-500"
                >
                  No hay inspecciones con estos criterios.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-zinc-100 transition-colors last:border-0 hover:bg-zinc-50/80 dark:border-zinc-900 dark:hover:bg-zinc-900/40"
                >
                  <td className="px-4 py-3 text-center font-mono text-xs font-medium">
                    {row.consecutivo}
                  </td>
                  <td className="px-4 py-3 text-center text-zinc-700 dark:text-zinc-300">
                    {String(row.fecha).slice(0, 10)}
                  </td>
                  <td className="px-4 py-3 text-center">{row.inspector}</td>
                  <td className="px-4 py-3 text-center font-mono">{row.tipo}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="font-mono text-xs">{row.producto}</div>
                    {row.descripcion && (
                      <div className="max-w-xs truncate text-xs text-zinc-500">
                        {row.descripcion}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={badgeEstado(row.estado)}>
                      {row.estado}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">{row.op}</td>
                  <td className="px-4 py-3 text-center">
                    <Link
                      href={`/inspecciones/${row.id}`}
                      className="font-medium text-zinc-900 underline-offset-4 hover:underline dark:text-zinc-100"
                    >
                      Abrir
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
