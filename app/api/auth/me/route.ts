import { NextResponse } from "next/server";
import { getCurrentUser, getUserPermissionKeys } from "@/lib/auth/server";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  const permissionKeys = getUserPermissionKeys(user);
  const isAdmin = user.role?.name === 'admin';

  return NextResponse.json({
    user: {
      id: user.id,
      phone: user.phone,
      username: user.username,
      email: user.email,
      role: user.role ? { id: user.role.id, name: user.role.name } : null,
      permissionKeys: isAdmin ? ['*'] : permissionKeys,
    },
  });
}


