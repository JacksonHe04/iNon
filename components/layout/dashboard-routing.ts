import { DASHBOARD_TABS, type DashboardTabId } from './DashboardSideNav';

export function getDashboardTabFromPath(pathname: string): DashboardTabId {
  if (pathname.endsWith('/home')) return 'home';
  if (pathname.endsWith('/content')) return 'content';
  if (pathname.endsWith('/library')) return 'library';
  if (pathname.endsWith('/website')) return 'canvas';
  if (pathname.endsWith('/messages')) return 'messages';
  if (pathname.endsWith('/analytics')) return 'analytics';
  if (pathname.endsWith('/account')) return 'account';
  return 'home';
}

export function getDashboardPathForTab(tabId: DashboardTabId): string {
  if (tabId === 'home') {
    return '/home';
  }
  return DASHBOARD_TABS.find((tab) => tab.id === tabId)?.path ?? '';
}
