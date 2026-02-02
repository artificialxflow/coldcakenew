'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { BlogPost } from '@/types';
import { LoadingSpinner, Input } from '@/components/ui';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export default function BlogListPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);

      const res = await fetch(`/api/blog?${params.toString()}`);
      if (res.ok) {
        setPosts(await res.json());
      }
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadPosts();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">بلاگ</h1>

        {/* Search */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="relative max-w-md">
            <MagnifyingGlassIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="جستجو در بلاگ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10"
            />
          </div>
        </form>

        {/* Posts */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">پستی یافت نشد</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <Link key={post.id} href={`/blog/${post.slug}`}>
                <article className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-shadow overflow-hidden">
                  {post.featuredImage && (
                    <img
                      src={post.featuredImage}
                      alt={post.title}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <div className="p-6">
                    {post.category && (
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded mb-2 inline-block">
                        {post.category}
                      </span>
                    )}
                    <h2 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                      {post.title}
                    </h2>
                    {post.excerpt && (
                      <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                        {post.excerpt}
                      </p>
                    )}
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{new Date(post.publishedAt || post.createdAt).toLocaleDateString('fa-IR')}</span>
                      {post.views > 0 && <span>{post.views} بازدید</span>}
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
