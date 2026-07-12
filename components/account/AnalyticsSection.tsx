'use client';

import { useMemo } from 'react';
import GlassCard from '@/components/GlassCard';
import {
  Activity,
  Globe2,
  Route as RouteIcon,
  Monitor,
  MapPin,
  Languages,
  Loader2,
} from 'lucide-react';
import {
  type AnalyticsSummaryRow,
  type AnalyticsTopRow,
  type AnalyticsTotals,
} from '@/lib/analytics/queries';

interface AnalyticsSectionProps {
  summary: AnalyticsSummaryRow[];
  totals: AnalyticsTotals;
  sources: AnalyticsTopRow[];
  paths: AnalyticsTopRow[];
  devices: AnalyticsTopRow[];
  browsers: AnalyticsTopRow[];
  countries: AnalyticsTopRow[];
}

const METRIC_LABELS: Record<string, string> = {
  direct: '直接访问',
  'unknown source': '未知来源',
};

function formatKey(key: string): string {
  if (!key) return '未知';
  if (key in METRIC_LABELS) return METRIC_LABELS[key]!;
  return key;
}

function formatDuration(ms: number): string {
  if (ms <= 0) return '0s';
  const sec = Math.floor(ms / 1000);
  if (sec < 60) return `${sec}s`;
  const min = Math.floor(sec / 60);
  const remainSec = sec % 60;
  if (min < 60) return `${min}m ${remainSec}s`;
  const hr = Math.floor(min / 60);
  return `${hr}h ${min % 60}m`;
}

export default function AnalyticsSection({
  summary,
  totals,
  sources,
  paths,
  devices,
  browsers,
  countries,
}: AnalyticsSectionProps) {
  const maxPv = useMemo(
    () => summary.reduce((m, r) => Math.max(m, r.pv), 0),
    [summary]
  );

  const empty = totals.total_pv === 0;

  return (
    <GlassCard className="p-6 space-y-6 border-white/20">
      <div className="flex items-center justify-between border-b border-white/20 pb-4">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-teal-500" />
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            数据观测（近 30 天）
          </h2>
        </div>
        <span className="text-[10px] font-mono px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
          Vercel Analytics · Supabase
        </span>
      </div>

      {empty ? (
        <div className="py-12 flex flex-col items-center gap-2 text-gray-500">
          <Loader2 className="w-6 h-6 text-gray-400" />
          <p className="text-sm">还没有访问数据，等待公开页被访问。</p>
          <p className="text-[11px] text-gray-400">
            统计在用户访问 <code className="font-mono">/:slug</code> 时自动写入。
          </p>
        </div>
      ) : (
        <>
          {/* Totals */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatTile label="总浏览量 (PV)" value={totals.total_pv.toLocaleString()} />
            <StatTile
              label="独立访客 (UV, 近似)"
              value={totals.total_uv.toLocaleString()}
              hint="按日独立访客最大值近似"
            />
            <StatTile
              label="总停留时长"
              value={formatDuration(totals.total_ms)}
            />
            <StatTile
              label="跳出率"
              value={`${(totals.avg_bounce * 100).toFixed(1)}%`}
              hint="单页会话占比"
            />
          </div>

          {/* Time series */}
          {summary.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                每日浏览趋势
              </h3>
              <TimeSeriesChart data={summary} maxPv={maxPv} />
            </div>
          )}

          {/* Top N grids */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TopList
              title="来源域名"
              icon={<Globe2 className="w-4 h-4" />}
              rows={sources}
              emptyText="无来源数据"
            />
            <TopList
              title="访问路径"
              icon={<RouteIcon className="w-4 h-4" />}
              rows={paths}
              emptyText="无路径数据"
              mono
            />
            <TopList
              title="设备类型"
              icon={<Monitor className="w-4 h-4" />}
              rows={devices}
              emptyText="无设备数据"
            />
            <TopList
              title="浏览器"
              icon={<Languages className="w-4 h-4" />}
              rows={browsers}
              emptyText="无浏览器数据"
            />
            <TopList
              title="国家/地区"
              icon={<MapPin className="w-4 h-4" />}
              rows={countries}
              emptyText="无地区数据（Vercel headers 可能未启用）"
            />
          </div>
        </>
      )}
    </GlassCard>
  );
}

function StatTile({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-xl bg-white/40 dark:bg-gray-800/40 p-4 border border-white/30 space-y-1">
      <p className="text-[10px] font-mono uppercase tracking-wider text-gray-500 dark:text-gray-400">
        {label}
      </p>
      <p className="text-xl font-bold text-gray-900 dark:text-white">{value}</p>
      {hint && <p className="text-[10px] text-gray-400">{hint}</p>}
    </div>
  );
}

function TimeSeriesChart({
  data,
  maxPv,
}: {
  data: AnalyticsSummaryRow[];
  maxPv: number;
}) {
  const height = 120;
  const width = 100;
  if (maxPv === 0) return null;

  const points = data
    .map((d, i) => {
      const x = (i / Math.max(data.length - 1, 1)) * width;
      const y = height - (d.pv / maxPv) * height;
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(' ');

  return (
    <div className="rounded-xl bg-white/30 dark:bg-gray-800/30 p-4 border border-white/20">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        className="w-full"
        style={{ height: 120 }}
      >
        <polyline
          points={points}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="text-teal-500"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <div className="flex items-center justify-between text-[10px] text-gray-400 mt-2 font-mono">
        <span>{data[0]?.stat_date}</span>
        <span>{data[data.length - 1]?.stat_date}</span>
      </div>
    </div>
  );
}

function TopList({
  title,
  icon,
  rows,
  emptyText,
  mono = false,
}: {
  title: string;
  icon: React.ReactNode;
  rows: AnalyticsTopRow[];
  emptyText: string;
  mono?: boolean;
}) {
  const max = rows.reduce((m, r) => Math.max(m, r.count), 0);

  return (
    <div className="rounded-xl bg-white/40 dark:bg-gray-800/40 p-4 border border-white/30 space-y-3">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
        {icon}
        <span>{title}</span>
      </div>
      {rows.length === 0 ? (
        <p className="text-xs text-gray-400 py-2">{emptyText}</p>
      ) : (
        <ul className="space-y-2">
          {rows.slice(0, 10).map((row) => {
            const pct = max > 0 ? (row.count / max) * 100 : 0;
            return (
              <li key={row.key || '(empty)'} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span
                    className={`truncate max-w-[70%] ${
                      mono ? 'font-mono' : ''
                    }`}
                    title={row.key}
                  >
                    {formatKey(row.key)}
                  </span>
                  <span className="font-mono text-gray-500">
                    {row.count.toLocaleString()}
                  </span>
                </div>
                <div className="h-1 rounded-full bg-gray-200/60 dark:bg-gray-700/60 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-teal-500 to-emerald-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}