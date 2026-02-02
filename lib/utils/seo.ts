import { Metadata } from 'next';
import { Product, BlogPost } from '@/types';

/**
 * Generate metadata for product pages
 */
export function generateProductMetadata(product: Product): Metadata {
  const title = product.seoTitle || product.name;
  const description = product.seoDescription || product.description || `خرید ${product.name} با بهترین قیمت`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      images: product.images && product.images.length > 0 ? [product.images[0]] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: product.images && product.images.length > 0 ? [product.images[0]] : [],
    },
  };
}

/**
 * Generate metadata for blog posts
 */
export function generateBlogMetadata(post: BlogPost): Metadata {
  const title = post.metaTitle || post.title;
  const description = post.metaDescription || post.excerpt || post.content.substring(0, 160);

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      publishedTime: post.publishedAt || undefined,
      images: post.featuredImage ? [post.featuredImage] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: post.featuredImage ? [post.featuredImage] : [],
    },
  };
}

/**
 * Generate structured data (JSON-LD) for products
 */
export function generateProductStructuredData(product: Product, baseUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description || product.seoDescription,
    image: product.images || [],
    offers: {
      '@type': 'Offer',
      price: product.finalPrice,
      priceCurrency: 'IRR',
      availability: product.stock && product.stock > 0 
        ? 'https://schema.org/InStock' 
        : 'https://schema.org/OutOfStock',
    },
    ...(product.category && { category: product.category }),
  };
}

/**
 * Generate structured data (JSON-LD) for blog posts
 */
export function generateBlogStructuredData(post: BlogPost, baseUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt || post.metaDescription,
    image: post.featuredImage,
    datePublished: post.publishedAt || post.createdAt,
    dateModified: post.updatedAt,
    author: {
      '@type': 'Person',
      name: post.author || 'Cold Cake',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Cold Cake',
    },
    ...(post.category && { articleSection: post.category }),
    ...(post.tags && { keywords: post.tags.join(', ') }),
  };
}

/**
 * Generate breadcrumb structured data
 */
export function generateBreadcrumbStructuredData(items: { name: string; url: string }[], baseUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${baseUrl}${item.url}`,
    })),
  };
}
