/**
 * دوال تصدير التقارير إلى Excel و PDF
 */

import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { SalesOrder } from '@shared/supabase';

/**
 * تصدير البيانات إلى Excel
 */
export function exportToExcel(data: SalesOrder[], filename: string = 'sales_report') {
  if (!data || data.length === 0) {
    alert('لا توجد بيانات للتصدير');
    return;
  }

  // تحويل البيانات إلى صيغة مناسبة للتصدير
  const exportData = data.map(order => ({
    'رقم الطلب': order.name,
    'التاريخ': new Date(order.date_order).toLocaleDateString('ar-SA'),
    'المبلغ (ر.س)': order.amount_total,
    'الحالة': order.state === 'sale' ? 'مؤكد' : order.state === 'draft' ? 'مسودة' : 'ملغي',
    'معرف العميل': order.customer_aumet_id || '-',
  }));

  // إنشاء ورقة عمل
  const ws = XLSX.utils.json_to_sheet(exportData);

  // تعيين عرض الأعمدة
  ws['!cols'] = [
    { wch: 20 }, // رقم الطلب
    { wch: 15 }, // التاريخ
    { wch: 15 }, // المبلغ
    { wch: 15 }, // الحالة
    { wch: 15 }, // معرف العميل
  ];

  // إنشاء كتاب عمل
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'تقرير المبيعات');

  // تصدير الملف
  const fileName = `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(wb, fileName);
  
  // إظهار رسالة نجاح
  alert(`تم تصدير ${data.length} طلب إلى ${fileName}`);
}

/**
 * تصدير البيانات إلى PDF مع دعم العربية
 */
export function exportToPDF(
  data: SalesOrder[], 
  filename: string = 'sales_report',
  stats?: {
    totalSales: number;
    totalOrders: number;
    averageOrderValue: number;
  }
) {
  if (!data || data.length === 0) {
    alert('لا توجد بيانات للتصدير');
    return;
  }

  // إنشاء مستند PDF
  const doc = new jsPDF();

  // إعدادات الصفحة
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  // العنوان الرئيسي
  doc.setFontSize(20);
  doc.setTextColor(41, 128, 185);
  doc.text('Sami Pharmacy - Sales Report', pageWidth / 2, 20, { align: 'center' });
  
  // خط فاصل
  doc.setDrawColor(200, 200, 200);
  doc.line(20, 25, pageWidth - 20, 25);

  // إضافة الإحصائيات إذا كانت موجودة
  let yPos = 35;
  if (stats) {
    doc.setFontSize(11);
    doc.setTextColor(60, 60, 60);
    
    // صف الإحصائيات الأول
    doc.text(`Total Sales: ${stats.totalSales.toLocaleString('en-US')} SAR`, 20, yPos);
    doc.text(`Total Orders: ${stats.totalOrders.toLocaleString('en-US')}`, pageWidth / 2, yPos);
    
    yPos += 8;
    
    // صف الإحصائيات الثاني
    doc.text(`Average Order: ${stats.averageOrderValue.toFixed(2)} SAR`, 20, yPos);
    doc.text(`Date: ${new Date().toLocaleDateString('en-US')}`, pageWidth / 2, yPos);
    
    yPos += 12;
  }

  // تحويل البيانات إلى صفوف الجدول
  const tableData = data.map((order, index) => [
    index + 1,
    order.name,
    new Date(order.date_order).toLocaleDateString('en-US'),
    `${order.amount_total.toLocaleString('en-US')} SAR`,
    order.state === 'sale' ? 'Confirmed' : order.state === 'draft' ? 'Draft' : 'Cancelled',
  ]);

  // إنشاء الجدول
  autoTable(doc, {
    head: [['#', 'Order Number', 'Date', 'Amount', 'Status']],
    body: tableData,
    startY: yPos,
    styles: {
      font: 'helvetica',
      fontSize: 9,
      cellPadding: 4,
      lineColor: [220, 220, 220],
      lineWidth: 0.1,
    },
    headStyles: {
      fillColor: [52, 152, 219],
      textColor: 255,
      fontStyle: 'bold',
      halign: 'center',
      fontSize: 10,
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 15 },
      1: { halign: 'left', cellWidth: 45 },
      2: { halign: 'center', cellWidth: 35 },
      3: { halign: 'right', cellWidth: 40 },
      4: { halign: 'center', cellWidth: 35 },
    },
    alternateRowStyles: {
      fillColor: [248, 249, 250],
    },
    margin: { top: 10, left: 20, right: 20 },
    didDrawPage: (data) => {
      // Footer
      const footerY = pageHeight - 15;
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `Page ${data.pageNumber} | Generated: ${new Date().toLocaleString('en-US')}`,
        pageWidth / 2,
        footerY,
        { align: 'center' }
      );
    },
  });

  // حفظ الملف
  const fileName = `${filename}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
  
  // إظهار رسالة نجاح
  alert(`تم تصدير ${data.length} طلب إلى ${fileName}`);
}

/**
 * تصدير بيانات المنتجات إلى Excel
 */
export function exportProductsToExcel(products: any[], filename: string = 'products_report') {
  if (!products || products.length === 0) {
    alert('لا توجد بيانات للتصدير');
    return;
  }

  const exportData = products.map(product => ({
    'المنتج': product.name,
    'الفئة': product.category,
    'الكمية المباعة': product.sold,
    'الإيرادات (ر.س)': product.revenue,
    'المخزون': product.stock,
  }));

  const ws = XLSX.utils.json_to_sheet(exportData);
  ws['!cols'] = [
    { wch: 30 },
    { wch: 20 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'تقرير المنتجات');

  const fileName = `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(wb, fileName);
  alert(`تم تصدير ${products.length} منتج إلى ${fileName}`);
}

/**
 * تصدير بيانات العملاء إلى Excel
 */
export function exportCustomersToExcel(customers: any[], filename: string = 'customers_report') {
  if (!customers || customers.length === 0) {
    alert('لا توجد بيانات للتصدير');
    return;
  }

  const exportData = customers.map(customer => ({
    'اسم العميل': customer.name,
    'المدينة': customer.city,
    'رقم الهاتف': customer.phone,
    'عدد الطلبات': customer.orders,
    'إجمالي المشتريات (ر.س)': customer.revenue,
  }));

  const ws = XLSX.utils.json_to_sheet(exportData);
  ws['!cols'] = [
    { wch: 25 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
    { wch: 20 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'تقرير العملاء');

  const fileName = `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(wb, fileName);
  alert(`تم تصدير ${customers.length} عميل إلى ${fileName}`);
}

/**
 * تصدير بيانات المخزون إلى Excel
 */
export function exportInventoryToExcel(inventory: any[], filename: string = 'inventory_report') {
  if (!inventory || inventory.length === 0) {
    alert('لا توجد بيانات للتصدير');
    return;
  }

  const exportData = inventory.map(item => ({
    'المنتج': item.product,
    'الكمية المتاحة': item.quantity,
    'الحد الأدنى': item.minStock,
    'الحالة': item.status,
    'آخر تحديث': item.lastUpdate,
  }));

  const ws = XLSX.utils.json_to_sheet(exportData);
  ws['!cols'] = [
    { wch: 30 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
    { wch: 20 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'تقرير المخزون');

  const fileName = `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(wb, fileName);
  alert(`تم تصدير ${inventory.length} منتج إلى ${fileName}`);
}

/**
 * تنسيق التاريخ للعرض
 */
export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * تنسيق المبلغ للعرض
 */
export function formatCurrency(amount: number): string {
  return `${amount.toLocaleString('ar-SA')} ر.س`;
}
