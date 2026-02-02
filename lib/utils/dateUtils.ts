import { toJalaali, toGregorian } from 'jalaali-js';

/**
 * تبدیل تاریخ میلادی به شمسی
 */
export function toPersianDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const jDate = toJalaali(d.getFullYear(), d.getMonth() + 1, d.getDate());
  return `${jDate.jy}/${String(jDate.jm).padStart(2, '0')}/${String(jDate.jd).padStart(2, '0')}`;
}

/**
 * تبدیل تاریخ شمسی به میلادی
 */
export function fromPersianDate(persianDate: string): Date {
  const [year, month, day] = persianDate.split('/').map(Number);
  const gDate = toGregorian(year, month, day);
  return new Date(gDate.gy, gDate.gm - 1, gDate.gd);
}

/**
 * تبدیل تاریخ میلادی به شمسی با فرمت کامل
 */
export function toPersianDateFull(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const jDate = toJalaali(d.getFullYear(), d.getMonth() + 1, d.getDate());
  const months = [
    'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
    'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
  ];
  return `${jDate.jd} ${months[jDate.jm - 1]} ${jDate.jy}`;
}

/**
 * تبدیل تاریخ میلادی به شمسی با فرمت برای input
 */
export function toPersianDateInput(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const jDate = toJalaali(d.getFullYear(), d.getMonth() + 1, d.getDate());
  return `${jDate.jy}-${String(jDate.jm).padStart(2, '0')}-${String(jDate.jd).padStart(2, '0')}`;
}

/**
 * تبدیل تاریخ شمسی از input به میلادی
 */
export function fromPersianDateInput(persianDate: string): Date {
  const [year, month, day] = persianDate.split('-').map(Number);
  const gDate = toGregorian(year, month, day);
  return new Date(gDate.gy, gDate.gm - 1, gDate.gd);
}

/**
 * دریافت تاریخ امروز به شمسی
 */
export function getTodayPersian(): string {
  return toPersianDate(new Date());
}

/**
 * دریافت تاریخ امروز به شمسی برای input
 */
export function getTodayPersianInput(): string {
  return toPersianDateInput(new Date());
}
