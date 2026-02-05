import Link from "next/link";

const navLinkClass =
  "text-gray-600 hover:text-yellow-600 transition-colors";

export default function StoreNavbar() {
  return (
    <header className="bg-white border-b border-gray-200 py-3">
      <div className="container mx-auto px-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-gray-900">
          فروشگاه کولدکیک
        </Link>
        <nav className="flex items-center gap-4 text-sm font-medium">
          <Link href="/" className={navLinkClass}>
            خانه
          </Link>
          <Link href="/store/products" className={navLinkClass}>
            محصولات
          </Link>
          <Link href="/store/cart" className={navLinkClass}>
            سبد خرید
          </Link>
          <Link href="/auth/login" className="text-yellow-600 hover:text-yellow-700">
            ورود / حساب کاربری
          </Link>
        </nav>
      </div>
    </header>
  );
}
