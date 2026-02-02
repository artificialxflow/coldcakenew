'use client';

import { useState, useEffect, useRef } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent, Button, Input, LoadingSpinner, EmptyState, useToast, Modal } from '@/components/ui';
import { Content } from '@/types';
import { toPersianDate } from '@/lib/utils/dateUtils';
import {
  PhotoIcon,
  VideoCameraIcon,
  MusicalNoteIcon,
  SparklesIcon,
  CalendarIcon,
  PaperAirplaneIcon,
  TrashIcon,
  PencilIcon,
} from '@heroicons/react/24/outline';

export default function ContentPage(props?: { noLayout?: boolean }) {
  const noLayout = props?.noLayout;
  const [contents, setContents] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [enhancing, setEnhancing] = useState<string | null>(null);
  const [selectedContent, setSelectedContent] = useState<Content | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  
  // Form state
  const [contentType, setContentType] = useState<'image' | 'video' | 'audio'>('image');
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState('');
  const [platforms, setPlatforms] = useState<string[]>([]);
  const [scheduledDate, setScheduledDate] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showToast, ToastContainer } = useToast();

  useEffect(() => {
    loadContents();
  }, []);

  const loadContents = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/content');
      if (res.ok) {
        setContents(await res.json());
      } else {
        showToast('خطا در دریافت محتوا', 'error');
      }
    } catch (error) {
      showToast('خطا در دریافت محتوا', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleCreateContent = async () => {
    if (!file) {
      showToast('لطفاً یک فایل انتخاب کنید', 'warning');
      return;
    }

    try {
      setUploading(true);

      const uploadForm = new FormData();
      uploadForm.append('file', file);
      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: uploadForm,
      });

      if (!uploadRes.ok) {
        const uploadErr = await uploadRes.json();
        showToast(uploadErr.error || uploadErr.message || 'خطا در آپلود فایل', 'error');
        setUploading(false);
        return;
      }

      const { url: fileUrl } = await uploadRes.json();
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
      const fullUrl = fileUrl.startsWith('http') ? fileUrl : `${baseUrl}${fileUrl}`;

      const res = await fetch('/api/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: contentType,
          url: fullUrl,
          originalCaption: caption || undefined,
          platforms: platforms.length > 0 ? platforms : undefined,
          scheduledDate: scheduledDate || undefined,
        }),
      });

      if (res.ok) {
        showToast('محتوا با موفقیت ایجاد شد', 'success');
        setShowCreateModal(false);
        resetForm();
        loadContents();
      } else {
        const error = await res.json();
        showToast(error.message || 'خطا در ایجاد محتوا', 'error');
      }
    } catch (error) {
      showToast('خطا در ایجاد محتوا', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleEnhanceWithAI = async (contentId: string) => {
    try {
      setEnhancing(contentId);
      const res = await fetch(`/api/content/${contentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enhanceWithAI: true }),
      });

      if (res.ok) {
        showToast('محتوا با موفقیت بهبود یافت', 'success');
        loadContents();
      } else {
        const error = await res.json();
        showToast(error.message || 'خطا در بهبود محتوا', 'error');
      }
    } catch (error) {
      showToast('خطا در بهبود محتوا', 'error');
    } finally {
      setEnhancing(null);
    }
  };

  const handlePublish = async (contentId: string) => {
    try {
      const res = await fetch(`/api/content/${contentId}/publish`, {
        method: 'POST',
      });

      if (res.ok) {
        showToast('محتوا با موفقیت منتشر شد', 'success');
        loadContents();
      } else {
        const error = await res.json();
        showToast(error.message || 'خطا در انتشار محتوا', 'error');
      }
    } catch (error) {
      showToast('خطا در انتشار محتوا', 'error');
    }
  };

  const handleDelete = async (contentId: string) => {
    if (!confirm('آیا از حذف این محتوا اطمینان دارید؟')) return;

    try {
      const res = await fetch(`/api/content/${contentId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        showToast('محتوا با موفقیت حذف شد', 'success');
        loadContents();
      } else {
        const error = await res.json();
        showToast(error.message || 'خطا در حذف محتوا', 'error');
      }
    } catch (error) {
      showToast('خطا در حذف محتوا', 'error');
    }
  };

  const resetForm = () => {
    setContentType('image');
    setFile(null);
    setCaption('');
    setPlatforms([]);
    setScheduledDate('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const togglePlatform = (platform: string) => {
    setPlatforms((prev) =>
      prev.includes(platform)
        ? prev.filter((p) => p !== platform)
        : [...prev, platform]
    );
  };

  const getContentIcon = (type: string) => {
    switch (type) {
      case 'image':
        return PhotoIcon;
      case 'video':
        return VideoCameraIcon;
      case 'audio':
        return MusicalNoteIcon;
      default:
        return PhotoIcon;
    }
  };

  const loadingBlock = (
    <div className="flex items-center justify-center min-h-screen">
      <LoadingSpinner size="lg" />
    </div>
  );
  if (loading) {
    return noLayout ? loadingBlock : <DashboardLayout title="مدیریت محتوا">{loadingBlock}</DashboardLayout>;
  }

  const mainContent = (
    <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">محتواهای من</h2>
          <Button onClick={() => setShowCreateModal(true)} className="bg-blue-600 hover:bg-blue-700">
            <PhotoIcon className="h-5 w-5 ml-2" />
            افزودن محتوا
          </Button>
        </div>

        {/* Content List */}
        {contents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {contents.map((content) => {
              const Icon = getContentIcon(content.type);
              return (
                <Card key={content.id} hover>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="flex items-center gap-2">
                        <Icon className="h-5 w-5 text-blue-600" />
                        {content.type === 'image' ? 'تصویر' : content.type === 'video' ? 'ویدیو' : 'صوت'}
                      </CardTitle>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleDelete(content.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {content.url && (
                        <div className="w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
                          {content.type === 'image' ? (
                            <img src={content.url} alt={content.originalCaption} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <Icon className="h-12 w-12" />
                            </div>
                          )}
                        </div>
                      )}

                      {content.originalCaption && (
                        <p className="text-sm text-gray-700 line-clamp-2">{content.originalCaption}</p>
                      )}

                      {content.aiEnhancedCaption && (
                        <div className="p-2 bg-blue-50 rounded">
                          <p className="text-xs font-medium text-blue-800 mb-1">بهبود شده با AI:</p>
                          <p className="text-sm text-blue-900">{content.aiEnhancedCaption}</p>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-2">
                        {content.platforms?.map((platform) => (
                          <span key={platform} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                            {platform}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center justify-between">
                        <span className={`text-xs px-2 py-1 rounded ${
                          content.status === 'published' ? 'bg-green-100 text-green-800' :
                          content.status === 'scheduled' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {content.status === 'published' ? 'منتشر شده' :
                           content.status === 'scheduled' ? 'زمان‌بندی شده' :
                           'پیش‌نویس'}
                        </span>
                        {content.publishedAt && (
                          <span className="text-xs text-gray-500">
                            {toPersianDate(new Date(content.publishedAt))}
                          </span>
                        )}
                      </div>

                      <div className="flex gap-2">
                        {!content.aiEnhancedCaption && (
                          <Button
                            size="sm"
                            onClick={() => handleEnhanceWithAI(content.id)}
                            disabled={enhancing === content.id}
                            className="flex-1 bg-purple-600 hover:bg-purple-700"
                          >
                            <SparklesIcon className="h-4 w-4 ml-1" />
                            {enhancing === content.id ? 'در حال بهبود...' : 'بهبود با AI'}
                          </Button>
                        )}
                        {content.status !== 'published' && (
                          <Button
                            size="sm"
                            onClick={() => handlePublish(content.id)}
                            className="flex-1 bg-green-600 hover:bg-green-700"
                          >
                            <PaperAirplaneIcon className="h-4 w-4 ml-1" />
                            انتشار
                          </Button>
                        )}
                      </div>

                      {content.stats && (
                        <div className="flex justify-between text-xs text-gray-600 pt-2 border-t">
                          <span>👁️ {content.stats.views || 0}</span>
                          <span>👍 {content.stats.likes || 0}</span>
                          <span>💬 {content.stats.comments || 0}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <EmptyState
            title="هیچ محتوایی یافت نشد"
            action={
              <Button onClick={() => setShowCreateModal(true)} className="bg-blue-600 hover:bg-blue-700">
                افزودن محتوا
              </Button>
            }
          />
        )}

        {/* Create Modal */}
        <Modal
          isOpen={showCreateModal}
          onClose={() => {
            setShowCreateModal(false);
            resetForm();
          }}
          title="افزودن محتوا"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">نوع محتوا</label>
              <select
                value={contentType}
                onChange={(e) => setContentType(e.target.value as 'image' | 'video' | 'audio')}
                className="w-full p-3 border border-gray-300 rounded-lg"
              >
                <option value="image">تصویر</option>
                <option value="video">ویدیو</option>
                <option value="audio">صوت</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">فایل</label>
              <input
                ref={fileInputRef}
                type="file"
                accept={
                  contentType === 'image' ? 'image/*' :
                  contentType === 'video' ? 'video/*' :
                  'audio/*'
                }
                onChange={handleFileSelect}
                className="w-full p-3 border border-gray-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">توضیحات</label>
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-lg"
                placeholder="توضیحات محتوا..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">پلتفرم‌ها</label>
              <div className="flex flex-wrap gap-2">
                {['telegram', 'whatsapp', 'rubika', 'instagram', 'youtube', 'aparat'].map((platform) => (
                  <button
                    key={platform}
                    onClick={() => togglePlatform(platform)}
                    className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                      platforms.includes(platform)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {platform}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">زمان‌بندی انتشار (اختیاری)</label>
              <Input
                type="datetime-local"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                onClick={() => {
                  setShowCreateModal(false);
                  resetForm();
                }}
                variant="outline"
              >
                انصراف
              </Button>
              <Button
                onClick={handleCreateContent}
                disabled={uploading || !file}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {uploading ? 'در حال آپلود...' : 'افزودن'}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
  );
  return noLayout ? (
    <>
      {mainContent}
      <ToastContainer />
    </>
  ) : (
    <DashboardLayout title="مدیریت محتوا">
      {mainContent}
      <ToastContainer />
    </DashboardLayout>
  );
}
