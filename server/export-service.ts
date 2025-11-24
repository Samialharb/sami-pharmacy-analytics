/**
 * خدمة التصدير
 * توفر وظائف لتصدير البيانات إلى PDF و Excel
 */

import PDFDocument from 'pdfkit';
import ExcelJS from 'exceljs';
import { Readable } from 'stream';

interface ExportOptions {
  title: string;
  subtitle?: string;
  columns: string[];
  data: any[];
  filename: string;
}

class ExportService {
  /**
   * تصدير البيانات إلى PDF
   */
  static async exportToPDF(options: ExportOptions): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: 'A4',
          margin: 50,
        });

        const buffers: Buffer[] = [];

        doc.on('data', (chunk) => buffers.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(buffers)));
        doc.on('error', reject);

        // العنوان
        doc.fontSize(20).font('Helvetica-Bold').text(options.title, { align: 'right' });
        
        if (options.subtitle) {
          doc.fontSize(12).font('Helvetica').text(options.subtitle, { align: 'right' });
        }

        // التاريخ
        doc.fontSize(10).text(`التاريخ: ${new Date().toLocaleDateString('ar-SA')}`, { align: 'right' });
        doc.moveDown();

        // الجدول
        const tableTop = doc.y;
        const columnWidth = (doc.page.width - 100) / options.columns.length;

        // رؤوس الأعمدة
        doc.fontSize(11).font('Helvetica-Bold');
        options.columns.forEach((col, i) => {
          doc.text(col, 50 + i * columnWidth, tableTop, {
            width: columnWidth,
            align: 'center',
          });
        });

        // خط الفاصل
        doc.moveTo(50, tableTop + 20).lineTo(doc.page.width - 50, tableTop + 20).stroke();

        // البيانات
        doc.fontSize(10).font('Helvetica');
        let currentY = tableTop + 30;

        options.data.forEach((row, rowIndex) => {
          if (currentY > doc.page.height - 50) {
            doc.addPage();
            currentY = 50;
          }

          options.columns.forEach((col, colIndex) => {
            const value = row[col] || '';
            doc.text(String(value), 50 + colIndex * columnWidth, currentY, {
              width: columnWidth,
              align: 'center',
            });
          });

          currentY += 20;
        });

        // التذييل
        doc.fontSize(10).text('© 2024 صيدلية سامي - منصة التقارير', { align: 'center' });

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * تصدير البيانات إلى Excel
   */
  static async exportToExcel(options: ExportOptions): Promise<Buffer> {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('البيانات');

      // إضافة العنوان
      worksheet.mergeCells('A1:E1');
      const titleCell = worksheet.getCell('A1');
      titleCell.value = options.title;
      titleCell.font = { bold: true, size: 16 };
      titleCell.alignment = { horizontal: 'center', vertical: 'center' };

      // إضافة التاريخ
      worksheet.mergeCells('A2:E2');
      const dateCell = worksheet.getCell('A2');
      dateCell.value = `التاريخ: ${new Date().toLocaleDateString('ar-SA')}`;
      dateCell.font = { size: 10 };
      dateCell.alignment = { horizontal: 'center' };

      // إضافة رؤوس الأعمدة
      const headerRow = worksheet.addRow(options.columns);
      headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4472C4' },
      };
      headerRow.alignment = { horizontal: 'center', vertical: 'center' };

      // إضافة البيانات
      options.data.forEach((row) => {
        const values = options.columns.map((col) => row[col] || '');
        const dataRow = worksheet.addRow(values);
        dataRow.alignment = { horizontal: 'center', vertical: 'center' };
      });

      // تعديل عرض الأعمدة
      options.columns.forEach((col, index) => {
        worksheet.getColumn(index + 1).width = 20;
      });

      // تحويل إلى Buffer
      const buffer = await workbook.xlsx.writeBuffer();
      return buffer as Buffer;
    } catch (error) {
      throw error;
    }
  }

  /**
   * تصدير البيانات إلى CSV
   */
  static exportToCSV(options: ExportOptions): string {
    try {
      const rows: string[] = [];

      // العنوان
      rows.push(options.title);
      if (options.subtitle) {
        rows.push(options.subtitle);
      }
      rows.push(`التاريخ: ${new Date().toLocaleDateString('ar-SA')}`);
      rows.push(''); // سطر فارغ

      // رؤوس الأعمدة
      rows.push(options.columns.map((col) => `"${col}"`).join(','));

      // البيانات
      options.data.forEach((row) => {
        const values = options.columns.map((col) => {
          const value = row[col] || '';
          return `"${String(value).replace(/"/g, '""')}"`;
        });
        rows.push(values.join(','));
      });

      return rows.join('\n');
    } catch (error) {
      throw error;
    }
  }

  /**
   * إنشاء تقرير شامل
   */
  static async generateReport(
    title: string,
    sections: Array<{
      name: string;
      columns: string[];
      data: any[];
    }>
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: 'A4',
          margin: 50,
        });

        const buffers: Buffer[] = [];

        doc.on('data', (chunk) => buffers.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(buffers)));
        doc.on('error', reject);

        // العنوان الرئيسي
        doc.fontSize(24).font('Helvetica-Bold').text(title, { align: 'right' });
        doc.fontSize(12).text(`التاريخ: ${new Date().toLocaleDateString('ar-SA')}`, { align: 'right' });
        doc.moveDown();

        // الأقسام
        sections.forEach((section) => {
          // عنوان القسم
          doc.fontSize(14).font('Helvetica-Bold').text(section.name, { align: 'right' });
          doc.moveDown(0.5);

          // الجدول
          const tableTop = doc.y;
          const columnWidth = (doc.page.width - 100) / section.columns.length;

          // رؤوس الأعمدة
          doc.fontSize(10).font('Helvetica-Bold');
          section.columns.forEach((col, i) => {
            doc.text(col, 50 + i * columnWidth, tableTop, {
              width: columnWidth,
              align: 'center',
            });
          });

          // خط الفاصل
          doc.moveTo(50, tableTop + 20).lineTo(doc.page.width - 50, tableTop + 20).stroke();

          // البيانات
          doc.fontSize(9).font('Helvetica');
          let currentY = tableTop + 30;

          section.data.slice(0, 10).forEach((row) => {
            if (currentY > doc.page.height - 50) {
              doc.addPage();
              currentY = 50;
            }

            section.columns.forEach((col, colIndex) => {
              const value = row[col] || '';
              doc.text(String(value).substring(0, 20), 50 + colIndex * columnWidth, currentY, {
                width: columnWidth,
                align: 'center',
              });
            });

            currentY += 20;
          });

          doc.moveDown();
        });

        // التذييل
        doc.fontSize(10).text('© 2024 صيدلية سامي - منصة التقارير', { align: 'center' });

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }
}

export default ExportService;
