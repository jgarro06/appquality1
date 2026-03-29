"use client";

import type { InspectionTipo } from "@/types/inspections";
import type { Dispatch, SetStateAction } from "react";
import type { SampleDraftMP, SampleDraftPT } from "./inspection-form-types";

type Props = {
  tipo: InspectionTipo;
  locked: boolean;
  cantidadMuestras: number;
  samplesPT: SampleDraftPT[];
  samplesMP: SampleDraftMP[];
  setSamplesPT: Dispatch<SetStateAction<SampleDraftPT[]>>;
  setSamplesMP: Dispatch<SetStateAction<SampleDraftMP[]>>;
};

export function InspectionSamplesTable({
  tipo,
  locked,
  cantidadMuestras,
  samplesPT,
  samplesMP,
  setSamplesPT,
  setSamplesMP,
}: Props) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-medium">Muestras</h2>
          <p className="text-sm text-gray-600">
            Máximo {cantidadMuestras} filas. Los cambios se guardan en Supabase al
            pulsar <strong className="text-gray-700">Guardar borrador</strong>{" "}
            o <strong className="text-gray-700">Finalizar inspección</strong>.
          </p>
        </div>
      </div>

      {tipo === "PT" ? (
        <div className="overflow-x-auto rounded-lg border border-gray-100">
          <table className="min-w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-100 text-left">
                <th className="px-3 py-2.5 font-medium">Nº</th>
                <th className="px-3 py-2.5 font-medium">Nº placa</th>
                {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                  <th key={n} className="px-3 py-2.5 font-medium">
                    A{n}
                  </th>
                ))}
                <th className="px-3 py-2.5 font-medium">Litros</th>
              </tr>
            </thead>
            <tbody>
              {samplesPT.map((row, idx) => (
                <tr
                  key={row.numero}
                  className="border-b border-gray-100 last:border-0"
                >
                  <td className="px-3 py-2 font-mono text-gray-600">{row.numero}</td>
                  <td className="px-3 py-2">
                    <input
                      className="w-28 rounded-md border border-gray-300 bg-white px-2 py-1.5 text-black outline-none ring-red-500 focus:ring-2 disabled:opacity-60"
                      value={row.placa}
                      onChange={(e) => {
                        const v = e.target.value;
                        setSamplesPT((prev) => {
                          const n = [...prev];
                          n[idx] = { ...n[idx], placa: v };
                          return n;
                        });
                      }}
                      disabled={locked}
                    />
                  </td>
                  {row.amperajes.map((cell, j) => (
                    <td key={j} className="px-3 py-2">
                      <input
                        inputMode="decimal"
                        className="w-[4.25rem] rounded-md border border-gray-300 bg-white px-2 py-1.5 text-black outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-60"
                        value={cell}
                        onChange={(e) => {
                          const v = e.target.value;
                          setSamplesPT((prev) => {
                            const next = [...prev];
                            const amps = [...next[idx].amperajes];
                            amps[j] = v;
                            next[idx] = { ...next[idx], amperajes: amps };
                            return next;
                          });
                        }}
                        disabled={locked}
                      />
                    </td>
                  ))}
                  <td className="px-3 py-2">
                    <input
                      inputMode="decimal"
                      className="w-24 rounded-md border border-gray-300 bg-white px-2 py-1.5 text-black outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-60"
                      value={row.litros}
                      onChange={(e) => {
                        const v = e.target.value;
                        setSamplesPT((prev) => {
                          const n = [...prev];
                          n[idx] = { ...n[idx], litros: v };
                          return n;
                        });
                      }}
                      disabled={locked}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-100">
          <table className="min-w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-100 text-left">
                <th className="px-3 py-2.5 font-medium">Nº</th>
                {["Medida 1", "Medida 2", "Medida 3", "Medida 4"].map((h) => (
                  <th key={h} className="px-3 py-2.5 font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {samplesMP.map((row, idx) => (
                <tr
                  key={row.numero}
                  className="border-b border-gray-100 last:border-0"
                >
                  <td className="px-3 py-2 font-mono text-gray-600">{row.numero}</td>
                  {(["medida1", "medida2", "medida3", "medida4"] as const).map(
                    (field) => (
                      <td key={field} className="px-3 py-2">
                        <input
                          inputMode="decimal"
                          className="w-28 rounded-md border border-gray-300 bg-white px-2 py-1.5 text-black outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-60"
                          value={row[field]}
                          onChange={(e) => {
                            const v = e.target.value;
                            setSamplesMP((prev) => {
                              const n = [...prev];
                              n[idx] = { ...n[idx], [field]: v };
                              return n;
                            });
                          }}
                          disabled={locked}
                        />
                      </td>
                    ),
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
