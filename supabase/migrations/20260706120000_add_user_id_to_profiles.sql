-- 为 profiles 绑定登录用户：一个 auth 用户拥有一个 profile（slug 即路径名，可编辑）
alter table public.profiles
  add column if not exists user_id uuid references auth.users(id) on delete set null;

create unique index if not exists profiles_user_id_key
  on public.profiles (user_id)
  where user_id is not null;

-- 回填：把现有 profile 与其对应的登录账号绑定
-- JacksonHe04 对应 admin_users 白名单账号
update public.profiles p
set user_id = a.user_id
from public.admin_users a
where p.slug = 'JacksonHe04'
  and a.user_id is not null
  and p.user_id is null;
