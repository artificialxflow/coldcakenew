import { cookies } from "next/headers";
import { verifyToken } from "./jwt";
import { prisma } from "../db/prisma";
import { AUTH_COOKIE_NAME } from "./constants";

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload) return null;

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    include: {
      role: {
        include: {
          rolePermissions: { include: { permission: true } },
        },
      },
    },
  });

  if (!user) return null;

  return user;
}

export type UserWithRole = Awaited<ReturnType<typeof getCurrentUser>>;

export function getUserPermissionKeys(user: NonNullable<UserWithRole>): string[] {
  if (!user.role?.rolePermissions) return [];
  return user.role.rolePermissions.map((rp) => rp.permission.key);
}


