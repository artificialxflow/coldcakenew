'use client';

import { useState, useEffect, useMemo } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Modal, useToast, LoadingSpinner, EmptyState } from '@/components/ui';
import { Customer, Message, Product } from '@/types';
import { toPersianDate } from '@/lib/utils/dateUtils';
import { 
  PaperAirplaneIcon,
  MagnifyingGlassIcon,
  UserIcon,
  ClockIcon,
  PlayIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';

export default function MessagesPage(props?: { noLayout?: boolean }) {
  const noLayout = props?.noLayout;
  const [activeTab, setActiveTab] = useState<'list' | 'create' | 'history' | 'automated'>('list');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [messageContent, setMessageContent] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<Message['platform']>('telegram');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
  });
  const { showToast, ToastContainer } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [customersRes, messagesRes, productsRes] = await Promise.all([
        fetch('/api/customers'),
        fetch('/api/messages'),
        fetch('/api/products'),
      ]);

      if (customersRes.ok) {
        setCustomers(await customersRes.json());
      }
      if (messagesRes.ok) {
        setMessages(await messagesRes.json());
      }
      if (productsRes.ok) {
        setProducts(await productsRes.json());
      }
    } catch (error) {
      showToast('خطا در بارگذاری داده‌ها', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = useMemo(() => {
    if (!searchQuery) return customers;
    const query = searchQuery.toLowerCase();
    return customers.filter((c) =>
      `${c.firstName} ${c.lastName}`.toLowerCase().includes(query) ||
      c.phone?.includes(query)
    );
  }, [customers, searchQuery]);

  const handleSendMessage = async () => {
    if (!selectedCustomer || !messageContent.trim()) {
      showToast('لطفاً مشتری و متن پیام را وارد کنید', 'warning');
      return;
    }

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: selectedCustomer.id,
          customerName: `${selectedCustomer.firstName} ${selectedCustomer.lastName}`,
          content: messageContent,
          platform: selectedPlatform,
        }),
      });

      if (res.ok) {
        showToast('پیام با موفقیت ارسال شد', 'success');
        setMessageContent('');
        setSelectedCustomer(null);
        loadData();
      } else {
        const error = await res.json();
        showToast(error.message || 'خطا در ارسال پیام', 'error');
      }
    } catch (error) {
      showToast('خطا در ارسال پیام', 'error');
    }
  };

  const handleAddCustomer = async () => {
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      showToast('لطفاً نام و نام خانوادگی را وارد کنید', 'warning');
      return;
    }

    try {
      setIsSaving(true);
      const requestBody = JSON.stringify(formData);
      
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: requestBody,
      });

      if (res.ok) {
        showToast('مشتری با موفقیت اضافه شد', 'success');
        setShowAddModal(false);
        setFormData({ firstName: '', lastName: '', phone: '', email: '' });
        loadData();
      } else {
        const error = await res.json();
        showToast(error.message || 'خطا در افزودن مشتری', 'error');
      }
    } catch (error) {
      showToast('خطا در افزودن مشتری', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditCustomer = async () => {
    if (!editingCustomer || !formData.firstName.trim() || !formData.lastName.trim()) {
      showToast('لطفاً نام و نام خانوادگی را وارد کنید', 'warning');
      return;
    }

    try {
      setIsSaving(true);
      const res = await fetch(`/api/customers/${editingCustomer.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        showToast('مشتری با موفقیت به‌روزرسانی شد', 'success');
        setShowEditModal(false);
        setEditingCustomer(null);
        setFormData({ firstName: '', lastName: '', phone: '', email: '' });
        loadData();
      } else {
        const error = await res.json();
        showToast(error.message || 'خطا در به‌روزرسانی مشتری', 'error');
      }
    } catch (error) {
      showToast('خطا در به‌روزرسانی مشتری', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCustomer = async () => {
    if (!customerToDelete) return;

    try {
      setIsSaving(true);
      const res = await fetch(`/api/customers/${customerToDelete.id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        showToast('مشتری با موفقیت حذف شد', 'success');
        setShowDeleteConfirm(false);
        setCustomerToDelete(null);
        loadData();
      } else {
        const error = await res.json();
        showToast(error.message || 'خطا در حذف مشتری', 'error');
      }
    } catch (error) {
      showToast('خطا در حذف مشتری', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const openEditModal = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormData({
      firstName: customer.firstName,
      lastName: customer.lastName,
      phone: customer.phone || '',
      email: customer.email || '',
    });
    setShowEditModal(true);
  };

  const openDeleteConfirm = (customer: Customer) => {
    setCustomerToDelete(customer);
    setShowDeleteConfirm(true);
  };

  if (loading) {
    const loader = <div className="flex items-center justify-center min-h-screen"><LoadingSpinner size="lg" /></div>;
    if (noLayout) return loader;
    return <DashboardLayout title="ارتباط با مشتری">{loader}</DashboardLayout>;
  }

  const content = (
    <>
      <div className="space-y-6">
        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-200">
          {(['list', 'create', 'history', 'automated'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 font-semibold transition-colors ${
                activeTab === tab
                  ? 'text-yellow-600 border-b-2 border-yellow-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              {tab === 'list' && '📋 لیست مشتریان'}
              {tab === 'create' && '✍️ ارسال پیام'}
              {tab === 'history' && '📜 تاریخچه'}
              {tab === 'automated' && '⚙️ خودکار'}
            </button>
          ))}
        </div>

        {/* List Tab */}
        {activeTab === 'list' && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>مشتریان</CardTitle>
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="جستجو..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="max-w-xs"
                  />
                  <Button
                    onClick={() => {
                      setFormData({ firstName: '', lastName: '', phone: '', email: '' });
                      setShowAddModal(true);
                    }}
                    className="flex items-center gap-2"
                  >
                    <PlusIcon className="h-5 w-5" />
                    افزودن مشتری
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredCustomers.length === 0 ? (
                <EmptyState title="مشتری یافت نشد" emoji="👤" />
              ) : (
                <div className="space-y-2">
                  {filteredCustomers.map((customer) => (
                    <div
                      key={customer.id}
                      className="p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center justify-between">
                        <div
                          className="flex-1 cursor-pointer"
                          onClick={() => {
                            setSelectedCustomer(customer);
                            setActiveTab('create');
                          }}
                        >
                          <h3 className="font-semibold">{customer.firstName} {customer.lastName}</h3>
                          {customer.phone && <p className="text-sm text-gray-600">{customer.phone}</p>}
                          {customer.email && <p className="text-sm text-gray-500">{customer.email}</p>}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditModal(customer);
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="ویرایش"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openDeleteConfirm(customer);
                            }}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="حذف"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Create Tab */}
        {activeTab === 'create' && (
          <Card>
            <CardHeader>
              <CardTitle>ارسال پیام</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">انتخاب مشتری</label>
                <select
                  className="w-full border rounded-lg p-2"
                  value={selectedCustomer?.id || ''}
                  onChange={(e) => {
                    const customer = customers.find((c) => c.id === e.target.value);
                    setSelectedCustomer(customer || null);
                  }}
                >
                  <option value="">-- انتخاب کنید --</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.firstName} {c.lastName} {c.phone ? `- ${c.phone}` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">پلتفرم</label>
                <select
                  className="w-full border rounded-lg p-2"
                  value={selectedPlatform}
                  onChange={(e) => setSelectedPlatform(e.target.value as Message['platform'])}
                >
                  <option value="telegram">تلگرام</option>
                  <option value="whatsapp">واتساپ</option>
                  <option value="rubika">روبیکا</option>
                  <option value="instagram">اینستاگرام</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">متن پیام</label>
                <textarea
                  className="w-full border rounded-lg p-2 min-h-32"
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  placeholder="متن پیام را وارد کنید..."
                />
              </div>

              <Button onClick={handleSendMessage} className="w-full">
                <PaperAirplaneIcon className="h-5 w-5 ml-2" />
                ارسال پیام
              </Button>
            </CardContent>
          </Card>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <Card>
            <CardHeader>
              <CardTitle>تاریخچه پیام‌ها</CardTitle>
            </CardHeader>
            <CardContent>
              {messages.length === 0 ? (
                <EmptyState title="پیامی ارسال نشده" emoji="📭" />
              ) : (
                <div className="space-y-2">
                  {messages.slice(0, 20).map((msg) => (
                    <div key={msg.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold">{msg.customerName}</p>
                          <p className="text-sm text-gray-600">{msg.content.substring(0, 100)}...</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {toPersianDate(msg.sentAt)} - {msg.platform}
                          </p>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs ${
                          msg.status === 'sent' ? 'bg-green-100 text-green-700' :
                          msg.status === 'failed' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {msg.status === 'sent' ? '✓ ارسال شد' : msg.status === 'failed' ? '✗ خطا' : '⏳ در انتظار'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Automated Tab */}
        {activeTab === 'automated' && (
          <Card>
            <CardHeader>
              <CardTitle>پیام‌رسانی خودکار</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">برای فعال‌سازی پیام‌رسانی خودکار، به بخش تنظیمات مراجعه کنید.</p>
              <Button onClick={async () => {
                try {
                  const res = await fetch('/api/messages/automated/run', { method: 'POST' });
                  if (res.ok) {
                    showToast('پیام‌رسانی خودکار اجرا شد', 'success');
                    loadData();
                  }
                } catch (error) {
                  showToast('خطا در اجرای پیام‌رسانی خودکار', 'error');
                }
              }}>
                <PlayIcon className="h-5 w-5 ml-2" />
                اجرای دستی پیام‌رسانی خودکار
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Add Customer Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="افزودن مشتری جدید"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">نام *</label>
            <Input
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              placeholder="نام را وارد کنید"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">نام خانوادگی *</label>
            <Input
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              placeholder="نام خانوادگی را وارد کنید"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">شماره تلفن</label>
            <Input
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="09123456789"
              type="tel"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">ایمیل</label>
            <Input
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="email@example.com"
              type="email"
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => setShowAddModal(false)}
              disabled={isSaving}
            >
              انصراف
            </Button>
            <Button
              onClick={handleAddCustomer}
              disabled={isSaving}
            >
              {isSaving ? <LoadingSpinner size="sm" /> : 'ذخیره'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Customer Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingCustomer(null);
        }}
        title="ویرایش مشتری"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">نام *</label>
            <Input
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              placeholder="نام را وارد کنید"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">نام خانوادگی *</label>
            <Input
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              placeholder="نام خانوادگی را وارد کنید"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">شماره تلفن</label>
            <Input
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="09123456789"
              type="tel"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">ایمیل</label>
            <Input
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="email@example.com"
              type="email"
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setShowEditModal(false);
                setEditingCustomer(null);
              }}
              disabled={isSaving}
            >
              انصراف
            </Button>
            <Button
              onClick={handleEditCustomer}
              disabled={isSaving}
            >
              {isSaving ? <LoadingSpinner size="sm" /> : 'ذخیره'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setCustomerToDelete(null);
        }}
        title="حذف مشتری"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            آیا مطمئن هستید که می‌خواهید مشتری{' '}
            <strong>{customerToDelete?.firstName} {customerToDelete?.lastName}</strong> را حذف کنید؟
          </p>
          <p className="text-sm text-red-600">
            ⚠️ این عمل قابل بازگشت نیست و تمام اطلاعات مرتبط با این مشتری حذف خواهد شد.
          </p>
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteConfirm(false);
                setCustomerToDelete(null);
              }}
              disabled={isSaving}
            >
              انصراف
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteCustomer}
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
  return <DashboardLayout title="ارتباط با مشتری">{content}</DashboardLayout>;
}
