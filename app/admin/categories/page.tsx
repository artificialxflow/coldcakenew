'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Modal, useToast, LoadingSpinner, EmptyState } from '@/components/ui';
import { Category } from '@/types';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ArrowUpIcon,
  ArrowDownIcon,
} from '@heroicons/react/24/outline';

export default function CategoriesPage(props?: { noLayout?: boolean }) {
  const noLayout = props?.noLayout;
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    order: 0,
    active: true,
  });
  const { showToast, ToastContainer } = useToast();

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/categories?includeInactive=true', {
        credentials: 'include',
      });
      if (res.ok) {
        setCategories(await res.json());
      } else {
        showToast('خطا در بارگذاری دسته‌بندی‌ها', 'error');
      }
    } catch (error) {
      showToast('خطا در بارگذاری دسته‌بندی‌ها', 'error');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      description: '',
      order: 0,
      active: true,
    });
  };

  const handleAddCategory = async () => {
    if (!formData.name.trim()) {
      showToast('نام دسته‌بندی الزامی است', 'warning');
      return;
    }

    try {
      setIsSaving(true);
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        showToast('دسته‌بندی با موفقیت اضافه شد', 'success');
        setShowAddModal(false);
        resetForm();
        loadCategories();
      } else {
        const error = await res.json();
        showToast(error.error || 'خطا در افزودن دسته‌بندی', 'error');
      }
    } catch (error) {
      showToast('خطا در افزودن دسته‌بندی', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditCategory = async () => {
    if (!editingCategory || !formData.name.trim()) {
      showToast('نام دسته‌بندی الزامی است', 'warning');
      return;
    }

    try {
      setIsSaving(true);
      const res = await fetch(`/api/admin/categories/${editingCategory.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        showToast('دسته‌بندی با موفقیت به‌روزرسانی شد', 'success');
        setShowEditModal(false);
        setEditingCategory(null);
        resetForm();
        loadCategories();
      } else {
        const error = await res.json();
        showToast(error.error || 'خطا در به‌روزرسانی دسته‌بندی', 'error');
      }
    } catch (error) {
      showToast('خطا در به‌روزرسانی دسته‌بندی', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;

    try {
      setIsSaving(true);
      const res = await fetch(`/api/admin/categories/${categoryToDelete.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (res.ok) {
        showToast('دسته‌بندی با موفقیت حذف شد', 'success');
        setShowDeleteConfirm(false);
        setCategoryToDelete(null);
        loadCategories();
      } else {
        const error = await res.json();
        showToast(error.error || 'خطا در حذف دسته‌بندی', 'error');
      }
    } catch (error) {
      showToast('خطا در حذف دسته‌بندی', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug || '',
      description: category.description || '',
      order: category.order,
      active: category.active,
    });
    setShowEditModal(true);
  };

  const openDeleteConfirm = (category: Category) => {
    setCategoryToDelete(category);
    setShowDeleteConfirm(true);
  };

  const handleMoveOrder = async (category: Category, direction: 'up' | 'down') => {
    const currentIndex = categories.findIndex((c) => c.id === category.id);
    if (currentIndex === -1) return;

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= categories.length) return;

    const targetCategory = categories[targetIndex];
    const newOrder = targetCategory.order;
    const oldOrder = category.order;

    try {
      setIsSaving(true);
      // Swap orders
      await Promise.all([
        fetch(`/api/admin/categories/${category.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ order: newOrder }),
        }),
        fetch(`/api/admin/categories/${targetCategory.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ order: oldOrder }),
        }),
      ]);
      loadCategories();
    } catch (error) {
      showToast('خطا در تغییر ترتیب', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    const loader = (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
    if (noLayout) return loader;
    return <DashboardLayout title="مدیریت دسته‌بندی‌ها">{loader}</DashboardLayout>;
  }

  const content = (
    <>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <CardTitle>لیست دسته‌بندی‌ها</CardTitle>
              <Button
                onClick={() => {
                  resetForm();
                  setShowAddModal(true);
                }}
                className="flex items-center gap-2"
              >
                <PlusIcon className="h-5 w-5" />
                افزودن دسته‌بندی
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {categories.length === 0 ? (
              <EmptyState title="دسته‌بندی‌ای یافت نشد" emoji="📁" />
            ) : (
              <div className="space-y-2">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className={`p-4 border rounded-lg hover:shadow-lg transition-shadow flex items-center justify-between ${
                      !category.active ? 'opacity-60 bg-gray-50' : ''
                    }`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-lg">{category.name}</h3>
                        {!category.active && (
                          <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
                            غیرفعال
                          </span>
                        )}
                        <span className="text-xs text-gray-500 bg-blue-100 px-2 py-1 rounded">
                          {category._count?.products || 0} محصول
                        </span>
                      </div>
                      {category.description && (
                        <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                      )}
                      {category.slug && (
                        <p className="text-xs text-gray-400 mt-1">slug: {category.slug}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleMoveOrder(category, 'up')}
                        disabled={isSaving || categories.findIndex((c) => c.id === category.id) === 0}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-30"
                        title="جابجایی به بالا"
                      >
                        <ArrowUpIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleMoveOrder(category, 'down')}
                        disabled={
                          isSaving ||
                          categories.findIndex((c) => c.id === category.id) === categories.length - 1
                        }
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-30"
                        title="جابجایی به پایین"
                      >
                        <ArrowDownIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => openEditModal(category)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="ویرایش"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => openDeleteConfirm(category)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="حذف"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add Category Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="افزودن دسته‌بندی جدید"
        size="md"
      >
        <CategoryForm
          formData={formData}
          setFormData={setFormData}
          isSaving={isSaving}
          onSave={handleAddCategory}
          onCancel={() => {
            setShowAddModal(false);
            resetForm();
          }}
        />
      </Modal>

      {/* Edit Category Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingCategory(null);
        }}
        title="ویرایش دسته‌بندی"
        size="md"
      >
        <CategoryForm
          formData={formData}
          setFormData={setFormData}
          isSaving={isSaving}
          onSave={handleEditCategory}
          onCancel={() => {
            setShowEditModal(false);
            setEditingCategory(null);
            resetForm();
          }}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setCategoryToDelete(null);
        }}
        title="حذف دسته‌بندی"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            آیا مطمئن هستید که می‌خواهید دسته‌بندی <strong>{categoryToDelete?.name}</strong> را حذف کنید؟
          </p>
          {categoryToDelete && (categoryToDelete._count?.products || 0) > 0 && (
            <p className="text-sm text-red-600">
              ⚠️ این دسته‌بندی دارای {categoryToDelete._count?.products} محصول است و نمی‌تواند حذف شود.
            </p>
          )}
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteConfirm(false);
                setCategoryToDelete(null);
              }}
              disabled={isSaving}
            >
              انصراف
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteCategory}
              disabled={isSaving || (categoryToDelete?._count?.products || 0) > 0}
            >
              {isSaving ? <LoadingSpinner size="sm" /> : 'حذف'}
            </Button>
          </div>
        </div>
      </Modal>

      <ToastContainer />
    </>
  );

  if (noLayout) return content;
  return <DashboardLayout title="مدیریت دسته‌بندی‌ها">{content}</DashboardLayout>;
}

function CategoryForm({
  formData,
  setFormData,
  isSaving,
  onSave,
  onCancel,
}: {
  formData: {
    name: string;
    slug: string;
    description: string;
    order: number;
    active: boolean;
  };
  setFormData: (data: any) => void;
  isSaving: boolean;
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">نام دسته‌بندی *</label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="مثلاً: سیسمونی، رختخواب"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Slug (اختیاری)</label>
        <Input
          value={formData.slug}
          onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
          placeholder="به صورت خودکار تولید می‌شود"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">توضیحات</label>
        <textarea
          className="w-full border rounded-lg p-2 min-h-20"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="توضیحات دسته‌بندی..."
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">ترتیب نمایش</label>
        <Input
          type="number"
          value={formData.order}
          onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
          placeholder="0"
          min="0"
        />
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="active"
          checked={formData.active}
          onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
          className="w-4 h-4"
        />
        <label htmlFor="active" className="text-sm font-medium">
          فعال
        </label>
      </div>
      <div className="flex gap-2 justify-end">
        <Button variant="outline" onClick={onCancel} disabled={isSaving}>
          انصراف
        </Button>
        <Button onClick={onSave} disabled={isSaving}>
          {isSaving ? <LoadingSpinner size="sm" /> : 'ذخیره'}
        </Button>
      </div>
    </div>
  );
}
