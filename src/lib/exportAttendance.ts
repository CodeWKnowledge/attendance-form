import { jsPDF } from 'jspdf';
import { autoTable } from 'jspdf-autotable';
import {
  AlignmentType,
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from 'docx';
import type { AttendanceRecord } from '@/lib/attendance';
import { formatDateTime } from '@/lib/formatDateTime';

const TITLE = 'Department Attendance Register';
const HEADERS = ['#', 'Full name', 'Phone number', 'Reg number', 'Signed in at'];
const HEADER_FILL = '0F766E';

function toRows(records: AttendanceRecord[]): string[][] {
  return records.map((record, index) => [
    String(index + 1),
    record.full_name,
    record.phone_number,
    record.reg_number,
    formatDateTime(record.created_at),
  ]);
}

function buildFilename(extension: string): string {
  const stamp = new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-');
  return `attendance-${stamp}.${extension}`;
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function exportAttendancePdf(records: AttendanceRecord[]) {
  const doc = new jsPDF({ orientation: 'landscape' });
  doc.setFontSize(16);
  doc.setTextColor(15, 23, 42);
  doc.text(TITLE, 14, 18);
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text(
    `Total records: ${records.length}   Generated: ${formatDateTime(new Date().toISOString())}`,
    14,
    25,
  );

  autoTable(doc, {
    head: [HEADERS],
    body: toRows(records),
    startY: 31,
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [15, 118, 110] },
    alternateRowStyles: { fillColor: [241, 245, 249] },
  });

  doc.save(buildFilename('pdf'));
}

function headerCell(text: string): TableCell {
  return new TableCell({
    shading: { type: ShadingType.CLEAR, color: 'auto', fill: HEADER_FILL },
    children: [
      new Paragraph({
        children: [new TextRun({ text, bold: true, color: 'FFFFFF' })],
      }),
    ],
  });
}

function bodyCell(text: string): TableCell {
  return new TableCell({
    children: [new Paragraph({ children: [new TextRun({ text })] })],
  });
}

export async function exportAttendanceDocx(records: AttendanceRecord[]) {
  const table = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({ tableHeader: true, children: HEADERS.map(headerCell) }),
      ...toRows(records).map(
        (cells) => new TableRow({ children: cells.map(bodyCell) }),
      ),
    ],
  });

  const document = new Document({
    sections: [
      {
        children: [
          new Paragraph({ heading: HeadingLevel.HEADING_1, text: TITLE }),
          new Paragraph({
            alignment: AlignmentType.LEFT,
            children: [
              new TextRun({
                text: `Total records: ${records.length}   Generated: ${formatDateTime(new Date().toISOString())}`,
                color: '64748B',
              }),
            ],
          }),
          new Paragraph({ text: '' }),
          table,
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(document);
  downloadBlob(blob, buildFilename('docx'));
}
