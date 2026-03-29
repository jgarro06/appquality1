import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-8 px-4 py-16">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">
          Inspecciones de calidad
        </h1>
        <p className="mt-3 text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
          Registre inspecciones de producto terminado (PT) o materia prima (MP),
          con consecutivos automáticos, muestras dinámicas y borradores
          reanudables en Supabase.
        </p>
      </div>
      <div className="flex flex-wrap gap-4">
        <Link
          href="/inspecciones"
          className="rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
        >
          Ir al dashboard
        </Link>
        <Link
          href="/inspecciones/nueva"
          className="rounded-lg border border-zinc-300 px-5 py-2.5 text-sm font-medium hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900"
        >
          Nueva inspección
        </Link>
      </div>
    </main>
  );
}
