import type { ValueRow } from '@/types/database';

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
const cityCoordinates: Record<string, { lat: number; lon: number }> = {
  上海: { lat: 31.2304, lon: 121.4737 },
  北京: { lat: 39.9042, lon: 116.4074 },
  广州: { lat: 23.1291, lon: 113.2644 },
  深圳: { lat: 22.5431, lon: 114.0579 },
  杭州: { lat: 30.2741, lon: 120.1551 },
  南京: { lat: 31.8900, lon: 118.8130 },
  青阳: { lat: 30.6386, lon: 117.8648 },
};

// 获取城市坐标
export function getCityCoordinates(city: string): { lat: number; lon: number } | null {
  return cityCoordinates[city] || null;
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
