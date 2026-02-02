import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, getUserPermissionKeys } from '../auth/server';

export async function requireAuth(request: NextRequest) {
  const user = await getCurrentUser();
  
  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized', message: 'لطفاً ابتدا وارد شوید.' },
      { status: 401 }
    );
  }
  
  return user;
}

export async function requirePermission(
  request: NextRequest,
  permissionKey: string
): Promise<ReturnType<typeof requireAuth>> {
  const user = await requireAuth(request);
  if (user instanceof NextResponse) return user;

  const keys = getUserPermissionKeys(user);
  const isAdmin = user.role?.name === 'admin';
  if (isAdmin || keys.includes(permissionKey)) return user;

  return NextResponse.json(
    { error: 'Forbidden', message: 'شما دسترسی به این بخش را ندارید.' },
    { status: 403 }
  );
}

export function withAuth(handler: (request: NextRequest, user: Awaited<ReturnType<typeof getCurrentUser>>) => Promise<NextResponse>) {
  return async (request: NextRequest) => {
    const user = await requireAuth(request);
    
    if (user instanceof NextResponse) {
      return user; // Return error response
    }
    
    return handler(request, user);
  };
}
