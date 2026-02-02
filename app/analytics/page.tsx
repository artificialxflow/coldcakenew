'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent, Button, LoadingSpinner, EmptyState, useToast } from '@/components/ui';
import {
  ChartBarIcon,
  UserGroupIcon,
  CalendarIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';

type TabType = 'interests' | 'predictions';

interface CustomerInterest {
  customerId: string;
  customerName: string;
  interests: {
    productType?: string;
    colors?: string[];
    quality?: string;
    priceRange?: { min: number; max: number };
    suggestedProducts?: string[];
  };
}

interface SeasonalPrediction {
  id: string;
  productId: string;
  productName: string;
  month: number;
  year: number;
  predictedDemand: number;
  confidence: number;
  reasoning: string;
}

export default function AnalyticsPage(props?: { noLayout?: boolean }) {
  const noLayout = props?.noLayout;
  const [activeTab, setActiveTab] = useState<TabType>('interests');
  const [loading, setLoading] = useState(true);
  const [interests, setInterests] = useState<CustomerInterest[]>([]);
  const [predictions, setPredictions] = useState<SeasonalPrediction[]>([]);
  const [generating, setGenerating] = useState(false);
  const { showToast, ToastContainer } = useToast();

  useEffect(() => {
    if (activeTab === 'interests') {
      loadInterests();
    } else {
      loadPredictions();
    }
  }, [activeTab]);

  const loadInterests = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/analytics/interests');
      if (res.ok) {
        setInterests(await res.json());
      } else {
        showToast('خطا در دریافت علاقه‌مندی‌های مشتریان', 'error');
      }
    } catch (error) {
      showToast('خطا در دریافت علاقه‌مندی‌های مشتریان', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadPredictions = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/analytics/seasonal-predictions');
      if (res.ok) {
        setPredictions(await res.json());
      } else {
        showToast('خطا در دریافت پیش‌بینی‌ها', 'error');
      }
    } catch (error) {
      showToast('خطا در دریافت پیش‌بینی‌ها', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePredictions = async () => {
    try {
      setGenerating(true);
      const res = await fetch('/api/analytics/generate-predictions', {
        method: 'POST',
      });

      if (res.ok) {
        showToast('پیش‌بینی‌ها با موفقیت تولید شدند', 'success');
        loadPredictions();
      } else {
        const error = await res.json();
        showToast(error.message || 'خطا در تولید پیش‌بینی‌ها', 'error');
      }
    } catch (error) {
      showToast('خطا در تولید پیش‌بینی‌ها', 'error');
    } finally {
      setGenerating(false);
    }
  };

  const tabs = [
    { id: 'interests' as TabType, label: 'علاقه‌مندی‌های مشتریان', icon: UserGroupIcon },
    { id: 'predictions' as TabType, label: 'پیش‌بینی‌های فصلی', icon: CalendarIcon },
  ];

  const loadingBlock = (
    <div className="flex items-center justify-center min-h-screen">
      <LoadingSpinner size="lg" />
    </div>
  );
  if (loading) {
    return noLayout ? loadingBlock : <DashboardLayout title="تحلیل و پیش‌بینی">{loadingBlock}</DashboardLayout>;
  }

  const mainContent = (
    <div className="space-y-6">
        {/* Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-4">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Interests Tab */}
        {activeTab === 'interests' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">علاقه‌مندی‌های مشتریان</h2>
            </div>

            {interests.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {interests.map((interest) => (
                  <Card key={interest.customerId} hover>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <UserGroupIcon className="h-5 w-5 text-blue-600" />
                        {interest.customerName}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {interest.interests.productType && (
                          <div>
                            <span className="text-sm font-medium text-gray-600">نوع محصول: </span>
                            <span className="text-sm text-gray-800">{interest.interests.productType}</span>
                          </div>
                        )}

                        {interest.interests.colors && interest.interests.colors.length > 0 && (
                          <div>
                            <span className="text-sm font-medium text-gray-600">رنگ‌های مورد علاقه: </span>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {interest.interests.colors.map((color, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs"
                                >
                                  {color}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {interest.interests.quality && (
                          <div>
                            <span className="text-sm font-medium text-gray-600">کیفیت: </span>
                            <span className="text-sm text-gray-800">{interest.interests.quality}</span>
                          </div>
                        )}

                        {interest.interests.priceRange && (
                          <div>
                            <span className="text-sm font-medium text-gray-600">محدوده قیمت: </span>
                            <span className="text-sm text-gray-800">
                              {interest.interests.priceRange.min.toLocaleString('fa-IR')} -{' '}
                              {interest.interests.priceRange.max.toLocaleString('fa-IR')} تومان
                            </span>
                          </div>
                        )}

                        {interest.interests.suggestedProducts && interest.interests.suggestedProducts.length > 0 && (
                          <div>
                            <span className="text-sm font-medium text-gray-600">محصولات پیشنهادی: </span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {interest.interests.suggestedProducts.slice(0, 3).map((product, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs"
                                >
                                  {product}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <EmptyState title="هیچ علاقه‌مندی‌ای یافت نشد" />
            )}
          </div>
        )}

        {/* Predictions Tab */}
        {activeTab === 'predictions' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">پیش‌بینی‌های فصلی</h2>
              <Button
                onClick={handleGeneratePredictions}
                disabled={generating}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <SparklesIcon className="h-5 w-5 ml-2" />
                {generating ? 'در حال تولید...' : 'تولید پیش‌بینی‌ها'}
              </Button>
            </div>

            {predictions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {predictions.map((prediction) => (
                  <Card key={prediction.id} hover>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <ChartBarIcon className="h-5 w-5 text-purple-600" />
                        {prediction.productName}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-gray-600">ماه و سال:</span>
                          <span className="text-sm text-gray-800">
                            {prediction.month}/{prediction.year}
                          </span>
                        </div>

                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-gray-600">پیش‌بینی تقاضا:</span>
                          <span className="text-sm font-bold text-blue-600">
                            {prediction.predictedDemand.toLocaleString('fa-IR')}
                          </span>
                        </div>

                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-gray-600">میزان اطمینان:</span>
                          <div className="flex items-center gap-2">
                            <div className="w-32 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-purple-600 h-2 rounded-full"
                                style={{ width: `${prediction.confidence}%` }}
                              />
                            </div>
                            <span className="text-sm text-gray-800">{prediction.confidence}%</span>
                          </div>
                        </div>

                        {prediction.reasoning && (
                          <div>
                            <span className="text-sm font-medium text-gray-600">توضیحات:</span>
                            <p className="text-sm text-gray-700 mt-1">{prediction.reasoning}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <EmptyState
                title="هیچ پیش‌بینی‌ای یافت نشد"
                action={
                  <Button onClick={handleGeneratePredictions} disabled={generating} className="bg-purple-600 hover:bg-purple-700">
                    <SparklesIcon className="h-5 w-5 ml-2" />
                    تولید پیش‌بینی‌ها
                  </Button>
                }
              />
            )}
          </div>
        )}
      </div>
  );
  return noLayout ? (
    <>
      {mainContent}
      <ToastContainer />
    </>
  ) : (
    <DashboardLayout title="تحلیل و پیش‌بینی">
      {mainContent}
      <ToastContainer />
    </DashboardLayout>
  );
}
