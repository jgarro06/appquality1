import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-8 px-4 py-16">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-black">
          Inspecciones de calidad
        </h1>
        <p className="mt-3 text-lg leading-relaxed text-gray-600">
          Registre inspecciones de producto terminado (PT) o materia prima (MP),
          con consecutivos automáticos, muestras dinámicas y borradores
          reanudables en Supabase.
        </p>
      </div>
      <div className="flex flex-wrap gap-4">
        <Link
          href="/inspecciones"
          className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-red-700 transition-colors"
        >
          Ir al dashboard
        </Link>
        <Link
          href="/inspecciones/nueva"
          className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-black hover:bg-gray-50 transition-colors"
        >
          Nueva inspección
        </Link>
      </div>
    </main>
  );
}
