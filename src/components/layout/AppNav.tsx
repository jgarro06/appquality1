import Link from "next/link";

export function AppNav() {
  return (
    <header className="border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
        <Link
          href="/"
          className="text-base font-semibold tracking-tight text-zinc-900 dark:text-zinc-50"
        >
          Calidad
        </Link>
        <nav className="flex items-center gap-6 text-sm font-medium">
          <Link
            className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            href="/inspecciones"
          >
            Dashboard
          </Link>
          <Link
            className="rounded-full bg-zinc-900 px-4 py-2 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
            href="/inspecciones/nueva"
          >
            Nueva inspección
          </Link>
        </nav>
      </div>
    </header>
  );
}
