import { NextRequest, NextResponse } from 'next/server';
import { getBlogPosts, createBlogPost } from '@/lib/services/blog.service';
import { requireAuth } from '@/lib/middleware/auth';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category') || undefined;
    const tag = searchParams.get('tag') || undefined;
    const search = searchParams.get('search') || undefined;
    const published = searchParams.get('published') !== 'false'; // Default true

    const posts = await getBlogPosts({
      category,
      tag,
      search,
      published,
    });

    return NextResponse.json(posts);
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت پست‌های بلاگ', message: error instanceof Error ? error.message : 'خطای نامشخص' },
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

    const body = await request.json();
    const post = await createBlogPost({
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
      published: body.published || false,
      publishedAt: body.publishedAt ? new Date(body.publishedAt) : undefined,
    });

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error('Error creating blog post:', error);
    return NextResponse.json(
      { error: 'خطا در ایجاد پست', message: error instanceof Error ? error.message : 'خطای نامشخص' },
      { status: 500 }
    );
  }
}
