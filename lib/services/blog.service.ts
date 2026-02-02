import { prisma } from '../db/prisma';
import { generateSlug } from '../utils/slug';

export interface CreateBlogPostData {
  title: string;
  content: string;
  excerpt?: string;
  featuredImage?: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  category?: string;
  tags?: string[];
  author?: string;
  published?: boolean;
  publishedAt?: Date;
}

export interface UpdateBlogPostData {
  title?: string;
  content?: string;
  excerpt?: string;
  featuredImage?: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  category?: string;
  tags?: string[];
  author?: string;
  published?: boolean;
  publishedAt?: Date;
}

/**
 * Check if slug exists
 */
async function slugExists(slug: string, excludeId?: string): Promise<boolean> {
  const post = await prisma.blogPost.findUnique({
    where: { slug },
  });
  return post ? post.id !== excludeId : false;
}

/**
 * Generate unique slug
 */
async function generateUniqueSlug(title: string, excludeId?: string): Promise<string> {
  const baseSlug = generateSlug(title);
  let slug = baseSlug;
  let attempt = 0;

  while (await slugExists(slug, excludeId) && attempt < 10) {
    attempt++;
    slug = `${baseSlug}-${attempt}`;
  }

  if (attempt >= 10) {
    slug = `${baseSlug}-${Date.now()}`;
  }

  return slug;
}

/**
 * Get all blog posts (public - only published)
 */
export async function getBlogPosts(filters?: {
  category?: string;
  tag?: string;
  search?: string;
  published?: boolean;
}) {
  const where: any = {};

  if (filters?.published !== false) {
    where.published = true;
  }

  if (filters?.category) {
    where.category = filters.category;
  }

  if (filters?.tag) {
    where.tags = {
      has: filters.tag,
    };
  }

  if (filters?.search) {
    where.OR = [
      { title: { contains: filters.search, mode: 'insensitive' } },
      { content: { contains: filters.search, mode: 'insensitive' } },
      { excerpt: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  return prisma.blogPost.findMany({
    where,
    orderBy: { publishedAt: 'desc' },
  });
}

/**
 * Get blog post by slug
 */
export async function getBlogPostBySlug(slug: string) {
  const post = await prisma.blogPost.findUnique({
    where: { slug },
  });

  if (post && post.published) {
    // Increment views
    await prisma.blogPost.update({
      where: { id: post.id },
      data: {
        views: { increment: 1 },
      },
    });
  }

  return post;
}

/**
 * Get blog post by ID
 */
export async function getBlogPostById(id: string) {
  return prisma.blogPost.findUnique({
    where: { id },
  });
}

/**
 * Create blog post
 */
export async function createBlogPost(data: CreateBlogPostData) {
  const slug = await generateUniqueSlug(data.title);

  return prisma.blogPost.create({
    data: {
      title: data.title,
      slug,
      content: data.content,
      excerpt: data.excerpt,
      featuredImage: data.featuredImage,
      metaTitle: data.metaTitle,
      metaDescription: data.metaDescription,
      metaKeywords: data.metaKeywords || [],
      category: data.category,
      tags: data.tags || [],
      author: data.author,
      published: data.published || false,
      publishedAt: data.published && data.publishedAt ? data.publishedAt : undefined,
    },
  });
}

/**
 * Update blog post
 */
export async function updateBlogPost(id: string, data: UpdateBlogPostData) {
  const existing = await prisma.blogPost.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new Error('Blog post not found');
  }

  // Generate new slug if title changed
  let slug = existing.slug;
  if (data.title && data.title !== existing.title) {
    slug = await generateUniqueSlug(data.title, id);
  }

  return prisma.blogPost.update({
    where: { id },
    data: {
      title: data.title,
      slug,
      content: data.content,
      excerpt: data.excerpt,
      featuredImage: data.featuredImage,
      metaTitle: data.metaTitle,
      metaDescription: data.metaDescription,
      metaKeywords: data.metaKeywords,
      category: data.category,
      tags: data.tags,
      author: data.author,
      published: data.published,
      publishedAt: data.published && data.publishedAt ? data.publishedAt : undefined,
    },
  });
}

/**
 * Delete blog post
 */
export async function deleteBlogPost(id: string) {
  return prisma.blogPost.delete({
    where: { id },
  });
}

/**
 * Get blog categories
 */
export async function getBlogCategories() {
  const posts = await prisma.blogPost.findMany({
    where: { published: true },
    select: { category: true },
  });

  const categories = new Set<string>();
  posts.forEach((post) => {
    if (post.category) {
      categories.add(post.category);
    }
  });

  return Array.from(categories);
}

/**
 * Get blog tags
 */
export async function getBlogTags() {
  const posts = await prisma.blogPost.findMany({
    where: { published: true },
    select: { tags: true },
  });

  const tags = new Set<string>();
  posts.forEach((post) => {
    if (post.tags) {
      post.tags.forEach((tag) => tags.add(tag));
    }
  });

  return Array.from(tags);
}
