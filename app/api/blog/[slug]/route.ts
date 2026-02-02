import { NextRequest, NextResponse } from 'next/server';
import { getBlogPostBySlug, updateBlogPost, deleteBlogPost } from '@/lib/services/blog.service';
import { requireAuth } from '@/lib/middleware/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const post = await getBlogPostBySlug(slug);

    if (!post) {
      return NextResponse.json(
        { error: 'پست یافت نشد' },
        { status: 404 }
      );
    }

    return NextResponse.json(post);
  } catch (error) {
    console.error('Error fetching blog post:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت پست', message: error instanceof Error ? error.message : 'خطای نامشخص' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const user = await requireAuth(request);
    
    if (user instanceof NextResponse) {
      return user;
    }

    const { slug } = await params;
    const body = await request.json();

    // Get post by slug first to get ID
    const existingPost = await getBlogPostBySlug(slug);
    if (!existingPost) {
      return NextResponse.json(
        { error: 'پست یافت نشد' },
        { status: 404 }
      );
    }

    const post = await updateBlogPost(existingPost.id, {
      title: body.title,
      content: body.content,
      excerpt: body.excerpt,
      featuredImage: body.featuredImage,
      metaTitle: body.metaTitle,
      metaDescription: body.metaDescription,
      metaKeywords: body.metaKeywords,
      category: body.category,
      tags: body.tags,
      author: body.author,
      published: body.published,
      publishedAt: body.publishedAt ? new Date(body.publishedAt) : undefined,
    });

    return NextResponse.json(post);
  } catch (error) {
    console.error('Error updating blog post:', error);
    return NextResponse.json(
      { error: 'خطا در به‌روزرسانی پست', message: error instanceof Error ? error.message : 'خطای نامشخص' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const user = await requireAuth(request);
    
    if (user instanceof NextResponse) {
      return user;
    }

    const { slug } = await params;

    // Get post by slug first to get ID
    const existingPost = await getBlogPostBySlug(slug);
    if (!existingPost) {
      return NextResponse.json(
        { error: 'پست یافت نشد' },
        { status: 404 }
      );
    }

    await deleteBlogPost(existingPost.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting blog post:', error);
    return NextResponse.json(
      { error: 'خطا در حذف پست', message: error instanceof Error ? error.message : 'خطای نامشخص' },
      { status: 500 }
    );
  }
}
