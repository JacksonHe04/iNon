import { inonLogoutPath } from '@/lib/sso/public-paths';

export default function AdminSignOutButton() {
  return (
    <a
      href={inonLogoutPath('/')}
      className="rounded-full bg-gray-900 px-3 py-1.5 text-sm text-white"
    >
      退出
    </a>
  );
}
