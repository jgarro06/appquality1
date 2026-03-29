"use client";

import {
  finalizeInspection,
  previewConsecutivo,
  saveInspectionDraft,
  type SampleInputMP,
  type SampleInputPT,
  type SaveInspectionPayload,
} from "@/app/actions/inspections";
import { fetchProductDescriptionByCodigo } from "@/lib/products-browser";
import type { InspectionRow, InspectionTipo } from "@/types/inspections";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  emptyMP,
  emptyPT,
  type SampleDraftMP,
  type SampleDraftPT,
} from "./inspection-form-types";
import { InspectionSamplesTable } from "./InspectionSamplesTable";

function parseNum(s: string): number | null {
  const t = s.trim();
  if (t === "") return null;
  const n = Number(t.replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

function buildPayload(
  state: {
    op: string;
    fecha: string;
    inspector: string;
    tipo: InspectionTipo;
    producto: string;
    descripcion: string;
    kw: string;
    temperaturas: string;
    cantidad_muestras: number;
    instrumento: string;
    fecha_calibracion: string;
    samplesPT: SampleDraftPT[];
    samplesMP: SampleDraftMP[];
  },
  id?: string,
): SaveInspectionPayload {
  const base = {
    id,
    op: state.op,
    fecha: state.fecha,
    inspector: state.inspector,
    tipo: state.tipo,
    producto: state.producto,
    descripcion: state.descripcion || null,
    kw: state.kw.trim() || null,
    temperaturas: state.temperaturas.trim() || null,
    cantidad_muestras: state.cantidad_muestras,
    instrumento: state.instrumento || null,
    fecha_calibracion: state.fecha_calibracion || null,
  };

  if (state.tipo === "PT") {
    const samplesPT: SampleInputPT[] = state.samplesPT.map((s) => ({
      numero_muestra: s.numero,
      placa: s.placa,
      amperajes: s.amperajes.map((x) => parseNum(x) ?? 0),
      litros: parseNum(s.litros) ?? 0,
    }));
    return { ...base, samplesPT };
  }

  const samplesMP: SampleInputMP[] = state.samplesMP.map((s) => ({
    numero_muestra: s.numero,
    medida1: parseNum(s.medida1) ?? 0,
    medida2: parseNum(s.medida2) ?? 0,
    medida3: parseNum(s.medida3) ?? 0,
    medida4: parseNum(s.medida4) ?? 0,
  }));
  return { ...base, samplesMP };
}

type Props = {
  inspection?: InspectionRow | null;
  samplesFromDb?: Record<string, unknown>[];
};

export function InspectionForm({ inspection, samplesFromDb }: Props) {
  const router = useRouter();
  const isEdit = Boolean(inspection?.id);
  const locked = inspection?.estado === "Completado";

  const [consecutivoPreview, setConsecutivoPreview] = useState<string | null>(
    inspection?.consecutivo ?? null,
  );
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const [op, setOp] = useState(inspection?.op ?? "");
  const [fecha, setFecha] = useState(
    inspection?.fecha?.slice(0, 10) ??
      new Date().toISOString().slice(0, 10),
  );
  const [inspector, setInspector] = useState(inspection?.inspector ?? "");
  const [tipo, setTipo] = useState<InspectionTipo>(inspection?.tipo ?? "PT");
  const [producto, setProducto] = useState(inspection?.producto ?? "");
  const [descripcion, setDescripcion] = useState(inspection?.descripcion ?? "");
  const [kw, setKw] = useState(inspection?.kw ?? "");
  const [temperaturas, setTemperaturas] = useState(
    inspection?.temperaturas ?? "",
  );
  const [cantidad_muestras, setCantidadMuestras] = useState(
    inspection?.cantidad_muestras ?? 0,
  );
  const [instrumento, setInstrumento] = useState(inspection?.instrumento ?? "");
  const [fecha_calibracion, setFechaCalibracion] = useState(
    inspection?.fecha_calibracion?.slice(0, 10) ?? "",
  );
  const [productLookupLoading, setProductLookupLoading] = useState(false);

  useEffect(() => {
    if (locked) return;
    const code = producto.trim();
    if (code.length < 2) {
      setDescripcion("");
      setProductLookupLoading(false);
      return;
    }
    let cancelled = false;
    const timer = window.setTimeout(async () => {
      setProductLookupLoading(true);
      const r = await fetchProductDescriptionByCodigo(code);
      if (cancelled) return;
      setProductLookupLoading(false);
      if (r.descripcion) setDescripcion(r.descripcion);
      else setDescripcion("");
    }, 420);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [producto, locked]);

  const initialSamples = useMemo(() => {
    if (!samplesFromDb?.length) return null;
    const t = inspection?.tipo ?? "PT";
    if (t === "PT") {
      return samplesFromDb.map((r, i) => ({
        numero: Number(r.numero_muestra) || i + 1,
        placa: String(r.placa ?? ""),
        amperajes: [
          r.amp1,
          r.amp2,
          r.amp3,
          r.amp4,
          r.amp5,
          r.amp6,
          r.amp7,
        ].map((v) => (v != null && v !== "" ? String(v) : "")),
        litros: r.litros != null && r.litros !== "" ? String(r.litros) : "",
      })) as SampleDraftPT[];
    }
    return samplesFromDb.map((r, i) => ({
      numero: Number(r.numero_muestra) || i + 1,
      medida1: r.medida1 != null && r.medida1 !== "" ? String(r.medida1) : "",
      medida2: r.medida2 != null && r.medida2 !== "" ? String(r.medida2) : "",
      medida3: r.medida3 != null && r.medida3 !== "" ? String(r.medida3) : "",
      medida4: r.medida4 != null && r.medida4 !== "" ? String(r.medida4) : "",
    })) as SampleDraftMP[];
  }, [samplesFromDb, inspection?.tipo]);

  const [samplesPT, setSamplesPT] = useState<SampleDraftPT[]>(() => {
    if (inspection?.tipo === "PT") {
      if (initialSamples && initialSamples.length > 0)
        return initialSamples as SampleDraftPT[];
      if (inspection)
        return Array.from({ length: inspection.cantidad_muestras }, (_, i) =>
          emptyPT(i + 1),
        );
    }
    return [emptyPT(1)];
  });

  const [samplesMP, setSamplesMP] = useState<SampleDraftMP[]>(() => {
    if (inspection?.tipo === "MP") {
      if (initialSamples && initialSamples.length > 0)
        return initialSamples as SampleDraftMP[];
      if (inspection)
        return Array.from({ length: inspection.cantidad_muestras }, (_, i) =>
          emptyMP(i + 1),
        );
    }
    return [emptyMP(1)];
  });

  const syncRowsToCantidad = useCallback(
    (next: number, t: InspectionTipo) => {
      const n = Math.max(1, Math.min(500, next));
      if (t === "PT") {
        setSamplesPT((prev) => {
          const copy = [...prev];
          if (n > copy.length) {
            for (let i = copy.length; i < n; i++)
              copy.push(emptyPT(i + 1));
          } else if (n < copy.length) {
            copy.length = n;
          }
          return copy.map((row, i) => ({ ...row, numero: i + 1 }));
        });
      } else {
        setSamplesMP((prev) => {
          const copy = [...prev];
          if (n > copy.length) {
            for (let i = copy.length; i < n; i++)
              copy.push(emptyMP(i + 1));
          } else if (n < copy.length) {
            copy.length = n;
          }
          return copy.map((row, i) => ({ ...row, numero: i + 1 }));
        });
      }
    },
    [],
  );

  useEffect(() => {
    if (!inspection?.id || locked) return;
    syncRowsToCantidad(cantidad_muestras, tipo);
    // Alinear filas al abrir un borrador existente
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inspection?.id]);

  useEffect(() => {
    if (locked || isEdit) return;
    let cancelled = false;
    (async () => {
      try {
        const r = await previewConsecutivo(tipo);
        if (!cancelled) setConsecutivoPreview(r.consecutivo);
      } catch {
        if (!cancelled) setConsecutivoPreview(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [tipo, locked, isEdit]);

  useEffect(() => {
    if (isEdit && inspection?.consecutivo)
      setConsecutivoPreview(inspection.consecutivo);
  }, [isEdit, inspection?.consecutivo]);

  const onTipoChange = (next: InspectionTipo) => {
    setTipo(next);
    syncRowsToCantidad(cantidad_muestras, next);
  };

  const onCantidadChange = (raw: number) => {
    const n = Math.max(0, Math.min(500, isNaN(raw) ? 0 : raw));
    setCantidadMuestras(n);
    if (!locked) syncRowsToCantidad(n, tipo);
  };

  const onLookupProduct = async () => {
    setMessage(null);
    setProductLookupLoading(true);
    const r = await fetchProductDescriptionByCodigo(producto);
    setProductLookupLoading(false);
    if (r.error) {
      setMessage(r.error);
      setDescripcion("");
      return;
    }
    if (r.descripcion) setDescripcion(r.descripcion);
    else {
      setMessage("No se encontró el producto para ese código.");
      setDescripcion("");
    }
  };

  const commonState = {
    op,
    fecha,
    inspector,
    tipo,
    producto,
    descripcion,
    kw,
    temperaturas,
    cantidad_muestras,
    instrumento,
    fecha_calibracion,
    samplesPT,
    samplesMP,
  };

  const onSaveDraft = async () => {
    setPending(true);
    setMessage(null);
    const payload = buildPayload(commonState, inspection?.id);
    const res = await saveInspectionDraft(payload);
    setPending(false);
    if (!res.ok) {
      setMessage(
        typeof res.error === "string"
          ? res.error
          : JSON.stringify(res.error),
      );
      return;
    }
    router.push(`/inspecciones/${res.id}`);
    router.refresh();
  };

  const onFinalize = async () => {
    setPending(true);
    setMessage(null);
    const payload = buildPayload(commonState, inspection?.id);
    const res = await finalizeInspection(payload);
    setPending(false);
    if (!res.ok) {
      setMessage(
        typeof res.error === "string"
          ? res.error
          : JSON.stringify(res.error),
      );
      return;
    }
    router.push(`/inspecciones/${res.id}`);
    router.refresh();
  };

  const sampleCount = tipo === "PT" ? samplesPT.length : samplesMP.length;
  const canFinalize =
    !locked &&
    sampleCount === cantidad_muestras &&
    cantidad_muestras > 0;

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {isEdit ? "Inspección" : "Nueva inspección"}
          </h1>
          <p className="text-sm text-gray-600">
            Consecutivo{" "}
            {isEdit ? "" : "(se asigna al guardar): "}
            <span className="font-mono text-gray-800">
              {consecutivoPreview ?? "—"}
            </span>
          </p>
        </div>
        <Link
          href="/inspecciones"
          className="text-sm font-medium text-red-600 underline-offset-4 hover:text-red-700 hover:underline"
        >
          Volver al listado
        </Link>
      </div>

      {locked && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-900">
          Esta inspección está completada y no se puede editar.
        </div>
      )}

      {message && (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-900">
          {message}
        </div>
      )}

      <section className="grid gap-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-medium">Información general</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-gray-700">
              OP
            </span>
            <input
              className="rounded-md border border-gray-300 bg-white px-3 py-2 text-black disabled:opacity-60 focus:ring-2 focus:ring-red-500"
              value={op}
              onChange={(e) => setOp(e.target.value)}
              disabled={locked}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-gray-700">
              Fecha
            </span>
            <input
              type="date"
              className="rounded-md border border-gray-300 bg-white px-3 py-2 text-black disabled:opacity-60 focus:ring-2 focus:ring-red-500"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              disabled={locked}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-gray-700">
              Inspector
            </span>
            <input
              className="rounded-md border border-gray-300 bg-white px-3 py-2 text-black disabled:opacity-60 focus:ring-2 focus:ring-red-500"
              value={inspector}
              onChange={(e) => setInspector(e.target.value)}
              disabled={locked}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-gray-700">
              Tipo
            </span>
            <select
              className="rounded-md border border-gray-300 bg-white px-3 py-2 text-black disabled:opacity-60 focus:ring-2 focus:ring-red-500"
              value={tipo}
              onChange={(e) => onTipoChange(e.target.value as InspectionTipo)}
              disabled={locked || isEdit}
            >
              <option value="PT">Producto terminado (PT)</option>
              <option value="MP">Materia prima (MP)</option>
            </select>
            {isEdit && (
              <span className="text-xs text-gray-600">
                El tipo no se puede cambiar en una inspección existente.
              </span>
            )}
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-gray-700">
              Código de producto
            </span>
            <div className="flex gap-2">
              <input
                className="min-w-0 flex-1 rounded-md border border-gray-300 bg-white px-3 py-2 font-mono text-black disabled:opacity-60 focus:ring-2 focus:ring-red-500"
                value={producto}
                onChange={(e) => setProducto(e.target.value)}
                disabled={locked}
                autoComplete="off"
              />
              <button
                type="button"
                className="shrink-0 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-black hover:bg-gray-50 disabled:opacity-50"
                onClick={onLookupProduct}
                disabled={locked}
              >
                Buscar
              </button>
            </div>
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="flex items-center gap-2 font-medium text-gray-700">
              Descripción
              {productLookupLoading && (
                <span className="text-xs font-normal text-gray-500">
                  Buscando en catálogo…
                </span>
              )}
            </span>
            <input
              className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-gray-800"
              value={descripcion}
              readOnly
              placeholder="Se autocompleta al escribir el código (mín. 2 caracteres)"
            />
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-gray-700">
              kW
            </span>
            <input
              className="rounded-md border border-gray-300 bg-white px-3 py-2 text-black disabled:opacity-60 focus:ring-2 focus:ring-red-500"
              value={kw}
              onChange={(e) => setKw(e.target.value)}
              disabled={locked}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm sm:col-span-2">
            <span className="font-medium text-gray-700">
              Temperaturas
            </span>
            <input
              className="rounded-md border border-gray-300 bg-white px-3 py-2 text-black disabled:opacity-60 focus:ring-2 focus:ring-red-500"
              value={temperaturas}
              onChange={(e) => setTemperaturas(e.target.value)}
              disabled={locked}
              placeholder="Ej. entrada 45 °C / salida 38 °C"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-gray-700">
              Cantidad de muestras
            </span>
            <input
              type="number"
              min={0}
              max={500}

              className="rounded-md border border-gray-300 bg-white px-3 py-2 text-black disabled:opacity-60 focus:ring-2 focus:ring-red-500"
              value={cantidad_muestras === 0 ? "" : cantidad_muestras}

              onChange={(e) => onCantidadChange(Number(e.target.value))}
              disabled={locked}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-gray-700">
              Instrumento
            </span>
            <input
              className="rounded-md border border-gray-300 bg-white px-3 py-2 text-black disabled:opacity-60 focus:ring-2 focus:ring-red-500"
              value={instrumento}
              onChange={(e) => setInstrumento(e.target.value)}
              disabled={locked}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-gray-700">
              Fecha calibración
            </span>
            <input
              type="date"
              className="rounded-md border border-gray-300 bg-white px-3 py-2 text-black disabled:opacity-60 focus:ring-2 focus:ring-red-500"
              value={fecha_calibracion}
              onChange={(e) => setFechaCalibracion(e.target.value)}
              disabled={locked}
            />
          </label>
        </div>
      </section>

      <InspectionSamplesTable
        tipo={tipo}
        locked={locked}
        cantidadMuestras={cantidad_muestras}
        samplesPT={samplesPT}
        samplesMP={samplesMP}
        setSamplesPT={setSamplesPT}
        setSamplesMP={setSamplesMP}
      />

      {!locked && (
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap gap-3">
          <button
            type="button"
            disabled={pending}
            onClick={onSaveDraft}
            className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
          >
            Guardar borrador
          </button>
          <button
            type="button"
            disabled={pending || !canFinalize}
            title={
              !canFinalize
                ? "Complete todas las muestras según la cantidad indicada"
                : undefined
            }
            onClick={onFinalize}
            className="rounded-lg border border-green-700 bg-green-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-green-500 disabled:opacity-50"
          >
            Finalizar inspección
          </button>
          </div>
          <p className="text-xs text-gray-600">
            <strong>Guardar borrador</strong> persiste la inspección y las muestras en Supabase con
            estado &quot;En proceso&quot;. <strong>Finalizar</strong> exige todas las muestras
            completas y marca &quot;Completado&quot;.
          </p>
        </div>
      )}
    </div>
  );
}
