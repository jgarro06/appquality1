import Link from "next/link";
import Image from "next/image";

export function AppNav() {
  return (
    <header className="border-b border-gray-200 bg-white shadow-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
        <Link
          href="/"
          className="flex items-center gap-3"
        >
          <Image
            src="/Rinnai_Logo_2019.png"
            alt="Rinnai Logo"
            width={80}
            height={80}
            className="object-contain"
          />
          <span className="text-xl font-semibold tracking-tight text-black">
            Calidad
          </span>
        </Link>
        <nav className="flex items-center gap-6 text-sm font-medium">
          <Link
            className="text-gray-600 hover:text-red-600 transition-colors"
            href="/inspecciones"
          >
            Inspecciones
          </Link>
          <Link
            className="text-gray-600 hover:text-red-600 transition-colors"
            href="/materia-prima"
          >
            Materia Prima
          </Link>
          <Link
            className="text-gray-600 hover:text-red-600 transition-colors"
            href="/proveedores"
          >
            Proveedores
          </Link>
          <Link
            className="text-gray-600 hover:text-red-600 transition-colors"
            href="/Productos"
          >
            Productos
          </Link>
        </nav>
      </div>
    </header>
  );
}
