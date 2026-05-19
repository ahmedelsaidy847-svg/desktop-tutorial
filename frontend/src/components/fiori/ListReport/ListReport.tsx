import React, { useState, useCallback } from 'react';
import { clsx } from 'clsx';

export type ColumnType = 'text' | 'number' | 'currency' | 'date' | 'status' | 'badge';

export interface Column<T = any> {
  key: string;
  header: string;
  type?: ColumnType;
  sortable?: boolean;
  width?: string;
  render?: (value: any, row: T) => React.ReactNode;
  align?: 'start' | 'center' | 'end';
}

export interface FilterField {
  key: string;
  label: string;
  type: 'text' | 'select' | 'date' | 'daterange' | 'number';
  options?: { value: string; label: string }[];
  placeholder?: string;
}

export interface ListReportProps<T = any> {
  title: string;
  columns: Column<T>[];
  data: T[];
  filterFields?: FilterField[];
  totalCount?: number;
  page?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  onFilterChange?: (filters: Record<string, any>) => void;
  onSortChange?: (key: string, direction: 'asc' | 'desc') => void;
  onRowClick?: (row: T) => void;
  isLoading?: boolean;
  selectable?: boolean;
  onSelectionChange?: (selected: T[]) => void;
  headerActions?: React.ReactNode;
  emptyMessage?: string;
}

const STATUS_MAP: Record<string, { label: string; class: string }> = {
  OPEN: { label: 'مفتوح', class: 'bg-blue-100 text-blue-700 border-blue-200' },
  CONFIRMED: { label: 'مؤكد', class: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  IN_DELIVERY: { label: 'قيد التسليم', class: 'bg-amber-100 text-amber-700 border-amber-200' },
  COMPLETED: { label: 'مكتمل', class: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  CANCELLED: { label: 'ملغي', class: 'bg-red-100 text-red-700 border-red-200' },
  DIVERTED: { label: 'محول', class: 'bg-purple-100 text-purple-700 border-purple-200' },
  POSTED: { label: 'مرحل', class: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  DRAFT: { label: 'مسودة', class: 'bg-slate-100 text-slate-600 border-slate-200' },
  ACTIVE: { label: 'نشط', class: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  CARRIED_FORWARD: { label: 'مرحّل', class: 'bg-amber-100 text-amber-700 border-amber-200' },
};

function formatCellValue(
  value: any,
  type: ColumnType = 'text'
): React.ReactNode {
  if (value == null) return <span className="text-[#BCC3CA]">-</span>;

  switch (type) {
    case 'currency':
      return (
        <span className="font-mono">
          {Number(value).toLocaleString('ar-SA', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}{' '}
          <span className="text-[#6E8091] text-xs">ريال</span>
        </span>
      );
    case 'number':
      return (
        <span className="font-mono">
          {Number(value).toLocaleString('ar-SA')}
        </span>
      );
    case 'date':
      return new Date(value).toLocaleDateString('ar-SA');
    case 'status': {
      const statusInfo = STATUS_MAP[value] ?? {
        label: value,
        class: 'bg-slate-100 text-slate-600 border-slate-200',
      };
      return (
        <span
          className={clsx(
            'px-2.5 py-0.5 rounded-full text-xs font-medium border',
            statusInfo.class
          )}
        >
          {statusInfo.label}
        </span>
      );
    }
    default:
      return String(value);
  }
}

export function ListReport<T extends Record<string, any>>({
  title,
  columns,
  data,
  filterFields = [],
  totalCount = 0,
  page = 1,
  pageSize = 20,
  onPageChange,
  onFilterChange,
  onSortChange,
  onRowClick,
  isLoading = false,
  selectable = false,
  onSelectionChange,
  headerActions,
  emptyMessage = 'لا توجد بيانات',
}: ListReportProps<T>) {
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(filterFields.length > 0);

  const handleFilterChange = useCallback(
    (key: string, value: any) => {
      const newFilters = { ...filters, [key]: value };
      if (!value) delete newFilters[key];
      setFilters(newFilters);
      onFilterChange?.(newFilters);
    },
    [filters, onFilterChange]
  );

  const handleSort = (key: string) => {
    const newDir =
      sortKey === key && sortDir === 'asc' ? 'desc' : 'asc';
    setSortKey(key);
    setSortDir(newDir);
    onSortChange?.(key, newDir);
  };

  const handleSelect = (rowId: string, row: T) => {
    const newSelected = new Set(selected);
    if (newSelected.has(rowId)) newSelected.delete(rowId);
    else newSelected.add(rowId);
    setSelected(newSelected);
    onSelectionChange?.(data.filter((r) => newSelected.has(r.id)));
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="flex flex-col h-full bg-[#F5F6F7]" dir="rtl">
      {/* ===================== */}
      {/* FILTER BAR            */}
      {/* ===================== */}
      {filterFields.length > 0 && (
        <div
          className={clsx(
            'bg-white border-b border-[#DFE3E8] overflow-hidden transition-all duration-300',
            showFilters ? 'max-h-96' : 'max-h-0'
          )}
        >
          <div className="px-6 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filterFields.map((field) => (
                <div key={field.key}>
                  <label className="block text-xs font-medium text-[#6E8091] mb-1">
                    {field.label}
                  </label>
                  {field.type === 'select' ? (
                    <select
                      className="w-full px-3 py-2 text-sm border border-[#BCC3CA] rounded bg-white text-[#32363A] focus:outline-none focus:ring-2 focus:ring-[#0070F2] focus:border-[#0070F2]"
                      value={filters[field.key] ?? ''}
                      onChange={(e) =>
                        handleFilterChange(field.key, e.target.value)
                      }
                    >
                      <option value="">الكل</option>
                      {field.options?.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'}
                      placeholder={field.placeholder}
                      className="w-full px-3 py-2 text-sm border border-[#BCC3CA] rounded bg-white text-[#32363A] focus:outline-none focus:ring-2 focus:ring-[#0070F2] focus:border-[#0070F2]"
                      value={filters[field.key] ?? ''}
                      onChange={(e) =>
                        handleFilterChange(field.key, e.target.value)
                      }
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="mt-4 flex gap-2 justify-end">
              <button
                onClick={() => {
                  setFilters({});
                  onFilterChange?.({});
                }}
                className="px-4 py-2 text-sm border border-[#BCC3CA] rounded text-[#32363A] hover:bg-slate-50 transition-colors"
              >
                مسح
              </button>
              <button
                onClick={() => onFilterChange?.(filters)}
                className="px-4 py-2 text-sm bg-[#0070F2] text-white rounded hover:bg-[#0057B8] transition-colors"
              >
                بحث
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================== */}
      {/* TOOLBAR               */}
      {/* ===================== */}
      <div className="bg-white border-b border-[#DFE3E8] px-6 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h2 className="text-base font-semibold text-[#32363A]">{title}</h2>
          <span className="text-sm text-[#6E8091] bg-[#F5F6F7] px-2 py-0.5 rounded">
            {totalCount.toLocaleString('ar-SA')} نتيجة
          </span>
          {selected.size > 0 && (
            <span className="text-sm text-[#0070F2] font-medium">
              {selected.size} محدد
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {headerActions}
          {filterFields.length > 0 && (
            <button
              onClick={() => setShowFilters((s) => !s)}
              className={clsx(
                'px-3 py-2 text-sm border rounded transition-colors flex items-center gap-2',
                showFilters
                  ? 'border-[#0070F2] text-[#0070F2] bg-[#EBF5FF]'
                  : 'border-[#BCC3CA] text-[#32363A] hover:bg-slate-50'
              )}
            >
              <FilterIcon className="w-4 h-4" />
              تصفية
            </button>
          )}
        </div>
      </div>

      {/* ===================== */}
      {/* TABLE                 */}
      {/* ===================== */}
      <div className="flex-1 overflow-auto">
        <table className="w-full border-collapse">
          <thead className="sticky top-0 z-10">
            <tr className="bg-[#F5F6F7] border-b border-[#DFE3E8]">
              {selectable && (
                <th className="w-12 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selected.size === data.length && data.length > 0}
                    onChange={(e) => {
                      const newSel = e.target.checked
                        ? new Set(data.map((r) => r.id))
                        : new Set<string>();
                      setSelected(newSel);
                      onSelectionChange?.(e.target.checked ? data : []);
                    }}
                    className="rounded border-[#BCC3CA] text-[#0070F2]"
                  />
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={col.key}
                  style={{ width: col.width }}
                  className={clsx(
                    'px-4 py-3 text-xs font-semibold text-[#6E8091] uppercase tracking-wider whitespace-nowrap',
                    col.align === 'center' && 'text-center',
                    col.align === 'end' && 'text-left',
                    col.sortable &&
                      'cursor-pointer hover:text-[#32363A] select-none'
                  )}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  <span className="flex items-center gap-1">
                    {col.header}
                    {col.sortable && (
                      <SortIcon
                        active={sortKey === col.key}
                        direction={sortKey === col.key ? sortDir : 'asc'}
                      />
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-[#DFE3E8]">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3">
                      <div className="h-4 bg-[#F5F6F7] rounded animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  className="px-4 py-16 text-center text-[#6E8091]"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, rowIdx) => (
                <tr
                  key={row.id ?? rowIdx}
                  onClick={() => onRowClick?.(row)}
                  className={clsx(
                    'transition-colors',
                    onRowClick && 'cursor-pointer hover:bg-[#EBF5FF]',
                    selected.has(row.id) && 'bg-[#EBF5FF]'
                  )}
                >
                  {selectable && (
                    <td
                      className="w-12 px-4 py-3"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        checked={selected.has(row.id)}
                        onChange={() => handleSelect(row.id, row)}
                        className="rounded border-[#BCC3CA] text-[#0070F2]"
                      />
                    </td>
                  )}
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={clsx(
                        'px-4 py-3 text-sm text-[#32363A]',
                        col.align === 'center' && 'text-center',
                        col.align === 'end' && 'text-left'
                      )}
                    >
                      {col.render
                        ? col.render(row[col.key], row)
                        : formatCellValue(row[col.key], col.type)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ===================== */}
      {/* PAGINATION            */}
      {/* ===================== */}
      {totalPages > 1 && (
        <div className="bg-white border-t border-[#DFE3E8] px-6 py-3 flex items-center justify-between">
          <span className="text-sm text-[#6E8091]">
            عرض {(page - 1) * pageSize + 1}-
            {Math.min(page * pageSize, totalCount)} من {totalCount}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onPageChange?.(page - 1)}
              disabled={page === 1}
              className="px-3 py-1.5 text-sm border border-[#BCC3CA] rounded hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              ‹
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum =
                page <= 3 ? i + 1 : page + i - 2;
              if (pageNum > totalPages) return null;
              return (
                <button
                  key={pageNum}
                  onClick={() => onPageChange?.(pageNum)}
                  className={clsx(
                    'px-3 py-1.5 text-sm border rounded transition-colors',
                    pageNum === page
                      ? 'border-[#0070F2] bg-[#0070F2] text-white'
                      : 'border-[#BCC3CA] hover:bg-slate-50 text-[#32363A]'
                  )}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => onPageChange?.(page + 1)}
              disabled={page === totalPages}
              className="px-3 py-1.5 text-sm border border-[#BCC3CA] rounded hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              ›
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function FilterIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z"
      />
    </svg>
  );
}

function SortIcon({
  active,
  direction,
}: {
  active: boolean;
  direction: 'asc' | 'desc';
}) {
  return (
    <svg
      className={clsx('w-3 h-3 transition-transform', !active && 'opacity-30',
        active && direction === 'desc' && 'rotate-180'
      )}
      fill="currentColor" viewBox="0 0 20 20"
    >
      <path d="M5 10l5-5 5 5H5z" />
    </svg>
  );
}

export default ListReport;
