import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Sale, Debt, Inventory, Product, BankAccount, BankTransaction } from '@/types';
import { toPersianDate } from './dateUtils';

/**
 * Export گزارش‌ها به Excel
 */
export function exportToExcel(
  data: {
    sales?: Sale[];
    debts?: Debt[];
    inventory?: Inventory[];
    products?: Product[];
  },
  fileName: string = 'گزارش'
) {
  const workbook = XLSX.utils.book_new();

  // Sheet 1: Sales
  if (data.sales && data.sales.length > 0) {
    const salesData = data.sales.map((sale) => ({
      'مشتری': sale.customerId,
      'مبلغ': sale.amount,
      'تاریخ': toPersianDate(sale.date),
      'ماه': sale.month,
      'سال': sale.year,
    }));
    const salesSheet = XLSX.utils.json_to_sheet(salesData);
    XLSX.utils.book_append_sheet(workbook, salesSheet, 'فروش‌ها');
  }

  // Sheet 2: Debts
  if (data.debts && data.debts.length > 0) {
    const debtsData = data.debts.map((debt) => ({
      'مشتری': debt.customerName,
      'مبلغ': debt.amount,
      'تاریخ سررسید': toPersianDate(debt.dueDate),
      'شماره چک': debt.checkNumber || '-',
      'بانک': debt.bank || '-',
      'وضعیت': debt.status === 'paid' ? 'پرداخت شده' : 'در انتظار',
    }));
    const debtsSheet = XLSX.utils.json_to_sheet(debtsData);
    XLSX.utils.book_append_sheet(workbook, debtsSheet, 'طلب‌ها');
  }

  // Sheet 3: Inventory
  if (data.inventory && data.inventory.length > 0) {
    const inventoryData = data.inventory.map((item) => ({
      'محصول': item.productName,
      'تعداد': item.quantity,
      'قیمت خرید': item.purchasePrice || 0,
      'تاریخ خرید': item.purchaseDate ? toPersianDate(item.purchaseDate) : '-',
      'ارزش کل': item.quantity * (item.purchasePrice || 0),
    }));
    const inventorySheet = XLSX.utils.json_to_sheet(inventoryData);
    XLSX.utils.book_append_sheet(workbook, inventorySheet, 'موجودی');
  }

  // Sheet 4: Products
  if (data.products && data.products.length > 0) {
    const productsData = data.products.map((product) => ({
      'نام': product.name,
      'دسته‌بندی': product.category,
      'قیمت اصلی': product.originalPrice,
      'قیمت نهایی': product.finalPrice,
      'توضیحات': product.description,
    }));
    const productsSheet = XLSX.utils.json_to_sheet(productsData);
    XLSX.utils.book_append_sheet(workbook, productsSheet, 'محصولات');
  }

  // Download
  const date = toPersianDate(new Date()).replace(/\//g, '-');
  XLSX.writeFile(workbook, `${fileName}_${date}.xlsx`);
}

/**
 * Export گزارش‌ها به PDF
 */
export function exportToPDF(
  data: {
    sales?: Sale[];
    debts?: Debt[];
    inventory?: Inventory[];
    products?: Product[];
    summary?: {
      monthlySales?: number;
      workingCapital?: number;
      totalInventory?: number;
      totalDebts?: number;
    };
  },
  fileName: string = 'گزارش'
) {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // تنظیم فونت برای فارسی (استفاده از فونت پیش‌فرض)
  doc.setLanguage('fa');

  let yPosition = 20;

  // Header
  doc.setFontSize(18);
  doc.text('گزارش مالی', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 10;

  doc.setFontSize(12);
  const date = new Date().toLocaleDateString('fa-IR');
  doc.text(`تاریخ: ${date}`, pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 15;

  // Summary Section
  if (data.summary) {
    doc.setFontSize(14);
    doc.text('خلاصه گزارش', 20, yPosition);
    yPosition += 10;

    const summaryData = [
      ['فروش ماه جاری', data.summary.monthlySales?.toLocaleString('fa-IR') + ' تومان' || '-'],
      ['سرمایه در گردش', data.summary.workingCapital?.toLocaleString('fa-IR') + ' تومان' || '-'],
      ['موجودی کل', data.summary.totalInventory?.toLocaleString('fa-IR') + ' تومان' || '-'],
      ['مجموع طلب‌ها', data.summary.totalDebts?.toLocaleString('fa-IR') + ' تومان' || '-'],
    ];

    autoTable(doc, {
      startY: yPosition,
      head: [['عنوان', 'مقدار']],
      body: summaryData,
      theme: 'striped',
      headStyles: { fillColor: [245, 158, 11], textColor: [255, 255, 255] },
      styles: { font: 'Vazirmatn', fontStyle: 'normal', fontSize: 10 },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 15;
  }

  // Sales Table
  if (data.sales && data.sales.length > 0) {
    if (yPosition > pageHeight - 40) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(14);
    doc.text('فروش‌ها', 20, yPosition);
    yPosition += 10;

    const salesData = data.sales.slice(0, 20).map((sale) => [
      sale.customerId,
      sale.amount.toLocaleString('fa-IR'),
      new Date(sale.date).toLocaleDateString('fa-IR'),
      sale.month.toString(),
      sale.year.toString(),
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [['مشتری', 'مبلغ', 'تاریخ', 'ماه', 'سال']],
      body: salesData,
      theme: 'striped',
      headStyles: { fillColor: [16, 185, 129], textColor: [255, 255, 255] },
      styles: { font: 'Vazirmatn', fontStyle: 'normal', fontSize: 9 },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 15;
  }

  // Debts Table
  if (data.debts && data.debts.length > 0) {
    if (yPosition > pageHeight - 40) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(14);
    doc.text('طلب‌ها', 20, yPosition);
    yPosition += 10;

    const debtsData = data.debts.slice(0, 20).map((debt) => [
      debt.customerName || '-',
      debt.amount.toLocaleString('fa-IR'),
      toPersianDate(debt.dueDate),
      debt.status === 'paid' ? 'پرداخت شده' : 'در انتظار',
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [['مشتری', 'مبلغ', 'تاریخ سررسید', 'وضعیت']],
      body: debtsData,
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246], textColor: [255, 255, 255] },
      styles: { font: 'Vazirmatn', fontStyle: 'normal', fontSize: 9 },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 15;
  }

  // Inventory Table
  if (data.inventory && data.inventory.length > 0) {
    if (yPosition > pageHeight - 40) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(14);
    doc.text('موجودی', 20, yPosition);
    yPosition += 10;

    const inventoryData = data.inventory.slice(0, 20).map((item) => [
      item.productName,
      item.quantity.toString(),
      (item.purchasePrice || 0).toLocaleString('fa-IR'),
      (item.quantity * (item.purchasePrice || 0)).toLocaleString('fa-IR'),
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [['محصول', 'تعداد', 'قیمت خرید', 'ارزش کل']],
      body: inventoryData,
      theme: 'striped',
      headStyles: { fillColor: [139, 92, 246], textColor: [255, 255, 255] },
      styles: { font: 'Vazirmatn', fontStyle: 'normal', fontSize: 9 },
    });
  }

  // Save PDF
  const dateStr = new Date().toLocaleDateString('fa-IR').replace(/\//g, '-');
  doc.save(`${fileName}_${dateStr}.pdf`);
}

/**
 * Export گزارش خلاصه
 */
export function exportSummaryReport(
  summary: {
    monthlySales: number;
    previousMonthlySales: number;
    workingCapital: number;
    totalInventory: number;
    totalDebts: number;
    bestSellingMonth?: { month: number; year: number; sales: number };
  },
  format: 'excel' | 'pdf'
) {
  if (format === 'excel') {
    const workbook = XLSX.utils.book_new();
    
    const summaryData = [
      ['فروش ماه جاری', summary.monthlySales],
      ['فروش ماه قبل', summary.previousMonthlySales],
      ['تغییرات', summary.monthlySales - summary.previousMonthlySales],
      ['درصد تغییرات', ((summary.monthlySales - summary.previousMonthlySales) / summary.previousMonthlySales * 100).toFixed(2) + '%'],
      ['سرمایه در گردش', summary.workingCapital],
      ['موجودی کل', summary.totalInventory],
      ['مجموع طلب‌ها', summary.totalDebts],
    ];

    if (summary.bestSellingMonth) {
      summaryData.push(['پر فروش‌ترین ماه', `${summary.bestSellingMonth.month}/${summary.bestSellingMonth.year}`]);
      summaryData.push(['فروش پر فروش‌ترین ماه', summary.bestSellingMonth.sales]);
    }

    const sheet = XLSX.utils.aoa_to_sheet([
      ['خلاصه گزارش مالی'],
      [],
      ...summaryData.map(([label, value]) => [label, typeof value === 'number' ? value.toLocaleString('fa-IR') : value]),
    ]);

    // تنظیم عرض ستون‌ها
    sheet['!cols'] = [{ wch: 25 }, { wch: 20 }];

    XLSX.utils.book_append_sheet(workbook, sheet, 'خلاصه');
    
    const date = toPersianDate(new Date()).replace(/\//g, '-');
    XLSX.writeFile(workbook, `گزارش_خلاصه_${date}.xlsx`);
  } else {
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();

    doc.setFontSize(18);
    doc.text('خلاصه گزارش مالی', pageWidth / 2, 20, { align: 'center' });

    doc.setFontSize(12);
    const date = new Date().toLocaleDateString('fa-IR');
    doc.text(`تاریخ: ${date}`, pageWidth / 2, 30, { align: 'center' });

    const summaryData = [
      ['فروش ماه جاری', summary.monthlySales.toLocaleString('fa-IR') + ' تومان'],
      ['فروش ماه قبل', summary.previousMonthlySales.toLocaleString('fa-IR') + ' تومان'],
      ['تغییرات', (summary.monthlySales - summary.previousMonthlySales).toLocaleString('fa-IR') + ' تومان'],
      ['درصد تغییرات', ((summary.monthlySales - summary.previousMonthlySales) / summary.previousMonthlySales * 100).toFixed(2) + '%'],
      ['سرمایه در گردش', summary.workingCapital.toLocaleString('fa-IR') + ' تومان'],
      ['موجودی کل', summary.totalInventory.toLocaleString('fa-IR') + ' تومان'],
      ['مجموع طلب‌ها', summary.totalDebts.toLocaleString('fa-IR') + ' تومان'],
    ];

    if (summary.bestSellingMonth) {
      summaryData.push(['پر فروش‌ترین ماه', `${summary.bestSellingMonth.month}/${summary.bestSellingMonth.year}`]);
      summaryData.push(['فروش پر فروش‌ترین ماه', summary.bestSellingMonth.sales.toLocaleString('fa-IR') + ' تومان']);
    }

    autoTable(doc, {
      startY: 45,
      head: [['عنوان', 'مقدار']],
      body: summaryData,
      theme: 'striped',
      headStyles: { fillColor: [245, 158, 11], textColor: [255, 255, 255] },
      styles: { font: 'Vazirmatn', fontStyle: 'normal', fontSize: 11 },
    });

    const dateStr = new Date().toLocaleDateString('fa-IR').replace(/\//g, '-');
    doc.save(`گزارش_خلاصه_${dateStr}.pdf`);
  }
}

/**
 * Export دفتر بانک به Excel
 */
export function exportBankLedgerToExcel(
  transactions: BankTransaction[],
  account: BankAccount
) {
  const workbook = XLSX.utils.book_new();

  const ledgerData = transactions.map((transaction) => {
    const persianDate = toPersianDate(transaction.date);
    const [year, month, day] = persianDate.split('/');
    return {
      'ردیف': transaction.rowNumber,
      'تاریخ': persianDate,
      'روز': parseInt(day),
      'ماه': parseInt(month),
      'سال': parseInt(year),
      'شماره چک طلب‌کار': transaction.checkNumber || '-',
      'شماره چک بدهکار': transaction.paidCheckNumber || '-',
      'شرح': transaction.description || transaction.customerName || '-',
      'بدهکار': transaction.debit || 0,
      'طلب‌کار': transaction.credit || 0,
      'باقیمانده': transaction.balance,
    };
  });

  const sheet = XLSX.utils.json_to_sheet(ledgerData);
  
  // تنظیم عرض ستون‌ها
  sheet['!cols'] = [
    { wch: 8 },  // ردیف
    { wch: 12 }, // تاریخ
    { wch: 6 },  // روز
    { wch: 6 },  // ماه
    { wch: 6 },  // سال
    { wch: 18 }, // شماره چک دریافتی
    { wch: 18 }, // شماره چک پرداختی
    { wch: 25 }, // شرح
    { wch: 15 }, // بدهکار
    { wch: 15 }, // طلب‌کار
    { wch: 15 }, // باقیمانده
  ];

  XLSX.utils.book_append_sheet(workbook, sheet, 'دفتر بانک');

  const date = toPersianDate(new Date()).replace(/\//g, '-');
  const fileName = `دفتر_بانک_${account.bankName}_${account.accountNumber}_${date}.xlsx`;
  XLSX.writeFile(workbook, fileName);
}

/**
 * Export دفتر بانک به PDF
 */
export function exportBankLedgerToPDF(
  transactions: BankTransaction[],
  account: BankAccount
) {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  doc.setLanguage('fa');
  let yPosition = 20;

  // Header
  doc.setFontSize(18);
  doc.text('دفتر بانک', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 8;

  doc.setFontSize(12);
  doc.text(`بانک: ${account.bankName}`, pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 6;
  doc.text(`شماره حساب: ${account.accountNumber}`, pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 6;
  doc.text(`نوع حساب: ${account.accountType === 'current' ? 'جاری' : account.accountType === 'savings' ? 'پس‌انداز' : 'سایر'}`, pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 6;
  
  const date = toPersianDate(new Date());
  doc.text(`تاریخ گزارش: ${date}`, pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 10;

  doc.line(20, yPosition, pageWidth - 20, yPosition);
  yPosition += 10;

  // Table
  const tableData = transactions.map((transaction) => {
    return [
      transaction.rowNumber.toString(),
      toPersianDate(transaction.date),
      transaction.checkNumber || '-',
      transaction.paidCheckNumber || '-',
      (transaction.description || transaction.customerName || '-').substring(0, 30),
      transaction.debit ? transaction.debit.toLocaleString('fa-IR') : '-',
      transaction.credit ? transaction.credit.toLocaleString('fa-IR') : '-',
      transaction.balance.toLocaleString('fa-IR'),
    ];
  });

  autoTable(doc, {
    startY: yPosition,
    head: [['ردیف', 'تاریخ', 'چک طلب‌کار', 'چک بدهکار', 'شرح', 'بدهکار', 'طلب‌کار', 'باقیمانده']],
    body: tableData,
    theme: 'striped',
    headStyles: { fillColor: [59, 130, 246], textColor: [255, 255, 255] },
    styles: { font: 'Vazirmatn', fontStyle: 'normal', fontSize: 8 },
    columnStyles: {
      0: { cellWidth: 15 },
      1: { cellWidth: 25 },
      2: { cellWidth: 25 },
      3: { cellWidth: 25 },
      4: { cellWidth: 40 },
      5: { cellWidth: 25 },
      6: { cellWidth: 25 },
      7: { cellWidth: 30 },
    },
  });

  // Footer with summary
  yPosition = (doc as any).lastAutoTable.finalY + 15;
  
  if (yPosition > pageHeight - 40) {
    doc.addPage();
    yPosition = 20;
  }

  const totalDebit = transactions.reduce((sum, t) => sum + (t.debit || 0), 0);
  const totalCredit = transactions.reduce((sum, t) => sum + (t.credit || 0), 0);
  const finalBalance = account.initialBalance + totalCredit - totalDebit;

  doc.setFontSize(12);
  doc.text('خلاصه:', 20, yPosition);
  yPosition += 8;

  const summaryData = [
    ['مجموع بدهکار', totalDebit.toLocaleString('fa-IR') + ' تومان'],
    ['مجموع طلب‌کار', totalCredit.toLocaleString('fa-IR') + ' تومان'],
    ['مانده نهایی', finalBalance.toLocaleString('fa-IR') + ' تومان'],
  ];

  autoTable(doc, {
    startY: yPosition,
    head: [['عنوان', 'مقدار']],
    body: summaryData,
    theme: 'striped',
    headStyles: { fillColor: [245, 158, 11], textColor: [255, 255, 255] },
    styles: { font: 'Vazirmatn', fontStyle: 'normal', fontSize: 10 },
  });

  // Save PDF
  const dateStr = new Date().toLocaleDateString('fa-IR').replace(/\//g, '-');
  const fileName = `دفتر_بانک_${account.bankName}_${account.accountNumber}_${dateStr}.pdf`;
  doc.save(fileName);
}
