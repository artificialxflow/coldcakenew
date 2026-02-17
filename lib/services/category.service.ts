import { prisma } from '../db/prisma';
import { generateSlug } from '../utils/slug';

export interface CreateCategoryData {
  name: string;
  slug?: string;
  description?: string;
  order?: number;
  active?: boolean;
}

export interface UpdateCategoryData {
  name?: string;
  slug?: string;
  description?: string;
  order?: number;
  active?: boolean;
}

export async function getAllCategories(includeInactive: boolean = false) {
  const where: any = {};
  if (!includeInactive) {
    where.active = true;
  }

  return prisma.category.findMany({
    where,
    include: {
      _count: {
        select: { products: true },
      },
    },
    orderBy: [
      { order: 'asc' },
      { name: 'asc' },
    ],
  });
}

export async function getCategoryById(id: string) {
  return prisma.category.findUnique({
    where: { id },
    include: {
      _count: {
        select: { products: true },
      },
    },
  });
}

export async function getCategoryBySlug(slug: string) {
  return prisma.category.findUnique({
    where: { slug },
    include: {
      _count: {
        select: { products: true },
      },
    },
  });
}

export async function createCategory(data: CreateCategoryData) {
  // Generate slug if not provided
  let slug = data.slug;
  if (!slug && data.name) {
    slug = generateSlug(data.name);

    // Check if slug exists
    const existing = await prisma.category.findUnique({
      where: { slug },
    });

    if (existing) {
      slug = `${slug}-${Date.now()}`;
    }
  }

  // Get max order value if order not provided
  let order = data.order;
  if (order === undefined) {
    const maxOrder = await prisma.category.findFirst({
      orderBy: { order: 'desc' },
      select: { order: true },
    });
    order = (maxOrder?.order ?? -1) + 1;
  }

  return prisma.category.create({
    data: {
      name: data.name,
      slug,
      description: data.description,
      order: order,
      active: data.active ?? true,
    },
    include: {
      _count: {
        select: { products: true },
      },
    },
  });
}

export async function updateCategory(id: string, data: UpdateCategoryData) {
  // If name changed, regenerate slug if slug was auto-generated
  if (data.name) {
    const existing = await prisma.category.findUnique({ where: { id } });
    if (existing && !data.slug) {
      // Only auto-update slug if it was likely auto-generated (matches name slug)
      const nameSlug = generateSlug(data.name);
      if (existing.slug === generateSlug(existing.name)) {
        data.slug = nameSlug;
        // Check for conflicts
        const conflict = await prisma.category.findUnique({
          where: { slug: nameSlug },
        });
        if (conflict && conflict.id !== id) {
          data.slug = `${nameSlug}-${Date.now()}`;
        }
      }
    }
  }

  return prisma.category.update({
    where: { id },
    data,
    include: {
      _count: {
        select: { products: true },
      },
    },
  });
}

export async function deleteCategory(id: string) {
  // Check if category has products
  const category = await prisma.category.findUnique({
    where: { id },
    include: {
      _count: {
        select: { products: true },
      },
    },
  });

  if (!category) {
    throw new Error('Category not found');
  }

  if (category._count.products > 0) {
    throw new Error('Cannot delete category with existing products');
  }

  return prisma.category.delete({
    where: { id },
  });
}

export async function getCategoriesForSelect() {
  const categories = await getAllCategories(true);
  return categories.map((cat) => ({
    id: cat.id,
    name: cat.name,
    active: cat.active,
  }));
}
