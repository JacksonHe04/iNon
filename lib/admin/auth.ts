import {
  getInonProjectAdminSession,
  requireInonProjectAdmin,
} from "@/lib/sso/project-session";

export type AdminContext = {
  user: {
    id: string;
    email: string;
  };
};

export async function getAdminContext(): Promise<AdminContext | null> {
  const session = await getInonProjectAdminSession();
  if (!session) {
    return null;
  }

  return {
    user: {
      id: session.id,
      email: session.email,
    },
  };
}

export async function requireAdminPage(
  next = "/admin",
): Promise<AdminContext> {
  const session = await requireInonProjectAdmin(next);
  return {
    user: {
      id: session.id,
      email: session.email,
    },
  };
}
