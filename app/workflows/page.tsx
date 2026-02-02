'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent, Button, LoadingSpinner, EmptyState, useToast } from '@/components/ui';
import {
  CogIcon,
  PlayIcon,
  StopIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

interface Workflow {
  id: string;
  name: string;
  description?: string;
  enabled: boolean;
  lastRun?: string;
  nextRun?: string;
  status?: 'active' | 'inactive' | 'error';
  triggerType?: 'schedule' | 'webhook' | 'manual';
}

// Mock workflows - In production, these would be fetched from n8n or a workflow management API
const mockWorkflows: Workflow[] = [
  {
    id: 'automated-messaging',
    name: 'ارسال پیام خودکار',
    description: 'ارسال پیام‌های خودکار به مشتریان بر اساس علاقه‌مندی‌ها',
    enabled: true,
    lastRun: new Date(Date.now() - 3600000).toISOString(),
    nextRun: new Date(Date.now() + 82800000).toISOString(),
    status: 'active',
    triggerType: 'schedule',
  },
  {
    id: 'gold-price-update',
    name: 'به‌روزرسانی قیمت طلا',
    description: 'به‌روزرسانی خودکار قیمت طلا از API خارجی',
    enabled: true,
    lastRun: new Date(Date.now() - 7200000).toISOString(),
    nextRun: new Date(Date.now() + 3600000).toISOString(),
    status: 'active',
    triggerType: 'schedule',
  },
  {
    id: 'daily-report',
    name: 'گزارش روزانه',
    description: 'ارسال گزارش روزانه فروش و موجودی',
    enabled: false,
    lastRun: new Date(Date.now() - 86400000).toISOString(),
    status: 'inactive',
    triggerType: 'schedule',
  },
  {
    id: 'customer-sync',
    name: 'همگام‌سازی مشتریان',
    description: 'همگام‌سازی اطلاعات مشتریان با Google Sheets',
    enabled: true,
    lastRun: new Date(Date.now() - 21600000).toISOString(),
    status: 'active',
    triggerType: 'webhook',
  },
];

export default function WorkflowsPage(props?: { noLayout?: boolean }) {
  const noLayout = props?.noLayout;
  const [workflows, setWorkflows] = useState<Workflow[]>(mockWorkflows);
  const [loading, setLoading] = useState(false);
  const [running, setRunning] = useState<string | null>(null);
  const { showToast, ToastContainer } = useToast();

  // In production, fetch workflows from API
  useEffect(() => {
    // loadWorkflows();
  }, []);

  const handleToggleWorkflow = async (workflowId: string) => {
    try {
      setWorkflows((prev) =>
        prev.map((w) =>
          w.id === workflowId ? { ...w, enabled: !w.enabled } : w
        )
      );
      
      // In production, call API to toggle workflow in n8n
      // await fetch(`/api/workflows/${workflowId}/toggle`, { method: 'POST' });
      
      const workflow = workflows.find((w) => w.id === workflowId);
      showToast(
        `ورک فلو ${workflow?.name} ${!workflow?.enabled ? 'فعال' : 'غیرفعال'} شد`,
        'success'
      );
    } catch (error) {
      showToast('خطا در تغییر وضعیت ورک فلو', 'error');
    }
  };

  const handleRunWorkflow = async (workflowId: string) => {
    try {
      setRunning(workflowId);
      
      // In production, trigger workflow execution via n8n webhook
      // await fetch(`/api/workflows/${workflowId}/run`, { method: 'POST' });
      
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      setWorkflows((prev) =>
        prev.map((w) =>
          w.id === workflowId
            ? { ...w, lastRun: new Date().toISOString() }
            : w
        )
      );
      
      const workflow = workflows.find((w) => w.id === workflowId);
      showToast(`ورک فلو ${workflow?.name} با موفقیت اجرا شد`, 'success');
    } catch (error) {
      showToast('خطا در اجرای ورک فلو', 'error');
    } finally {
      setRunning(null);
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
            <CheckCircleIcon className="h-4 w-4" />
            فعال
          </span>
        );
      case 'error':
        return (
          <span className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 rounded text-xs">
            <XCircleIcon className="h-4 w-4" />
            خطا
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs">
            <StopIcon className="h-4 w-4" />
            غیرفعال
          </span>
        );
    }
  };

  const getTriggerTypeLabel = (type?: string) => {
    switch (type) {
      case 'schedule':
        return 'زمان‌بندی شده';
      case 'webhook':
        return 'وب‌هوک';
      case 'manual':
        return 'دستی';
      default:
        return 'نامشخص';
    }
  };

  const loadingBlock = (
    <div className="flex items-center justify-center min-h-screen">
      <LoadingSpinner size="lg" />
    </div>
  );
  if (loading) {
    return noLayout ? loadingBlock : <DashboardLayout title="ورک فلوها">{loadingBlock}</DashboardLayout>;
  }

  const mainContent = (
    <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold">ورک فلوهای n8n</h2>
            <p className="text-sm text-gray-600 mt-1">
              مدیریت و کنترل ورک فلوهای خودکار n8n
            </p>
          </div>
        </div>

        {/* Info Card */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <p className="text-sm text-blue-800">
              💡 ورک فلوها در n8n مدیریت می‌شوند. برای مشاهده جزئیات بیشتر و ویرایش ورک فلوها، به پنل n8n مراجعه کنید.
            </p>
          </CardContent>
        </Card>

        {/* Workflows List */}
        {workflows.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {workflows.map((workflow) => (
              <Card key={workflow.id} hover>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="flex items-center gap-2">
                      <CogIcon className="h-5 w-5 text-blue-600" />
                      {workflow.name}
                    </CardTitle>
                    {getStatusBadge(workflow.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {workflow.description && (
                      <p className="text-sm text-gray-600">{workflow.description}</p>
                    )}

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">نوع تریگر:</span>
                        <span className="text-gray-800">{getTriggerTypeLabel(workflow.triggerType)}</span>
                      </div>
                      {workflow.lastRun && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">آخرین اجرا:</span>
                          <span className="text-gray-800">
                            {new Date(workflow.lastRun).toLocaleDateString('fa-IR')}
                          </span>
                        </div>
                      )}
                      {workflow.nextRun && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">اجرای بعدی:</span>
                          <span className="text-gray-800">
                            {new Date(workflow.nextRun).toLocaleDateString('fa-IR')}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button
                        onClick={() => handleToggleWorkflow(workflow.id)}
                        className={`flex-1 ${
                          workflow.enabled
                            ? 'bg-yellow-600 hover:bg-yellow-700'
                            : 'bg-gray-600 hover:bg-gray-700'
                        }`}
                        size="sm"
                      >
                        {workflow.enabled ? (
                          <>
                            <StopIcon className="h-4 w-4 ml-1" />
                            غیرفعال کردن
                          </>
                        ) : (
                          <>
                            <PlayIcon className="h-4 w-4 ml-1" />
                            فعال کردن
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={() => handleRunWorkflow(workflow.id)}
                        disabled={running === workflow.id}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        size="sm"
                      >
                        <PlayIcon className="h-4 w-4 ml-1" />
                        {running === workflow.id ? 'در حال اجرا...' : 'اجرای دستی'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState title="هیچ ورک فلوئی یافت نشد" />
        )}

        {/* Documentation Link */}
        <Card>
          <CardContent className="p-6 text-center">
            <h3 className="font-semibold mb-2">مستندات n8n</h3>
            <p className="text-sm text-gray-600 mb-4">
              برای راه‌اندازی و مدیریت ورک فلوهای n8n، به مستندات مراجعه کنید.
            </p>
            <a
              href="/docs/n8n-integration.md"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              مشاهده مستندات →
            </a>
          </CardContent>
        </Card>
      </div>
  );
  return noLayout ? (
    <>
      {mainContent}
      <ToastContainer />
    </>
  ) : (
    <DashboardLayout title="ورک فلوها">
      {mainContent}
      <ToastContainer />
    </DashboardLayout>
  );
}
