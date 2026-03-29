import { z } from "zod";

export const inspectionTipoSchema = z.enum(["PT", "MP"]);

const samplePTSchema = z.object({
  numero_muestra: z.number().int().min(1),
  placa: z.string().min(1, "Nº placa requerido"),
  amperajes: z.tuple([
    z.number(),
    z.number(),
    z.number(),
    z.number(),
    z.number(),
    z.number(),
    z.number(),
  ]),
  litros: z.number(),
});

const sampleMPSchema = z.object({
  numero_muestra: z.number().int().min(1),
  medida1: z.number(),
  medida2: z.number(),
  medida3: z.number(),
  medida4: z.number(),
});

export const inspectionBaseSchema = z.object({
  op: z.string().min(1, "OP requerida"),
  fecha: z.string().min(1, "Fecha requerida"),
  inspector: z.string().min(1, "Inspector requerido"),
  tipo: inspectionTipoSchema,
  producto: z.string().min(1, "Producto (código) requerido"),
  descripcion: z.string().optional().nullable(),
  kw: z.string().optional().nullable(),
  temperaturas: z.string().optional().nullable(),
  cantidad_muestras: z.coerce
    .number()
    .int()
    .min(1, "Debe ser al menos 1"),
  instrumento: z.string().optional().nullable(),
  fecha_calibracion: z.string().optional().nullable(),
});

export function buildFinalizeSchema(tipo: "PT" | "MP", cantidadMuestras: number) {
  const samples =
    tipo === "PT"
      ? z
          .array(samplePTSchema)
          .length(
            cantidadMuestras,
            `Debe haber exactamente ${cantidadMuestras} muestras PT`,
          )
      : z
          .array(sampleMPSchema)
          .length(
            cantidadMuestras,
            `Debe haber exactamente ${cantidadMuestras} muestras MP`,
          );

  return inspectionBaseSchema.extend({ samples });
}

export type InspectionBaseInput = z.infer<typeof inspectionBaseSchema>;
