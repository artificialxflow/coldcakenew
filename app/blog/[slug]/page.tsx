'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { BlogPost } from '@/types';
import { LoadingSpinner } from '@/components/ui';

export default function BlogPostPage() {
  const params = useParams();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.slug) {
      loadPost();
    }
  }, [params.slug]);

  const loadPost = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/blog/${params.slug}`);
      if (res.ok) {
        setPost(await res.json());
      }
    } catch (error) {
      console.error('Error loading post:', error);
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

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <p className="text-center text-gray-500">پست یافت نشد</p>
        </div>
      </div>
    );
  }

  return (
    <article className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {post.featuredImage && (
          <img
            src={post.featuredImage}
            alt={post.title}
            className="w-full h-96 object-cover rounded-lg mb-8"
          />
        )}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="mb-6">
            {post.category && (
              <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                {post.category}
              </span>
            )}
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{post.title}</h1>
          <div className="flex items-center gap-4 text-sm text-gray-500 mb-8">
            {post.author && <span>نویسنده: {post.author}</span>}
            {post.publishedAt && (
              <span>{new Date(post.publishedAt).toLocaleDateString('fa-IR')}</span>
            )}
            {post.views > 0 && <span>{post.views} بازدید</span>}
          </div>
          <div
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
          {post.tags && post.tags.length > 0 && (
            <div className="mt-8 pt-8 border-t">
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
