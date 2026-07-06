import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

type AdminUserRow = {
  id: string;
  email: string;
  user_id: string | null;
  is_active: boolean;
  display_name: string | null;
};

export type AdminContext = {
  user: {
    id: string;
    email: string;
  };
  adminUser: AdminUserRow;
};

export async function getAdminContext(): Promise<AdminContext | null> {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user?.email) {
    return null;
  }

  const adminClient = createAdminClient();
  const email = user.email.toLowerCase();

  const { data: adminUser, error: adminError } = await adminClient
    .from('admin_users')
    .select('id, email, user_id, is_active, display_name')
    .or(`user_id.eq.${user.id},email.eq.${email}`)
    .eq('is_active', true)
    .maybeSingle();

  if (adminError || !adminUser) {
    return null;
  }

  if (!adminUser.user_id) {
    await adminClient
      .from('admin_users')
      .update({ user_id: user.id })
      .eq('id', adminUser.id);
  }

  return {
    user: {
      id: user.id,
      email: user.email,
    },
    adminUser,
  };
}

export async function requireAdminPage(next = '/admin') {
  const context = await getAdminContext();

  if (!context) {
    redirect(`/login?next=${encodeURIComponent(next)}`);
  }

  return context;
}
