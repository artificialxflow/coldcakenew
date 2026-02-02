import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Sale, Customer, BusinessSettings, SaleItem, Debt } from '@/types';

/**
 * تولید رسید فروش به صورت PDF
 */
export function generateSaleReceipt(
  sale: Sale,
  customer: Customer | undefined,
  settings: BusinessSettings
): void {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Header - اطلاعات فروشگاه
  doc.setFontSize(18);
  doc.text(settings.businessName || 'فروشگاه', pageWidth / 2, 20, { align: 'center' });
  
  doc.setFontSize(12);
  if (settings.address) {
    doc.text(`آدرس: ${settings.address}`, pageWidth / 2, 30, { align: 'center' });
  }
  if (settings.contactPhone) {
    doc.text(`تلفن: ${settings.contactPhone}`, pageWidth / 2, 36, { align: 'center' });
  }
  
  // Separator
  doc.line(20, 42, pageWidth - 20, 42);
  
  // Title
  doc.setFontSize(16);
  doc.text('رسید فروش', pageWidth / 2, 52, { align: 'center' });
  
  let yPosition = 60;
  
  // اطلاعات مشتری
  doc.setFontSize(12);
  doc.text('اطلاعات مشتری:', 20, yPosition);
  yPosition += 8;
  
  if (customer) {
    doc.setFontSize(11);
    doc.text(`نام: ${customer.firstName} ${customer.lastName}`, 25, yPosition);
    yPosition += 6;
    if (customer.phone) {
      doc.text(`تلفن: ${customer.phone}`, 25, yPosition);
      yPosition += 6;
    }
    if (customer.email) {
      doc.text(`ایمیل: ${customer.email}`, 25, yPosition);
      yPosition += 6;
    }
  } else if (sale.customerName) {
    doc.setFontSize(11);
    doc.text(`نام: ${sale.customerName}`, 25, yPosition);
    yPosition += 6;
  }
  
  // اطلاعات فروش
  yPosition += 4;
  doc.setFontSize(12);
  doc.text('اطلاعات فروش:', 20, yPosition);
  yPosition += 8;
  
  doc.setFontSize(11);
  doc.text(`شماره فاکتور: ${sale.id}`, 25, yPosition);
  yPosition += 6;
  doc.text(`تاریخ: ${new Date(sale.date).toLocaleDateString('fa-IR')}`, 25, yPosition);
  yPosition += 10;
  
  // جدول محصولات
  if (sale.items && sale.items.length > 0) {
    const itemsData = sale.items.map((item, index) => [
      (index + 1).toString(),
      item.productName,
      item.quantity.toString(),
      item.unitPrice.toLocaleString('fa-IR') + ' تومان',
      (item.quantity * item.unitPrice).toLocaleString('fa-IR') + ' تومان',
    ]);
    
    autoTable(doc, {
      startY: yPosition,
      head: [['ردیف', 'نام محصول', 'تعداد', 'قیمت واحد', 'جمع']],
      body: itemsData,
      theme: 'striped',
      headStyles: { fillColor: [245, 158, 11], textColor: [255, 255, 255] },
      styles: { font: 'Vazirmatn', fontStyle: 'normal', fontSize: 10 },
      margin: { left: 20, right: 20 },
    });
    
    yPosition = (doc as any).lastAutoTable.finalY + 10;
  } else if (sale.products && sale.products.length > 0) {
    // اگر items وجود نداشت، از products استفاده کن
    const itemsData = sale.products.map((product, index) => [
      (index + 1).toString(),
      product.name,
      '1',
      (product.originalPrice || 0).toLocaleString('fa-IR') + ' تومان',
      (product.originalPrice || 0).toLocaleString('fa-IR') + ' تومان',
    ]);
    
    autoTable(doc, {
      startY: yPosition,
      head: [['ردیف', 'نام محصول', 'تعداد', 'قیمت واحد', 'جمع']],
      body: itemsData,
      theme: 'striped',
      headStyles: { fillColor: [245, 158, 11], textColor: [255, 255, 255] },
      styles: { font: 'Vazirmatn', fontStyle: 'normal', fontSize: 10 },
      margin: { left: 20, right: 20 },
    });
    
    yPosition = (doc as any).lastAutoTable.finalY + 10;
  }
  
  // مبلغ کل
  doc.setFontSize(14);
  doc.text(`مبلغ کل: ${sale.amount.toLocaleString('fa-IR')} تومان`, pageWidth - 20, yPosition, { align: 'right' });
  
  // Footer
  yPosition = doc.internal.pageSize.getHeight() - 30;
  doc.setFontSize(10);
  doc.text('با تشکر از اعتماد شما', pageWidth / 2, yPosition, { align: 'center' });
  doc.text('امیدواریم از خرید خود راضی باشید', pageWidth / 2, yPosition + 6, { align: 'center' });
  
  // Save
  const dateStr = new Date(sale.date).toLocaleDateString('fa-IR').replace(/\//g, '-');
  doc.save(`رسید_${sale.id}_${dateStr}.pdf`);
}

/**
 * تولید رسید بدهی (فاکتور طلب) به صورت PDF
 */
export function generateDebtReceipt(
  debt: Debt,
  customer: Customer | undefined,
  settings: BusinessSettings
): void {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Header
  doc.setFontSize(18);
  doc.text(settings.businessName || 'فروشگاه', pageWidth / 2, 20, { align: 'center' });
  
  doc.setFontSize(12);
  if (settings.address) {
    doc.text(`آدرس: ${settings.address}`, pageWidth / 2, 30, { align: 'center' });
  }
  if (settings.contactPhone) {
    doc.text(`تلفن: ${settings.contactPhone}`, pageWidth / 2, 36, { align: 'center' });
  }
  
  doc.line(20, 42, pageWidth - 20, 42);
  
  // Title
  doc.setFontSize(16);
  doc.text('فاکتور طلب', pageWidth / 2, 52, { align: 'center' });
  
  let yPosition = 60;
  
  // اطلاعات مشتری
  doc.setFontSize(12);
  doc.text('اطلاعات مشتری:', 20, yPosition);
  yPosition += 8;
  
  doc.setFontSize(11);
  doc.text(`نام: ${debt.customerName}`, 25, yPosition);
  yPosition += 6;
  if (customer?.phone) {
    doc.text(`تلفن: ${customer.phone}`, 25, yPosition);
    yPosition += 6;
  }
  if (customer?.email) {
    doc.text(`ایمیل: ${customer.email}`, 25, yPosition);
    yPosition += 6;
  }
  
  // اطلاعات طلب
  yPosition += 4;
  doc.setFontSize(12);
  doc.text('اطلاعات طلب:', 20, yPosition);
  yPosition += 8;
  
  doc.setFontSize(11);
  doc.text(`شماره فاکتور: ${debt.id}`, 25, yPosition);
  yPosition += 6;
  doc.text(`مبلغ طلب: ${debt.amount.toLocaleString('fa-IR')} تومان`, 25, yPosition);
  yPosition += 6;
  doc.text(`تاریخ سررسید: ${new Date(debt.dueDate).toLocaleDateString('fa-IR')}`, 25, yPosition);
  yPosition += 6;
  
  if (debt.checkNumber) {
    doc.text(`شماره چک: ${debt.checkNumber}`, 25, yPosition);
    yPosition += 6;
  }
  if (debt.bank) {
    doc.text(`بانک: ${debt.bank}`, 25, yPosition);
    yPosition += 6;
  }
  if (debt.receiveDate) {
    doc.text(`تاریخ دریافت: ${new Date(debt.receiveDate).toLocaleDateString('fa-IR')}`, 25, yPosition);
    yPosition += 6;
  }
  
  const statusText = debt.status === 'paid' ? 'پرداخت شده' : 'در انتظار پرداخت';
  const statusColor = debt.status === 'paid' ? [34, 197, 94] : [239, 68, 68];
  doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
  doc.text(`وضعیت: ${statusText}`, 25, yPosition);
  doc.setTextColor(0, 0, 0);
  yPosition += 6;
  
  if (debt.daysUntilDue !== undefined && debt.daysUntilDue > 0 && debt.status === 'pending') {
    yPosition += 2;
    doc.setTextColor(239, 68, 68);
    doc.text(`تعداد روز تا سررسید: ${debt.daysUntilDue} روز`, 25, yPosition);
    doc.setTextColor(0, 0, 0);
    yPosition += 6;
  }
  
  if (debt.paidDate) {
    doc.text(`تاریخ پرداخت: ${new Date(debt.paidDate).toLocaleDateString('fa-IR')}`, 25, yPosition);
  }
  
  // Footer
  yPosition = doc.internal.pageSize.getHeight() - 30;
  doc.setFontSize(10);
  if (debt.status === 'pending') {
    doc.text('لطفاً تا قبل از تاریخ سررسید نسبت به پرداخت اقدام فرمایید', pageWidth / 2, yPosition, { align: 'center' });
  } else {
    doc.text('این طلب پرداخت شده است', pageWidth / 2, yPosition, { align: 'center' });
  }
  
  // Save
  const dateStr = new Date(debt.dueDate).toLocaleDateString('fa-IR').replace(/\//g, '-');
  doc.save(`فاکتور_طلب_${debt.id}_${dateStr}.pdf`);
}
