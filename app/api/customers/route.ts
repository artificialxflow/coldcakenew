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
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/e77c6a33-0990-4e85-b79e-b1f96db37185',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/api/customers/route.ts:32',message:'POST /api/customers entry',data:{timestamp:Date.now()},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    
    const user = await requireAuth(request);
    
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/e77c6a33-0990-4e85-b79e-b1f96db37185',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/api/customers/route.ts:36',message:'Auth check result',data:{isNextResponse:user instanceof NextResponse,hasUserId:!(!user || user instanceof NextResponse),userId:user instanceof NextResponse ? null : user?.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    
    if (user instanceof NextResponse) {
      return user;
    }

    const data = await request.json();
    
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/e77c6a33-0990-4e85-b79e-b1f96db37185',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/api/customers/route.ts:44',message:'Request data received',data:{firstName:data?.firstName,lastName:data?.lastName,phone:data?.phone,email:data?.email,hasFavoriteProducts:!!data?.favoriteProducts,hasPreferences:!!data?.preferences,userId:user.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    
    const customerData = {
      ...data,
      userId: user.id,
    };
    
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/e77c6a33-0990-4e85-b79e-b1f96db37185',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/api/customers/route.ts:51',message:'Data before createCustomer',data:{firstName:customerData.firstName,lastName:customerData.lastName,userId:customerData.userId,dataKeys:Object.keys(customerData)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    
    const customer = await createCustomer(customerData);

    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/e77c6a33-0990-4e85-b79e-b1f96db37185',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/api/customers/route.ts:55',message:'Customer created successfully',data:{customerId:customer?.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion

    return NextResponse.json(customer, { status: 201 });
  } catch (error) {
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/e77c6a33-0990-4e85-b79e-b1f96db37185',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/api/customers/route.ts:60',message:'Error in POST /api/customers',data:{errorMessage:error instanceof Error ? error.message : String(error),errorName:error instanceof Error ? error.name : 'Unknown',errorStack:error instanceof Error ? error.stack?.substring(0,500) : null},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
    // #endregion
    
    console.error('Error creating customer:', error);
    return NextResponse.json(
      { error: 'خطا در ایجاد مشتری', message: error instanceof Error ? error.message : 'خطای نامشخص' },
      { status: 500 }
    );
  }
}
