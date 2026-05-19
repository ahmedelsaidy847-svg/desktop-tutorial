import React from 'react';
import { clsx } from 'clsx';

export type Route = 'dashboard' | 'sales-list' | 'sales-detail';

const NAV = [
  { key: 'dashboard', label: 'لوحة التحكم', icon: '▦' },
  { key: 'sales-list', label: 'أوامر البيع', icon: '▤' },
  { key: 'production', label: 'أوامر الإنتاج', icon: '⚙' },
  { key: 'fleet', label: 'الأسطول والرحلات', icon: '▷' },
  { key: 'finance', label: 'المحاسبة العامة', icon: '◈' },
  { key: 'hcm', label: 'الموارد البشرية', icon: '◉' },
  { key: 'payroll', label: 'الرواتب والسلف', icon: '▣' },
  { key: 'inventory', label: 'المخزون والمواد', icon: '▥' },
];

interface Props {
  current: Route;
  onNavigate: (r: Route) => void;
  children: React.ReactNode;
}

export function Shell({ current, onNavigate, children }: Props) {
  return (
    <div className="flex flex-col h-screen overflow-hidden" dir="rtl">
      {/* Shell Header */}
      <header className="h-12 bg-fiori-shell text-white flex items-center px-4 gap-4 shadow-md shrink-0 z-50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded bg-fiori-brand flex items-center justify-center font-bold text-sm">
            RMC
          </div>
          <span className="font-semibold text-[15px]">نظام إدارة محطات الخرسانة</span>
        </div>
        <div className="flex-1 max-w-md mx-auto">
          <div className="relative">
            <input
              placeholder="بحث..."
              className="w-full h-8 bg-white/10 rounded px-3 text-sm placeholder-white/50 text-white focus:outline-none focus:bg-white/20 transition-colors"
            />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="w-8 h-8 rounded hover:bg-white/10 flex items-center justify-center text-base">⚲</button>
          <button className="w-8 h-8 rounded hover:bg-white/10 flex items-center justify-center text-base relative">
            ◔
            <span className="absolute top-1 left-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>
          <div className="flex items-center gap-2 pr-2 border-r border-white/20">
            <div className="w-8 h-8 rounded-full bg-fiori-brand flex items-center justify-center text-xs font-semibold">
              عأ
            </div>
            <div className="text-xs leading-tight">
              <div className="font-medium">عبدالله أحمد</div>
              <div className="text-white/60">مدير العمليات</div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-60 bg-white border-l border-fiori-border flex flex-col shrink-0">
          <nav className="flex-1 py-3 overflow-y-auto">
            {NAV.map((item) => {
              const active =
                (item.key === 'dashboard' && current === 'dashboard') ||
                (item.key === 'sales-list' &&
                  (current === 'sales-list' || current === 'sales-detail'));
              return (
                <button
                  key={item.key}
                  onClick={() =>
                    (item.key === 'dashboard' || item.key === 'sales-list') &&
                    onNavigate(item.key as Route)
                  }
                  className={clsx(
                    'w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors text-right',
                    active
                      ? 'bg-fiori-brand-lt text-fiori-brand border-r-[3px] border-fiori-brand font-medium'
                      : 'text-fiori-text-sec hover:bg-fiori-bg-page'
                  )}
                >
                  <span className="text-base w-5 text-center">{item.icon}</span>
                  {item.label}
                </button>
              );
            })}
          </nav>
          <div className="p-3 border-t border-fiori-border">
            <div className="bg-fiori-bg-page rounded-lg p-3 text-xs">
              <div className="text-fiori-text-sec mb-1">الفترة المحاسبية</div>
              <div className="font-semibold text-fiori-text">مايو 2026 — مفتوحة</div>
            </div>
          </div>
        </aside>

        {/* Content */}
        <main className="flex-1 overflow-hidden bg-fiori-bg-page">{children}</main>
      </div>
    </div>
  );
}
