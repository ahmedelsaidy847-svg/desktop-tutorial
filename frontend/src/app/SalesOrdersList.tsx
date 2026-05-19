import React, { useState, useMemo } from 'react';
import { clsx } from 'clsx';
import { salesOrders } from '../data/mock';

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  CONFIRMED: { label: 'مؤكد', cls: 'bg-blue-100 text-blue-700 border-blue-200' },
  IN_DELIVERY: { label: 'قيد التسليم', cls: 'bg-amber-100 text-amber-700 border-amber-200' },
  COMPLETED: { label: 'مكتمل', cls: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  CANCELLED: { label: 'ملغي', cls: 'bg-red-100 text-red-700 border-red-200' },
  DIVERTED: { label: 'محوّل', cls: 'bg-purple-100 text-purple-700 border-purple-200' },
};

interface Props {
  onOpenOrder: (id: string) => void;
}

export function SalesOrdersList({ onOpenOrder }: Props) {
  const [statusFilter, setStatusFilter] = useState('');
  const [plantFilter, setPlantFilter] = useState('');
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState('orderNumber');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [showFilters, setShowFilters] = useState(true);

  const filtered = useMemo(() => {
    let rows = salesOrders.filter((o) => {
      if (statusFilter && o.status !== statusFilter) return false;
      if (plantFilter && o.plant.plantNameAr !== plantFilter) return false;
      if (search && !o.orderNumber.includes(search) &&
          !o.customer.bpNameAr.includes(search)) return false;
      return true;
    });
    rows = [...rows].sort((a: any, b: any) => {
      const av = a[sortKey], bv = b[sortKey];
      const cmp = typeof av === 'number' ? av - bv : String(av).localeCompare(String(bv));
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return rows;
  }, [statusFilter, plantFilter, search, sortKey, sortDir]);

  const toggleSort = (key: string) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('asc'); }
  };

  const cols = [
    { key: 'orderNumber', label: 'رقم الأمر', sortable: true },
    { key: 'customer', label: 'العميل', sortable: false },
    { key: 'plant', label: 'المحطة', sortable: false },
    { key: 'grade', label: 'الخلطة', sortable: false },
    { key: 'orderedQtyM3', label: 'الكمية (م³)', sortable: true, align: 'end' },
    { key: 'progress', label: 'نسبة التسليم', sortable: false },
    { key: 'totalAmount', label: 'القيمة', sortable: true, align: 'end' },
    { key: 'status', label: 'الحالة', sortable: false },
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-fiori-border px-6 pt-4">
        <div className="text-xs text-fiori-text-sec mb-1">الرئيسية / أوامر البيع</div>
        <h1 className="text-2xl font-bold text-fiori-text mb-3">أوامر البيع</h1>
      </div>

      {/* Filter Bar */}
      <div
        className={clsx(
          'bg-white border-b border-fiori-border overflow-hidden transition-all',
          showFilters ? 'max-h-40' : 'max-h-0'
        )}
      >
        <div className="px-6 py-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-fiori-text-sec mb-1">
              بحث
            </label>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="رقم الأمر أو العميل..."
              className="w-full px-3 py-2 text-sm border border-fiori-text-dis rounded focus:outline-none focus:ring-2 focus:ring-fiori-brand focus:border-fiori-brand"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-fiori-text-sec mb-1">
              الحالة
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-fiori-text-dis rounded bg-white focus:outline-none focus:ring-2 focus:ring-fiori-brand"
            >
              <option value="">الكل</option>
              <option value="CONFIRMED">مؤكد</option>
              <option value="IN_DELIVERY">قيد التسليم</option>
              <option value="COMPLETED">مكتمل</option>
              <option value="DIVERTED">محوّل</option>
              <option value="CANCELLED">ملغي</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-fiori-text-sec mb-1">
              المحطة
            </label>
            <select
              value={plantFilter}
              onChange={(e) => setPlantFilter(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-fiori-text-dis rounded bg-white focus:outline-none focus:ring-2 focus:ring-fiori-brand"
            >
              <option value="">الكل</option>
              <option value="محطة الرياض الشمالية">محطة الرياض الشمالية</option>
              <option value="محطة الرياض الجنوبية">محطة الرياض الجنوبية</option>
              <option value="محطة الخرج">محطة الخرج</option>
            </select>
          </div>
          <div className="flex items-end gap-2">
            <button
              onClick={() => { setStatusFilter(''); setPlantFilter(''); setSearch(''); }}
              className="px-4 py-2 text-sm border border-fiori-text-dis rounded hover:bg-fiori-bg-page transition-colors"
            >
              مسح
            </button>
            <button className="px-4 py-2 text-sm bg-fiori-brand text-white rounded hover:bg-fiori-brand-dk transition-colors">
              بحث
            </button>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white border-b border-fiori-border px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-base font-semibold text-fiori-text">
            القائمة
          </h2>
          <span className="text-sm text-fiori-text-sec bg-fiori-bg-page px-2 py-0.5 rounded tabular-nums">
            {filtered.length} نتيجة
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-3 py-2 text-sm bg-fiori-brand text-white rounded hover:bg-fiori-brand-dk transition-colors">
            + أمر بيع جديد
          </button>
          <button
            onClick={() => setShowFilters((s) => !s)}
            className={clsx(
              'px-3 py-2 text-sm border rounded transition-colors',
              showFilters
                ? 'border-fiori-brand text-fiori-brand bg-fiori-brand-lt'
                : 'border-fiori-text-dis text-fiori-text hover:bg-fiori-bg-page'
            )}
          >
            ⛃ تصفية
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full border-collapse">
          <thead className="sticky top-0 z-10">
            <tr className="bg-fiori-bg-page border-b border-fiori-border">
              {cols.map((c) => (
                <th
                  key={c.key}
                  onClick={() => c.sortable && toggleSort(c.key)}
                  className={clsx(
                    'px-4 py-3 text-xs font-semibold text-fiori-text-sec uppercase tracking-wide whitespace-nowrap',
                    c.align === 'end' ? 'text-left' : 'text-right',
                    c.sortable && 'cursor-pointer hover:text-fiori-text select-none'
                  )}
                >
                  <span className="inline-flex items-center gap-1">
                    {c.label}
                    {c.sortable && (
                      <span className={clsx('text-[10px]', sortKey === c.key ? 'text-fiori-brand' : 'opacity-30')}>
                        {sortKey === c.key && sortDir === 'desc' ? '▼' : '▲'}
                      </span>
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-fiori-border">
            {filtered.map((o) => {
              const pct = (o.deliveredQtyM3 / o.orderedQtyM3) * 100;
              const st = STATUS_MAP[o.status];
              return (
                <tr
                  key={o.id}
                  onClick={() => onOpenOrder(o.id)}
                  className="cursor-pointer hover:bg-fiori-brand-lt transition-colors"
                >
                  <td className="px-4 py-3 text-sm font-medium text-fiori-brand whitespace-nowrap">
                    {o.orderNumber}
                  </td>
                  <td className="px-4 py-3 text-sm text-fiori-text">
                    {o.customer.bpNameAr}
                    <div className="text-xs text-fiori-text-sec">{o.customer.bpCode}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-fiori-text-sec whitespace-nowrap">
                    {o.plant.plantNameAr}
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-xs font-medium">
                      {o.mixDesign.concretGrade}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-fiori-text text-left tabular-nums">
                    {o.orderedQtyM3}
                  </td>
                  <td className="px-4 py-3 w-40">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-fiori-bg-page rounded-full overflow-hidden">
                        <div
                          className={clsx(
                            'h-full rounded-full',
                            pct >= 100 ? 'bg-emerald-500' : pct > 0 ? 'bg-fiori-brand' : 'bg-fiori-text-dis'
                          )}
                          style={{ width: `${Math.max(pct, 2)}%` }}
                        />
                      </div>
                      <span className="text-xs text-fiori-text-sec tabular-nums w-9">
                        {pct.toFixed(0)}%
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-fiori-text text-left tabular-nums whitespace-nowrap">
                    {o.totalAmount.toLocaleString('en-US')}
                    <span className="text-xs text-fiori-text-sec"> ريال</span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={clsx(
                        'px-2.5 py-0.5 rounded-full text-xs font-medium border whitespace-nowrap',
                        st.cls
                      )}
                    >
                      {st.label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
