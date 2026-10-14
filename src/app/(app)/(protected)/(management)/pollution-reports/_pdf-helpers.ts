import jsPDF from "jspdf";
import { getBase64ImageFromUrl, loadNormalizedImage } from "@/utils/utils.file";
import dayjs from "dayjs";
import { jsPDFDocument } from "jspdf-autotable";
import { IPollutionReport } from "@/services/service.pollution-report";

function fitInBox(
  imgW: number,
  imgH: number,
  maxW: number,
  maxH: number,
): { w: number; h: number } {
  const ratio = Math.min(maxW / imgW, maxH / imgH);
  return { w: imgW * ratio, h: imgH * ratio };
}

export async function generateSingleReportPdf(
  report: IPollutionReport,
): Promise<jsPDF> {
  const { default: jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");

  const doc = new jsPDF({ format: "a4", unit: "mm" });

  // header -----------------------------------------------
  doc.setFillColor(18, 133, 133);
  doc.rect(0, 0, 210, 24, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("NSW EPA POLLUTION INCIDENT REPORT", 14, 12);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(`REPORT ID: #${report.id}`, 14, 18);

  // details ----------------------------------------------
  autoTable(doc, {
    startY: 30,
    theme: "striped",
    head: [["Attribute", "Incident Details"]],
    body: [
      ["Title", report.title],
      ["Type", report.type],
      ["Status", report.status],
      [
        "Location",
        `${report.address || "Unspecified"}` +
          (report.latitude && report.longitude
            ? ` (${report.latitude}, ${report.longitude})`
            : ""),
      ],
      ["Reported Date", dayjs(report.createdAt).format("DD/MM/YYYY HH:mm A")],
    ],
    headStyles: { fillColor: [18, 133, 133], fontSize: 9 },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 45 },
      1: { cellWidth: 135 },
    },
    styles: { fontSize: 9, cellPadding: 3.5 },
  });

  let currentY = (doc as jsPDFDocument).lastAutoTable.finalY + 10;

  // desc -------------------------------------------------
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(11, 98, 103);
  doc.text("Incident Description:", 14, currentY);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(50);
  const splitDescription = doc.splitTextToSize(report.description, 180);
  doc.text(splitDescription, 14, currentY + 6);

  currentY += 6 + splitDescription.length * 5 + 6;

  // image ------------------------------------------------
  if (report.imageUrl) {
    const img = await loadNormalizedImage(report.imageUrl);
    if (img) {
      const footerY = 285;
      const maxW = 180;
      const maxH = 110;

      const { w, h } = fitInBox(img.width, img.height, maxW, maxH);

      const needed = 4 + h + 6;
      if (currentY + needed > footerY - 5) {
        doc.addPage();
        currentY = 20;
      }

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(11, 98, 103);
      doc.text("Attached Photographic Evidence:", 14, currentY);

      try {
        doc.addImage(img.dataUrl, "JPEG", 14, currentY + 4, w, h);
      } catch (e) {
        console.error("Failed to add image to PDF", e);
      }
    }
  }

  // footer -----------------------------------------------
  doc.setFontSize(8);
  doc.setTextColor(150);
  doc.text(`NetZero Hub • ${dayjs().format("DD/MM/YYYY")}`, 14, 285);

  return doc;
}
