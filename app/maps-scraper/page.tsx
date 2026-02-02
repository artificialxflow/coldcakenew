'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent, Button, Input, LoadingSpinner, EmptyState, useToast, Modal } from '@/components/ui';
import {
  MapPinIcon,
  PlayIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';

interface ScrapeTarget {
  id: string;
  query: string;
  location: string;
  radius?: number;
  enabled: boolean;
  createdAt: string;
}

interface ScrapedBusiness {
  id: string;
  targetId: string;
  name: string;
  address?: string;
  phone?: string;
  website?: string;
  rating?: number;
  reviewCount?: number;
  latitude?: number;
  longitude?: number;
  scrapedAt: string;
}

export default function MapsScraperPage(props?: { noLayout?: boolean }) {
  const noLayout = props?.noLayout;
  const [targets, setTargets] = useState<ScrapeTarget[]>([]);
  const [businesses, setBusinesses] = useState<ScrapedBusiness[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTarget, setSelectedTarget] = useState<string>('all');
  
  // Form state
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [radius, setRadius] = useState('5000');
  
  const { showToast, ToastContainer } = useToast();

  useEffect(() => {
    loadTargets();
    loadBusinesses();
  }, [selectedTarget]);

  const loadTargets = async () => {
    try {
      const res = await fetch('/api/maps-scraper/targets');
      if (res.ok) {
        setTargets(await res.json());
      }
    } catch (error) {
      showToast('خطا در دریافت اهداف', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadBusinesses = async () => {
    try {
      const url = selectedTarget === 'all' 
        ? '/api/maps-scraper/businesses'
        : `/api/maps-scraper/businesses?targetId=${selectedTarget}`;
      const res = await fetch(url);
      if (res.ok) {
        setBusinesses(await res.json());
      }
    } catch (error) {
      showToast('خطا در دریافت کسب‌وکارها', 'error');
    }
  };

  const handleCreateTarget = async () => {
    if (!query || !location) {
      showToast('لطفاً query و location را وارد کنید', 'warning');
      return;
    }

    try {
      const res = await fetch('/api/maps-scraper/targets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          location,
          radius: radius ? parseInt(radius) : 5000,
        }),
      });

      if (res.ok) {
        showToast('هدف با موفقیت ایجاد شد', 'success');
        setShowCreateModal(false);
        setQuery('');
        setLocation('');
        setRadius('5000');
        loadTargets();
      } else {
        const error = await res.json();
        showToast(error.message || 'خطا در ایجاد هدف', 'error');
      }
    } catch (error) {
      showToast('خطا در ایجاد هدف', 'error');
    }
  };

  const handleRunScrape = async (targetId: string) => {
    try {
      setRunning(targetId);
      const res = await fetch('/api/maps-scraper/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetId }),
      });

      if (res.ok) {
        showToast('اسکریپ با موفقیت اجرا شد', 'success');
        setTimeout(() => {
          loadBusinesses();
        }, 2000);
      } else {
        const error = await res.json();
        showToast(error.message || 'خطا در اجرای اسکریپ', 'error');
      }
    } catch (error) {
      showToast('خطا در اجرای اسکریپ', 'error');
    } finally {
      setRunning(null);
    }
  };

  const loadingBlock = (
    <div className="flex items-center justify-center min-h-screen">
      <LoadingSpinner size="lg" />
    </div>
  );
  if (loading) {
    return noLayout ? loadingBlock : <DashboardLayout title="اسکریپ Google Maps">{loadingBlock}</DashboardLayout>;
  }

  const mainContent = (
    <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">اهداف اسکریپ</h2>
          <Button onClick={() => setShowCreateModal(true)} className="bg-blue-600 hover:bg-blue-700">
            <PlusIcon className="h-5 w-5 ml-2" />
            افزودن هدف
          </Button>
        </div>

        {/* Targets List */}
        {targets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {targets.map((target) => (
              <Card key={target.id} hover>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPinIcon className="h-5 w-5 text-blue-600" />
                    {target.query}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm font-medium text-gray-600">مکان: </span>
                      <span className="text-sm text-gray-800">{target.location}</span>
                    </div>
                    {target.radius && (
                      <div>
                        <span className="text-sm font-medium text-gray-600">شعاع: </span>
                        <span className="text-sm text-gray-800">{target.radius}m</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded ${
                        target.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {target.enabled ? 'فعال' : 'غیرفعال'}
                      </span>
                    </div>
                    <Button
                      onClick={() => handleRunScrape(target.id)}
                      disabled={running === target.id}
                      className="w-full bg-green-600 hover:bg-green-700"
                      size="sm"
                    >
                      <PlayIcon className="h-4 w-4 ml-1" />
                      {running === target.id ? 'در حال اجرا...' : 'اجرای اسکریپ'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            title="هیچ هدفی یافت نشد"
            action={
              <Button onClick={() => setShowCreateModal(true)} className="bg-blue-600 hover:bg-blue-700">
                افزودن هدف
              </Button>
            }
          />
        )}

        {/* Scraped Businesses */}
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">کسب‌وکارهای اسکریپ شده</h2>
            <select
              value={selectedTarget}
              onChange={(e) => setSelectedTarget(e.target.value)}
              className="p-2 border border-gray-300 rounded-lg"
            >
              <option value="all">همه اهداف</option>
              {targets.map((target) => (
                <option key={target.id} value={target.id}>
                  {target.query}
                </option>
              ))}
            </select>
          </div>

          {businesses.length > 0 ? (
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-right">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50">
                        <th className="p-3 text-sm font-semibold">نام</th>
                        <th className="p-3 text-sm font-semibold">آدرس</th>
                        <th className="p-3 text-sm font-semibold">تلفن</th>
                        <th className="p-3 text-sm font-semibold">امتیاز</th>
                        <th className="p-3 text-sm font-semibold">تعداد نظر</th>
                      </tr>
                    </thead>
                    <tbody>
                      {businesses.map((business) => (
                        <tr key={business.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="p-3">{business.name}</td>
                          <td className="p-3">{business.address || '-'}</td>
                          <td className="p-3">{business.phone || '-'}</td>
                          <td className="p-3">{business.rating ? business.rating.toFixed(1) : '-'}</td>
                          <td className="p-3">{business.reviewCount || 0}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          ) : (
            <EmptyState title="هیچ کسب‌وکاری یافت نشد" />
          )}
        </div>

        {/* Create Modal */}
        <Modal
          isOpen={showCreateModal}
          onClose={() => {
            setShowCreateModal(false);
            setQuery('');
            setLocation('');
            setRadius('5000');
          }}
          title="افزودن هدف اسکریپ"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Query (جستجو)</label>
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="مثال: فروشگاه لوازم بچه"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">مکان</label>
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="مثال: تهران، ایران"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">شعاع (متر)</label>
              <Input
                type="number"
                value={radius}
                onChange={(e) => setRadius(e.target.value)}
                placeholder="5000"
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                onClick={() => {
                  setShowCreateModal(false);
                  setQuery('');
                  setLocation('');
                  setRadius('5000');
                }}
                variant="outline"
              >
                انصراف
              </Button>
              <Button
                onClick={handleCreateTarget}
                className="bg-blue-600 hover:bg-blue-700"
              >
                افزودن
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
    <DashboardLayout title="اسکریپ Google Maps">
      {mainContent}
      <ToastContainer />
    </DashboardLayout>
  );
}
