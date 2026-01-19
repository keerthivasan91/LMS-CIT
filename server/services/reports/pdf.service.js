// server/services/reports/pdf.service.js

const PDFDocument = require("pdfkit");
const path = require("path");

const PAGE_MARGIN = 40;
const ROW_HEIGHT = 20;
const LOGO_PATH = path.join(__dirname, "../../assets/cit-logo.png");

const columns = [
  { header: "Name", width: 120, key: "requester_name" },
  { header: "Dept", width: 50, key: "department_code" },
  { header: "Type", width: 90, key: "leave_type" },
  { header: "From", width: 60, key: "start_date" },
  { header: "To", width: 60, key: "end_date" },
  { header: "Days", width: 40, key: "days" },
  { header: "Status", width: 55, key: "final_status" }
];

function sanitize(value) {
  return String(value)
    .replace(/\s+/g, "_")
    .replace(/[^a-zA-Z0-9_-]/g, "")
    .toUpperCase();
}

/* ================= HEADER ================= */
function drawCollegeHeader(doc, filters) {
  const startY = PAGE_MARGIN;

  // Logo (left)
  doc.image(LOGO_PATH, PAGE_MARGIN, startY, { width: 70 });

  // College Name (center)
  doc
    .font("Helvetica-Bold")
    .fontSize(16)
    .text(
      "CAMBRIDGE INSTITUTE OF TECHNOLOGY",
      0,
      startY,
      { align: "center" }
    );

  doc
    .fontSize(11)
    .text("(An Autonomous Institution)", { align: "center" });

  doc
    .fontSize(11)
    .text("K.R. PURAM, BENGALURU – 560 036", { align: "center" });

  doc.moveDown(0.6);

  // Blue divider line
  doc
    .strokeColor("#2b6cb0")
    .lineWidth(2)
    .moveTo(PAGE_MARGIN, doc.y)
    .lineTo(doc.page.width - PAGE_MARGIN, doc.y)
    .stroke();

  doc
    .strokeColor("black")
    .lineWidth(1);

  doc.moveDown(1);

  // Report title
  doc
    .font("Helvetica-Bold")
    .fontSize(12)
    .text(`${filters.department == 'all' ? 'Institution' : filters.department} Leave History`, { align: "center" });

  doc
    .font("Helvetica")
    .fontSize(10)
    .text(
      `Period: ${filters.startDate} to ${filters.endDate}`,
      { align: "center" }
    );

  doc.moveDown(1);
}

/* ================= TABLE ================= */
function drawTableHeader(doc, y) {
  let x = PAGE_MARGIN;
  doc.font("Helvetica-Bold").fontSize(10);

  columns.forEach(col => {
    doc.text(col.header, x, y, { width: col.width });
    x += col.width;
  });

  doc
    .moveTo(PAGE_MARGIN, y + 14)
    .lineTo(doc.page.width - PAGE_MARGIN, y + 14)
    .stroke();

  doc.font("Helvetica");
}

function drawRow(doc, row, y) {
  let x = PAGE_MARGIN;

  columns.forEach(col => {
    let value = row[col.key];

    if (col.key === "start_date" || col.key === "end_date") {
      value = new Date(value).toLocaleDateString();
    }

    doc.text(String(value ?? ""), x, y, { width: col.width });
    x += col.width;
  });
}

/* ================= MAIN ================= */
function generatePDF(res, data, filters) {
  const doc = new PDFDocument({ size: "A4", margin: PAGE_MARGIN });

  const filename = `leave-history_${filters.department}_${filters.startDate}_to_${filters.endDate}.pdf`;

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${filename}"`
  );

  res.flushHeaders();

  doc.pipe(res);

  drawCollegeHeader(doc, filters);

  let y = doc.y;
  drawTableHeader(doc, y);
  y += ROW_HEIGHT;

  data.forEach(row => {
    if (y + ROW_HEIGHT > doc.page.height - PAGE_MARGIN) {
      doc.addPage();
      drawCollegeHeader(doc, filters);
      y = doc.y;
      drawTableHeader(doc, y);
      y += ROW_HEIGHT;
    }

    drawRow(doc, row, y);
    y += ROW_HEIGHT;
  });

  doc.end();
}

module.exports = { generatePDF };
