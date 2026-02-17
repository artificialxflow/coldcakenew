import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth';
import { getAllCategories, createCategory } from '@/lib/services/category.service';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    if (user instanceof NextResponse) return user;

    const searchParams = request.nextUrl.searchParams;
    const includeInactive = searchParams.get('includeInactive') === 'true';

    const categories = await getAllCategories(includeInactive);
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت دسته‌بندی‌ها', message: error instanceof Error ? error.message : 'خطای نامشخص' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    if (user instanceof NextResponse) return user;

    const data = await request.json();
    
    if (!data.name || !data.name.trim()) {
      return NextResponse.json(
        { error: 'نام دسته‌بندی الزامی است' },
        { status: 400 }
      );
    }

    const category = await createCategory({
      name: data.name.trim(),
      slug: data.slug?.trim(),
      description: data.description?.trim(),
      order: data.order,
      active: data.active !== undefined ? data.active : true,
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error('Error creating category:', error);
    
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        { error: 'دسته‌بندی با این نام یا slug قبلاً ثبت شده است' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'خطا در ایجاد دسته‌بندی', message: error instanceof Error ? error.message : 'خطای نامشخص' },
      { status: 500 }
    );
  }
}
