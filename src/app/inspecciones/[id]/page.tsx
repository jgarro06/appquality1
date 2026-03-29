import { InspectionForm } from "@/components/inspections/InspectionForm";
import { fetchInspectionById } from "@/lib/data/inspections";
import type { InspectionRow } from "@/types/inspections";
import { notFound } from "next/navigation";

type Props = { params: Promise<{ id: string }> };

export default async function InspeccionDetallePage({ params }: Props) {
  const { id } = await params;
  const { inspection, samples, error } = await fetchInspectionById(id);

  if (error || !inspection) notFound();

  return (
    <InspectionForm
      inspection={inspection as InspectionRow}
      samplesFromDb={samples}
    />
  );
}
