export const APP_EVENTS = {
  locationChange: 'locationchange',
  pushState: 'pushstate',
  replaceState: 'replacestate',
  toggleConsolePreview: 'toggle-console-preview',
  colorThemeChanged: 'color-theme-changed',
  openAiPanel: 'inon-open-ai-panel',
} as const;

type AppEventDetailMap = {
  [APP_EVENTS.toggleConsolePreview]: { targetPath: string };
  [APP_EVENTS.colorThemeChanged]: { theme: string };
  [APP_EVENTS.locationChange]: undefined;
  [APP_EVENTS.pushState]: undefined;
  [APP_EVENTS.replaceState]: undefined;
  [APP_EVENTS.openAiPanel]: undefined;
};

export type AppEventName = keyof AppEventDetailMap;

export function dispatchAppEvent<K extends AppEventName>(
  eventName: K,
  detail: AppEventDetailMap[K],
  options: Omit<CustomEventInit<AppEventDetailMap[K]>, 'detail'> = {}
) {
  const event = new CustomEvent(eventName, {
    ...options,
    detail,
  });
  return window.dispatchEvent(event);
}

export function addAppEventListener<K extends AppEventName>(
  eventName: K,
  listener: (event: CustomEvent<AppEventDetailMap[K]>) => void
) {
  const handler = listener as EventListener;
  window.addEventListener(eventName, handler);
  return () => window.removeEventListener(eventName, handler);
}
