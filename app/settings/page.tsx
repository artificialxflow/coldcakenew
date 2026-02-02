'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Modal, useToast, LoadingSpinner } from '@/components/ui';
import { 
  Cog6ToothIcon, 
  CloudIcon, 
  LinkIcon, 
  KeyIcon,
  InformationCircleIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

interface BusinessSettings {
  businessName?: string;
  contactPhone: string;
  telegramChannel: string;
  rubikaChannel: string;
  whatsappNumber: string;
  instagramPage: string;
  address?: string;
}

interface IntegrationSettings {
  googleCloudClientId?: string;
  googleCloudClientSecret?: string;
  n8nWebhookUrl?: string;
  geminiApiKey?: string;
  openAiApiKey?: string;
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'business' | 'integrations'>('business');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [businessSettings, setBusinessSettings] = useState<BusinessSettings>({
    contactPhone: '',
    telegramChannel: '',
    rubikaChannel: '',
    whatsappNumber: '',
    instagramPage: '',
  });
  const [integrationSettings, setIntegrationSettings] = useState<IntegrationSettings>({});
  const [showGoogleGuide, setShowGoogleGuide] = useState(false);
  const { showToast, ToastContainer } = useToast();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const [businessRes, integrationsRes] = await Promise.all([
        fetch('/api/settings'),
        fetch('/api/settings/integrations'),
      ]);

      if (businessRes.ok) {
        const businessData = await businessRes.json();
        setBusinessSettings(businessData);
      }

      if (integrationsRes.ok) {
        const integrationsData = await integrationsRes.json();
        setIntegrationSettings(integrationsData);
      }
    } catch (error) {
      showToast('خطا در بارگذاری تنظیمات', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const saveBusinessSettings = async () => {
    try {
      setIsSaving(true);
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(businessSettings),
      });

      if (response.ok) {
        showToast('تنظیمات کسب‌وکار با موفقیت ذخیره شد', 'success');
      } else {
        const error = await response.json();
        showToast(error.message || 'خطا در ذخیره تنظیمات', 'error');
      }
    } catch (error) {
      showToast('خطا در ذخیره تنظیمات', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const saveIntegrationSettings = async () => {
    try {
      setIsSaving(true);
      const response = await fetch('/api/settings/integrations', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(integrationSettings),
      });

      if (response.ok) {
        showToast('تنظیمات یکپارچه‌سازی با موفقیت ذخیره شد', 'success');
        loadSettings(); // Reload to get masked values
      } else {
        const error = await response.json();
        showToast(error.message || 'خطا در ذخیره تنظیمات', 'error');
      }
    } catch (error) {
      showToast('خطا در ذخیره تنظیمات', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <Cog6ToothIcon className="h-8 w-8 text-yellow-600" />
            تنظیمات سیستم
          </h1>
          <p className="text-gray-600 mt-2">مدیریت تنظیمات کسب‌وکار و یکپارچه‌سازی‌ها</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('business')}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === 'business'
                ? 'text-yellow-600 border-b-2 border-yellow-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            تنظیمات کسب‌وکار
          </button>
          <button
            onClick={() => setActiveTab('integrations')}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === 'integrations'
                ? 'text-yellow-600 border-b-2 border-yellow-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            یکپارچه‌سازی‌ها
          </button>
        </div>

        {/* Business Settings Tab */}
        {activeTab === 'business' && (
          <Card>
            <CardHeader>
              <CardTitle>تنظیمات عمومی کسب‌وکار</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <Input
                  label="نام کسب‌وکار"
                  value={businessSettings.businessName || ''}
                  onChange={(e) => setBusinessSettings({ ...businessSettings, businessName: e.target.value })}
                  placeholder="مثال: کیک سرد"
                />

                <Input
                  label="شماره تماس"
                  value={businessSettings.contactPhone}
                  onChange={(e) => setBusinessSettings({ ...businessSettings, contactPhone: e.target.value })}
                  placeholder="09123456789"
                  required
                />

                <Input
                  label="کانال تلگرام"
                  value={businessSettings.telegramChannel}
                  onChange={(e) => setBusinessSettings({ ...businessSettings, telegramChannel: e.target.value })}
                  placeholder="@channel"
                />

                <Input
                  label="کانال روبیکا"
                  value={businessSettings.rubikaChannel}
                  onChange={(e) => setBusinessSettings({ ...businessSettings, rubikaChannel: e.target.value })}
                  placeholder="@channel"
                />

                <Input
                  label="شماره واتساپ"
                  value={businessSettings.whatsappNumber}
                  onChange={(e) => setBusinessSettings({ ...businessSettings, whatsappNumber: e.target.value })}
                  placeholder="989123456789"
                />

                <Input
                  label="صفحه اینستاگرام"
                  value={businessSettings.instagramPage}
                  onChange={(e) => setBusinessSettings({ ...businessSettings, instagramPage: e.target.value })}
                  placeholder="@instagram"
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    آدرس
                  </label>
                  <textarea
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    value={businessSettings.address || ''}
                    onChange={(e) => setBusinessSettings({ ...businessSettings, address: e.target.value })}
                    rows={3}
                    placeholder="آدرس کامل کسب‌وکار"
                  />
                </div>

                <div className="flex justify-end">
                  <Button onClick={saveBusinessSettings} isLoading={isSaving}>
                    ذخیره تنظیمات
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Integration Settings Tab */}
        {activeTab === 'integrations' && (
          <div className="space-y-6">
            {/* Google Cloud Settings */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <CloudIcon className="h-6 w-6 text-blue-600" />
                    Google Cloud Platform
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowGoogleGuide(true)}
                  >
                    <InformationCircleIcon className="h-4 w-4 ml-2" />
                    راهنمای دریافت
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Input
                    label="Client ID"
                    type="text"
                    value={integrationSettings.googleCloudClientId || ''}
                    onChange={(e) => setIntegrationSettings({ ...integrationSettings, googleCloudClientId: e.target.value })}
                    placeholder="xxxxx.apps.googleusercontent.com"
                    helperText="شناسه مشتری Google Cloud"
                  />

                  <Input
                    label="Client Secret"
                    type="password"
                    value={integrationSettings.googleCloudClientSecret || ''}
                    onChange={(e) => setIntegrationSettings({ ...integrationSettings, googleCloudClientSecret: e.target.value })}
                    placeholder="••••••••••••••••"
                    helperText="رمز مشتری Google Cloud"
                  />
                </div>
              </CardContent>
            </Card>

            {/* n8n Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LinkIcon className="h-6 w-6 text-purple-600" />
                  n8n Workflow Automation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Input
                  label="Webhook URL"
                  type="url"
                  value={integrationSettings.n8nWebhookUrl || ''}
                  onChange={(e) => setIntegrationSettings({ ...integrationSettings, n8nWebhookUrl: e.target.value })}
                  placeholder="https://autocoldcake.runflare.run/webhook/..."
                  helperText="آدرس Webhook نود n8n شما"
                />
              </CardContent>
            </Card>

            {/* AI APIs */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <KeyIcon className="h-6 w-6 text-green-600" />
                  API های هوش مصنوعی
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Input
                    label="Gemini API Key"
                    type="password"
                    value={integrationSettings.geminiApiKey || ''}
                    onChange={(e) => setIntegrationSettings({ ...integrationSettings, geminiApiKey: e.target.value })}
                    placeholder="AIza..."
                    helperText="کلید API گوگل Gemini"
                  />

                  <Input
                    label="OpenAI API Key"
                    type="password"
                    value={integrationSettings.openAiApiKey || ''}
                    onChange={(e) => setIntegrationSettings({ ...integrationSettings, openAiApiKey: e.target.value })}
                    placeholder="sk-..."
                    helperText="کلید API OpenAI"
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button onClick={saveIntegrationSettings} isLoading={isSaving}>
                ذخیره تنظیمات یکپارچه‌سازی
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Google Cloud Guide Modal */}
      <Modal
        isOpen={showGoogleGuide}
        onClose={() => setShowGoogleGuide(false)}
        title="راهنمای دریافت Google Cloud Client ID و Secret"
        size="xl"
      >
        <div className="space-y-6 text-right">
          <div className="bg-blue-50 border-r-4 border-blue-500 p-4 rounded">
            <h3 className="font-semibold text-blue-800 mb-2">مراحل دریافت Client ID و Secret:</h3>
            <ol className="list-decimal list-inside space-y-2 text-blue-700">
              <li>وارد Google Cloud Console شوید: <a href="https://console.cloud.google.com" target="_blank" rel="noopener noreferrer" className="underline">console.cloud.google.com</a></li>
              <li>یک پروژه جدید ایجاد کنید یا پروژه موجود را انتخاب کنید</li>
              <li>به بخش "APIs & Services" → "Credentials" بروید</li>
              <li>روی "Create Credentials" کلیک کنید و "OAuth client ID" را انتخاب کنید</li>
              <li>اگر اولین بار است، "Configure consent screen" را تکمیل کنید:
                <ul className="list-disc list-inside mr-4 mt-2 space-y-1">
                  <li>User Type: External را انتخاب کنید</li>
                  <li>نام اپلیکیشن و اطلاعات تماس را وارد کنید</li>
                  <li>Scopes را اضافه کنید (Google Drive API، Google Sheets API و...)</li>
                  <li>Test users را اضافه کنید (برای تست)</li>
                </ul>
              </li>
              <li>نوع اپلیکیشن را انتخاب کنید (Web application)</li>
              <li>نام OAuth client را وارد کنید</li>
              <li>Authorized redirect URIs را اضافه کنید (اختیاری - برای حالات خاص)</li>
              <li>روی "Create" کلیک کنید</li>
              <li>Client ID و Client Secret نمایش داده می‌شوند</li>
              <li>Client Secret را کپی کنید (فقط یکبار نمایش داده می‌شود)</li>
            </ol>
          </div>

          <div className="bg-yellow-50 border-r-4 border-yellow-500 p-4 rounded">
            <h3 className="font-semibold text-yellow-800 mb-2">نکات مهم:</h3>
            <ul className="list-disc list-inside space-y-1 text-yellow-700">
              <li>Client Secret فقط یکبار نمایش داده می‌شود - آن را در جای امن ذخیره کنید</li>
              <li>برای استفاده در Google Apps Script، باید APIs مربوطه را در پروژه فعال کنید</li>
              <li>برای Google Drive API و Sheets API، به "APIs & Services" → "Library" بروید و آن‌ها را فعال کنید</li>
              <li>در محیط Production، باید OAuth consent screen را verify کنید</li>
            </ul>
          </div>

          <div className="bg-gray-50 p-4 rounded">
            <h3 className="font-semibold text-gray-800 mb-2">لینک‌های مفید:</h3>
            <ul className="space-y-1">
              <li>
                <a href="https://console.cloud.google.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  Google Cloud Console
                </a>
              </li>
              <li>
                <a href="https://developers.google.com/identity/protocols/oauth2" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  مستندات OAuth 2.0
                </a>
              </li>
              <li>
                <a href="https://developers.google.com/apps-script/guides/oauth" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  راهنمای OAuth در Google Apps Script
                </a>
              </li>
            </ul>
          </div>
        </div>
      </Modal>

      <ToastContainer />
    </div>
  );
}
