import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth';
import { getCustomers, createCustomer, updateCustomer, deleteCustomer } from '@/lib/services/customer.service';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    
    if (user instanceof NextResponse) {
      return user;
    }

    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || undefined;
    const hasPurchases = searchParams.get('hasPurchases');
    
    const customers = await getCustomers(user.id, {
      search,
      hasPurchases: hasPurchases ? hasPurchases === 'true' : undefined,
    });

    return NextResponse.json(customers);
  } catch (error) {
    console.error('Error fetching customers:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت مشتریان', message: error instanceof Error ? error.message : 'خطای نامشخص' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    if (user instanceof NextResponse) {
      return user;
    }

    const data = await request.json();
    const customerData = {
      ...data,
      userId: user.id,
    };
    const customer = await createCustomer(customerData);

    return NextResponse.json(customer, { status: 201 });
  } catch (error) {
    console.error('Error creating customer:', error);
    return NextResponse.json(
      { error: 'خطا در ایجاد مشتری', message: error instanceof Error ? error.message : 'خطای نامشخص' },
      { status: 500 }
    );
  }
}
