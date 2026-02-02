'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent, Button, Input, LoadingSpinner, EmptyState, useToast, Modal } from '@/components/ui';
import { Sale, Debt, Report, BankAccount, BankTransaction, Customer, Product } from '@/types';
import { toPersianDate } from '@/lib/utils/dateUtils';
import { exportToExcel, exportToPDF, exportSummaryReport, exportBankLedgerToExcel, exportBankLedgerToPDF } from '@/lib/utils/exportReports';
import SalesChart from '@/components/charts/SalesChart';
import {
  DocumentArrowDownIcon,
  MagnifyingGlassIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  UserIcon,
  BanknotesIcon,
  CubeIcon,
  PlusIcon,
  TrashIcon,
  PencilIcon,
} from '@heroicons/react/24/outline';

type TabType = 'summary' | 'sales' | 'debts' | 'inventory' | 'forms' | 'bank-ledger';

export default function ReportsPage(props?: { noLayout?: boolean }) {
  const noLayout = props?.noLayout;
  const [activeTab, setActiveTab] = useState<TabType>('summary');
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState<Report | null>(null);
  const [sales, setSales] = useState<Sale[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [bankTransactions, setBankTransactions] = useState<BankTransaction[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [showAddAccountModal, setShowAddAccountModal] = useState(false);
  const [showAddTransactionModal, setShowAddTransactionModal] = useState(false);
  const [bankAccountForm, setBankAccountForm] = useState({ accountNumber: '', bankName: '', accountType: 'current' as 'current' | 'savings' | 'other', initialBalance: '' });
  const [bankTransactionForm, setBankTransactionForm] = useState({ date: new Date().toISOString().split('T')[0], type: 'received' as 'received' | 'paid', amount: '', description: '' });
  const [transactionToDelete, setTransactionToDelete] = useState<BankTransaction | null>(null);
  const [isSavingBank, setIsSavingBank] = useState(false);
  const { showToast, ToastContainer } = useToast();

  useEffect(() => {
    loadSummary();
    loadSales();
    loadDebts();
    loadInventory();
    loadBankAccounts();
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    if (selectedAccount) {
      loadBankTransactions(selectedAccount);
    } else {
      setBankTransactions([]);
    }
  }, [selectedAccount]);

  const loadSummary = async () => {
    try {
      const res = await fetch(`/api/reports/summary?month=${selectedMonth}&year=${selectedYear}`);
      if (res.ok) {
        const data = await res.json();
        setReport(data);
      }
    } catch (error) {
      console.error('Error loading summary:', error);
    }
  };

  const loadSales = async () => {
    try {
      const res = await fetch(`/api/reports/sales?month=${selectedMonth}&year=${selectedYear}`);
      if (res.ok) {
        const data = await res.json();
        setSales(data.sales || []);
      }
    } catch (error) {
      console.error('Error loading sales:', error);
    }
  };

  const loadDebts = async () => {
    try {
      const res = await fetch('/api/debts');
      if (res.ok) {
        setDebts(await res.json());
      }
    } catch (error) {
      console.error('Error loading debts:', error);
    }
  };

  const loadInventory = async () => {
    try {
      const [inventoryRes, productsRes] = await Promise.all([
        fetch('/api/inventory'),
        fetch('/api/products'),
      ]);
      if (inventoryRes.ok) {
        setInventory(await inventoryRes.json());
      }
      if (productsRes.ok) {
        setProducts(await productsRes.json());
      }
    } catch (error) {
      console.error('Error loading inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadBankAccounts = async () => {
    try {
      const res = await fetch('/api/bank-accounts');
      if (res.ok) {
        setBankAccounts(await res.json());
      }
    } catch (error) {
      console.error('Error loading bank accounts:', error);
    }
  };

  const loadBankTransactions = async (accountId: string) => {
    try {
      const res = await fetch(`/api/bank-transactions?accountId=${accountId}`);
      if (res.ok) {
        setBankTransactions(await res.json());
      }
    } catch (error) {
      console.error('Error loading bank transactions:', error);
    }
  };

  const handleAddBankAccount = async () => {
    if (!bankAccountForm.accountNumber.trim() || !bankAccountForm.bankName.trim()) {
      showToast('شماره حساب و نام بانک الزامی است', 'warning');
      return;
    }
    const initialBalance = parseFloat(bankAccountForm.initialBalance) || 0;
    try {
      setIsSavingBank(true);
      const res = await fetch('/api/bank-accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountNumber: bankAccountForm.accountNumber,
          bankName: bankAccountForm.bankName,
          accountType: bankAccountForm.accountType,
          initialBalance,
        }),
      });
      if (res.ok) {
        showToast('حساب بانکی با موفقیت اضافه شد', 'success');
        setShowAddAccountModal(false);
        setBankAccountForm({ accountNumber: '', bankName: '', accountType: 'current', initialBalance: '' });
        loadBankAccounts();
      } else {
        const err = await res.json();
        showToast(err.message || 'خطا در افزودن حساب', 'error');
      }
    } catch (error) {
      showToast('خطا در افزودن حساب بانکی', 'error');
    } finally {
      setIsSavingBank(false);
    }
  };

  const handleAddBankTransaction = async () => {
    if (!selectedAccount) return;
    const amount = parseFloat(bankTransactionForm.amount);
    if (!amount || amount <= 0) {
      showToast('مبلغ را وارد کنید', 'warning');
      return;
    }
    const debit = bankTransactionForm.type === 'paid' ? amount : undefined;
    const credit = bankTransactionForm.type === 'received' ? amount : undefined;
    try {
      setIsSavingBank(true);
      const account = bankAccounts.find((a) => a.id === selectedAccount);
      const res = await fetch('/api/bank-transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountId: selectedAccount,
          accountNumber: account?.accountNumber || '',
          date: new Date(bankTransactionForm.date).toISOString(),
          type: bankTransactionForm.type,
          debit,
          credit,
          description: bankTransactionForm.description || undefined,
        }),
      });
      if (res.ok) {
        showToast('تراکنش با موفقیت ثبت شد', 'success');
        setShowAddTransactionModal(false);
        setBankTransactionForm({ date: new Date().toISOString().split('T')[0], type: 'received', amount: '', description: '' });
        loadBankTransactions(selectedAccount);
        loadBankAccounts();
      } else {
        const err = await res.json();
        showToast(err.message || 'خطا در ثبت تراکنش', 'error');
      }
    } catch (error) {
      showToast('خطا در ثبت تراکنش', 'error');
    } finally {
      setIsSavingBank(false);
    }
  };

  const handleDeleteBankTransaction = async () => {
    if (!transactionToDelete) return;
    try {
      setIsSavingBank(true);
      const res = await fetch(`/api/bank-transactions/${transactionToDelete.id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('تراکنش حذف شد', 'success');
        setTransactionToDelete(null);
        if (selectedAccount) loadBankTransactions(selectedAccount);
        loadBankAccounts();
      } else {
        const err = await res.json();
        showToast(err.message || 'خطا در حذف تراکنش', 'error');
      }
    } catch (error) {
      showToast('خطا در حذف تراکنش', 'error');
    } finally {
      setIsSavingBank(false);
    }
  };

  const handleExport = async (type: 'excel' | 'pdf', reportType: TabType) => {
    try {
      if (reportType === 'summary' && report) {
        exportSummaryReport({
          monthlySales: report.monthlySales || 0,
          previousMonthlySales: 0, // You may need to calculate this
          workingCapital: report.workingCapital || 0,
          totalInventory: report.totalInventory || 0,
          totalDebts: report.totalDebts || 0,
          bestSellingMonth: report.bestSellingMonth,
        }, type);
        showToast('گزارش خلاصه با موفقیت دانلود شد', 'success');
      } else if (reportType === 'sales') {
        exportToExcel({ sales }, 'گزارش_فروش');
        if (type === 'pdf') {
          exportToPDF({ sales }, 'گزارش_فروش');
        }
        showToast('گزارش فروش با موفقیت دانلود شد', 'success');
      } else if (reportType === 'debts') {
        exportToExcel({ debts }, 'گزارش_طلب');
        if (type === 'pdf') {
          exportToPDF({ debts }, 'گزارش_طلب');
        }
        showToast('گزارش طلب با موفقیت دانلود شد', 'success');
      } else if (reportType === 'inventory') {
        exportToExcel({ inventory, products }, 'گزارش_موجودی');
        if (type === 'pdf') {
          exportToPDF({ inventory, products }, 'گزارش_موجودی');
        }
        showToast('گزارش موجودی با موفقیت دانلود شد', 'success');
      } else if (reportType === 'bank-ledger' && selectedAccount) {
        const res = await fetch(`/api/bank-ledger/export?accountId=${selectedAccount}&format=${type}`);
        if (res.ok) {
          const data = await res.json();
          if (type === 'excel') {
            exportBankLedgerToExcel(data.transactions, data.account);
          } else {
            exportBankLedgerToPDF(data.transactions, data.account);
          }
          showToast('دفتر بانک با موفقیت دانلود شد', 'success');
        }
      }
    } catch (error) {
      showToast('خطا در دانلود گزارش', 'error');
      console.error('Export error:', error);
    }
  };

  const tabs = [
    { id: 'summary' as TabType, label: 'خلاصه', icon: CurrencyDollarIcon },
    { id: 'sales' as TabType, label: 'فروش‌ها', icon: CurrencyDollarIcon },
    { id: 'debts' as TabType, label: 'طلب‌ها', icon: BanknotesIcon },
    { id: 'inventory' as TabType, label: 'موجودی', icon: CubeIcon },
    { id: 'forms' as TabType, label: 'فرم‌ها', icon: DocumentArrowDownIcon },
    { id: 'bank-ledger' as TabType, label: 'دفتر بانک', icon: BanknotesIcon },
  ];

  if (loading && activeTab === 'summary') {
    const loader = <div className="flex items-center justify-center min-h-screen"><LoadingSpinner size="lg" /></div>;
    if (noLayout) return loader;
    return <DashboardLayout title="گزارش‌ها">{loader}</DashboardLayout>;
  }

  const content = (
    <>
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
                    ? 'bg-yellow-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Date Filter */}
        <div className="flex gap-4 items-center">
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-gray-600" />
            <label className="text-sm font-medium">ماه:</label>
            <Input
              type="number"
              min="1"
              max="12"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="w-20"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">سال:</label>
            <Input
              type="number"
              min="1400"
              max="1500"
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="w-24"
            />
          </div>
        </div>

        {/* Summary Tab */}
        {activeTab === 'summary' && report && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">گزارش خلاصه</h2>
              <div className="flex gap-2">
                <Button onClick={() => handleExport('excel', 'summary')} className="bg-green-600 hover:bg-green-700">
                  <DocumentArrowDownIcon className="h-5 w-5 ml-2" />
                  خروجی Excel
                </Button>
                <Button onClick={() => handleExport('pdf', 'summary')} className="bg-red-600 hover:bg-red-700">
                  <DocumentArrowDownIcon className="h-5 w-5 ml-2" />
                  خروجی PDF
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>فروش ماه جاری</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-yellow-600">
                    {(report.monthlySales || 0).toLocaleString('fa-IR')} تومان
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>سرمایه در گردش</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-blue-600">
                    {(report.workingCapital || 0).toLocaleString('fa-IR')} تومان
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>موجودی کل</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-green-600">
                    {(report.totalInventory || 0).toLocaleString('fa-IR')} تومان
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>مجموع طلب‌ها</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-red-600">
                    {(report.totalDebts || 0).toLocaleString('fa-IR')} تومان
                  </p>
                </CardContent>
              </Card>
            </div>

            {report.bestSellingMonth && (
              <Card>
                <CardHeader>
                  <CardTitle>پر فروش‌ترین ماه</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg">
                    {report.bestSellingMonth.month}/{report.bestSellingMonth.year} - 
                    {report.bestSellingMonth.sales.toLocaleString('fa-IR')} تومان
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Sales Tab */}
        {activeTab === 'sales' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">گزارش فروش‌ها</h2>
              <div className="flex gap-2">
                <Button onClick={() => handleExport('excel', 'sales')} className="bg-green-600 hover:bg-green-700">
                  <DocumentArrowDownIcon className="h-5 w-5 ml-2" />
                  خروجی Excel
                </Button>
                <Button onClick={() => handleExport('pdf', 'sales')} className="bg-red-600 hover:bg-red-700">
                  <DocumentArrowDownIcon className="h-5 w-5 ml-2" />
                  خروجی PDF
                </Button>
              </div>
            </div>

            {sales.length > 0 ? (
              <>
                <Card>
                  <CardContent className="p-6">
                    <SalesChart sales={sales} type="monthly" currentMonth={selectedMonth} currentYear={selectedYear} />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>لیست فروش‌ها</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-right">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="p-3 text-sm font-semibold">مشتری</th>
                            <th className="p-3 text-sm font-semibold">مبلغ</th>
                            <th className="p-3 text-sm font-semibold">تاریخ</th>
                            <th className="p-3 text-sm font-semibold">تعداد محصولات</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sales.map((sale) => (
                            <tr key={sale.id} className="border-b border-gray-100 hover:bg-gray-50">
                              <td className="p-3">{sale.customerName}</td>
                              <td className="p-3">{sale.amount.toLocaleString('fa-IR')} تومان</td>
                              <td className="p-3">{toPersianDate(new Date(sale.date))}</td>
                              <td className="p-3">{sale.items?.length || 0}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <EmptyState title="فروشی یافت نشد" />
            )}
          </div>
        )}

        {/* Debts Tab */}
        {activeTab === 'debts' && (
          <div className="space-y-6">
            <DebtForm 
              onSuccess={() => {
                loadDebts();
                loadSummary();
                showToast('بدهی با موفقیت ثبت شد', 'success');
              }}
              showToast={showToast}
            />
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">لیست طلب‌ها</h2>
              <div className="flex gap-2">
                <Button onClick={() => handleExport('excel', 'debts')} className="bg-green-600 hover:bg-green-700">
                  <DocumentArrowDownIcon className="h-5 w-5 ml-2" />
                  خروجی Excel
                </Button>
                <Button onClick={() => handleExport('pdf', 'debts')} className="bg-red-600 hover:bg-red-700">
                  <DocumentArrowDownIcon className="h-5 w-5 ml-2" />
                  خروجی PDF
                </Button>
              </div>
            </div>

            {debts.length > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle>لیست طلب‌ها</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-right">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="p-3 text-sm font-semibold">مشتری</th>
                          <th className="p-3 text-sm font-semibold">مبلغ</th>
                          <th className="p-3 text-sm font-semibold">تاریخ سررسید</th>
                          <th className="p-3 text-sm font-semibold">وضعیت</th>
                        </tr>
                      </thead>
                      <tbody>
                        {debts.map((debt) => (
                          <tr key={debt.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="p-3">{debt.customerName}</td>
                            <td className="p-3">{debt.amount.toLocaleString('fa-IR')} تومان</td>
                            <td className="p-3">{toPersianDate(new Date(debt.dueDate))}</td>
                            <td className="p-3">
                              <span className={`px-2 py-1 rounded text-xs ${
                                debt.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {debt.status === 'paid' ? 'پرداخت شده' : 'در انتظار'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <EmptyState title="طلبی یافت نشد" />
            )}
          </div>
        )}

        {/* Inventory Tab */}
        {activeTab === 'inventory' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">گزارش موجودی</h2>
              <div className="flex gap-2">
                <Button onClick={() => handleExport('excel', 'inventory')} className="bg-green-600 hover:bg-green-700">
                  <DocumentArrowDownIcon className="h-5 w-5 ml-2" />
                  خروجی Excel
                </Button>
                <Button onClick={() => handleExport('pdf', 'inventory')} className="bg-red-600 hover:bg-red-700">
                  <DocumentArrowDownIcon className="h-5 w-5 ml-2" />
                  خروجی PDF
                </Button>
              </div>
            </div>

            {inventory.length > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle>لیست موجودی</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-right">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="p-3 text-sm font-semibold">محصول</th>
                          <th className="p-3 text-sm font-semibold">تعداد</th>
                          <th className="p-3 text-sm font-semibold">قیمت خرید</th>
                          <th className="p-3 text-sm font-semibold">ارزش کل</th>
                        </tr>
                      </thead>
                      <tbody>
                        {inventory.map((item) => (
                          <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="p-3">{item.productName}</td>
                            <td className="p-3">{item.quantity}</td>
                            <td className="p-3">{(item.purchasePrice || 0).toLocaleString('fa-IR')} تومان</td>
                            <td className="p-3">{(item.quantity * (item.purchasePrice || 0)).toLocaleString('fa-IR')} تومان</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <EmptyState title="موجودی یافت نشد" />
            )}
          </div>
        )}

        {/* Forms Tab */}
        {activeTab === 'forms' && (
          <div className="space-y-6">
            <SaleForm 
              onSuccess={() => {
                loadSales();
                loadSummary();
                showToast('فروش با موفقیت ثبت شد', 'success');
              }}
              showToast={showToast}
            />
          </div>
        )}

        {/* Bank Ledger Tab */}
        {activeTab === 'bank-ledger' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center flex-wrap gap-2">
              <h2 className="text-xl font-bold">دفتر بانک</h2>
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    setBankAccountForm({ accountNumber: '', bankName: '', accountType: 'current', initialBalance: '' });
                    setShowAddAccountModal(true);
                  }}
                  className="flex items-center gap-2"
                >
                  <PlusIcon className="h-5 w-5" />
                  افزودن حساب بانکی
                </Button>
                {selectedAccount && (
                  <>
                    <Button
                      onClick={() => {
                        setBankTransactionForm({ date: new Date().toISOString().split('T')[0], type: 'received', amount: '', description: '' });
                        setShowAddTransactionModal(true);
                      }}
                      className="flex items-center gap-2"
                    >
                      <PlusIcon className="h-5 w-5" />
                      افزودن تراکنش
                    </Button>
                    <Button onClick={() => handleExport('excel', 'bank-ledger')} className="bg-green-600 hover:bg-green-700">
                      <DocumentArrowDownIcon className="h-5 w-5 ml-2" />
                      Excel
                    </Button>
                    <Button onClick={() => handleExport('pdf', 'bank-ledger')} className="bg-red-600 hover:bg-red-700">
                      <DocumentArrowDownIcon className="h-5 w-5 ml-2" />
                      PDF
                    </Button>
                  </>
                )}
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>انتخاب حساب بانکی</CardTitle>
              </CardHeader>
              <CardContent>
                <select
                  value={selectedAccount}
                  onChange={(e) => setSelectedAccount(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                >
                  <option value="">انتخاب کنید...</option>
                  {bankAccounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.bankName} - {account.accountNumber}
                    </option>
                  ))}
                </select>
              </CardContent>
            </Card>

            {selectedAccount && bankTransactions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>لیست تراکنش‌ها</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-right">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="p-3 text-sm font-semibold">ردیف</th>
                          <th className="p-3 text-sm font-semibold">تاریخ</th>
                          <th className="p-3 text-sm font-semibold">نوع</th>
                          <th className="p-3 text-sm font-semibold">بدهکار</th>
                          <th className="p-3 text-sm font-semibold">بستانکار</th>
                          <th className="p-3 text-sm font-semibold">مانده</th>
                          <th className="p-3 text-sm font-semibold">توضیح</th>
                          <th className="p-3 text-sm font-semibold">عملیات</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bankTransactions.map((t) => (
                          <tr key={t.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="p-3">{t.rowNumber}</td>
                            <td className="p-3">{toPersianDate(new Date(t.date))}</td>
                            <td className="p-3">{t.type === 'received' ? 'دریافت' : 'پرداخت'}</td>
                            <td className="p-3">{(t.debit || 0).toLocaleString('fa-IR')}</td>
                            <td className="p-3">{(t.credit || 0).toLocaleString('fa-IR')}</td>
                            <td className="p-3">{(t.balance || 0).toLocaleString('fa-IR')}</td>
                            <td className="p-3 text-sm text-gray-600">{t.description || '-'}</td>
                            <td className="p-3">
                              <div className="flex gap-1">
                                <button
                                  onClick={() => setTransactionToDelete(t)}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                  title="حذف"
                                >
                                  <TrashIcon className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}

            {selectedAccount && bankTransactions.length === 0 && (
              <EmptyState title="تراکنشی برای این حساب ثبت نشده" emoji="📒" />
            )}
          </div>
        )}

        {/* Add Bank Account Modal */}
        <Modal isOpen={showAddAccountModal} onClose={() => setShowAddAccountModal(false)} title="افزودن حساب بانکی">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">شماره حساب *</label>
              <Input value={bankAccountForm.accountNumber} onChange={(e) => setBankAccountForm({ ...bankAccountForm, accountNumber: e.target.value })} placeholder="6037-1234-5678-9012" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">نام بانک *</label>
              <Input value={bankAccountForm.bankName} onChange={(e) => setBankAccountForm({ ...bankAccountForm, bankName: e.target.value })} placeholder="بانک ملی" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">نوع حساب</label>
              <select className="w-full border rounded-lg p-2" value={bankAccountForm.accountType} onChange={(e) => setBankAccountForm({ ...bankAccountForm, accountType: e.target.value as 'current' | 'savings' | 'other' })}>
                <option value="current">جاری</option>
                <option value="savings">پس‌انداز</option>
                <option value="other">سایر</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">مانده اولیه (تومان)</label>
              <Input type="number" value={bankAccountForm.initialBalance} onChange={(e) => setBankAccountForm({ ...bankAccountForm, initialBalance: e.target.value })} placeholder="0" />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowAddAccountModal(false)} disabled={isSavingBank}>انصراف</Button>
              <Button onClick={handleAddBankAccount} disabled={isSavingBank}>{isSavingBank ? <LoadingSpinner size="sm" /> : 'ذخیره'}</Button>
            </div>
          </div>
        </Modal>

        {/* Add Bank Transaction Modal */}
        <Modal isOpen={showAddTransactionModal} onClose={() => setShowAddTransactionModal(false)} title="افزودن تراکنش">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">تاریخ *</label>
              <Input type="date" value={bankTransactionForm.date} onChange={(e) => setBankTransactionForm({ ...bankTransactionForm, date: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">نوع</label>
              <select className="w-full border rounded-lg p-2" value={bankTransactionForm.type} onChange={(e) => setBankTransactionForm({ ...bankTransactionForm, type: e.target.value as 'received' | 'paid' })}>
                <option value="received">دریافت</option>
                <option value="paid">پرداخت</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">مبلغ (تومان) *</label>
              <Input type="number" min="0" value={bankTransactionForm.amount} onChange={(e) => setBankTransactionForm({ ...bankTransactionForm, amount: e.target.value })} placeholder="0" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">توضیح</label>
              <Input value={bankTransactionForm.description} onChange={(e) => setBankTransactionForm({ ...bankTransactionForm, description: e.target.value })} placeholder="توضیحات (اختیاری)" />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowAddTransactionModal(false)} disabled={isSavingBank}>انصراف</Button>
              <Button onClick={handleAddBankTransaction} disabled={isSavingBank}>{isSavingBank ? <LoadingSpinner size="sm" /> : 'ذخیره'}</Button>
            </div>
          </div>
        </Modal>

        {/* Delete Transaction Confirm Modal */}
        <Modal isOpen={!!transactionToDelete} onClose={() => setTransactionToDelete(null)} title="حذف تراکنش">
          {transactionToDelete && (
            <div className="space-y-4">
              <p className="text-gray-700">آیا از حذف این تراکنش اطمینان دارید؟ این عمل قابل بازگشت نیست.</p>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setTransactionToDelete(null)} disabled={isSavingBank}>انصراف</Button>
                <Button variant="danger" onClick={handleDeleteBankTransaction} disabled={isSavingBank}>{isSavingBank ? <LoadingSpinner size="sm" /> : 'حذف'}</Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
      <ToastContainer />
    </>
  );
  if (noLayout) return content;
  return <DashboardLayout title="گزارش‌ها">{content}</DashboardLayout>;
}

// Sale Form Component
function SaleForm({ onSuccess, showToast }: { onSuccess: () => void; showToast: (msg: string, type: 'success' | 'error' | 'warning') => void }) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<string>('');
  const [saleDate, setSaleDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [items, setItems] = useState<Array<{ productId: string; quantity: number; unitPrice: number }>>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [customersRes, productsRes] = await Promise.all([
        fetch('/api/customers'),
        fetch('/api/products'),
      ]);

      if (customersRes.ok) {
        setCustomers(await customersRes.json());
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

  const addItem = () => {
    setItems([...items, { productId: '', quantity: 1, unitPrice: 0 }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: 'productId' | 'quantity' | 'unitPrice', value: string | number) => {
    const newItems = [...items];
    if (field === 'productId') {
      const product = products.find(p => p.id === value);
      newItems[index] = { ...newItems[index], productId: value as string, unitPrice: product?.finalPrice || 0 };
    } else {
      newItems[index][field] = value as number;
    }
    setItems(newItems);
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  };

  const handleSubmit = async () => {
    if (!selectedCustomer) {
      showToast('لطفاً مشتری را انتخاب کنید', 'warning');
      return;
    }

    if (items.length === 0) {
      showToast('لطفاً حداقل یک محصول اضافه کنید', 'warning');
      return;
    }

    const invalidItem = items.find(i => !i.productId || i.quantity < 1 || (i.unitPrice !== undefined && i.unitPrice < 0));
    if (invalidItem) {
      showToast('برای هر ردیف محصول را انتخاب کنید و تعداد معتبر وارد کنید', 'warning');
      return;
    }

    const customer = customers.find(c => c.id === selectedCustomer);
    if (!customer) return;

    try {
      setIsSubmitting(true);
      const res = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: selectedCustomer,
          customerName: `${customer.firstName} ${customer.lastName}`,
          amount: calculateTotal(),
          date: new Date(saleDate).toISOString(),
          items: items.map(item => {
            const product = products.find(p => p.id === item.productId);
            return {
              productId: item.productId,
              productName: product?.name || '',
              quantity: item.quantity,
              unitPrice: item.unitPrice,
            };
          }),
        }),
      });

      if (res.ok) {
        showToast('فروش با موفقیت ثبت شد', 'success');
        setSelectedCustomer('');
        setSaleDate(new Date().toISOString().split('T')[0]);
        setItems([]);
        onSuccess();
      } else {
        const error = await res.json();
        showToast(error.message || 'خطا در ثبت فروش', 'error');
      }
    } catch (error) {
      showToast('خطا در ثبت فروش', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner size="lg" />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>ثبت فروش جدید</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">مشتری *</label>
            <select
              className="w-full border rounded-lg p-2"
              value={selectedCustomer}
              onChange={(e) => setSelectedCustomer(e.target.value)}
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
            <label className="block text-sm font-medium mb-2">تاریخ فروش *</label>
            <Input
              type="date"
              value={saleDate}
              onChange={(e) => setSaleDate(e.target.value)}
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium">محصولات *</label>
            <Button onClick={addItem} size="sm" className="flex items-center gap-1">
              <PlusIcon className="h-4 w-4" />
              افزودن محصول
            </Button>
          </div>
          <div className="space-y-2">
            {items.map((item, index) => (
              <div key={index} className="flex items-center gap-2 p-3 border rounded-lg">
                <select
                  className="flex-1 border rounded p-2"
                  value={item.productId}
                  onChange={(e) => updateItem(index, 'productId', e.target.value)}
                >
                  <option value="">-- انتخاب محصول --</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} - {p.finalPrice?.toLocaleString('fa-IR')} تومان
                    </option>
                  ))}
                </select>
                <Input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                  className="w-24"
                  placeholder="تعداد"
                />
                <Input
                  type="number"
                  min="0"
                  value={item.unitPrice}
                  onChange={(e) => updateItem(index, 'unitPrice', parseInt(e.target.value) || 0)}
                  className="w-40"
                  placeholder="قیمت واحد"
                />
                <span className="text-sm font-medium w-32 text-left">
                  {(item.quantity * item.unitPrice).toLocaleString('fa-IR')} تومان
                </span>
                <button
                  onClick={() => removeItem(index)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            ))}
            {items.length === 0 && (
              <p className="text-gray-500 text-sm text-center py-4">
                هیچ محصولی اضافه نشده است
              </p>
            )}
          </div>
        </div>

        <div className="border-t pt-4">
          <div className="flex justify-between items-center mb-4">
            <span className="text-lg font-bold">مجموع:</span>
            <span className="text-xl font-bold text-yellow-600">
              {calculateTotal().toLocaleString('fa-IR')} تومان
            </span>
          </div>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !selectedCustomer || items.length === 0}
            className="w-full"
          >
            {isSubmitting ? <LoadingSpinner size="sm" /> : 'ثبت فروش'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Debt Form Component
function DebtForm({ onSuccess, showToast }: { onSuccess: () => void; showToast: (msg: string, type: 'success' | 'error' | 'warning') => void }) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [dueDate, setDueDate] = useState<string>(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [debtType, setDebtType] = useState<'received' | 'paid'>('received');
  const [status, setStatus] = useState<'pending' | 'paid'>('pending');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/customers');
      if (res.ok) {
        setCustomers(await res.json());
      }
    } catch (error) {
      showToast('خطا در بارگذاری مشتریان', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedCustomer) {
      showToast('لطفاً مشتری را انتخاب کنید', 'warning');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      showToast('لطفاً مبلغ را وارد کنید', 'warning');
      return;
    }

    if (!dueDate) {
      showToast('لطفاً تاریخ سررسید را وارد کنید', 'warning');
      return;
    }

    const customer = customers.find(c => c.id === selectedCustomer);
    if (!customer) return;

    try {
      setIsSubmitting(true);
      const res = await fetch('/api/debts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: selectedCustomer,
          customerName: `${customer.firstName} ${customer.lastName}`,
          amount: parseFloat(amount),
          dueDate: new Date(dueDate).toISOString(),
          type: debtType,
          status,
        }),
      });

      if (res.ok) {
        showToast('بدهی با موفقیت ثبت شد', 'success');
        setSelectedCustomer('');
        setAmount('');
        setDueDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
        setDebtType('received');
        setStatus('pending');
        onSuccess();
      } else {
        const error = await res.json();
        showToast(error.message || 'خطا در ثبت بدهی', 'error');
      }
    } catch (error) {
      showToast('خطا در ثبت بدهی', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner size="lg" />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>ثبت بدهی جدید</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">مشتری *</label>
            <select
              className="w-full border rounded-lg p-2"
              value={selectedCustomer}
              onChange={(e) => setSelectedCustomer(e.target.value)}
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
            <label className="block text-sm font-medium mb-2">نوع بدهی *</label>
            <select
              className="w-full border rounded-lg p-2"
              value={debtType}
              onChange={(e) => setDebtType(e.target.value as 'received' | 'paid')}
            >
              <option value="received">بدهکار به ما (دریافتی)</option>
              <option value="paid">بدهکار ما (پرداختی)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">مبلغ *</label>
            <Input
              type="number"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="مبلغ را به تومان وارد کنید"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">تاریخ سررسید *</label>
            <Input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">وضعیت</label>
          <select
            className="w-full border rounded-lg p-2"
            value={status}
            onChange={(e) => setStatus(e.target.value as 'pending' | 'paid')}
          >
            <option value="pending">در انتظار پرداخت</option>
            <option value="paid">پرداخت شده</option>
          </select>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || !selectedCustomer || !amount || !dueDate}
          className="w-full"
        >
          {isSubmitting ? <LoadingSpinner size="sm" /> : 'ثبت بدهی'}
        </Button>
      </CardContent>
    </Card>
  );
}
