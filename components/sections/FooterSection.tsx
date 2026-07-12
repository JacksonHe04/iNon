'use client';

import { useState, useEffect } from 'react';
import GlassCard from '../GlassCard';
import type { ReadmeData } from '@/types';
import { getAuthorNickname } from '@/lib/utils';

interface FooterSectionProps {
  data?: ReadmeData;
}

export default function FooterSection({ data }: FooterSectionProps) {
  const [visitCount, setVisitCount] = useState(0);
  const [uptime, setUptime] = useState('0 秒');
  
  const nickname = data ? getAuthorNickname(data.basic.name) : 'default';
  const visitStorageKey = `inon-visit-count-${nickname}`;


  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = Number(window.localStorage.getItem(visitStorageKey) ?? '0');
    const nextCount = stored + 1;
    setVisitCount(nextCount);
    window.localStorage.setItem(visitStorageKey, String(nextCount));
  }, [visitStorageKey]);

  useEffect(() => {
    // 从指定日期时间开始计时：Nov 12, 2025, 4:01:29 AM GMT+8
    const start = new Date('Nov 12, 2025, 4:59:35 AM GMT+8').getTime();
    const tick = () => {
      const diff = Date.now() - start;
      setUptime(formatDuration(diff));
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatDuration = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    if (days > 0) {
      return `${days} 天 ${hours} 小时 ${minutes} 分 ${seconds} 秒`;
    }
    if (hours > 0) {
      return `${hours} 小时 ${minutes} 分 ${seconds} 秒`;
    }
    return `${minutes} 分 ${seconds} 秒`;
  };

  const techStack = ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'Three.js', 'Framer Motion'];
  const designConcept = '用创新的交互方式，让信息在视觉美感中自然流动。';

  return (
    <footer className="py-8 px-4 bg-gradient-to-b from-transparent to-gray-100 dark:to-gray-900">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <GlassCard>
            <h3 className="font-semibold mb-2">访问次数</h3>
            <p className="text-2xl font-bold text-blue-500">{visitCount.toLocaleString()}</p>
          </GlassCard>

          <GlassCard>
            <h3 className="font-semibold mb-2">网站运行时长</h3>
            <p className="text-2xl font-bold text-green-500">{uptime}</p>
          </GlassCard>

          <GlassCard>
            <h3 className="font-semibold mb-2">更新日期</h3>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              {new Date().toLocaleDateString('zh-CN')}
            </p>
          </GlassCard>

          <GlassCard className="md:col-span-2">
            <h3 className="font-semibold mb-2">网站技术栈</h3>
            <div className="flex flex-wrap gap-2">
              {techStack.map((tech, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-white/20 rounded-full text-sm"
                >
                  {tech}
                </span>
              ))}
            </div>
          </GlassCard>

          <GlassCard>
            <h3 className="font-semibold mb-2">设计理念</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {designConcept}
            </p>
          </GlassCard>

          <GlassCard className="md:col-span-3">
            <h3 className="font-semibold mb-2">致谢</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              感谢所有支持这个项目的朋友和开源社区。特别感谢 Next.js、React、Three.js 等优秀开源项目的贡献者。
            </p>
          </GlassCard>
        </div>
      </div>
    </footer>
  );
}
