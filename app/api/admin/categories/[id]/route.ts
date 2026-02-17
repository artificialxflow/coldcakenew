import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth';
import { getCategoryById, updateCategory, deleteCategory } from '@/lib/services/category.service';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(request);
    if (user instanceof NextResponse) return user;

    const category = await getCategoryById(params.id);
    
    if (!category) {
      return NextResponse.json(
        { error: 'دسته‌بندی یافت نشد' },
        { status: 404 }
      );
    }

    return NextResponse.json(category);
  } catch (error) {
    console.error('Error fetching category:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت دسته‌بندی', message: error instanceof Error ? error.message : 'خطای نامشخص' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(request);
    if (user instanceof NextResponse) return user;

    const data = await request.json();

    if (data.name && !data.name.trim()) {
      return NextResponse.json(
        { error: 'نام دسته‌بندی نمی‌تواند خالی باشد' },
        { status: 400 }
      );
    }

    const category = await updateCategory(params.id, {
      name: data.name?.trim(),
      slug: data.slug?.trim(),
      description: data.description?.trim(),
      order: data.order,
      active: data.active,
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error('Error updating category:', error);
    
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        { error: 'دسته‌بندی با این نام یا slug قبلاً ثبت شده است' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'خطا در به‌روزرسانی دسته‌بندی', message: error instanceof Error ? error.message : 'خطای نامشخص' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(request);
    if (user instanceof NextResponse) return user;

    await deleteCategory(params.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting category:', error);
    
    if (error instanceof Error && error.message.includes('existing products')) {
      return NextResponse.json(
        { error: 'نمی‌توان دسته‌بندی دارای محصول را حذف کرد' },
        { status: 400 }
      );
    }

    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json(
        { error: 'دسته‌بندی یافت نشد' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'خطا در حذف دسته‌بندی', message: error instanceof Error ? error.message : 'خطای نامشخص' },
      { status: 500 }
    );
  }
}
