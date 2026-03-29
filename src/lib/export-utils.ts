import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

// Función auxiliar para convertir Blob a base64
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      resolve(result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export type InspectionExportData = {
  id: string;
  consecutivo: string;
  fecha: string;
  inspector: string;
  tipo: "PT" | "MP";
  producto: string;
  descripcion: string | null;
  op: string;
  kw: string | null;
  temperaturas: string | null;
  cantidad_muestras: number;
  instrumento: string | null;
  fecha_calibracion: string | null;
  estado: string;
  samples: Record<string, unknown>[];
};

export async function exportToPDF(data: InspectionExportData) {
  try {
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    let yPosition = 15;

    // Cargar y agregar logo
    try {
      const logoResponse = await fetch("/Rinnai_Logo_2019.png");
      if (logoResponse.ok) {
        const logoBlob = await logoResponse.blob();
        const logoBase64 = await blobToBase64(logoBlob);
        // Agregar logo en esquina superior izquierda
        pdf.addImage(logoBase64, "PNG", 15, 8, 30, 25);
        yPosition += 20;
      }
    } catch (logoError) {
      console.error("Error cargando logo:", logoError);
      // Continuar sin logo si hay error
    }

    // Título
    pdf.setFontSize(16);
    pdf.setFont("helvetica", "bold");
    pdf.text("REPORTE DE INSPECCIÓN DE CALIDAD", pageWidth / 2, yPosition, {
      align: "center",
    });
    yPosition += 12;

    // Información general
    pdf.setFontSize(11);
    pdf.setFont("helvetica", "normal");
    pdf.text(`Consecutivo: ${data.consecutivo}`, 15, yPosition);
    yPosition += 6;
    pdf.text(`Fecha: ${data.fecha}`, 15, yPosition);
    yPosition += 6;
    pdf.text(`Inspector: ${data.inspector}`, 15, yPosition);
    yPosition += 6;
    pdf.text(`Tipo: ${data.tipo}`, 15, yPosition);
    yPosition += 6;
    pdf.text(`Estado: ${data.estado}`, 15, yPosition);
    yPosition += 10;

    // Información del producto
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "bold");
    pdf.text("INFORMACIÓN DEL PRODUCTO", 15, yPosition);
    yPosition += 7;
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    pdf.text(`Código: ${data.producto}`, 15, yPosition);
    yPosition += 5;
    if (data.descripcion) {
      const descLines = pdf.splitTextToSize(
        `Descripción: ${data.descripcion}`,
        180
      );
      pdf.text(descLines, 15, yPosition);
      yPosition += descLines.length * 4 + 2;
    }
    pdf.text(`OP: ${data.op}`, 15, yPosition);
    yPosition += 5;
    if (data.kw) {
      pdf.text(`kW: ${data.kw}`, 15, yPosition);
      yPosition += 5;
    }
    if (data.temperaturas) {
      const tempLines = pdf.splitTextToSize(
        `Temperaturas: ${data.temperaturas}`,
        180
      );
      pdf.text(tempLines, 15, yPosition);
      yPosition += tempLines.length * 4 + 2;
    }
    if (data.instrumento) {
      pdf.text(`Instrumento: ${data.instrumento}`, 15, yPosition);
      yPosition += 5;
    }
    if (data.fecha_calibracion) {
      pdf.text(`Fecha Calibración: ${data.fecha_calibracion}`, 15, yPosition);
      yPosition += 5;
    }
    yPosition += 8;

    // Muestras
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "bold");
    pdf.text("MUESTRAS", 15, yPosition);
    yPosition += 8;

    if (data.samples.length > 0) {
      const headers =
        data.tipo === "PT"
          ? ["Nº", "Placa", "A1", "A2", "A3", "A4", "A5", "A6", "A7", "Litros"]
          : ["Nº", "Medida 1", "Medida 2", "Medida 3", "Medida 4"];

      const rows = data.samples.map((sample: any) => {
        if (data.tipo === "PT") {
          return [
            String(sample.numero_muestra || ""),
            String(sample.placa || ""),
            String(sample.amp1 || ""),
            String(sample.amp2 || ""),
            String(sample.amp3 || ""),
            String(sample.amp4 || ""),
            String(sample.amp5 || ""),
            String(sample.amp6 || ""),
            String(sample.amp7 || ""),
            String(sample.litros || ""),
          ];
        } else {
          return [
            String(sample.numero_muestra || ""),
            String(sample.medida1 || ""),
            String(sample.medida2 || ""),
            String(sample.medida3 || ""),
            String(sample.medida4 || ""),
          ];
        }
      });

      pdf.setFontSize(9);
      pdf.setFont("helvetica", "normal");
      autoTable(pdf, {
        head: [headers],
        body: rows,
        startY: yPosition,
        margin: { left: 15, right: 15 },
        styles: {
          fontSize: 9,
          cellPadding: 4,
          overflow: "linebreak",
        },
        headStyles: {
          fillColor: [220, 53, 69],
          textColor: [255, 255, 255],
          fontStyle: "bold",
          fontSize: 9,
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
        didDrawPage: (data: any) => {
          // Footer
          const pageSize = pdf.internal.pageSize;
          const pageHeight = pageSize.getHeight();
          const pageWidth = pageSize.getWidth();
          pdf.setFontSize(9);
          pdf.text(
            `Página ${data.pageNumber}`,
            pageWidth / 2,
            pageHeight - 10,
            { align: "center" }
          );
        },
      });
    }

    pdf.save(`Inspeccion_${data.consecutivo}.pdf`);
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw error;
  }
}

export function exportToExcel(data: InspectionExportData) {
  try {
    const workbook = XLSX.utils.book_new();

    // Hoja de información general
    const generalData = [
      ["INFORMACIÓN GENERAL"],
      [],
      ["Consecutivo", data.consecutivo],
      ["Fecha", data.fecha],
      ["Inspector", data.inspector],
      ["Tipo", data.tipo],
      ["Estado", data.estado],
      [],
      ["INFORMACIÓN DEL PRODUCTO"],
      ["Código Producto", data.producto],
      ["Descripción", data.descripcion || ""],
      ["OP", data.op],
      ["kW", data.kw || ""],
      ["Temperaturas", data.temperaturas || ""],
      ["Instrumento", data.instrumento || ""],
      ["Fecha Calibración", data.fecha_calibracion || ""],
      ["Cantidad Muestras", data.cantidad_muestras],
    ];

    const generalSheet = XLSX.utils.aoa_to_sheet(generalData);

    // Estilos para la hoja general (opcional)
    if (generalSheet["A1"]) {
      generalSheet["A1"].s = { bold: true, sz: 14 };
    }
    if (generalSheet["A9"]) {
      generalSheet["A9"].s = { bold: true, sz: 14 };
    }

    // Ajustar ancho de columnas
    generalSheet["!cols"] = [{ wch: 30 }, { wch: 40 }];
    XLSX.utils.book_append_sheet(workbook, generalSheet, "General");

    // Hoja de muestras
    if (data.samples.length > 0) {
      let samplesData: any[][] = [];

      if (data.tipo === "PT") {
        samplesData = [
          [
            "Nº",
            "Placa",
            "A1",
            "A2",
            "A3",
            "A4",
            "A5",
            "A6",
            "A7",
            "Litros",
          ],
          ...data.samples.map((sample: any) => [
            sample.numero_muestra || "",
            sample.placa || "",
            sample.amp1 || "",
            sample.amp2 || "",
            sample.amp3 || "",
            sample.amp4 || "",
            sample.amp5 || "",
            sample.amp6 || "",
            sample.amp7 || "",
            sample.litros || "",
          ]),
        ];
      } else {
        samplesData = [
          ["Nº", "Medida 1", "Medida 2", "Medida 3", "Medida 4"],
          ...data.samples.map((sample: any) => [
            sample.numero_muestra || "",
            sample.medida1 || "",
            sample.medida2 || "",
            sample.medida3 || "",
            sample.medida4 || "",
          ]),
        ];
      }

      const samplesSheet = XLSX.utils.aoa_to_sheet(samplesData);

      // Estilos para encabezados
      if (samplesSheet["A1"]) {
        samplesSheet["A1"].s = { bold: true, fill: { fgColor: { rgb: "FFDC3545" } } };
      }

      // Ajustar ancho de columnas
      samplesSheet["!cols"] = Array(
        data.tipo === "PT" ? 10 : 5
      ).fill({ wch: 15 });
      XLSX.utils.book_append_sheet(workbook, samplesSheet, "Muestras");
    }

    XLSX.writeFile(workbook, `Inspeccion_${data.consecutivo}.xlsx`);
  } catch (error) {
    console.error("Error generating Excel:", error);
    throw error;
  }
}
