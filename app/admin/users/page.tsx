'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Modal, useToast, LoadingSpinner } from '@/components/ui';

interface Role {
  id: string;
  name: string;
  description: string | null;
}

interface User {
  id: string;
  username: string | null;
  email: string | null;
  phone: string | null;
  role: { id: string; name: string } | null;
  createdAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ username: '', email: '', password: '', roleId: '' });
  const { showToast, ToastContainer } = useToast();

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      setLoading(true);
      const [usersRes, rolesRes] = await Promise.all([
        fetch('/api/admin/users', { credentials: 'include' }),
        fetch('/api/admin/roles', { credentials: 'include' }),
      ]);
      if (usersRes.ok) setUsers(await usersRes.json());
      if (rolesRes.ok) setRoles(await rolesRes.json());
    } catch (e) {
      showToast('خطا در بارگذاری', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!form.username.trim() || !form.password) {
      showToast('نام کاربری و رمز عبور الزامی است', 'warning');
      return;
    }
    try {
      setSaving(true);
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: form.username.trim(),
          email: form.email.trim() || undefined,
          password: form.password,
          roleId: form.roleId || undefined,
        }),
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'خطا در ایجاد کاربر');
      showToast('کاربر با موفقیت اضافه شد', 'success');
      setShowAddModal(false);
      setForm({ username: '', email: '', password: '', roleId: '' });
      load();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'خطا', 'error');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[40vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>کاربران پنل</CardTitle>
              <Button onClick={() => setShowAddModal(true)}>افزودن کاربر</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {users.map((u) => (
                <div
                  key={u.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div>
                    <p className="font-medium">{u.username ?? u.phone ?? u.email ?? u.id}</p>
                    <p className="text-sm text-gray-500">
                      {u.email && <span>{u.email}</span>}
                      {u.phone && <span className="mr-2"> | {u.phone}</span>}
                      {u.role && <span className="mr-2"> | نقش: {u.role.name}</span>}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="افزودن کاربر"
      >
        <form onSubmit={handleAdd} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">نام کاربری *</label>
            <Input
              value={form.username}
              onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
              placeholder="username"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">ایمیل</label>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              placeholder="email@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">رمز عبور *</label>
            <Input
              type="password"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              placeholder="••••••••"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">نقش</label>
            <select
              className="w-full border rounded-lg p-2"
              value={form.roleId}
              onChange={(e) => setForm((f) => ({ ...f, roleId: e.target.value }))}
            >
              <option value="">بدون نقش</option>
              {roles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} {r.description ? `- ${r.description}` : ''}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => setShowAddModal(false)} disabled={saving}>
              انصراف
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? <LoadingSpinner size="sm" /> : 'ذخیره'}
            </Button>
          </div>
        </form>
      </Modal>

      <ToastContainer />
    </>
  );
}
