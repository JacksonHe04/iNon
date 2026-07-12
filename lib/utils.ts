import type { ValueRow } from '@/types/database';

type CityCoordinates = { lat: number; lon: number };
const cityCoordinatesCache = new Map<string, CityCoordinates | null>();

function normalizeCityKey(city: string): string {
  return city.trim().replace(/\s+/g, '').replace(/[市區区县縣]$/, '');
}

// 计算年龄
export function calculateAge(birthDate: string): number {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

// 计算今年过去的天数/总天数（用于年龄进度条）
export function getYearProgress(): { daysPassed: number; totalDays: number; percentage: number } {
  const today = new Date();
  const yearStart = new Date(today.getFullYear(), 0, 1);
  const yearEnd = new Date(today.getFullYear() + 1, 0, 1);
  const totalDays = Math.floor((yearEnd.getTime() - yearStart.getTime()) / (1000 * 60 * 60 * 24));
  const daysPassed = Math.floor((today.getTime() - yearStart.getTime()) / (1000 * 60 * 60 * 24));
  const percentage = (daysPassed / totalDays) * 100;
  return { daysPassed, totalDays, percentage };
}

// 计算两点之间的距离（使用 Haversine 公式）
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // 地球半径（公里）
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// 获取用户位置（需要用户授权）
export async function getUserLocation(): Promise<{ lat: number; lon: number } | null> {
  if (!navigator.geolocation) {
    return null;
  }
  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
      },
      () => resolve(null)
    );
  });
}

// 城市坐标映射（简化版，实际应该使用地理编码API）
const cityCoordinates: Record<string, CityCoordinates> = {
  上海: { lat: 31.2304, lon: 121.4737 },
  北京: { lat: 39.9042, lon: 116.4074 },
  广州: { lat: 23.1291, lon: 113.2644 },
  深圳: { lat: 22.5431, lon: 114.0579 },
  杭州: { lat: 30.2741, lon: 120.1551 },
  南京: { lat: 31.8900, lon: 118.8130 },
  青阳: { lat: 30.6386, lon: 117.8648 },
};

// 获取城市坐标
export function getCityCoordinates(city: string): CityCoordinates | null {
  const normalized = normalizeCityKey(city);
  return cityCoordinates[normalized] || cityCoordinates[city] || null;
}

export async function resolveCityCoordinates(city: string): Promise<CityCoordinates | null> {
  const normalized = normalizeCityKey(city);
  if (!normalized) return null;

  const localMatch = getCityCoordinates(normalized);
  if (localMatch) return localMatch;

  if (cityCoordinatesCache.has(normalized)) {
    return cityCoordinatesCache.get(normalized) || null;
  }

  const storageKey = `inon-city-coordinates:${normalized}`;
  if (typeof window !== 'undefined') {
    try {
      const cached = window.localStorage.getItem(storageKey);
      if (cached) {
        const parsed = JSON.parse(cached) as CityCoordinates;
        if (typeof parsed.lat === 'number' && typeof parsed.lon === 'number') {
          cityCoordinatesCache.set(normalized, parsed);
          return parsed;
        }
      }
    } catch {
      // ignore stale cache
    }
  }

  try {
    const url = new URL('https://geocoding-api.open-meteo.com/v1/search');
    url.searchParams.set('name', city);
    url.searchParams.set('count', '1');
    url.searchParams.set('language', 'zh');
    url.searchParams.set('format', 'json');

    const response = await fetch(url.toString());
    if (!response.ok) return null;

    const payload = (await response.json()) as {
      results?: Array<{ latitude?: number; longitude?: number }>;
    };
    const result = payload.results?.[0];
    if (typeof result?.latitude !== 'number' || typeof result?.longitude !== 'number') {
      return null;
    }

    const coords = { lat: result.latitude, lon: result.longitude };
    cityCoordinatesCache.set(normalized, coords);
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(storageKey, JSON.stringify(coords));
      } catch {
        // ignore cache write failures
      }
    }
    return coords;
  } catch {
    return null;
  }
}

// 获取当前时间字符串
export function getCurrentTime(): string {
  const now = new Date();
  return now.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

// 滚动到元素
export function scrollToElement(elementId: string) {
  const element = document.getElementById(elementId);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

// 从作者名字中提取简称/昵称
export function getAuthorNickname(name: string): string {
  if (!name) return '作者';
  // 提取 `｜`、`的`、空格前面的字符
  const raw = name.split('｜')[0].split('的')[0].split(' ')[0].trim();
  return raw || name;
}
