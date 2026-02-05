'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent, Button, LoadingSpinner, useToast, Modal } from '@/components/ui';
import { BlogPost } from '@/types';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

export default function BlogAdminPage() {
  const noLayout = false;
  const { showToast, ToastContainer } = useToast();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [postToDelete, setPostToDelete] = useState<BlogPost | null>(null);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/blog?published=false');
      if (res.ok) {
        setPosts(await res.json());
      }
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!postToDelete) return;

    try {
      const res = await fetch(`/api/blog/${postToDelete.slug}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        showToast('پست حذف شد', 'success');
        setShowDeleteModal(false);
        setPostToDelete(null);
        loadPosts();
      } else {
        showToast('خطا در حذف', 'error');
      }
    } catch (error) {
      showToast('خطا در حذف', 'error');
    }
  };

  const mainContent = (
    <>
    <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">پست‌های بلاگ</h1>
          <Link href={noLayout ? "/admin/blog-admin/new" : "/blog-admin/new"}>
            <Button className="flex items-center gap-2">
              <PlusIcon className="h-5 w-5" />
              پست جدید
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : posts.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-500">پستی یافت نشد</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <Card key={post.id}>
                <CardContent className="p-6">
                  {post.featuredImage && (
                    <img
                      src={post.featuredImage}
                      alt={post.title}
                      className="w-full h-48 object-cover rounded-lg mb-4"
                    />
                  )}
                  <h3 className="font-semibold text-lg mb-2">{post.title}</h3>
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <span>{post.published ? 'منتشر شده' : 'پیش‌نویس'}</span>
                    <span>{new Date(post.createdAt).toLocaleDateString('fa-IR')}</span>
                  </div>
                  <div className="flex gap-2">
                    <Link href={noLayout ? `/admin/blog-admin/${post.id}/edit` : `/blog-admin/${post.id}/edit`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        <PencilIcon className="h-4 w-4 mr-2" />
                        ویرایش
                      </Button>
                    </Link>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => {
                        setPostToDelete(post);
                        setShowDeleteModal(true);
                      }}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setPostToDelete(null);
        }}
        title="حذف پست"
      >
        <div className="space-y-4">
          <p>آیا مطمئن هستید که می‌خواهید پست "{postToDelete?.title}" را حذف کنید؟</p>
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteModal(false);
                setPostToDelete(null);
              }}
            >
              انصراف
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              حذف
            </Button>
          </div>
        </div>
      </Modal>

      <ToastContainer />
    </>
  );
  return noLayout ? (
    <>
      {mainContent}
    </>
  ) : (
    <DashboardLayout title="مدیریت بلاگ">
      {mainContent}
    </DashboardLayout>
  );
}
