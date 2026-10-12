import jsPDF from "jspdf";
import { IPollutionReportItem } from "./_types";
import { getBase64ImageFromUrl } from "@/utils/utils.file";
import dayjs from "dayjs";
import { jsPDFDocument } from "jspdf-autotable";

export async function generateSingleReportPdf(
  report: IPollutionReportItem,
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
      ["Location", report.address || "Unspecified"],
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
    const base64Img = await getBase64ImageFromUrl(report.imageUrl);
    if (base64Img) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(11, 98, 103);
      doc.text("Attached Photographic Evidence:", 14, currentY);

      try {
        doc.addImage(base64Img, "JPEG", 14, currentY + 4, 120, 75);
      } catch {}
    }
  }

  // footer -----------------------------------------------
  doc.setFontSize(8);
  doc.setTextColor(150);
  doc.text(`NetZero Hub • ${dayjs().format("DD/MM/YYYY")}`, 14, 285);

  return doc;
}
