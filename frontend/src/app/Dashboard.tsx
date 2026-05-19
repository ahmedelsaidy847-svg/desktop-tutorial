import React from 'react';
import { clsx } from 'clsx';
import { kpis, recentActivity } from '../data/mock';

const KPI_COLORS: Record<string, string> = {
  success: 'border-emerald-200 bg-emerald-50',
  info: 'border-blue-200 bg-blue-50',
  warning: 'border-amber-200 bg-amber-50',
};
const TREND_COLORS: Record<string, string> = {
  success: 'text-emerald-600',
  info: 'text-blue-600',
  warning: 'text-amber-600',
};
const TAG_STYLES: Record<string, string> = {
  POURING: 'bg-orange-100 text-orange-700',
  IN_TRANSIT: 'bg-amber-100 text-amber-700',
  ALERT: 'bg-red-100 text-red-700',
  INVOICE: 'bg-emerald-100 text-emerald-700',
  DIVERTED: 'bg-purple-100 text-purple-700',
  LOADED: 'bg-blue-100 text-blue-700',
};

const plantLoad = [
  { name: 'محطة الرياض الشمالية', load: 87, m3: 412 },
  { name: 'محطة الرياض الجنوبية', load: 64, m3: 268 },
  { name: 'محطة الخرج', load: 41, m3: 167 },
];

const mixDist = [
  { grade: 'C40', pct: 38, color: '#0070F2' },
  { grade: 'C30', pct: 27, color: '#107E3E' },
  { grade: 'C25', pct: 19, color: '#E9730C' },
  { grade: 'C50', pct: 11, color: '#7858A8' },
  { grade: 'أخرى', pct: 5, color: '#BCC3CA' },
];

export function Dashboard() {
  return (
    <div className="h-full overflow-y-auto">
      {/* Header */}
      <div className="bg-white border-b border-fiori-border px-6 py-4">
        <div className="text-xs text-fiori-text-sec mb-1">الرئيسية</div>
        <h1 className="text-2xl font-bold text-fiori-text">لوحة تحكم العمليات</h1>
        <p className="text-sm text-fiori-text-sec mt-1">
          نظرة شاملة على الإنتاج والتسليم — الثلاثاء 19 مايو 2026
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-5 space-y-5">
        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((kpi) => (
            <div
              key={kpi.label}
              className={clsx(
                'rounded-lg border p-4 shadow-sm',
                KPI_COLORS[kpi.variant]
              )}
            >
              <div className="text-xs text-fiori-text-sec font-medium">
                {kpi.label}
              </div>
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="text-3xl font-light text-fiori-text tabular-nums">
                  {kpi.value}
                </span>
                <span className="text-sm text-fiori-text-sec">{kpi.unit}</span>
              </div>
              <div
                className={clsx(
                  'mt-1 text-xs font-medium',
                  TREND_COLORS[kpi.variant]
                )}
              >
                ▲ {kpi.trend}
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Plant Load */}
          <div className="lg:col-span-2 bg-white rounded-lg border border-fiori-border shadow-sm">
            <div className="px-5 py-3.5 border-b border-fiori-border bg-fiori-bg-page">
              <h2 className="text-base font-semibold text-fiori-text">
                تحميل المحطات
              </h2>
            </div>
            <div className="p-5 space-y-5">
              {plantLoad.map((p) => (
                <div key={p.name}>
                  <div className="flex justify-between items-baseline mb-1.5">
                    <span className="text-sm font-medium text-fiori-text">
                      {p.name}
                    </span>
                    <span className="text-xs text-fiori-text-sec tabular-nums">
                      {p.m3} م³ &middot; {p.load}%
                    </span>
                  </div>
                  <div className="h-2.5 bg-fiori-bg-page rounded-full overflow-hidden">
                    <div
                      className={clsx(
                        'h-full rounded-full',
                        p.load > 80
                          ? 'bg-amber-500'
                          : p.load > 50
                          ? 'bg-fiori-brand'
                          : 'bg-emerald-500'
                      )}
                      style={{ width: `${p.load}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mix Distribution */}
          <div className="bg-white rounded-lg border border-fiori-border shadow-sm">
            <div className="px-5 py-3.5 border-b border-fiori-border bg-fiori-bg-page">
              <h2 className="text-base font-semibold text-fiori-text">
                توزيع الخلطات
              </h2>
            </div>
            <div className="p-5 space-y-3">
              {mixDist.map((m) => (
                <div key={m.grade} className="flex items-center gap-3">
                  <span className="text-xs font-medium text-fiori-text w-12">
                    {m.grade}
                  </span>
                  <div className="flex-1 h-5 bg-fiori-bg-page rounded overflow-hidden">
                    <div
                      className="h-full rounded flex items-center px-2"
                      style={{ width: `${m.pct * 2}%`, background: m.color }}
                    >
                      <span className="text-[10px] text-white font-medium">
                        {m.pct}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="bg-white rounded-lg border border-fiori-border shadow-sm">
          <div className="px-5 py-3.5 border-b border-fiori-border bg-fiori-bg-page flex items-center justify-between">
            <h2 className="text-base font-semibold text-fiori-text">
              النشاط اللحظي
            </h2>
            <span className="flex items-center gap-1.5 text-xs text-emerald-600">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              مباشر
            </span>
          </div>
          <div className="divide-y divide-fiori-border">
            {recentActivity.map((a, i) => (
              <div
                key={i}
                className="px-5 py-3 flex items-center gap-3 hover:bg-fiori-bg-page transition-colors"
              >
                <span className="text-lg">{a.icon}</span>
                <span className="text-xs text-fiori-text-sec tabular-nums w-10">
                  {a.time}
                </span>
                <span className="flex-1 text-sm text-fiori-text">{a.text}</span>
                <span
                  className={clsx(
                    'px-2 py-0.5 rounded text-[10px] font-medium',
                    TAG_STYLES[a.tag]
                  )}
                >
                  {a.tag}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
