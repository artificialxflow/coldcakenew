'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Product } from '@/types';
import ProductCard from '@/components/store/ProductCard';
import { LoadingSpinner } from '@/components/ui';

export default function StoreHomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load featured products
      const productsRes = await fetch('/api/store/products?featured=true&limit=8');
      if (productsRes.ok) {
        const productsData = await productsRes.json();
        setFeaturedProducts(productsData.products || []);
      }

      // Load categories
      const categoriesRes = await fetch('/api/store/categories');
      if (categoriesRes.ok) {
        setCategories(await categoriesRes.json());
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-yellow-50 to-amber-50 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              فروشگاه کولدکیک
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              بهترین محصولات با بهترین قیمت
            </p>
            <Link
              href="/store/products"
              className="inline-block bg-yellow-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-yellow-700 transition-colors"
            >
              مشاهده محصولات
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="py-12 container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">محصولات ویژه</h2>
            <Link
              href="/store/products?featured=true"
              className="text-yellow-600 hover:text-yellow-700 font-semibold"
            >
              مشاهده همه
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Categories */}
      {categories.length > 0 && (
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">دسته‌بندی‌ها</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {categories.map((category) => (
                <Link
                  key={category}
                  href={`/store/products?category=${encodeURIComponent(category)}`}
                  className="bg-gray-50 hover:bg-yellow-50 p-6 rounded-lg text-center transition-colors border border-gray-200 hover:border-yellow-300"
                >
                  <span className="font-semibold text-gray-900">{category}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Blog Link */}
      <section className="py-12 container mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">بلاگ</h2>
          <p className="text-gray-600 mb-6">
            مقالات و مطالب مفید درباره محصولات و خدمات ما
          </p>
          <Link
            href="/blog"
            className="inline-block bg-yellow-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-yellow-700 transition-colors"
          >
            مشاهده بلاگ
          </Link>
        </div>
      </section>
    </div>
  );
}
