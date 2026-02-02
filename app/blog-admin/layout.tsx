import { ReactNode } from 'react';

export const dynamic = 'force-dynamic';

export default function BlogAdminLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
