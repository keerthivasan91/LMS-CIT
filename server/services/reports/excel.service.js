const ExcelJS = require("exceljs");
const path = require("path");

const LOGO_PATH = path.join(__dirname, "../../assets/cit-logo.png");

/* ---------- helpers ---------- */
function sanitize(value = "") {
  return String(value)
    .replace(/\s+/g, "_")
    .replace(/[^a-zA-Z0-9_-]/g, "")
    .toUpperCase();
}

async function generateExcel(res, data, filters = {}) {
  const {
    department = "ALL",
    startDate = "",
    endDate = ""
  } = filters;

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Leave History");

  /* =====================================================
     1️⃣ ROW LAYOUT (RESERVE SPACE FOR HEADER)
  ===================================================== */
  sheet.getRow(1).height = 30;
  sheet.getRow(2).height = 24;
  sheet.getRow(3).height = 22;
  sheet.getRow(4).height = 10;
  sheet.getRow(5).height = 14;
  sheet.getRow(6).height = 10;
  sheet.getRow(7).height = 24;
  sheet.getRow(8).height = 10;

  /* =====================================================
     2️⃣ LOGO (LEFT)
  ===================================================== */
  const logo = workbook.addImage({
    filename: LOGO_PATH,
    extension: "png"
  });

  sheet.addImage(logo, {
    tl: { col: 0, row: 0 },
    ext: { width: 80, height: 80 }
  });

  /* =====================================================
     3️⃣ COLLEGE HEADER (CENTERED)
  ===================================================== */
  sheet.mergeCells("C1:I1");
  sheet.mergeCells("C2:I2");
  sheet.mergeCells("C3:I3");

  sheet.getCell("C1").value = "CAMBRIDGE INSTITUTE OF TECHNOLOGY";
  sheet.getCell("C1").font = { bold: true, size: 14 };
  sheet.getCell("C1").alignment = { horizontal: "center", vertical: "middle" };

  sheet.getCell("C2").value = "(An Autonomous Institution)";
  sheet.getCell("C2").font = { size: 11 };
  sheet.getCell("C2").alignment = { horizontal: "center", vertical: "middle" };

  sheet.getCell("C3").value = "K.R. PURAM, BENGALURU – 560 036";
  sheet.getCell("C3").font = { size: 11 };
  sheet.getCell("C3").alignment = { horizontal: "center", vertical: "middle" };

  /* =====================================================
     4️⃣ BLUE DIVIDER LINE
  ===================================================== */
  sheet.mergeCells("A5:I5");
  sheet.getCell("A5").border = {
    bottom: { style: "thick", color: { argb: "2B6CB0" } }
  };

  /* =====================================================
     5️⃣ REPORT TITLE
  ===================================================== */
  sheet.mergeCells("A7:I7");

  const titleDept =
    department === "ALL" ? "Institution" : department;

  sheet.getCell("A7").value =
    `${titleDept} Leave History (${startDate} to ${endDate})`;

  sheet.getCell("A7").font = { bold: true };
  sheet.getCell("A7").alignment = {
    horizontal: "center",
    vertical: "middle"
  };

  /* =====================================================
     6️⃣ TABLE HEADER (MANUAL — IMPORTANT)
  ===================================================== */
  const TABLE_HEADER_ROW = 9;

  const columns = [
    { header: "Name", key: "requester_name", width: 26 },
    { header: "Department", key: "department_code", width: 14 },
    { header: "Leave Type", key: "leave_type", width: 22 },
    { header: "Start Date", key: "start_date", width: 14 },
    { header: "End Date", key: "end_date", width: 14 },
    { header: "Days", key: "days", width: 8 },
    { header: "Status", key: "final_status", width: 14 }
  ];

  // Set column widths ONLY (no headers here)
  sheet.columns = columns.map(c => ({
    key: c.key,
    width: c.width
  }));

  // Write header row manually
  const headerRow = sheet.getRow(TABLE_HEADER_ROW);
  columns.forEach((col, index) => {
    const cell = headerRow.getCell(index + 1);
    cell.value = col.header;
    cell.font = { bold: true };
    cell.alignment = { horizontal: "center", vertical: "middle" };
    cell.border = {
      top: { style: "thin" },
      bottom: { style: "thin" }
    };
  });
  headerRow.height = 20;

  /* =====================================================
     7️⃣ DATA ROWS
  ===================================================== */
  let currentRow = TABLE_HEADER_ROW + 1;

  data.forEach(row => {
    const excelRow = sheet.getRow(currentRow);

    columns.forEach((col, index) => {
      let value = row[col.key];

      if (col.key === "start_date" || col.key === "end_date") {
        value = new Date(value).toLocaleDateString();
      }

      excelRow.getCell(index + 1).value = value ?? "";
    });

    excelRow.commit();
    currentRow++;
  });

  /* =====================================================
     8️⃣ FILENAME + RESPONSE
  ===================================================== */
  const safeDept = sanitize(department);
  const filename =
    `leave-history_${safeDept}_${startDate}_to_${endDate}.xlsx`;

  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${filename}"`
  );
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );

  await workbook.xlsx.write(res);
  res.end();
}

module.exports = { generateExcel };
