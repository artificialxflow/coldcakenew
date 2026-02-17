'use client';

import { useState, useEffect, useMemo } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Modal, useToast, LoadingSpinner, EmptyState } from '@/components/ui';
import { Product, Category } from '@/types';
import { 
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';

export default function ProductsPage(props?: { noLayout?: boolean }) {
  const noLayout = props?.noLayout;
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    color: '',
    categoryId: '',
    originalPrice: '',
    discountedPrice: '',
    finalPrice: '',
    stock: '',
    description: '',
    images: [] as string[],
    priceType: 'fixed' as 'fixed' | 'call_for_price' | 'negotiable',
    featured: false,
    seoTitle: '',
    seoDescription: '',
  });
  const { showToast, ToastContainer } = useToast();

  useEffect(() => {
    loadCategories();
    loadProducts();
  }, []);

  const loadCategories = async () => {
    try {
      const res = await fetch('/api/admin/categories?includeInactive=false', {
        credentials: 'include',
      });
      if (res.ok) {
        setCategories(await res.json());
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (selectedCategory) params.append('category', selectedCategory);

      const res = await fetch(`/api/products?${params.toString()}`);
      if (res.ok) {
        setProducts(await res.json());
      } else {
        showToast('خطا در بارگذاری محصولات', 'error');
      }
    } catch (error) {
      showToast('خطا در بارگذاری محصولات', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadProducts();
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery, selectedCategory]);

  const filteredProducts = useMemo(() => {
    return products;
  }, [products]);

  const handleAddProduct = async () => {
    if (!formData.name.trim() || (!formData.originalPrice && formData.priceType === 'fixed') || (!formData.finalPrice && formData.priceType === 'fixed')) {
      showToast('لطفاً فیلدهای اجباری را پر کنید', 'warning');
      return;
    }
    if (formData.priceType === 'fixed') {
      const op = Number(formData.originalPrice);
      const fp = Number(formData.finalPrice);
      if (isNaN(op) || isNaN(fp) || op < 0 || fp < 0) {
        showToast('قیمت باید عدد معتبر و نامنفی باشد', 'warning');
        return;
      }
    }

    try {
      setIsSaving(true);
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          color: formData.color || undefined,
          categoryId: formData.categoryId || undefined,
          originalPrice: formData.priceType === 'fixed' ? Number(formData.originalPrice) : 0,
          discountedPrice: formData.discountedPrice ? Number(formData.discountedPrice) : undefined,
          finalPrice: formData.priceType === 'fixed' ? Number(formData.finalPrice) : 0,
          stock: formData.stock ? Number(formData.stock) : 0,
          description: formData.description || undefined,
          images: formData.images,
          priceType: formData.priceType,
          featured: formData.featured,
          seoTitle: formData.seoTitle || undefined,
          seoDescription: formData.seoDescription || undefined,
        }),
      });

      if (res.ok) {
        showToast('محصول با موفقیت اضافه شد', 'success');
        setShowAddModal(false);
        resetForm();
        loadProducts();
      } else {
        const error = await res.json();
        showToast(error.message || 'خطا در افزودن محصول', 'error');
      }
    } catch (error) {
      showToast('خطا در افزودن محصول', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditProduct = async () => {
    if (!editingProduct || !formData.name.trim() || (!formData.originalPrice && formData.priceType === 'fixed') || (!formData.finalPrice && formData.priceType === 'fixed')) {
      showToast('لطفاً فیلدهای اجباری را پر کنید', 'warning');
      return;
    }
    if (formData.priceType === 'fixed') {
      const op = Number(formData.originalPrice);
      const fp = Number(formData.finalPrice);
      if (isNaN(op) || isNaN(fp) || op < 0 || fp < 0) {
        showToast('قیمت باید عدد معتبر و نامنفی باشد', 'warning');
        return;
      }
    }

    try {
      setIsSaving(true);
      const res = await fetch(`/api/products/${editingProduct.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          color: formData.color || undefined,
          categoryId: formData.categoryId || undefined,
          originalPrice: formData.priceType === 'fixed' ? Number(formData.originalPrice) : 0,
          discountedPrice: formData.discountedPrice ? Number(formData.discountedPrice) : undefined,
          finalPrice: formData.priceType === 'fixed' ? Number(formData.finalPrice) : 0,
          stock: formData.stock ? Number(formData.stock) : 0,
          description: formData.description || undefined,
          images: formData.images,
          priceType: formData.priceType,
          featured: formData.featured,
          seoTitle: formData.seoTitle || undefined,
          seoDescription: formData.seoDescription || undefined,
        }),
      });

      if (res.ok) {
        showToast('محصول با موفقیت به‌روزرسانی شد', 'success');
        setShowEditModal(false);
        setEditingProduct(null);
        resetForm();
        loadProducts();
      } else {
        const error = await res.json();
        showToast(error.message || 'خطا در به‌روزرسانی محصول', 'error');
      }
    } catch (error) {
      showToast('خطا در به‌روزرسانی محصول', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!productToDelete) return;

    try {
      setIsSaving(true);
      const res = await fetch(`/api/products/${productToDelete.id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        showToast('محصول با موفقیت حذف شد', 'success');
        setShowDeleteConfirm(false);
        setProductToDelete(null);
        loadProducts();
      } else {
        const error = await res.json();
        showToast(error.message || 'خطا در حذف محصول', 'error');
      }
    } catch (error) {
      showToast('خطا در حذف محصول', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      color: '',
      categoryId: '',
      originalPrice: '',
      discountedPrice: '',
      finalPrice: '',
      stock: '',
      description: '',
      images: [],
      priceType: 'fixed',
      featured: false,
      seoTitle: '',
      seoDescription: '',
    });
  };

  const handleImageUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsUploading(true);
    try {
      const uploadedUrls: string[] = [];
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
          credentials: 'include',
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || 'خطا در آپلود تصویر');
        if (data?.url) uploadedUrls.push(data.url);
      }
      if (uploadedUrls.length > 0) {
        setFormData((prev) => ({ ...prev, images: [...prev.images, ...uploadedUrls] }));
        showToast('تصاویر با موفقیت آپلود شدند', 'success');
      }
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'خطا در آپلود تصویر', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    // Find categoryId from categories list if product only has category string
    let categoryId = product.categoryId || '';
    if (!categoryId && product.category) {
      const foundCategory = categories.find((cat) => cat.name === product.category);
      if (foundCategory) {
        categoryId = foundCategory.id;
      }
    }
    setFormData({
      name: product.name || '',
      color: product.color || '',
      categoryId: categoryId,
      originalPrice: String(product.originalPrice || 0),
      discountedPrice: product.discountedPrice ? String(product.discountedPrice) : '',
      finalPrice: String(product.finalPrice || 0),
      stock: String(product.stock || 0),
      description: product.description || '',
      images: product.images || [],
      priceType: product.priceType || 'fixed',
      featured: product.featured || false,
      seoTitle: product.seoTitle || '',
      seoDescription: product.seoDescription || '',
    });
    setShowEditModal(true);
  };

  const openDeleteConfirm = (product: Product) => {
    setProductToDelete(product);
    setShowDeleteConfirm(true);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fa-IR').format(price);
  };

  if (loading) {
    const loader = <div className="flex items-center justify-center min-h-screen"><LoadingSpinner size="lg" /></div>;
    if (noLayout) return loader;
    return <DashboardLayout title="مدیریت محصولات">{loader}</DashboardLayout>;
  }

  const content = (
    <>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <CardTitle>لیست محصولات</CardTitle>
              <div className="flex items-center gap-2 flex-wrap">
                <div className="relative max-w-xs">
                  <MagnifyingGlassIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    placeholder="جستجو..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pr-10"
                  />
                </div>
                <select
                  className="border rounded-lg p-2 text-sm"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="">همه دسته‌بندی‌ها</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                <Button
                  onClick={() => {
                    resetForm();
                    setShowAddModal(true);
                  }}
                  className="flex items-center gap-2"
                >
                  <PlusIcon className="h-5 w-5" />
                  افزودن محصول
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredProducts.length === 0 ? (
              <EmptyState title="محصولی یافت نشد" emoji="📦" />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="p-4 border rounded-lg hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{product.name}</h3>
                        {product.category && (
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            {product.category}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEditModal(product)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="ویرایش"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openDeleteConfirm(product)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="حذف"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2 mt-4">
                      {product.color && (
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">رنگ:</span> {product.color}
                        </p>
                      )}
                      <p className="text-sm">
                        <span className="font-medium text-gray-600">قیمت:</span>{' '}
                        <span className="font-bold text-yellow-600">
                          {formatPrice(product.finalPrice || 0)} تومان
                        </span>
                      </p>
                      {product.stock !== undefined && (
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">موجودی:</span> {product.stock} عدد
                        </p>
                      )}
                      {product.description && (
                        <p className="text-sm text-gray-500 line-clamp-2">
                          {product.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add Product Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="افزودن محصول جدید"
        size="lg"
      >
        <ProductForm
          formData={formData}
          setFormData={setFormData}
          categories={categories}
          isSaving={isSaving}
          isUploading={isUploading}
          onUpload={handleImageUpload}
          onSave={handleAddProduct}
          onCancel={() => {
            setShowAddModal(false);
            resetForm();
          }}
        />
      </Modal>

      {/* Edit Product Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingProduct(null);
        }}
        title="ویرایش محصول"
        size="lg"
      >
        <ProductForm
          formData={formData}
          setFormData={setFormData}
          categories={categories}
          isSaving={isSaving}
          isUploading={isUploading}
          onUpload={handleImageUpload}
          onSave={handleEditProduct}
          onCancel={() => {
            setShowEditModal(false);
            setEditingProduct(null);
            resetForm();
          }}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setProductToDelete(null);
        }}
        title="حذف محصول"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            آیا مطمئن هستید که می‌خواهید محصول{' '}
            <strong>{productToDelete?.name}</strong> را حذف کنید؟
          </p>
          <p className="text-sm text-red-600">
            ⚠️ این عمل قابل بازگشت نیست و تمام اطلاعات مرتبط با این محصول حذف خواهد شد.
          </p>
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteConfirm(false);
                setProductToDelete(null);
              }}
              disabled={isSaving}
            >
              انصراف
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteProduct}
              disabled={isSaving}
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
  return <DashboardLayout title="مدیریت محصولات">{content}</DashboardLayout>;
}

function ProductForm({
  formData,
  setFormData,
  categories,
  isSaving,
  isUploading,
  onUpload,
  onSave,
  onCancel,
}: {
  formData: any;
  setFormData: (data: any) => void;
  categories: Category[];
  isSaving: boolean;
  isUploading: boolean;
  onUpload: (files: FileList | null) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">نام محصول *</label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="مثلاً: سرویس سیسمونی صورتی، رختخواب نوزاد"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">دسته‌بندی</label>
          <select
            className="w-full border rounded-lg p-2"
            value={formData.categoryId}
            onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
          >
            <option value="">-- انتخاب کنید --</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">رنگ</label>
          <Input
            value={formData.color}
            onChange={(e) => setFormData({ ...formData, color: e.target.value })}
            placeholder="مثلاً: صورتی، آبی، کرم، سفید"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">موجودی</label>
          <Input
            type="number"
            value={formData.stock}
            onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
            placeholder="0"
            min="0"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">نوع قیمت *</label>
        <select
          className="w-full border rounded-lg p-2"
          value={formData.priceType}
          onChange={(e) => setFormData({ ...formData, priceType: e.target.value as any })}
        >
          <option value="fixed">قیمت ثابت</option>
          <option value="call_for_price">تماس بگیرید</option>
          <option value="negotiable">قابل مذاکره</option>
        </select>
      </div>
      {formData.priceType === 'fixed' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">قیمت اصلی *</label>
            <Input
              type="number"
              value={formData.originalPrice}
              onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
              placeholder="0"
              min="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">قیمت تخفیف‌خورده</label>
            <Input
              type="number"
              value={formData.discountedPrice}
              onChange={(e) => setFormData({ ...formData, discountedPrice: e.target.value })}
              placeholder="0"
              min="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">قیمت نهایی *</label>
            <Input
              type="number"
              value={formData.finalPrice}
              onChange={(e) => setFormData({ ...formData, finalPrice: e.target.value })}
              placeholder="0"
              min="0"
            />
          </div>
        </div>
      )}
      <div>
        <label className="block text-sm font-medium mb-2">توضیحات</label>
        <textarea
          className="w-full border rounded-lg p-2 min-h-24"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="توضیحات محصول..."
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">تصاویر (URL ها، هر خط یک URL)</label>
        <textarea
          className="w-full border rounded-lg p-2 min-h-24"
          value={formData.images.join('\n')}
          onChange={(e) =>
            setFormData({
              ...formData,
              images: e.target.value.split('\n').filter((url: string) => url.trim()),
            })
          }
          placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
        />
        <div className="mt-3 flex items-center gap-3">
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => onUpload(e.target.files)}
            disabled={isUploading}
            className="text-sm"
          />
          {isUploading && <span className="text-sm text-gray-500">در حال آپلود...</span>}
        </div>
        {formData.images.length > 0 && (
          <div className="mt-3 space-y-2">
            {formData.images.map((url: string, idx: number) => (
              <div key={`${url}-${idx}`} className="flex items-center justify-between gap-2 text-sm">
                <span className="truncate text-gray-600">{url}</span>
                <button
                  type="button"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      images: formData.images.filter((_: string, i: number) => i !== idx),
                    })
                  }
                  className="text-red-600 hover:text-red-700"
                >
                  حذف
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="featured"
          checked={formData.featured}
          onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
          className="w-4 h-4"
        />
        <label htmlFor="featured" className="text-sm font-medium">
          محصول ویژه
        </label>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">عنوان SEO</label>
          <Input
            value={formData.seoTitle}
            onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
            placeholder="عنوان برای SEO"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">توضیحات SEO</label>
          <textarea
            className="w-full border rounded-lg p-2 min-h-20"
            value={formData.seoDescription}
            onChange={(e) => setFormData({ ...formData, seoDescription: e.target.value })}
            placeholder="توضیحات برای SEO"
          />
        </div>
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
