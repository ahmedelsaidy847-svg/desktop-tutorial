import React, { useState } from 'react';
import { clsx } from 'clsx';
import { salesOrders } from '../data/mock';

interface Props {
  tripNumber: string;
  onClose: () => void;
}

export function DumpDivertModal({ tripNumber, onClose }: Props) {
  const [target, setTarget] = useState('');
  const [qty, setQty] = useState('');
  const [reason, setReason] = useState('');
  const [done, setDone] = useState(false);

  const openOrders = salesOrders.filter((o) =>
    ['CONFIRMED', 'IN_DELIVERY'].includes(o.status)
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      dir="rtl"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        <div className="bg-amber-50 border-b border-amber-200 px-6 py-4 flex items-start justify-between">
          <div>
            <h2 className="text-base font-bold text-fiori-text">تحويل شحنة الخرسانة</h2>
            <p className="text-xs text-fiori-text-sec mt-0.5">
              Dump &amp; Divert — رحلة {tripNumber}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-fiori-text-sec hover:text-fiori-text text-xl leading-none"
          >
            ×
          </button>
        </div>

        {done ? (
          <div className="p-8 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 text-2xl flex items-center justify-center mx-auto mb-3">
              ✓
            </div>
            <h3 className="text-base font-semibold text-fiori-text">
              تم التحويل بنجاح
            </h3>
            <p className="text-sm text-fiori-text-sec mt-1">
              تم تحويل {qty} م³ وإصدار فاتورة جديدة للعميل المستهدف
            </p>
            <button
              onClick={onClose}
              className="mt-5 px-5 py-2 text-sm bg-fiori-brand text-white rounded hover:bg-fiori-brand-dk transition-colors"
            >
              إغلاق
            </button>
          </div>
        ) : (
          <>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-fiori-text-sec mb-1">
                  أمر البيع المستهدف *
                </label>
                <select
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  className="w-full px-3 py-2 border border-fiori-text-dis rounded text-sm focus:outline-none focus:ring-2 focus:ring-fiori-brand"
                >
                  <option value="">اختر أمر البيع...</option>
                  {openOrders.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.orderNumber} — {o.customer.bpNameAr}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-fiori-text-sec mb-1">
                  الكمية المحوّلة (م³) *
                </label>
                <input
                  type="number"
                  value={qty}
                  onChange={(e) => setQty(e.target.value)}
                  placeholder="0.0"
                  className="w-full px-3 py-2 border border-fiori-text-dis rounded text-sm focus:outline-none focus:ring-2 focus:ring-fiori-brand"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-fiori-text-sec mb-1">
                  سبب التحويل *
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                  placeholder="مثال: رفض العميل / مشكلة في الموقع..."
                  className="w-full px-3 py-2 border border-fiori-text-dis rounded text-sm resize-none focus:outline-none focus:ring-2 focus:ring-fiori-brand"
                />
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded p-3 text-xs text-blue-800">
                سيتم التحقق من الحد الائتماني للعميل المستهدف وإصدار فاتورة
                مرنة تلقائياً عند التأكيد.
              </div>
            </div>
            <div className="px-6 pb-6 flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm border border-fiori-text-dis rounded hover:bg-fiori-bg-page transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={() => setDone(true)}
                disabled={!target || !qty || !reason}
                className={clsx(
                  'px-4 py-2 text-sm text-white rounded transition-colors',
                  !target || !qty || !reason
                    ? 'bg-amber-300 cursor-not-allowed'
                    : 'bg-amber-600 hover:bg-amber-700'
                )}
              >
                تأكيد التحويل
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
