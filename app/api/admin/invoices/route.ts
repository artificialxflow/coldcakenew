import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/lib/middleware/auth';
import { getInvoiceByOrderId, getInvoiceByInvoiceNumber, listInvoices } from '@/lib/services/invoice.service';

/** GET: list invoices or get one by orderId / invoiceNumber */
export async function GET(request: NextRequest) {
  const user = await requirePermission(request, 'invoices.read');
  if (user instanceof NextResponse) return user;

  const searchParams = request.nextUrl.searchParams;
  const orderId = searchParams.get('orderId');
  const invoiceNumber = searchParams.get('invoiceNumber');

  if (orderId) {
    const invoice = await getInvoiceByOrderId(orderId);
    if (!invoice) {
      return NextResponse.json({ error: 'فاکتور یافت نشد' }, { status: 404 });
    }
    return NextResponse.json(invoice);
  }

  if (invoiceNumber) {
    const invoice = await getInvoiceByInvoiceNumber(invoiceNumber);
    if (!invoice) {
      return NextResponse.json({ error: 'فاکتور یافت نشد' }, { status: 404 });
    }
    return NextResponse.json(invoice);
  }

  const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : undefined;
  const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!, 10) : undefined;
  const status = searchParams.get('status') || undefined;
  const fromDate = searchParams.get('fromDate') ? new Date(searchParams.get('fromDate')!) : undefined;
  const toDate = searchParams.get('toDate') ? new Date(searchParams.get('toDate')!) : undefined;

  const result = await listInvoices({ limit, offset, status, fromDate, toDate });
  return NextResponse.json(result);
}
